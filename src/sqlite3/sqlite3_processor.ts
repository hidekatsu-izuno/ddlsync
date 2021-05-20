import { Statement, Token, TokenType } from "../parser"
import { AlterTableStatement, AttachDatabaseStatement, CreateIndexStatement, CreateTableStatement, CreateTriggerStatement, CreateViewStatement, DetachDatabaseStatement, DropIndexStatement, DropTableStatement, DropTriggerStatement, DropViewStatement, ExplainStatement, InsertStatement, NotNullColumnConstraint, PrimaryKeyColumnConstraint, PrimaryKeyTableConstraint, SortOrder, UniqueColumnConstraint, UniqueTableConstraint, UpdateStatement, SelectStatement, BeginTransactionStatement, SavepointStatement, ReleaseSavepointStatement, CommitTransactionStatement, RollbackTransactionStatement } from "./sqlite3_models";
import { DdlSyncProcessor } from "../processor"
import { Sqlite3Parser } from "./sqlite3_parser"
import { lcase, ucase } from "../util/functions";

export default class Sqlite3Processor extends DdlSyncProcessor {
  constructor(config: { [key: string]: any }) {
    super("sqlite3", config)
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
      switch (stmt.constructor.name) {
        case AttachDatabaseStatement.name:
          await this.tryAttachDatabaseStatement(i, stmt as AttachDatabaseStatement, vdb)
          break
        case DetachDatabaseStatement.name:
          await this.tryDetachDatabaseStatement(i, stmt as DetachDatabaseStatement, vdb)
          break
        case CreateTableStatement.name:
          await this.tryCreateTableStatement(i, stmt as CreateTableStatement, vdb)
          break
        case AlterTableStatement.name:
          throw Error(`[plan] alter table statement is not supported`)
        case DropTableStatement.name:
          await this.tryDropTableStatement(i, stmt as DropTableStatement, vdb)
          break
        case CreateViewStatement.name:
          await this.tryCreateViewStatement(i, stmt as CreateViewStatement, vdb)
          break
        case DropViewStatement.name:
          await this.tryDropViewStatement(i, stmt as DropViewStatement, vdb)
          break
        case CreateTriggerStatement.name:
          await this.tryCreateTriggerStatement(i, stmt as CreateTriggerStatement, vdb)
          break
        case DropTriggerStatement.name:
          await this.tryDropTriggerStatement(i, stmt as DropTriggerStatement, vdb)
          break
        case CreateIndexStatement.name:
          await this.tryCreateIndexStatement(i, stmt as CreateIndexStatement, vdb)
          break
        case DropIndexStatement.name:
          await this.tryDropIndexStatement(i, stmt as DropIndexStatement, vdb)
          break
        case InsertStatement.name:
          await this.tryInsertStatement(i, stmt as InsertStatement, vdb)
        default:
          // no handle
      }
      const handler = (this as any)["try" + stmt.constructor.name]
      if (handler) {
        refs[i] = await handler(i, stmt, vdb)
      }
    }

    for (const [i, stmt] of stmts.entries()) {
      try {
        console.time(`-- ## start statement ${i}: ${stmt.summary()}`)
        switch (stmt.constructor.name) {
          case CreateTableStatement.name:
          case CreateViewStatement.name:
          case CreateTriggerStatement.name:
          case CreateIndexStatement.name:
              await this.runCreateObjectStatement(i, stmt, refs[i])
            break
          case DropTableStatement.name:
          case DropViewStatement.name:
          case DropTriggerStatement.name:
          case DropIndexStatement.name:
            await this.runDropObjectStatement(i, stmt, refs[i])
            break
          case InsertStatement.name:
            await this.runInsertStatement(i, stmt as InsertStatement, refs[i])
            break
          case BeginTransactionStatement.name:
          case SavepointStatement.name:
          case ReleaseSavepointStatement.name:
          case CommitTransactionStatement.name:
          case RollbackTransactionStatement.name:
            await this.runTransactionStatement(i, stmt)
            break;
          default:
            await this.runStatement(i, stmt)
        }
      } finally {
        console.timeEnd(`-- ## end statement ${i}: time`)
      }
    }
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

  private tryCreateTableStatement(seq: number, stmt: CreateTableStatement, vdb: VDatabase) {
    const schemaName = stmt.schemaName || (stmt.temporary ? "temp" : "main")
    const schema = vdb.get(schemaName)
    if (!schema) {
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    let table = schema.get(stmt.name)
    if (table && !table.dropped) {
      throw new Error(`[plan] ${table.type} ${stmt.name} already exists`)
    }

    return schema.add("table", stmt.name)
  }

  private tryDropTableStatement(seq: number, stmt: DropTableStatement, vdb: VDatabase) {
    const schemaName = stmt.schemaName ||
      (vdb.get("temp")?.get(stmt.name)?.dropped === false ? "temp" : "main")
    const schema = vdb.get(schemaName)
    if (!schema) {
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    let table = schema.get(stmt.name)
    if (!table || table.dropped) {
      if (stmt.ifExists) {
        if (!table) {
          table = schema.add("table", stmt.name)
          table.dropped = true
        }
        return table
      }
      throw new Error(`[plan] no such table: ${schemaName}.${stmt.name}`)
    } else if (table.type !== "table") {
      throw new Error(`[plan] no such table: ${schemaName}.${stmt.name}`)
    }

    table.dropped = true
    for (const object of schema) {
      if (object.type === "index" && object.tableName && lcase(object.tableName) === lcase(table.name)) {
        object.dropped = true
      }
    }
    return table
  }

  private tryCreateViewStatement(seq: number, stmt: CreateViewStatement, vdb: VDatabase) {
    const schemaName = stmt.schemaName || (stmt.temporary ? "temp" : "main")
    const schema = vdb.get(schemaName)
    if (!schema) {
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    const view = schema.get(stmt.name)
    if (view && !view.dropped) {
      throw new Error(`[plan] ${view.type} ${stmt.name} already exists`)
    }

    return schema.add("view", stmt.name)
  }

  private tryDropViewStatement(seq: number, stmt: DropViewStatement, vdb: VDatabase) {
    const schemaName = stmt.schemaName ||
      (vdb.get("temp")?.get(stmt.name)?.dropped === false ? "temp" : "main")
    const schema = vdb.get(schemaName)
    if (!schema) {
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    let view = schema.get(stmt.name)
    if (!view || view.dropped) {
      if (stmt.ifExists) {
        if (!view) {
          view = schema.add("view", stmt.name)
          view.dropped = true
        }
        return view
      }
      throw new Error(`[plan] no such view: ${schemaName}.${stmt.name}`)
    } else if (view.type !== "view") {
      throw new Error(`[plan] no such view: ${schemaName}.${stmt.name}`)
    }

    view.dropped = true
    return view
  }

  private tryCreateTriggerStatement(seq: number, stmt: CreateTriggerStatement, vdb: VDatabase) {
    const schemaName = stmt.schemaName || (stmt.temporary ? "temp" : "main")
    const schema = vdb.get(schemaName)
    if (!schema) {
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    let trigger = schema.get(stmt.name)
    if (trigger && !trigger.dropped) {
      throw new Error(`[plan] ${trigger.type} ${stmt.name} already exists`)
    }

    return schema.add("trigger", stmt.name)
  }

  private tryDropTriggerStatement(seq: number, stmt: DropTriggerStatement, vdb: VDatabase) {
    const schemaName = stmt.schemaName ||
      (vdb.get("temp")?.get(stmt.name)?.dropped === false ? "temp" : "main")
    const schema = vdb.get(schemaName)
    if (!schema) {
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    let trigger = schema.get(stmt.name)
    if (!trigger || trigger.dropped) {
      if (stmt.ifExists) {
        if (!trigger) {
          trigger = schema.add("trigger", stmt.name)
          trigger.dropped = true
        }
        return trigger
      }
      throw new Error(`[plan] no such trigger: ${schemaName}.${stmt.name}`)
    } else if (trigger.type !== "trigger") {
      throw new Error(`[plan] no such trigger: ${schemaName}.${stmt.name}`)
    }

    trigger.dropped = true
    return trigger
  }

  private tryCreateIndexStatement(seq: number, stmt: CreateIndexStatement, vdb: VDatabase) {
    const schemaName = stmt.schemaName ||
      (vdb.get("temp")?.get(stmt.name)?.dropped === false ? "temp" : "main")
    const schema = vdb.get(schemaName)
    if (!schema) {
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    const index = schema.get(stmt.name)
    if (index && !index.dropped) {
      throw new Error(`[plan] ${index.type} ${stmt.name} already exists`)
    }

    const table = schema.get(stmt.tableName)
    if (!table || table.dropped || table.type !== "table") {
      throw new Error(`[plan] no such table: ${schemaName}.${stmt.tableName}`)
    }

    return schema.add("index", stmt.name)
  }

  private tryDropIndexStatement(seq: number, stmt: DropIndexStatement, vdb: VDatabase) {
    const schemaName = stmt.schemaName ||
      (vdb.get("temp")?.get(stmt.name)?.dropped === false ? "temp" : "main")
    const schema = vdb.get(schemaName)
    if (!schema) {
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    let index = schema.get(stmt.name)
    if (!index || index.dropped) {
      if (stmt.ifExists) {
        if (!index) {
          index = schema.add("index", stmt.name)
          index.dropped = true
        }
        return index
      }
      throw new Error(`[plan] no such index: ${schemaName}.${stmt.name}`)
    } else if (index.type !== "index") {
      throw new Error(`[plan] no such index: ${schemaName}.${stmt.name}`)
    }

    index.dropped = true
    return index
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

  private async runCreateObjectStatement(seq: number, stmt: Statement, object: VObject) {
    if (object.dropped) {
      console.log(`-- skip: ${object.type} ${object.schemaName}.${object.name} is dropped`)
    } else if (lcase(object.schemaName) === "temp") {
      await this.runStatement(seq, stmt)
    } else {
      const scripts = []
      const row = await this.getMetaData(object.type, object.schemaName, object.name, object.tableName)
      if (row && ((stmt as any).asSelect || this.isDifference(stmt, row.sql))) {
        scripts.push(`DROP ${ucase(object.type)} IF EXISTS ${quoteIdentifier(object.name)}`)
      }
      scripts.push(Token.concat(stmt.tokens))

      for (const script of scripts) {
        console.log(script + ";")
        const result = await this.con.raw(script)
        console.log(`-- result: ${result}`)
      }
    }
  }

  private async runDropObjectStatement(seq: number, stmt: Statement, object: VObject) {
    if (lcase(object.schemaName) === "temp") {
      await this.runStatement(seq, stmt)
    } else {
      const scripts = []
      const row = await this.getMetaData(object.type, object.schemaName, object.name, object.tableName)
      if (row) {
        scripts.push(Token.concat(stmt.tokens))
      }

      for (const script of scripts) {
        console.log(script + ";")
        const result = await this.con.raw(script)
        console.log(`-- result: ${result}`)
      }
    }
  }

  private async runInsertStatement(seq: number, stmt: InsertStatement, table: VObject) {
    if (lcase(table.schemaName) === "temp") {
      await this.runStatement(seq, stmt)
    } else {
      const hasData = await this.hasData(table.schemaName, table.name)
      if (!hasData) {
        const script = Token.concat(stmt.tokens)
        console.log(script)
        const result = await this.con.raw(script)
        console.log(`-- result: ${result}`)
      }
    }
  }

  private async runTransactionStatement(seq: number, stmt: Statement) {
    console.log(`-- skip: transaction control is ignroed`)
  }

  private async runStatement(seq: number, stmt: Statement) {
    const script = Token.concat(stmt.tokens)
    console.log(script)
    const result = await this.con.raw(script)
    console.log(`-- result: ${result}`)
  }

  private async getMetaData(type: string, schemaName: string, name: string, tableName?: string) {
    const builder = this.con.withSchema(schemaName)
      .select("sql")
      .from("sqlite_master")
      .whereRaw("type = :type AND name = :name COLLATE NOCASE", { type, name })
    if (tableName) {
      builder.andWhereRaw("tbl_name = :tableName", { tableName })
    }
    return await builder.first()
  }

  private async hasData(schemaName: string, name: string) {
    const row = await this.con.withSchema(schemaName)
      .select("1")
      .from(name)
      .first()
    return !!row
  }

  private async isDifference(stmt1: Statement, sql: string) {
    const tokens1 = stmt1.tokens
    const tokens2 = (await this.parse(sql))[0].tokens
    //TODO
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

function quoteIdentifier(text: string) {
  return "`" + text.replace(/`/g, "``") + "`"
}
