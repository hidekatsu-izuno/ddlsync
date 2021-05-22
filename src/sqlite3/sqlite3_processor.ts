import { knex, Knex } from "knex"
import fs from 'fs'
import path from "path"
import { Transform } from "stream"
import zlib from "zlib"
import { Statement, Token } from "../parser"
import { AlterTableStatement, AttachDatabaseStatement, CreateIndexStatement, CreateTableStatement, CreateTriggerStatement, CreateViewStatement, DetachDatabaseStatement, DropIndexStatement, DropTableStatement, DropTriggerStatement, DropViewStatement, ExplainStatement, InsertStatement, NotNullColumnConstraint, PrimaryKeyColumnConstraint, PrimaryKeyTableConstraint, SortOrder, UniqueColumnConstraint, UniqueTableConstraint, UpdateStatement, SelectStatement, BeginTransactionStatement, SavepointStatement, ReleaseSavepointStatement, CommitTransactionStatement, RollbackTransactionStatement } from "./sqlite3_models";
import { DdlSyncProcessor } from "../processor"
import { Sqlite3Parser } from "./sqlite3_parser"
import { lcase, sortBy, ucase } from "../util/functions"

export default class Sqlite3Processor extends DdlSyncProcessor {
  private con: Knex

  constructor(config: { [key: string]: any }) {
    super("sqlite3", config)
    this.con = knex(config)
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
          refs[i] = await this.tryAttachDatabaseStatement(i, stmt as AttachDatabaseStatement, vdb)
          break
        case DetachDatabaseStatement:
          refs[i] = await this.tryDetachDatabaseStatement(i, stmt as DetachDatabaseStatement, vdb)
          break
        case CreateTableStatement:
        case CreateViewStatement:
        case CreateTriggerStatement:
        case CreateIndexStatement:
          refs[i] = await this.tryCreateObjectStatement(i, stmt, vdb)
          break
        case AlterTableStatement:
          throw Error(`[plan] alter table statement is not supported`)
        case DropTableStatement:
        case DropViewStatement:
        case DropTriggerStatement:
        case DropIndexStatement:
          refs[i] = await this.tryDropObjectStatement(i, stmt, vdb)
          break
        case InsertStatement:
          refs[i] = await this.tryInsertStatement(i, stmt as InsertStatement, vdb)
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
            await this.runCreateObjectStatement(i, stmt, refs[i] as VObject, dryrun)
          break
        case DropTableStatement:
        case DropViewStatement:
        case DropTriggerStatement:
        case DropIndexStatement:
          await this.runDropObjectStatement(i, stmt, refs[i] as VObject, dryrun)
          break
        case InsertStatement:
          await this.runInsertStatement(i, stmt as InsertStatement, refs[i] as VObject, dryrun)
          break
        case BeginTransactionStatement:
        case SavepointStatement:
        case ReleaseSavepointStatement:
        case CommitTransactionStatement:
        case RollbackTransactionStatement:
          await this.runTransactionStatement(i, stmt, dryrun)
          break;
        default:
          await this.runStatement(i, stmt, dryrun)
      }
      console.log()
    }
  }

  async destroy()  {
    await this.con.destroy()
  }

  private tryAttachDatabaseStatement(seq: number, stmt: AttachDatabaseStatement, vdb: VDatabase) {
    let schema = vdb.get(stmt.name)
    if (schema) {
      if (schema.dropped) {
        throw new Error(`[plan] multiple attach for same database name is not supported: ${stmt.name}`)
      }
      throw new Error(`[plan] database ${stmt.name} is already in use`)
    }

    return vdb.add(stmt.name)
  }

  private tryDetachDatabaseStatement(seq: number, stmt: DetachDatabaseStatement, vdb: VDatabase) {
    const schema = vdb.get(stmt.name)
    if (!schema || schema.dropped) {
      throw new Error(`[plan] no such database: ${stmt.name}`)
    }
    if (lcase(stmt.name) === "main" || lcase(stmt.name) === "temp") {
      throw new Error(`[plan] cannot detach database ${stmt.name}`)
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
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    let object = schema.get(stmt.name)
    if (object && !object.dropped) {
      throw new Error(`[plan] ${object.type} ${stmt.name} already exists`)
    }

    if (type === "index") {
      const table = schema.get(stmt.tableName)
      if (!table || table.dropped || table.type !== "table") {
        throw new Error(`[plan] no such table: ${schemaName}.${stmt.tableName}`)
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
      throw new Error(`[plan] unknown database ${schemaName}`)
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
      throw new Error(`[plan] no such ${type}: ${schemaName}.${stmt.name}`)
    } else if (object.type !== type) {
      throw new Error(`[plan] no such ${type}: ${schemaName}.${stmt.name}`)
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
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    const table = schema.get(stmt.name)
    if (!table || table.dropped || table.type !== "table") {
      throw new Error(`[plan] no such table: ${schemaName}.${stmt.name}`)
    }

    return table
  }

  private async runCreateObjectStatement(seq: number, stmt: Statement, obj: VObject, dryrun: boolean) {
    if (obj.dropped) {
      console.log(`-- skip: ${obj.type} ${obj.schemaName}.${obj.name} is dropped`)
    } else if (lcase(obj.schemaName) === "temp") {
      await await this.runScript(this.createScript(stmt))
    } else {
      const meta = await this.getTableMetaData(obj.schemaName, obj.name)
      if (!meta) {
        // create new object if not exists
        await this.runScript(this.createScript(stmt))
      } else {
        const stmt2 = (await this.parse(meta.sql || ""))[0]
        if (!stmt2) {
          throw new Error(`Failed to get metadata: ${obj.schemaName}.${obj.name}`)
        }

        if ((stmt as any).asSelect || !this.isSame(stmt, stmt2)) {
          if (
            stmt2 instanceof CreateTableStatement && !stmt2.virtual &&
            stmt instanceof CreateTableStatement && !stmt.virtual && !(stmt as any).asSelect
          ) {
            if (await this.hasData(obj.schemaName, obj.name)) {
              const columnMappings = this.mapColumns(stmt, stmt2)
              const backupTableName = `~${this.timestamp()} ${obj.name}`

              // backup src table
              await this.runScript(`ALTER TABLE ${iquote(obj.schemaName)}.${iquote(obj.name)} RENAME TO ${iquote(backupTableName)}`)
              // create new table
              await this.runScript(this.createScript(stmt))
              // restore data
              await this.runScript(`INSERT INTO ${iquote(obj.schemaName)}.${iquote(obj.name)} ` +
                `(${columnMappings.srcColumns.join(", ")}) ` +
                `SELECT ${columnMappings.destColumns.join(", ")} ` +
                `FROM ${iquote(obj.schemaName)}.${iquote(backupTableName)} ` +
                `ORDER BY ${columnMappings.sortColumns.join(", ")}`)
              // drop backup table
              if (columnMappings.compatible) {
                await this.runScript(`DROP TABLE IF EXISTS ${iquote(obj.schemaName)}.${iquote(backupTableName)}`)
              } else {
                console.log(`-- backup: ${obj.type} ${obj.schemaName}.${obj.name} is backuped as ${backupTableName}. this must be resolved manually`)
              }
            } else {
              // drop object
              await this.runScript(`DROP ${ucase(meta.type)} IF EXISTS ${iquote(obj.schemaName)}.${iquote(obj.name)}`)
              // create new object
              await this.runScript(this.createScript(stmt))
            }
          } else {
            // backup src table if object is a normal table
            if (stmt2 instanceof CreateTableStatement && !stmt2.virtual) {
              if (await this.hasData(obj.schemaName, obj.name)) {
                await this.backupTableData(obj.schemaName, obj.name)
              }
            }

            // drop object
            await this.runScript(`DROP ${ucase(meta.type)} IF EXISTS ${iquote(obj.schemaName)}.${iquote(obj.name)}`)
            // create new object
            await this.runScript(this.createScript(stmt))
          }
        } else {
          console.log(`-- skip: ${obj.type} ${obj.schemaName}.${obj.name} is unchangeed`)
        }
      }
    }
  }

  private async runDropObjectStatement(seq: number, stmt: Statement, obj: VObject, dryrun: boolean) {
    if (lcase(obj.schemaName) === "temp") {
      await this.runScript(this.createScript(stmt))
    } else {
      const meta = await this.getTableMetaData(obj.schemaName, obj.name)
      if (meta && meta.type === obj.type) {
        await this.runScript(this.createScript(stmt))
      } else {
        console.log(`-- skip: ${obj.type} ${obj.schemaName}.${obj.name} is not found`)
      }
    }
  }

  private async runInsertStatement(seq: number, stmt: InsertStatement, table: VObject, dryrun: boolean) {
    const scripts = []
    if (lcase(table.schemaName) === "temp") {
      await await this.runScript(this.createScript(stmt))
    } else {
      const hasData = await this.hasData(table.schemaName, table.name)
      if (!hasData) {
        await await this.runScript(this.createScript(stmt))
      } else {
        console.log(`-- skip: ${table.schemaName}.${table.name} has data`)
      }
    }
  }

  private async runTransactionStatement(seq: number, stmt: Statement, dryrun: boolean) {
    console.log(`-- skip: transaction control is ignroed`)
  }

  private async runStatement(seq: number, stmt: Statement, dryrun: boolean) {
    await await this.runScript(this.createScript(stmt))
  }

  private createScript(stmt: Statement) {
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

  private async getTableMetaData(schemaName: string, name: string) {
    const result = await this.con.raw(
      `SELECT type, sql FROM ${iquote(schemaName)}.sqlite_master WHERE name = ? COLLATE NOCASE LIMIT 1`,
      [name]
    ) as any
    return result.length ? result[0] : undefined
  }

  private async hasData(schemaName: string, name: string) {
    const result = await this.con.raw(`SELECT 1 FROM ${iquote(schemaName)}.${iquote(name)} LIMIT 1`)
    return !!result.length
  }

  private isSame(stmt1: Statement, stmt2: Statement) {
    if (stmt1.constructor.name !== stmt2.constructor.name) {
      return false
    }

    if ((stmt1 as any).virtual !== (stmt2 as any).virtual) {
      return false
    }

    const tokens1 = stmt1.tokens
    const startPos1 = stmt1.markers.get("nameStart") || 0
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

  private async runScript(script: string) {
    console.log(script + ";")
    if (!this.dryrun) {
      const result = await this.con.raw(script)
      if (result && result.length) {
        console.log(`-- result: ${result.length} records`)
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

    let count = 0
    await this.con
      .withSchema(schemaName)
      .select("*")
      .from(name)
      .stream(stream => {
        stream
          .pipe(new Transform({
            objectMode: true,
            transform(chunk, encoding, done) {
              if (count == 0) {
                this.push(`header\n`)
              }
              count++
              done()
            },
          }))
          .pipe(zlib.createGzip())
          .pipe(fs.createWriteStream(backupFileName))
      })
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

function iquote(text: string) {
  return "`" + text.replace(/`/g, "``") + "`"
}
