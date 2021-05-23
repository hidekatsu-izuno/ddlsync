import fs from 'fs'
import path from "path"
import sqlite3 from "better-sqlite3"
import { Statement } from "../models"
import { Token, TokenType } from "../parser"
import { DdlSyncProcessor } from "../processor"
import { AlterTableStatement, AttachDatabaseStatement, CreateIndexStatement, CreateTableStatement, CreateTriggerStatement, CreateViewStatement, DetachDatabaseStatement, DropIndexStatement, DropTableStatement, DropTriggerStatement, DropViewStatement, ExplainStatement, InsertStatement, NotNullColumnConstraint, PrimaryKeyColumnConstraint, PrimaryKeyTableConstraint, SortOrder, UniqueColumnConstraint, UniqueTableConstraint, UpdateStatement, SelectStatement,  DeleteStatement, AlterTableAction, GeneratedColumnConstraint, ColumnDef, getAffinityType, AffinityType, DefaultColumnConstraint } from "./sqlite3_models";
import { Sqlite3Parser } from "./sqlite3_parser"
import { lcase, ucase, bquote, dquote } from "../util/functions"
import { writeGzippedCsv } from '../util/io'

export default class Sqlite3Processor extends DdlSyncProcessor {
  private con

  constructor(config: { [key: string]: any }) {
    super(config)
    this.con = sqlite3(config.database || ":memory:")
  }

  async parse(input: string, options?: { [key: string]: any}) {
    const parser = new Sqlite3Parser(input, options)
    return await parser.root()
  }

  async run(stmts: Statement[], dryrun: boolean = false) {
    const vdb = new VDatabase()
    vdb.add("main")
    vdb.add("temp")

    const refs = []
    for (const [i, stmt] of stmts.entries()) {
      switch (stmt.constructor) {
        case AttachDatabaseStatement:
          refs[i] = this.tryAttachDatabaseStatement(i, stmt as AttachDatabaseStatement, vdb)
          break
        case DetachDatabaseStatement:
          refs[i] = this.tryDetachDatabaseStatement(i, stmt as DetachDatabaseStatement, vdb)
          break
        case CreateTableStatement:
        case CreateViewStatement:
        case CreateTriggerStatement:
        case CreateIndexStatement:
          refs[i] = this.tryCreateObjectStatement(i, stmt, vdb)
          break
        case AlterTableStatement:
          refs[i] = this.tryAlterTableStatement(i, stmt as AlterTableStatement, vdb)
          break
        case DropTableStatement:
        case DropViewStatement:
        case DropTriggerStatement:
        case DropIndexStatement:
          refs[i] = this.tryDropObjectStatement(i, stmt, vdb)
          break
        case InsertStatement:
        case UpdateStatement:
        case DeleteStatement:
          refs[i] = this.tryUpdateStatement(i, stmt, vdb)
        default:
          // no handle
      }
    }

    for (const [i, stmt] of stmts.entries()) {
      console.log(`-- ## statement ${i+1}: ${stmt.summary()}`)
      switch (stmt.constructor) {
        case CreateTableStatement:
        case CreateViewStatement:
        case CreateTriggerStatement:
        case CreateIndexStatement:
            await this.runCreateObjectStatement(i, stmt, refs[i] as VObject)
          break
        case InsertStatement:
        case UpdateStatement:
        case DeleteStatement:
          await this.runStatement(i, stmt, QueryType.UPDATE)
          break
        case SelectStatement:
          await this.runStatement(i, stmt, QueryType.SELECT)
          break
        default:
          await this.runStatement(i, stmt)
      }
      console.log()
    }
  }

  async destroy()  {
    this.con.close()
  }

  private tryAttachDatabaseStatement(seq: number, stmt: AttachDatabaseStatement, vdb: VDatabase) {
    let schema = vdb.get(stmt.name)
    if (schema) {
      if (schema.dropped) {
        throw new Error(`multiple attach for same database name is not supported: ${stmt.name}`)
      }
      throw new Error(`database ${stmt.name} is already in use`)
    }

    return vdb.add(stmt.name)
  }

  private tryDetachDatabaseStatement(seq: number, stmt: DetachDatabaseStatement, vdb: VDatabase) {
    const schema = vdb.get(stmt.name)
    if (!schema || schema.dropped) {
      throw new Error(`no such database: ${stmt.name}`)
    }
    if (lcase(stmt.name) === "main" || lcase(stmt.name) === "temp") {
      throw new Error(`cannot detach database ${stmt.name}`)
    }

    schema.dropped = true
    return schema
  }

  private tryCreateObjectStatement(seq: number, stmt: any, vdb: VDatabase) {
    const type = lcase(stmt.constructor.name.replace(/^Create([a-zA-Z0-9]+)Statement$/, "$1"))

    let schemaName = stmt.schemaName
    if (!schemaName) {
      if (type === "index") {
        const tempObject = vdb.get("temp")?.get(stmt.name)
        schemaName = tempObject && !tempObject.dropped ? "temp" : "main"
      } else {
        schemaName = stmt.temporary ? "temp" : "main"
      }
    }

    const schema = vdb.get(schemaName)
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

    return schema.add(type, stmt.name, stmt.tableName)
  }

  private tryAlterTableStatement(seq: number, stmt: AlterTableStatement, vdb: VDatabase) {
    let schemaName = stmt.schemaName
    if (!schemaName) {
      const tempObject = vdb.get("temp")?.get(stmt.name)
      schemaName = tempObject && !tempObject.dropped ? "temp" : "main"
    }

    const schema = vdb.get(schemaName)
    if (!schema) {
      throw new Error(`unknown database ${schemaName}`)
    }

    let obj = schema.get(stmt.name)
    if (!obj || obj.dropped) {
      throw new Error(`no such table: ${schemaName}.${stmt.name}`)
    } else if (obj.type !== "table") {
      throw new Error(`no such table: ${schemaName}.${stmt.name}`)
    }

    if (stmt.alterTableAction == AlterTableAction.RENAME_TABLE && stmt.newTableName) {
      obj.dropped = true
      schema.add("table", stmt.newTableName)
      for (const aObj of schema) {
        if (aObj.type === "index" && aObj.tableName && lcase(aObj.tableName) === lcase(aObj.name)) {
          aObj.dropped = true
          schema.add("index", aObj.name, stmt.newTableName)
        }
      }
    }

    return obj
  }

  private tryDropObjectStatement(seq: number, stmt: any, vdb: VDatabase) {
    const type = lcase(stmt.constructor.name.replace(/^Drop([a-zA-Z0-9]+)Statement$/, "$1"))
    let schemaName = stmt.schemaName
    if (!schemaName) {
      const tempObject = vdb.get("temp")?.get(stmt.name)
      schemaName = tempObject && !tempObject.dropped ? "temp" : "main"
    }

    const schema = vdb.get(schemaName)
    if (!schema) {
      throw new Error(`unknown database ${schemaName}`)
    }

    let object = schema.get(stmt.name)
    if (!object || object.dropped) {
      if (stmt.ifExists) {
        if (!object) {
          object = schema.add(type, stmt.name)
          object.dropped = true
        }
        return object
      }
      throw new Error(`no such ${type}: ${schemaName}.${stmt.name}`)
    } else if (object.type !== type) {
      throw new Error(`no such ${type}: ${schemaName}.${stmt.name}`)
    }

    object.dropped = true

    if (type === "table") {
      for (const object of schema) {
        if (object.type === "index" && object.tableName && lcase(object.tableName) === lcase(object.name)) {
          object.dropped = true
        }
      }
    }

    return object
  }

  private tryUpdateStatement(seq: number, stmt: any, vdb: VDatabase) {
    let schemaName = stmt.schemaName
    if (!schemaName) {
      const tempObject = vdb.get("temp")?.get(stmt.name)
      schemaName = tempObject && !tempObject.dropped ? "temp" : "main"
    }

    const schema = vdb.get(schemaName)
    if (!schema) {
      throw new Error(`unknown database ${schemaName}`)
    }

    const table = schema.get(stmt.name)
    if (!table || table.dropped || table.type !== "table") {
      throw new Error(`no such table: ${schemaName}.${stmt.name}`)
    }

    return table
  }

  private async runCreateObjectStatement(seq: number, stmt: Statement, obj: VObject) {
    if (obj.dropped) {
      console.log(`-- skip: ${obj.type} ${obj.schemaName}.${obj.name} is dropped`)
    } else if (lcase(obj.schemaName) === "temp") {
      this.runScript(this.toSQL(stmt))
    } else {
      const meta = this.getTableMetaData(obj.schemaName, obj.name)
      if (!meta) {
        // create new object if not exists
        this.runScript(this.toSQL(stmt))
      } else {
        const oldStmt = (await this.parse(meta.sql || ""))[0]
        if (!oldStmt) {
          throw new Error(`Failed to get metadata: ${obj.schemaName}.${obj.name}`)
        }

        if (!this.isSame(stmt, oldStmt)) {
          if (
            stmt instanceof CreateTableStatement && !stmt.virtual && !(stmt as any).asSelect &&
            oldStmt instanceof CreateTableStatement && !oldStmt.virtual
          ) {
            if (this.hasData(obj.schemaName, obj.name)) {
              const columnMappings = this.mapColumns(stmt, oldStmt)
              const backupTableName = `~${this.timestamp(seq)} ${obj.name}`

              if (!columnMappings.compatible && this.config.backupMode === "file") {
                const backupFilename = await this.backupTableData(seq, obj.schemaName, obj.name)
                console.log(`-- backup: ${obj.type} ${obj.schemaName}.${obj.name} is backuped to ${dquote(backupFilename)}. you may need to resolve manually`)
              }

              // backup src table
              this.runScript(`ALTER TABLE ${bquote(obj.schemaName)}.${bquote(obj.name)} RENAME TO ${bquote(backupTableName)}`)
              if (!columnMappings.compatible && this.config.backupMode === "table") {
                console.log(`-- backup: ${obj.type} ${obj.schemaName}.${obj.name} is backuped as table ${dquote(backupTableName)}. you may need to resolve manually`)
              }

              // create new table
              this.runScript(this.toSQL(stmt))
              // restore data
              this.runScript(`INSERT INTO ${bquote(obj.schemaName)}.${bquote(obj.name)} ` +
                `(${columnMappings.destColumns.join(", ")}) ` +
                `SELECT ${columnMappings.srcColumns.join(", ")} ` +
                `FROM ${bquote(obj.schemaName)}.${bquote(backupTableName)} ` +
                `ORDER BY ${columnMappings.sortColumns.join(", ")}`, QueryType.UPDATE)
              if (columnMappings.compatible || this.config.backupMode === "file") {
                // drop backup table
                this.runScript(`DROP TABLE IF EXISTS ${bquote(obj.schemaName)}.${bquote(backupTableName)}`)
              }
            } else {
              // drop object
              this.runScript(`DROP ${ucase(meta.type)} IF EXISTS ${bquote(obj.schemaName)}.${bquote(obj.name)}`)
              // create new object
              this.runScript(this.toSQL(stmt))
            }
          } else {
            // backup src table if object is a normal table
            if (
              oldStmt instanceof CreateTableStatement && !oldStmt.virtual &&
              this.hasData(obj.schemaName, obj.name)
            ) {
              // backup src table
              if (this.config.backupMode === "file") {
                const backupFilename = await this.backupTableData(seq, obj.schemaName, obj.name)
                console.log(`-- backup: ${obj.type} ${obj.schemaName}.${obj.name} is backuped to ${dquote(backupFilename)}. you may need to resolve manually`)
                this.runScript(`DROP ${ucase(meta.type)} IF EXISTS ${bquote(obj.schemaName)}.${bquote(obj.name)}`)
              } else {
                const backupTableName = `~${this.timestamp(seq)} ${obj.name}`
                this.runScript(`ALTER TABLE ${bquote(obj.schemaName)}.${bquote(obj.name)} RENAME TO ${bquote(backupTableName)}`)
                console.log(`-- backup: ${obj.type} ${obj.schemaName}.${obj.name} is backuped as table ${dquote(backupTableName)}. you may need to resolve manually`)
              }

              // create new object
              this.runScript(this.toSQL(stmt))
            } else {
              // drop object
              this.runScript(`DROP ${ucase(meta.type)} IF EXISTS ${bquote(obj.schemaName)}.${bquote(obj.name)}`)
              // create new object
              this.runScript(this.toSQL(stmt))
            }
          }
        } else {
          console.log(`-- skip: ${obj.type} ${obj.schemaName}.${obj.name} is unchangeed`)
        }
      }
    }
  }

  private async runStatement(seq: number, stmt: Statement, type: QueryType = QueryType.DEFINE) {
    this.runScript(this.toSQL(stmt), type)
  }

  private toSQL(stmt: Statement) {
    let tokens = stmt.tokens
    if ((stmt as any).ifNotExists) {
      const start = stmt.markers.get("ifNotExistsStart")
      const end = stmt.markers.get("ifNotExistsEnd")
      if (start != null && end != null && end - start > 0) {
        tokens = tokens.splice(start, end - start)
      }
    }
    return Token.concat(tokens)
  }

  private getTableMetaData(schemaName: string, name: string) {
    return this.con
      .prepare(`SELECT type, sql FROM ${bquote(schemaName)}.sqlite_master WHERE name = ? COLLATE NOCASE LIMIT 1`)
      .get(name)
  }

  private hasData(schemaName: string, name: string) {
    return !!this.con
      .prepare(`SELECT 1 FROM ${bquote(schemaName)}.${bquote(name)} LIMIT 1`)
      .get()
  }

  private isSame(newStmt: Statement, oldStmt: Statement) {
    if (newStmt.constructor.name !== oldStmt.constructor.name) {
      return false
    }

    if ((newStmt as any).virtual !== (oldStmt as any).virtual) {
      return false
    }

    let tokens1 = newStmt.tokens
    let startPos1 = newStmt.markers.get("nameStart") || 0
    if ((newStmt as any).asSelect) {
      const nameEnd = newStmt.markers.get("nameEnd") || 0
      const selectStart = newStmt.markers.get("selectStart") || 0
      const selectEnd = newStmt.markers.get("selectEnd") || 0
      const columns = this.con.prepare(Token.concat(tokens1.slice(selectStart, selectEnd))).columns()
      const newTokens = [...tokens1.slice(0, nameEnd)]
      newTokens.push(new Token(TokenType.LeftParen, "("))
      for (let i = 0; i < columns.length; i++) {
        if (i > 0) {
          newTokens.push(new Token(TokenType.Comma, ","))
        }
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columns[i].name)) {
          newTokens.push(new Token(TokenType.Identifier, columns[i].name))
        } else {
          newTokens.push(new Token(TokenType.QuotedValue, dquote(columns[i].name)))
        }
      }
      newTokens.push(new Token(TokenType.RightParen, ")"))
      tokens1 = newTokens
    }

    const tokens2 = oldStmt.tokens
    const startPos2 = oldStmt.markers.get("nameStart") || 0

    if (tokens1.length - startPos1 !== tokens2.length - startPos2) {
      return false
    }

    for (let i = 0; i < tokens1.length - startPos1; i++) {
      const token1 = tokens1[startPos1 + i]
      const token2 = tokens2[startPos2 + i]
      if (token1.text !== token2.text) {
        return false
      }
    }

    return true
  }

  private mapColumns(newStmt: CreateTableStatement, oldStmt: CreateTableStatement) {
    const oldColumns = (oldStmt.columns || []).reduce((prev, current) => {
      prev.set(lcase(current.name), current)
      return prev
    }, new Map<string, ColumnDef>())

    const droppedColumns = new Map<string, ColumnDef>(oldColumns)
    const srcColumns = []
    const destColumns = []
    let sortColumns = []

    let newPkeyColumns = new Map<string, string>()
    for (const newCnst of newStmt.constraints || []) {
      if (newPkeyColumns.size === 0 && newCnst instanceof PrimaryKeyTableConstraint) {
        for (const newCnstCols of newCnst.columns) {
          let sortColumn = bquote(newCnstCols.name || "")
          if (newCnstCols.sortOrder === SortOrder.DESC) {
            sortColumn += " DESC"
          }
          newPkeyColumns.set(lcase(newCnstCols.name || ""), sortColumn)
        }
      }
    }
    for (const newColumn of newStmt.columns || []) {
      let autoIncrement = false
      let notNull = false
      let defaultValue = false
      let generated = false
      for (const newCnst of newColumn.constraints) {
        if (newPkeyColumns.size === 0 && newCnst instanceof PrimaryKeyColumnConstraint) {
          if (newCnst.autoIncrement) {
            autoIncrement = true
          }
          let sortColumn = bquote(newColumn.name)
          if (newCnst.sortOrder === SortOrder.DESC) {
            sortColumn += " DESC"
          }
          newPkeyColumns.set(lcase(newColumn.name), sortColumn)
        } else if (newCnst instanceof NotNullColumnConstraint) {
          notNull = true
        } else if (newCnst instanceof DefaultColumnConstraint) {
          defaultValue = true
        } else if (newCnst instanceof GeneratedColumnConstraint) {
          generated = true
        }
      }

      if (generated) {
        // skip
      } else {
        const oldColumn = oldColumns.get(lcase(newColumn.name))
        if (oldColumn) {
          srcColumns.push(bquote(oldColumn.name))
          destColumns.push(bquote(newColumn.name))
          droppedColumns.delete(lcase(newColumn.name))
        } else if (autoIncrement || defaultValue) {
          // skip
        } else if (notNull) {
          const atype = getAffinityType(newColumn.typeName)
          if (atype === AffinityType.TEXT) {
            srcColumns.push(`'' AS ${bquote(newColumn.name)}`)
          } else if (atype === AffinityType.BLOB) {
            srcColumns.push(`X'00' AS ${bquote(newColumn.name)}`)
          } else {
            srcColumns.push(`0 AS ${bquote(newColumn.name)}`)
          }
          destColumns.push(bquote(newColumn.name))
        } else {
          srcColumns.push(`NULL AS ${bquote(newColumn.name)}`)
          destColumns.push(bquote(newColumn.name))
        }
      }
    }
    if (newPkeyColumns.size > 0) {
      sortColumns = Array.from(newPkeyColumns.values())
    } else {
      sortColumns = destColumns
    }

    return {
      compatible: droppedColumns.size === 0,
      srcColumns,
      destColumns,
      sortColumns,
    }
  }

  private runScript(script: string, type: QueryType = QueryType.DEFINE) {
    console.log(script + ";")
    if (!this.dryrun) {
      const stmt = this.con.prepare(script)
      if (type === QueryType.SELECT) {
        let count = 0
        for (const row of stmt.iterate()) {
          count++
        }
        console.log(`-- result: ${count} records`)
      } else if (type === QueryType.UPDATE) {
        const result = stmt.run()
        console.log(`-- result: ${result.changes} records`)
      } else {
        stmt.run()
      }
    }
  }

  private async backupTableData(seq: number, schemaName: string, name: string) {
    const backupDir = path.join(this.config.ddlsync.workDir, "backup")
    await fs.promises.mkdir(backupDir, { recursive: true })

    const backupFileName = path.join(
      backupDir,
      `~${this.timestamp(seq)}-${schemaName}-${name}.csv.gz`
    )

    const stmt = this.con.prepare(`SELECT * FROM ${bquote(schemaName)}.${bquote(name)}`)
    await writeGzippedCsv(backupFileName, (async function *() {
      yield stmt.columns().map(column => column.name);
      yield* stmt.raw().iterate();
    })())

    return backupFileName
  }
}

enum QueryType {
  DEFINE,
  UPDATE,
  SELECT,
}

class VDatabase {
  private schemas = new Map<string, VSchema>()

  add(name: string) {
    const schema = new VSchema(name)
    this.schemas.set(lcase(schema.name), schema)
    return schema
  }

  get(name: string) {
    return this.schemas.get(lcase(name))
  }

  [Symbol.iterator]() {
    return this.schemas.values()
  }
}

class VSchema {
  private objects = new Map<string, VObject>()
  public dropped = false

  constructor(
    public name: string,
  ) {
  }

  add(type: string, name: string, tableName?: string) {
    const object = new VObject(type, this.name, name, tableName)
    this.objects.set(lcase(name), object)
    return object
  }

  get(name: string) {
    return this.objects.get(lcase(name))
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
