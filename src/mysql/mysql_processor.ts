import mariadb from "mariadb"
import { Statement, VCollation, VDatabase, VObject, VSchema } from "../models"
import { DdlSyncProcessor } from "../processor"
import { MysqlParser } from "./mysql_parser"
import * as model from "./mysql_models"
import { lcase, ucamel } from "../util/functions"

export default class MysqlProcessor extends DdlSyncProcessor {
  private con?: mariadb.Connection

  constructor(
    config: { [key: string]: any },
    dryrun: boolean,
  ) {
    super(config, dryrun)
  }

  protected async init() {
    const options = {} as any

    this.con = await mariadb.createConnection({
      host: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
      database: this.config.database,
    })

    const versions = await this.con.query("SELECT version() AS v") as any[]
    if (versions.length) {
      const vparts = (versions[0].v || "").split("-")
      options.package = /mariadb/i.test(vparts[1]) ? "mariadb" : "mysql"
      options.version = vparts[0]
    }

    const sqlModes = await this.con.query("SELECT @@sql_mode AS sql_mode") as any[]
    if (sqlModes.length) {
      options.sqlMode = sqlModes[0].sql_mode
    }

    const keywordsSchema = await this.con.query("SELECT TABLE_NAME" +
      " FROM INFORMATION_SCHEMA.TABLES" +
      " WHERE TABLE_SCHEMA = 'information_schema'" +
      " AND TABLE_NAME = 'KEYWORDS'" +
      " AND TABLE_TYPE = 'SYSTEM VIEW'"
    ) as any[]
    if (keywordsSchema.length) {
      options.reservedWords = []
      for await (const row of await this.con.queryStream("SELECT WORD " +
        " FROM INFORMATION_SCHEMA.KEYWORDS" +
        " WHERE WHERE RESERVED = 1"
      )) {
        options.reservedWords.push(row.WORD)
      }
    }

    return options
  }

  protected async parse(input: string, options: { [key: string]: any }) {
    const parser = new MysqlParser(input, options)
    return parser.root()
  }

  protected async run(stmts: Statement[], options: { [key: string]: any }) {
    const vdb = new VDatabase()
    vdb.addSchema("mysql", true)
    vdb.addSchema("sys", true)
    vdb.addSchema("information_schema", true)
    vdb.addSchema("performance_schema", true)
    vdb.defaultSchemaName = await this.getCurrentSchemaName()

    const refs = []
    for (const [i, stmt] of stmts.entries()) {
      refs[i] = stmt.process(vdb)
    }

    for (const [i, stmt] of stmts.entries()) {
      switch (stmt.constructor) {
        case model.CreateDatabaseStatement:
          refs[i] = this.tryCreateDatabaseStatement(i, stmt as model.CreateDatabaseStatement, vdb)
          break
        case model.DropDatabaseStatement:
          refs[i] = this.tryDropDatabaseStatement(i, stmt as model.DropDatabaseStatement, vdb)
          break
        case model.CreateTableStatement:
          refs[i] = this.tryCreateObjectStatement(i, stmt, vdb, "table")
          break
        case model.CreateViewStatement:
          refs[i] = this.tryCreateObjectStatement(i, stmt, vdb, "view")
          break
        case model.CreateProcedureStatement:
          refs[i] = this.tryCreateObjectStatement(i, stmt, vdb, "procedure")
          break
        case model.CreateFunctionStatement:
          refs[i] = this.tryCreateObjectStatement(i, stmt, vdb, "function")
          break
        case model.CreateTriggerStatement:
          refs[i] = this.tryCreateObjectStatement(i, stmt, vdb, "trigger")
          break
        case model.CreateIndexStatement:
          refs[i] = this.tryCreateObjectStatement(i, stmt, vdb, "index")
          break
        case model.AlterTableStatement:
          refs[i] = this.tryAlterObjectStatement(i, stmt, vdb, "table")
          break
        case model.AlterViewStatement:
          refs[i] = this.tryAlterObjectStatement(i, stmt, vdb, "view")
          break
        case model.AlterProcedureStatement:
          refs[i] = this.tryAlterObjectStatement(i, stmt, vdb, "procedure")
          break
        case model.AlterFunctionStatement:
          refs[i] = this.tryAlterObjectStatement(i, stmt, vdb, "function")
          break
        case model.RenameTableStatement:
          refs[i] = this.tryRenameTableStatement(i, stmt as model.RenameTableStatement, vdb)
          break
        case model.DropTableStatement:
          refs[i] = this.tryDropObjectStatement(i, stmt, vdb, "table", "tables")
          break
        case model.DropViewStatement:
          refs[i] = this.tryDropObjectStatement(i, stmt, vdb, "view", "views")
          break
        case model.DropProcedureStatement:
          refs[i] = this.tryDropObjectStatement(i, stmt, vdb, "procedure")
          break
        case model.DropFunctionStatement:
          refs[i] = this.tryDropObjectStatement(i, stmt, vdb, "function")
          break
        case model.DropTriggerStatement:
          refs[i] = this.tryDropObjectStatement(i, stmt, vdb, "trigger")
          break
        case model.DropIndexStatement:
          refs[i] = this.tryDropObjectStatement(i, stmt, vdb, "index", "indexes")
          break
        case model.AnalyzeTableStatement:
        case model.CheckTableStatement:
        case model.ChecksumTableStatement:
        case model.OptimizeTableStatement:
        case model.RepairTableStatement:
          refs[i] = this.tryManipulateObjectStatement(i, stmt, vdb, "table", "tables")
          break
        case model.TruncateTableStatement:
        case model.InsertStatement:
        case model.UpdateStatement:
        case model.ReplaceStatement:
        case model.DeleteStatement:
          refs[i] = this.tryManipulateObjectStatement(i, stmt, vdb, "table")
          break
        case model.CheckIndexStatement:
          refs[i] = this.tryManipulateObjectStatement(i, stmt, vdb, "index", "indexes")
          break
        default:
          // no handle
      }
    }

    for (const [i, stmt] of stmts.entries()) {
      console.log(`-- ## statement ${i + 1}: ${stmt.summary()}`)
      switch (stmt.constructor) {
      }
      console.log()
    }
  }

  async destroy() {
    this.con?.destroy()
  }

  private async getCurrentSchemaName() {
    const result = await this.con?.query("SELECT database() ad schemaName") as any[]
    return result[0]?.schemaName
  }

  private tryCreateDatabaseStatement(seq: number, stmt: any, vdb: VDatabase) {
    let schema = vdb.getSchema(stmt.name)
    if (schema && !schema.dropped) {
      throw new Error(`database ${stmt.name} is already in use`)
    }
    return vdb.addSchema(stmt.name)
  }

  private tryDropDatabaseStatement(seq: number, stmt: any, vdb: VDatabase) {
    const schema = vdb.getSchema(stmt.name)
    if (!schema || schema.dropped) {
      throw new Error(`no such database: ${stmt.name}`)
    }
    if (schema.system) {
      throw new Error(`cannot drop system database ${stmt.name}`)
    }

    schema.dropped = true
    return schema
  }

  private tryCreateObjectStatement(seq: number, stmt: any, vdb: VDatabase, type: string) {
    const schemaName = stmt.schemaName || vdb.defaultSchemaName
    if (!schemaName) {
      throw new Error(`No database selected`)
    }
    const schema = vdb.getSchema(schemaName)
    if (!schema) {
      throw new Error(`unknown database ${schemaName}`)
    }

    let object = schema.getObject(stmt.name)
    if (object && !object.dropped) {
      throw new Error(`${object.type} ${stmt.name} already exists`)
    }

    if (stmt instanceof model.CreateIndexStatement) {
      const tableSchemaName = stmt.table.schemaName || vdb.defaultSchemaName
      if (!tableSchemaName) {
        throw new Error(`No database selected`)
      }
      const tableSchema = vdb.getSchema(tableSchemaName)
      if (!tableSchema) {
        throw new Error(`unknown database ${tableSchemaName}`)
      }
      const table = tableSchema.getObject(stmt.table.name)
      if (!table || table.dropped || table.type !== "table") {
        throw new Error(`no such table: ${tableSchemaName}.${stmt.table.name}`)
      }
    }

    return schema.addObject(type, stmt.name, stmt.tableName)
  }

  private tryAlterObjectStatement(seq: number, stmt: Statement, vdb: VDatabase, type: string) {
    let schemaName = (stmt as any)[type].schemaName || vdb.defaultSchemaName
    if (!schemaName) {
      throw new Error(`No database selected`)
    }

    const schema = vdb.getSchema(schemaName)
    if (!schema) {
      throw new Error(`unknown database ${schemaName}`)
    }

    let obj = schema.getObject((stmt as any)[type].name)
    if (!obj || obj.dropped) {
      throw new Error(`no such table: ${schemaName}.${(stmt as any)[type].name}`)
    } else if (obj.type !== "table") {
      throw new Error(`no such table: ${schemaName}.${(stmt as any)[type].name}`)
    }

    const newObject = (stmt as any)[`new${ucamel(type)}`]
    if (newObject) {
      obj.dropped = true
      const newSchema = newObject.schemaName ? vdb.getSchema(newObject.schemaName) : schema
      if (!newSchema) {
        throw new Error(`unknown database ${newSchema}`)
      }
      newSchema.addObject(type, newObject.name)
      for (const aObj of schema) {
        if (aObj.type === "index" && aObj.tableName === aObj.name) {
          aObj.dropped = true
          schema.addObject("index", aObj.name, newObject.name)
        }
      }
    }
    return obj
  }

  private tryRenameTableStatement(seq: number, stmt: model.RenameTableStatement, vdb: VDatabase) {
    const results = []
    for (const pair of stmt.pairs) {
      let schemaName = pair.table.schemaName || vdb.defaultSchemaName
      if (!schemaName) {
        throw new Error(`No database selected`)
      }

      const schema = vdb.getSchema(schemaName)
      if (!schema) {
        throw new Error(`unknown database ${schemaName}`)
      }

      let obj = schema.getObject(pair.table.name)
      if (!obj || obj.dropped) {
        throw new Error(`no such table: ${schemaName}.${pair.table.name}`)
      } else if (obj.type !== "table" && obj.type !== "view") {
        throw new Error(`no such table: ${schemaName}.${pair.table.name}`)
      }

      obj.dropped = true
      const newSchema = pair.newTable.schemaName ? vdb.getSchema(pair.newTable.schemaName) : schema
      if (!newSchema) {
        throw new Error(`unknown database ${newSchema}`)
      }

      obj = newSchema.addObject(obj.type, pair.newTable.name)
      for (const aObj of schema) {
        if (aObj.type === "index" && aObj.tableName === aObj.name) {
          aObj.dropped = true
          schema.addObject("index", aObj.name, pair.newTable.name)
        }
      }
      results.push(obj)
    }
    return results
  }

  private tryDropObjectStatement(seq: number, stmt: any, vdb: VDatabase, type: string, key?: string) {
    const targets = stmt[key || type]
    const results = []
    for (const target of (Array.isArray(targets) ? targets : [ targets ])) {
      const schemaName = target.schemaName || vdb.defaultSchemaName
      if (!schemaName) {
        throw new Error(`No database selected`)
      }

      const schema = vdb.getSchema(schemaName)
      if (!schema) {
        throw new Error(`unknown database ${schemaName}`)
      }

      let obj = schema.getObject(target.name)
      if (!obj || obj.dropped) {
        if (!stmt.ifExists) {
          throw new Error(`no such ${type}: ${schemaName}.${stmt.name}`)
        }
      } else if (obj.type !== type) {
        throw new Error(`no such ${type}: ${schemaName}.${stmt.name}`)
      }

      if (!obj) {
        obj = schema.addObject(type, stmt.name)
      }
      obj.dropped = true
      results.push(obj)
    }
    return Array.isArray(targets) ? results : results[0]
  }

  private tryManipulateObjectStatement(seq: number, stmt: any, vdb: VDatabase, type: string, key?: string) {
    const targets = stmt[key || type]
    const results = []
    for (const target of (Array.isArray(targets) ? targets : [ targets ])) {
      const schemaName = target.schemaName || vdb.defaultSchemaName
      if (!schemaName) {
        throw new Error(`No database selected`)
      }

      const schema = vdb.getSchema(schemaName)
      if (!schema) {
        throw new Error(`unknown database ${schemaName}`)
      }

      const obj = schema.getObject(target.name)
      if (!obj || obj.dropped) {
        throw new Error(`no such ${type}: ${schemaName}.${target.name}`)
      } else if (obj.type !== type) {
        throw new Error(`no such ${type}: ${schemaName}.${target.name}`)
      }
      results.push(obj)
    }
    return Array.isArray(targets) ? results : results[0]
  }
}

function dquote(text: string) {
  return '"' + text.replace(/"/g, '""') + '"'
}

function bquote(text: string) {
  return "`" + text.replace(/`/g, "``") + "`"
}
