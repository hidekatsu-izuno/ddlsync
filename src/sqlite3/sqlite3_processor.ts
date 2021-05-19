import { knex } from "knex";
import { Statement, Token } from "../parser"
import { AlterTableAction, AlterTableStatement, AttachDatabaseStatement, ConflictAction, CreateIndexStatement, CreateTableStatement, CreateTriggerStatement, CreateViewStatement, DetachDatabaseStatement, DropIndexStatement, DropTableStatement, DropTriggerStatement, DropViewStatement, NotNullColumnConstraint, PrimaryKeyColumnConstraint, PrimaryKeyTableConstraint, SortOrder, UniqueColumnConstraint, UniqueTableConstraint } from "./sqlite3_models";
import { ChangePlan, DdlSyncProcessor } from "../processor"
import { Sqlite3Parser } from "./sqlite3_parser"
import { lc } from "../util/functions";

export default class Sqlite3Processor extends DdlSyncProcessor {
  constructor(config: { [key: string]: any }) {
    super("sqlite3", config)
  }

  async parse(input: string, options: { [key: string]: any}) {
    const parser = new Sqlite3Parser(input, options)
    return await parser.root()
  }

  async plan(stmts: Statement[]) {
    const vdb = this.createVdb()
    const refs = []
    for (const [i, stmt] of stmts.entries()) {
      const handler = (this as any)["handle" + stmt.constructor.name]
      if (handler) {
        refs.push(await handler(i, stmt, vdb))
      }
    }

    return new Array<ChangePlan>()
  }

  async apply(changePlan: ChangePlan) {
  }

  private createVdb() {
    return {
      schemas: {
        "main": { name: "main", objects: {} },
        "temp": { name: "temp", objects: {} }
      }
    }
  }

  private handleAttachDatabaseStatement(index: number, stmt: AttachDatabaseStatement, vdb: any) {
    if (vdb.schemas[stmt.name]) {
      throw new Error(`[plan] database ${stmt.name} is already in use`)
    }
    if (vdb.schemas[stmt.name].dropped) {
      throw new Error(`[plan] database ${stmt.name} define multiple times`)
    }
    const schema = {
      type: "schema",
      name: stmt.name,
      dropped: false
    }
    vdb.schemas[stmt.name] = schema
    return schema
  }

  private handleDetachDatabaseStatement(index: number, stmt: DetachDatabaseStatement, vdb: any) {
    if (!vdb.schemas[stmt.name] || vdb.schemas[stmt.name].dropped) {
      throw new Error(`[plan] no such database: ${stmt.name}`)
    }
    if (stmt.name === "main" || stmt.name === "temp") {
      throw new Error(`[plan] cannot detach database ${stmt.name}`)
    }

    const schema = vdb.schemas[stmt.name]
    schema.dropped = true
    return schema
  }

  private handleCreateTableStatement(index: number, stmt: CreateTableStatement, vdb: any) {
    const schemaName = stmt.schemaName || (stmt.temporary ? "temp" : "main")
    const schema = vdb.schemas[lc(schemaName)]
    if (!schema) {
      throw new Error(`[plan] unknown database ${stmt.name}`)
    }

    const object = schema.objects[lc(stmt.name)]
    if (object) {
      if (object.dropped) {
        throw new Error(`[plan] table ${schemaName}.${stmt.name} is defined multiple times`)
      }
      throw new Error(`[plan] ${schema[stmt.name].type} ${stmt.name} already exists`)
    }

    if (stmt.asSelect) {
      throw Error(`[plan] create table as select statement is not supported`)
    }

    const table = {
      index,
      type: "table",
      name: stmt.name,
      virtual: !!stmt.virtual,
      columns: stmt.columns?.map(column => column.name),
      dropped: false,
    }
    schema.objects[lc(table.name)] = table
    return table
  }

  private handleAlterTableStatement(index: number, stmt: AlterTableStatement, vdb: any) {
    throw Error(`[plan] alter table statement is not supported`)
  }

  private handleDropTableStatement(index: number, stmt: DropTableStatement, vdb: any) {
    const schemaName = stmt.schemaName || (vdb.temp[lc(stmt.name)] && !vdb.temp[lc(stmt.name)].dropped ? "temp" : "main")
    const schema = vdb.schemas[lc(schemaName)]
    if (!schema) {
      throw new Error(`[plan] unknown database ${stmt.name}`)
    }

    const object = schema.objects[lc(stmt.name)]
    if (!object || object.dropped) {
      if (stmt.ifExists) {
        const table = {
          index,
          type: "table",
          name: stmt.name,
          dropped: true,
        }
        schema.objects[lc(stmt.name)] = table
        return table
      }
      throw new Error(`[plan] no such table: ${stmt.name}`)
    } else if (object.type !== "table") {
      throw new Error(`[plan] no such table: ${stmt.name}`)
    }

    const table = object
    table.dropped = true
    return table
  }

  private handleCreateViewStatement(index: number, stmt: CreateViewStatement, vdb: any) {
    const schemaName = stmt.schemaName || (stmt.temporary ? "temp" : "main")
    const schema = vdb.schemas[lc(schemaName)]
    if (!schema) {
      throw new Error(`[plan] unknown database ${stmt.name}`)
    }

    const object = schema.objects[lc(stmt.name)]
    if (object) {
      if (object.dropped) {
        throw new Error(`[plan] view ${schemaName}.${stmt.name} define multiple times`)
      }
      throw new Error(`[plan] ${schema[stmt.name].type} ${stmt.name} already exists`)
    }

    const view = {
      index,
      type: "view",
      name: stmt.name,
      dropped: false,
    }
    schema.objects[lc(stmt.name)] = view
    return view
  }

  private handleDropViewStatement(index: number, stmt: DropViewStatement, vdb: any) {
    const schemaName = stmt.schemaName || (vdb.temp[stmt.name] && !vdb.temp[stmt.name].dropped ? "temp" : "main")
    const schema = vdb.schemas[lc(schemaName)]
    if (!schema) {
      throw new Error(`[plan] unknown database ${stmt.name}`)
    }

    const object = schema.objects[lc(stmt.name)]
    if (!object || object.dropped) {
      if (stmt.ifExists) {
        const table = {
          index,
          type: "view",
          name: stmt.name,
          dropped: true,
        }
        schema.objects[lc(stmt.name)] = table
        return table
      }
      throw new Error(`[plan] no such view: ${stmt.name}`)
    } else if (object.type !== "view") {
      throw new Error(`[plan] no such view: ${stmt.name}`)
    }

    const view = object
    view.dropped = true
    return view
  }

  private handleCreateTriggerStatement(index: number, stmt: CreateTriggerStatement, vdb: any) {
    const schemaName = stmt.schemaName || (stmt.temporary ? "temp" : "main")
    const schema = vdb.schemas[schemaName]
    if (!schema) {
      throw new Error(`[plan] unknown database ${stmt.name}`)
    }

    const object = schema.objects[lc(stmt.name)]
    if (object) {
      throw new Error(`[plan] ${schema[stmt.name].type} ${stmt.name} already exists`)
    }
    if (object.dropped) {
      throw new Error(`[plan] trigger ${schemaName}.${stmt.name} define multiple times`)
    }

    const trigger = {
      index,
      type: "trigger",
      name: stmt.name,
      dropped: false,
    }
    schema.objects[lc(stmt.name)] = trigger
    return trigger
  }

  private handleDropTriggerStatement(index: number, stmt: DropTriggerStatement, vdb: any) {
    const schemaName = stmt.schemaName || (vdb.temp[stmt.name] && !vdb.temp[stmt.name].dropped ? "temp" : "main")
    const schema = vdb.schemas[schemaName]
    if (!schema) {
      throw new Error(`[plan] unknown database ${stmt.name}`)
    }

    const object = schema.objects[lc(stmt.name)]
    if (!object || object.dropped) {
      if (stmt.ifExists) {
        const table = {
          index,
          type: "trigger",
          name: stmt.name,
          dropped: true,
        }
        schema.objects[lc(stmt.name)] = table
        return table
      }
      throw new Error(`[plan] no such trigger: ${stmt.name}`)
    } else if (object.type !== "trigger") {
      throw new Error(`[plan] no such trigger: ${stmt.name}`)
    }

    const trigger = object
    trigger.dropped = true
    return trigger
  }
}
