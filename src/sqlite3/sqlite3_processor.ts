import { Statement, Token } from "../parser"
import { AlterTableStatement, AttachDatabaseStatement, CreateIndexStatement, CreateTableStatement, CreateTriggerStatement, CreateViewStatement, DetachDatabaseStatement, DropIndexStatement, DropTableStatement, DropTriggerStatement, DropViewStatement, ExplainStatement, InsertStatement, NotNullColumnConstraint, PrimaryKeyColumnConstraint, PrimaryKeyTableConstraint, SortOrder, UniqueColumnConstraint, UniqueTableConstraint, UpdateStatement, SelectStatement, BeginTransactionStatement, SavepointStatement, ReleaseSavepointStatement, CommitTransactionStatement, RollbackTransactionStatement } from "./sqlite3_models";
import { DdlSyncProcessor } from "../processor"
import { Sqlite3Parser } from "./sqlite3_parser"
import { lcase, ucase } from "../util/functions";

export default class Sqlite3Processor extends DdlSyncProcessor {
  constructor(config: { [key: string]: any }) {
    super("sqlite3", config)
  }

  async parse(input: string, options: { [key: string]: any}) {
    const parser = new Sqlite3Parser(input, options)
    return await parser.root()
  }

  async run(stmts: Statement[], dryrun: boolean = false) {
    const vdb = this.createVdb()
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
        case BeginTransactionStatement.name:
        case SavepointStatement.name:
        case ReleaseSavepointStatement.name:
        case CommitTransactionStatement.name:
        case RollbackTransactionStatement.name:
          throw Error(`[plan] transaction features are not supported`)
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
            await this.runCreateObjectStatement(i, stmt, refs[i])
            break
          case DropTableStatement.name:
          case DropViewStatement.name:
          case DropTriggerStatement.name:
            await this.runDropObjectStatement(i, stmt, refs[i])
            break
          case InsertStatement.name:
            await this.runInsertStatement(i, stmt as InsertStatement, refs[i])
            break
          default:
            await this.runStatement(i, stmt)
        }
      } finally {
        console.timeEnd(`-- ## end statement ${i}: time`)
      }
    }
  }

  private createVdb() {
    return {
      schemas: {
        "main": { name: "main", objects: {} },
        "temp": { name: "temp", objects: {} }
      }
    }
  }

  private tryAttachDatabaseStatement(seq: number, stmt: AttachDatabaseStatement, vdb: any) {
    let schema = vdb.schemas[lcase(stmt.name)]
    if (schema) {
      if (schema.dropped) {
        throw new Error(`[plan] multiple attach for same database name is not supported: ${stmt.name}`)
      }
      throw new Error(`[plan] database ${stmt.name} is already in use`)
    }

    schema = {
      type: "schema",
      name: stmt.name,
      dropped: false
    }
    vdb.schemas[lcase(stmt.name)] = schema
    return schema
  }

  private tryDetachDatabaseStatement(seq: number, stmt: DetachDatabaseStatement, vdb: any) {
    const schema = vdb.schemas[lcase(stmt.name)]
    if (!schema || schema.dropped) {
      throw new Error(`[plan] no such database: ${stmt.name}`)
    }
    if (lcase(stmt.name) === "main" || lcase(stmt.name) === "temp") {
      throw new Error(`[plan] cannot detach database ${stmt.name}`)
    }

    schema.dropped = true
    return schema
  }

  private tryCreateTableStatement(seq: number, stmt: CreateTableStatement, vdb: any) {
    const schemaName = stmt.schemaName || (stmt.temporary ? "temp" : "main")
    const schema = vdb.schemas[lcase(schemaName)]
    if (!schema) {
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    let table = schema.objects[lcase(stmt.name)]
    if (table && !table.dropped) {
      throw new Error(`[plan] ${table.type} ${stmt.name} already exists`)
    }

    table = {
      schema,
      type: "table",
      name: stmt.name,
      virtual: !!stmt.virtual,
      columns: stmt.columns?.map(column => {
        return {
          name: column.name
        }
      }),
      dropped: false,
    }
    schema.objects[lcase(table.name)] = table
    return table
  }

  private tryDropTableStatement(seq: number, stmt: DropTableStatement, vdb: any) {
    const schemaName = stmt.schemaName ||
      (vdb.schemas["temp"].objects[lcase(stmt.name)]?.dropped === false ? "temp" : "main")
    const schema = vdb.schemas[lcase(schemaName)]
    if (!schema) {
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    const table = schema.objects[lcase(stmt.name)]
    if (!table || table.dropped) {
      if (stmt.ifExists) {
        const table = {
          schema,
          type: "table",
          name: stmt.name,
          dropped: true,
        }
        schema.objects[lcase(stmt.name)] = table
        return table
      }
      throw new Error(`[plan] no such table: ${schemaName}.${stmt.name}`)
    } else if (table.type !== "table") {
      throw new Error(`[plan] no such table: ${schemaName}.${stmt.name}`)
    }

    table.dropped = true
    return table
  }

  private tryCreateViewStatement(seq: number, stmt: CreateViewStatement, vdb: any) {
    const schemaName = stmt.schemaName || (stmt.temporary ? "temp" : "main")
    const schema = vdb.schemas[lcase(schemaName)]
    if (!schema) {
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    let view = schema.objects[lcase(stmt.name)]
    if (view && !view.dropped) {
      throw new Error(`[plan] ${view.type} ${stmt.name} already exists`)
    }

    view = {
      schema,
      type: "view",
      name: stmt.name,
      dropped: false,
    }
    schema.objects[lcase(stmt.name)] = view
    return view
  }

  private tryDropViewStatement(seq: number, stmt: DropViewStatement, vdb: any) {
    const schemaName = stmt.schemaName ||
      (vdb.schemas["temp"].objects[lcase(stmt.name)]?.dropped === false ? "temp" : "main")
    const schema = vdb.schemas[lcase(schemaName)]
    if (!schema) {
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    let view = schema.objects[lcase(stmt.name)]
    if (!view || view.dropped) {
      if (stmt.ifExists) {
        view = {
          schema,
          type: "view",
          name: stmt.name,
          dropped: true,
        }
        schema.objects[lcase(stmt.name)] = view
        return view
      }
      throw new Error(`[plan] no such view: ${schemaName}.${stmt.name}`)
    } else if (view.type !== "view") {
      throw new Error(`[plan] no such view: ${schemaName}.${stmt.name}`)
    }

    view.dropped = true
    return view
  }

  private tryCreateTriggerStatement(seq: number, stmt: CreateTriggerStatement, vdb: any) {
    const schemaName = stmt.schemaName || (stmt.temporary ? "temp" : "main")
    const schema = vdb.schemas[schemaName]
    if (!schema) {
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    let trigger = schema.objects[lcase(stmt.name)]
    if (trigger && !trigger.dropped) {
      throw new Error(`[plan] ${schema[stmt.name].type} ${stmt.name} already exists`)
    }

    trigger = {
      schema,
      type: "trigger",
      name: stmt.name,
      dropped: false,
    }
    schema.objects[lcase(stmt.name)] = trigger
    return trigger
  }

  private tryDropTriggerStatement(seq: number, stmt: DropTriggerStatement, vdb: any) {
    const schemaName = stmt.schemaName ||
      (vdb.schemas["temp"].objects[lcase(stmt.name)]?.dropped === false ? "temp" : "main")
    const schema = vdb.schemas[lcase(schemaName)]
    if (!schema) {
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    let trigger = schema.objects[lcase(stmt.name)]
    if (!trigger || trigger.dropped) {
      if (stmt.ifExists) {
        trigger = {
          schema,
          type: "trigger",
          name: stmt.name,
          dropped: true,
        }
        schema.objects[lcase(stmt.name)] = trigger
        return trigger
      }
      throw new Error(`[plan] no such trigger: ${schemaName}.${stmt.name}`)
    } else if (trigger.type !== "trigger") {
      throw new Error(`[plan] no such trigger: ${schemaName}.${stmt.name}`)
    }

    trigger.dropped = true
    return trigger
  }

  private tryCreateIndexStatement(seq: number, stmt: CreateIndexStatement, vdb: any) {
    const schemaName = stmt.schemaName ||
      (vdb.schemas["temp"].objects[lcase(stmt.name)]?.dropped === false ? "temp" : "main")
    const schema = vdb.schemas[lcase(schemaName)]
    if (!schema) {
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    let index = schema.objects[lcase(stmt.name)]
    if (index && !index.dropped) {
      throw new Error(`[plan] ${index.type} ${stmt.name} already exists`)
    }

    let table = schema.objects[lcase(stmt.tableName)]
    if (!table || table.dropped || table.type !== "table") {
      throw new Error(`[plan] no such table: ${schemaName}.${stmt.tableName}`)
    }

    index = {
      schema,
      type: "index",
      name: stmt.name,
      dropped: false,
    }
    schema.objects[lcase(stmt.name)] = index
    return index
  }

  private tryDropIndexStatement(seq: number, stmt: DropIndexStatement, vdb: any) {
    const schemaName = stmt.schemaName ||
      (vdb.schemas["temp"].objects[lcase(stmt.name)]?.dropped === false ? "temp" : "main")
    const schema = vdb.schemas[lcase(schemaName)]
    if (!schema) {
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    let index = schema.objects[lcase(stmt.name)]
    if (!index || index.dropped) {
      if (stmt.ifExists) {
        index = {
          schema,
          type: "index",
          name: stmt.name,
          dropped: true,
        }
        schema.objects[lcase(stmt.name)] = index
        return index
      }
      throw new Error(`[plan] no such index: ${schemaName}.${stmt.name}`)
    } else if (index.type !== "index") {
      throw new Error(`[plan] no such index: ${schemaName}.${stmt.name}`)
    }

    index.dropped = true
    return index
  }

  private tryInsertStatement(seq: number, stmt: InsertStatement, vdb: any) {
    const schemaName = stmt.schemaName ||
    (vdb.schemas["temp"].objects[lcase(stmt.name)]?.dropped === false ? "temp" : "main")
    const schema = vdb.schemas[lcase(schemaName)]
    if (!schema) {
      throw new Error(`[plan] unknown database ${schemaName}`)
    }

    const table = schema.objects[lcase(stmt.name)]
    if (!table || table.dropped || table.type !== "table") {
      throw new Error(`[plan] no such table: ${schemaName}.${stmt.name}`)
    }
  }

  private async runCreateObjectStatement(seq: number, stmt: Statement, obj: any) {
    if (obj.dropped) {
      console.log(`-- skip: ${obj.type} ${obj.schema.name}.${obj.name} is dropped`)
    } else if (lcase(obj.schema.name) === "temp") {
      await this.runStatement(seq, stmt)
    } else {
      const scripts = []
      const row = await this.con.withSchema(obj.schema.name)
        .select("*")
        .from("sqlite_master")
        .whereRaw("type = :type AND name = :name COLLATE NOCASE", {
          type: obj.type,
          name: obj.name,
        })
        .first()
      if (row || obj.asSelect) {
        scripts.push(`DROP ${ucase(obj.type)} IF EXISTS ${quoteIdentifier(obj.name)}`)
      }
      scripts.push(Token.concat(stmt.tokens))

      for (const script of scripts) {
        console.log(script + ";")
        const result = await this.con.raw(script)
        console.log(`-- result: ${result}`)
      }
    }
  }

  private async runDropObjectStatement(seq: number, stmt: Statement, obj: any) {
    if (lcase(obj.schema.name) === "temp") {
      await this.runStatement(seq, stmt)
      return
    }

    const scripts = []
    const row = await this.con.withSchema(obj.schema.name)
      .select("*")
      .from("sqlite_master")
      .whereRaw("type = :type AND name = :name COLLATE NOCASE", {
        type: obj.type,
        name: obj.name,
      })
      .first()
    if (row) {
      scripts.push(Token.concat(stmt.tokens))
    }

    for (const script of scripts) {
      console.log(script + ";")
      const result = await this.con.raw(script)
      console.log(`-- result: ${result}`)
    }
  }

  private async runInsertStatement(seq: number, stmt: InsertStatement, table: any) {
    if (lcase(table.schema.name) === "temp") {
      await this.runStatement(seq, stmt)
      return
    }

    const row = await this.con.withSchema(table.schema.name)
      .select("1").from(stmt.name).first()
    if (!row) {
      const script = Token.concat(stmt.tokens)
      console.log(script)
      const result = await this.con.raw(script)
      console.log(`-- result: ${result}`)
    }
  }

  private async runStatement(seq: number, stmt: Statement) {
    const script = Token.concat(stmt.tokens)
    console.log(script)
    const result = await this.con.raw(script)
    console.log(`-- result: ${result}`)
  }
}

function quoteIdentifier(text: string) {
  return "`" + text.replace(/`/g, "``") + "`"
}
