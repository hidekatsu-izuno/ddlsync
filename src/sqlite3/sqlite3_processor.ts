import fs from 'fs'
import path from "path"
import { Statement, Token, TokenType } from "../parser"
import { AlterTableStatement, AttachDatabaseStatement, CreateIndexStatement, CreateTableStatement, CreateTriggerStatement, CreateViewStatement, DetachDatabaseStatement, DropIndexStatement, DropTableStatement, DropTriggerStatement, DropViewStatement, ExplainStatement, InsertStatement, NotNullColumnConstraint, PrimaryKeyColumnConstraint, PrimaryKeyTableConstraint, SortOrder, UniqueColumnConstraint, UniqueTableConstraint, UpdateStatement, SelectStatement, BeginTransactionStatement, SavepointStatement, ReleaseSavepointStatement, CommitTransactionStatement, RollbackTransactionStatement } from "./sqlite3_models";
import { DdlSyncProcessor } from "../processor"
import { Sqlite3Parser } from "./sqlite3_parser"
import sqlite3 from "better-sqlite3"
import { lcase, sortBy, ucase } from "../util/functions"
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
          throw Error(`alter table statement is not supported`)
        case DropTableStatement:
        case DropViewStatement:
        case DropTriggerStatement:
        case DropIndexStatement:
          refs[i] = this.tryDropObjectStatement(i, stmt, vdb)
          break
        case InsertStatement:
          refs[i] = this.tryInsertStatement(i, stmt as InsertStatement, vdb)
        default:
          // no handle
      }
    }

    for (const [i, stmt] of stmts.entries()) {
      console.log(`-- ## statement ${i}: ${stmt.summary()}`)
      switch (stmt.constructor) {
        case CreateTableStatement:
        case CreateViewStatement:
        case CreateTriggerStatement:
        case CreateIndexStatement:
            await this.runCreateObjectStatement(i, stmt, refs[i] as VObject)
          break
        case DropTableStatement:
        case DropViewStatement:
        case DropTriggerStatement:
        case DropIndexStatement:
          await this.runDropObjectStatement(i, stmt, refs[i] as VObject)
          break
        case InsertStatement:
          await this.runInsertStatement(i, stmt as InsertStatement, refs[i] as VObject)
          break
        case BeginTransactionStatement:
        case SavepointStatement:
        case ReleaseSavepointStatement:
        case CommitTransactionStatement:
        case RollbackTransactionStatement:
          await this.runTransactionStatement(i, stmt)
          break;
        case SelectStatement:
          await this.runSelectStatement(i, stmt)
          break;
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


  private tryDropObjectStatement(seq: number, stmt: any, vdb: VDatabase) {
    const type = lcase(stmt.constructor.name.replace(/^Drop([a-zA-Z0-9]+)Statement$/, "$1"))
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

  private tryInsertStatement(seq: number, stmt: InsertStatement, vdb: VDatabase) {
    const schemaName = stmt.schemaName ||
      (vdb.get("temp")?.get(stmt.name)?.dropped === false ? "temp" : "main")
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
      this.runScript(this.toSQL(stmt), false)
    } else {
      const meta = this.getTableMetaData(obj.schemaName, obj.name)
      if (!meta) {
        // create new object if not exists
        this.runScript(this.toSQL(stmt), false)
      } else {
        const stmt2 = (await this.parse(meta.sql || ""))[0]
        if (!stmt2) {
          throw new Error(`Failed to get metadata: ${obj.schemaName}.${obj.name}`)
        }

        if (!this.isSame(stmt, stmt2)) {
          if (
            stmt2 instanceof CreateTableStatement && !stmt2.virtual &&
            stmt instanceof CreateTableStatement && !stmt.virtual && !(stmt as any).asSelect
          ) {
            if (this.hasData(obj.schemaName, obj.name)) {
              const columnMappings = this.mapColumns(stmt, stmt2)
              const backupTableName = `~${this.timestamp()} ${obj.name}`

              // backup src table
              this.runScript(`ALTER TABLE ${bquote(obj.schemaName)}.${bquote(obj.name)} RENAME TO ${bquote(backupTableName)}`, false)
              // create new table
              this.runScript(this.toSQL(stmt), false)
              // restore data
              this.runScript(`INSERT INTO ${bquote(obj.schemaName)}.${bquote(obj.name)} ` +
                `(${columnMappings.srcColumns.join(", ")}) ` +
                `SELECT ${columnMappings.destColumns.join(", ")} ` +
                `FROM ${bquote(obj.schemaName)}.${bquote(backupTableName)} ` +
                `ORDER BY ${columnMappings.sortColumns.join(", ")}`, false)
              // drop backup table
              if (columnMappings.compatible) {
                this.runScript(`DROP TABLE IF EXISTS ${bquote(obj.schemaName)}.${bquote(backupTableName)}`, false)
              } else {
                console.log(`-- backup: ${obj.type} ${obj.schemaName}.${obj.name} is backuped as ${backupTableName}. this must be resolved manually`)
              }
            } else {
              // drop object
              this.runScript(`DROP ${ucase(meta.type)} IF EXISTS ${bquote(obj.schemaName)}.${bquote(obj.name)}`, false)
              // create new object
              this.runScript(this.toSQL(stmt), false)
            }
          } else {
            // backup src table if object is a normal table
            if (stmt2 instanceof CreateTableStatement && !stmt2.virtual) {
              if (this.hasData(obj.schemaName, obj.name)) {
                this.backupTableData(obj.schemaName, obj.name)
              }
            }

            // drop object
            this.runScript(`DROP ${ucase(meta.type)} IF EXISTS ${bquote(obj.schemaName)}.${bquote(obj.name)}`, false)
            // create new object
            this.runScript(this.toSQL(stmt), false)
          }
        } else {
          console.log(`-- skip: ${obj.type} ${obj.schemaName}.${obj.name} is unchangeed`)
        }
      }
    }
  }

  private async runDropObjectStatement(seq: number, stmt: Statement, obj: VObject) {
    if (lcase(obj.schemaName) === "temp") {
      this.runScript(this.toSQL(stmt), false)
    } else {
      const meta = this.getTableMetaData(obj.schemaName, obj.name)
      if (meta && meta.type === obj.type) {
        this.runScript(this.toSQL(stmt), false)
      } else {
        console.log(`-- skip: ${obj.type} ${obj.schemaName}.${obj.name} is not found`)
      }
    }
  }

  private async runInsertStatement(seq: number, stmt: InsertStatement, table: VObject) {
    if (lcase(table.schemaName) === "temp") {
      this.runScript(this.toSQL(stmt), false)
    } else {
      const hasData = this.hasData(table.schemaName, table.name)
      if (!hasData) {
        this.runScript(this.toSQL(stmt), false)
      } else {
        console.log(`-- skip: ${table.schemaName}.${table.name} has data`)
      }
    }
  }

  private async runTransactionStatement(seq: number, stmt: Statement) {
    console.log(`-- skip: transaction control is ignroed`)
  }

  private async runSelectStatement(seq: number, stmt: Statement) {
    this.runScript(this.toSQL(stmt), true)
  }

  private async runStatement(seq: number, stmt: Statement) {
    this.runScript(this.toSQL(stmt), false)
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

  private getSelectSQL(stmt: CreateTableStatement) {
    // TODO
    return ""
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

  private isSame(stmt1: Statement, stmt2: Statement) {
    if (stmt1.constructor.name !== stmt2.constructor.name) {
      return false
    }

    if ((stmt1 as any).virtual !== (stmt2 as any).virtual) {
      return false
    }

    let tokens1 = stmt1.tokens
    let startPos1 = stmt1.markers.get("nameStart") || 0
    if ((stmt1 as any).asSelect) {
      const nameEnd = stmt1.markers.get("nameEnd") || 0
      const selectStart = stmt1.markers.get("selectStart") || 0
      const selectEnd = stmt1.markers.get("selectEnd") || 0
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
    const tokens2 = stmt2.tokens
    const startPos2 = stmt2.markers.get("nameStart") || 0

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

  private mapColumns(stmt1: CreateTableStatement, stmt2: CreateTableStatement) {
    return {
      compatible: true,
      srcColumns: [],
      destColumns: [],
      sortColumns:[],
    }
  }

  private runScript(script: string, hasResult: boolean) {
    console.log(script + ";")
    if (!this.dryrun) {
      const stmt = this.con.prepare(script)
      if (hasResult) {
        let count = 0
        for (const row of stmt.iterate()) {
          count++
        }
        console.log(`-- result: ${count} records`)
      } else {
        const result = stmt.run()
        console.log(`-- result: ${result.changes} records`)
      }
    }
  }

  private async backupTableData(schemaName: string, name: string) {
    const backupDir = path.join(this.config.ddlsync.workDir, "backup")
    await fs.promises.mkdir(backupDir, { recursive: true })

    const backupFileName = path.join(
      backupDir,
      `${schemaName}-${name}-${this.timestamp()}.csv.gz`
    )

    const stmt = this.con.prepare(`SELECT * FROM ${bquote(schemaName)}.${bquote(name)}`)
    await writeGzippedCsv(backupFileName, (async function *() {
      yield stmt.columns().map(column => column.name);
      yield* stmt.raw().iterate();
    })())
  }
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

function dquote(text: string) {
  return '"' + text.replace(/`/g, '""') + '"'
}

function bquote(text: string) {
  return "`" + text.replace(/`/g, "``") + "`"
}
