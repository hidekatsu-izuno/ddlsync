import mariadb from "mariadb"
import { Statement } from "../models"
import { DdlSyncProcessor } from "../processor"
import { MysqlParser } from "./mysql_parser"
import * as model from "./mysql_models"
import { lcase } from "../util/functions"

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
    vdb.schemas.set("mysql", new VSchema("mysql", true))
    vdb.schemas.set("sys", new VSchema("sys", true))
    vdb.schemas.set("information_schema", new VSchema("information_schema", true))
    vdb.schemas.set("performance_schema", new VSchema("performance_schema", true))
    vdb.schemaName = await this.getCurrentSchemaName()

    const refs = []
    for (const [i, stmt] of stmts.entries()) {
      switch (stmt.constructor) {
        case model.CreateDatabaseStatement:
          refs[i] = this.tryCreateDatabaseStatement(i, stmt as model.CreateDatabaseStatement, vdb)
          break
        case model.DropDatabaseStatement:
          refs[i] = this.tryDropDatabaseStatement(i, stmt as model.DropDatabaseStatement, vdb)
          break
        case model.CreateTableStatement:
        case model.CreateViewStatement:
        case model.CreateProcedureStatement:
        case model.CreateFunctionStatement:
        case model.CreateTriggerStatement:
        case model.CreateIndexStatement:
          refs[i] = this.tryCreateObjectStatement(i, stmt, vdb)
          break
        case model.AlterTableStatement:
        case model.AlterViewStatement:
        case model.AlterProcedureStatement:
        case model.AlterFunctionStatement:
          refs[i] = this.tryAlterObjectStatement(i, stmt, vdb)
          break
        case model.DropTableStatement:
        case model.DropViewStatement:
        case model.DropProcedureStatement:
        case model.DropFunctionStatement:
        case model.DropTriggerStatement:
        case model.DropIndexStatement:
          refs[i] = this.tryDropObjectStatement(i, stmt, vdb)
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

  private tryCreateDatabaseStatement(seq: number, stmt: model.CreateDatabaseStatement, vdb: VDatabase) {
    let schema = vdb.schemas.get(stmt.name)
    if (schema && !schema.dropped) {
      throw new Error(`database ${stmt.name} is already in use`)
    }

    const vschema = new VSchema(stmt.name)
    vdb.schemas.set(stmt.name, vschema)
    return vschema
  }

  private tryDropDatabaseStatement(seq: number, stmt: model.DropDatabaseStatement, vdb: VDatabase) {
    const schema = vdb.schemas.get(stmt.name)
    if (!schema || schema.dropped) {
      throw new Error(`no such database: ${stmt.name}`)
    }
    if (schema.system) {
      throw new Error(`cannot drop system database ${stmt.name}`)
    }

    schema.dropped = true
    return schema
  }

  private tryCreateObjectStatement(seq: number, stmt: any, vdb: VDatabase) {
    const type = lcase(stmt.constructor.name.replace(/^Create([a-zA-Z0-9]+)Statement$/, "$1"))

    let schemaName = stmt.schemaName || vdb.schemaName
    if (!schemaName) {
      throw new Error(`No database selected`)
    }

    const schema = vdb.schemas.get(schemaName)
    if (!schema) {
      throw new Error(`unknown database ${schemaName}`)
    }

    let object = schema.get(stmt.name)
    if (object && !object.dropped) {
      throw new Error(`${object.type} ${stmt.name} already exists`)
    }

    if (type === "index") {
      const table = schema.get(stmt.tableName)
      if (!table || table.dropped || table.type !== "table") {
        throw new Error(`no such table: ${schemaName}.${stmt.tableName}`)
      }
    }

    return schema.add(stmt.name, new VObject(type, schema.name, stmt.name, stmt.tableName))
  }

  private tryAlterObjectStatement(seq: number, stmt: Statement, vdb: VDatabase) {
    const type = lcase(stmt.constructor.name.replace(/^Alter([a-zA-Z0-9]+)Statement$/, "$1"))

    let schemaName = (stmt as any)[type].schemaName || vdb.schemaName
    if (!schemaName) {
      throw new Error(`No database selected`)
    }

    const schema = vdb.schemas.get(schemaName)
    if (!schema) {
      throw new Error(`unknown database ${schemaName}`)
    }

    let obj = schema.get((stmt as any)[type].name)
    if (!obj || obj.dropped) {
      throw new Error(`no such table: ${schemaName}.${(stmt as any)[type].name}`)
    } else if (obj.type !== "table") {
      throw new Error(`no such table: ${schemaName}.${(stmt as any)[type].name}`)
    }
/*
    if (stmt.alterTableAction == model.AlterTableAction.RENAME_TABLE && stmt.newTableName) {
      obj.dropped = true
      schema.add(lcase(stmt.newTableName), new VObject("table", schema.name, stmt.newTableName))
      for (const aObj of schema) {
        if (aObj.type === "index" && aObj.tableName && lcase(aObj.tableName) === lcase(aObj.name)) {
          aObj.dropped = true
          schema.add(lcase(aObj.name), new VObject("index", schema.name, aObj.name, stmt.newTableName))
        }
      }
    }
*/
    return obj
  }

  private tryDropObjectStatement(seq: number, stmt: any, vdb: VDatabase) {
    const type = lcase(stmt.constructor.name.replace(/^Drop([a-zA-Z0-9]+)Statement$/, "$1"))
    if (type === "table" || type === "view") {
      const objs = []
      for (const target of stmt[type + "s"]) {
        const schemaName = target.schemaName || vdb.schemaName
        if (!schemaName) {
          throw new Error(`No database selected`)
        }

        const schema = vdb.schemas.get(schemaName)
        if (!schema) {
          throw new Error(`unknown database ${schemaName}`)
        }

        let obj = schema.get(target.name)
        if (!obj || obj.dropped) {
          if (!stmt.ifExists) {
            throw new Error(`no such ${type}: ${schemaName}.${stmt.name}`)
          }
        } else if (obj.type !== type) {
          throw new Error(`no such ${type}: ${schemaName}.${stmt.name}`)
        }

        if (!obj) {
          obj = schema.add(type, new VObject(type, schema.name, stmt.name))
        }
        obj.dropped = true
        objs.push(obj)
      }

      return objs
    }

    const schemaName = stmt[type].schemaName || vdb.schemaName
    if (!schemaName) {
      throw new Error(`No database selected`)
    }

    const schema = vdb.schemas.get(schemaName)
    if (!schema) {
      throw new Error(`unknown database ${schemaName}`)
    }

    let obj = schema.get(stmt[type].name)
    if (!obj || obj.dropped) {
      if (!stmt.ifExists) {
        throw new Error(`no such ${type}: ${schemaName}.${stmt.name}`)
      }
    } else if (obj.type !== type) {
      throw new Error(`no such ${type}: ${schemaName}.${stmt.name}`)
    }

    if (!obj) {
      obj = schema.add(type, new VObject(type, schema.name, stmt.name))
    }
    obj.dropped = true

    return obj
  }
}

class VDatabase {
  schemaName?: string
  schemas = new Map<string, VSchema>()
}

class VSchema {
  private objects = new Map<string, VObject>()
  public dropped = false

  constructor(
    public name: string,
    public system = false,
  ) {
  }

  add(name: string, obj: VObject) {
    this.objects.set(name, obj)
    return obj
  }

  get(name: string) {
    return this.objects.get(name)
  }

  [Symbol.iterator]() {
    return this.objects.values()
  }
}

class VObject {
  public dropped = false

  constructor(
    public type: string,
    public schemaName: string,
    public name: string,
    public tableName?: string,
  ) {
  }
}


function dquote(text: string) {
  return '"' + text.replace(/"/g, '""') + '"'
}

function bquote(text: string) {
  return "`" + text.replace(/`/g, "``") + "`"
}
