import { knex } from "knex";
import { Statement } from "../parser"
import { AlterTableAction, AlterTableStatement, AttachDatabaseStatement, ConflictAction, CreateIndexStatement, CreateTableStatement, CreateTriggerStatement, CreateViewStatement, DetachDatabaseStatement, DropIndexStatement, DropTableStatement, DropTriggerStatement, DropViewStatement, NotNullColumnConstraint, PrimaryKeyColumnConstraint, PrimaryKeyTableConstraint, SortOrder, UniqueColumnConstraint, UniqueTableConstraint } from "./sqlite3_models";
import { ChangePlan, DdlSyncProcessor } from "../processor"
import { Sqlite3Parser } from "./sqlite3_parser"

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
    const schema = vdb.schemas[schemaName]
    if (!schema) {
      throw new Error(`[plan] unknown database ${stmt.name}`)
    }
    if (stmt.temporary && schema !== "temp") {
      throw new Error("temporary table name must be unqualified")
    }
    if (schema[stmt.name]) {
      throw new Error(`[plan] ${schema[stmt.name].type} ${stmt.name} already exists`)
    }
    if (schema[stmt.name].dropped) {
      throw new Error(`[plan] table ${schemaName}.${stmt.name} define multiple times`)
    }

    const table = {
      index,
      type: "table",
      name: stmt.name,
      temporary: !!stmt.temporary,
      virtual: !!stmt.virtual,
      dropped: false,
    } as any
    if (stmt.virtual) {
      table.moduleName = stmt.moduleName
      table.moduleArgs = stmt.moduleArgs || []
    } else if (stmt.select) {
      table.select = stmt.select.map(token => token.text)
    } else {
      let pkeyCount = 0
      table.columns = (stmt.columns || []).map(column => ({
        name: column.name,
        typeName: column.typeName,
        length: column.length,
        scale: column.scale,
        columns: (column.constraints || []).map(constraint => {
          if (constraint instanceof PrimaryKeyColumnConstraint) {
            pkeyCount++
            return {
              type: "primarykey",
              autoIncrement: constraint.autoIncrement,
              conflictAction: constraint.conflictAction,
              columns: [
                { expression: [ column.name ], sortOrder: constraint.sortOrder }
              ]
            }
          } else if (constraint instanceof UniqueColumnConstraint) {
            return {
              type: "unique",
              conflictAction: constraint.conflictAction,
              columns: [
                { expression: [ column.name ], sortOrder: SortOrder.ASC }
              ]
            }
          } else if (constraint instanceof NotNullColumnConstraint) {
            return {
              type: "notnull",
              conflictAction: constraint.conflictAction
            }
          }
        }),
        constraints: (stmt.constraints || []).map(constraint => {
          if (constraint instanceof PrimaryKeyTableConstraint) {
            pkeyCount++
            return {
              type: "primarykey",
              constraintName: constraint.name,
              conflictAction: constraint.conflictAction,
              columns: constraint.columns.map(tccolumn => ({
                name: tccolumn.expression.elements(),
                sortOrder: tccolumn.sortOrder,
              })),
            }
          } else if (constraint instanceof UniqueTableConstraint) {
            return {
              type: "unique",
              constraintName: constraint.name,
              conflictAction: constraint.conflictAction,
              columns: constraint.columns.map(tccolumn => ({
                name: tccolumn.expression.elements(),
                sortOrder: tccolumn.sortOrder,
              })),
            }
          }
        }),
        dropped: false,
      }))

      if (pkeyCount > 1) {
        throw new Error(`Table ${table.name} has has more than one primary key`)
      }
      if (stmt.withoutRowid && pkeyCount === 0) {
        throw new Error(`PRIMARY KEY missing on table ${table.name}`)
      }
    }
    schema.objects[stmt.name] = table
    return table
  }

  private handleAlterTableStatement(index: number, stmt: AlterTableStatement, vdb: any) {
    const schemaName = stmt.schemaName || (vdb.temp[stmt.name] && !vdb.temp[stmt.name].dropped ? "temp" : "main")
    const schema = vdb.schemas[schemaName]
    if (!schema) {
      throw new Error(`[plan] unknown database ${schemaName}.${stmt.name}`)
    }
    if (!schema[stmt.name] || schema[stmt.name].dropped || schema[stmt.name].type !== "table") {
      throw new Error(`[plan] no such table: ${schemaName}.${stmt.name}`)
    }

    const table = schema[stmt.name]
    if (stmt.alterTableAction === AlterTableAction.RENAME_TABLE) {
      table.name = stmt.newTableName
    } else if (stmt.alterTableAction === AlterTableAction.ADD_COLUMN) {

    } else if (stmt.alterTableAction === AlterTableAction.RENAME_COLUMN) {

    } else if (stmt.alterTableAction === AlterTableAction.DROP_COLUMN) {

    } else {
      throw Error(`[plan] unrecognized alter action: ${schemaName}.${stmt.name}`)
    }
    return table
  }

  private handleDropTableStatement(index: number, stmt: DropTableStatement, vdb: any) {
    const schemaName = stmt.schemaName || (vdb.temp[stmt.name] && !vdb.temp[stmt.name].dropped ? "temp" : "main")
    const schema = vdb.schemas[schemaName]
    if (!schema) {
      throw new Error(`[plan] unknown database ${stmt.name}`)
    }

    if ((!schema[stmt.name] || schema[stmt.name].dropped) && stmt.ifExists) {
      const table = {
        index,
        type: "table",
        name: stmt.name,
        dropped: true,
      }
      schema[stmt.name] = table
      return table
    }
    if (!schema[stmt.name] || schema[stmt.name].dropped || schema[stmt.name].type !== "table") {
      throw new Error(`[plan] no such table: ${stmt.name}`)
    }

    const table = schema[stmt.name]
    table.dropped = true
    return table
  }

  private handleCreateViewStatement(index: number, stmt: CreateViewStatement, vdb: any) {
    const schemaName = stmt.schemaName || (stmt.temporary ? "temp" : "main")
    const schema = vdb.schemas[schemaName]
    if (!schema) {
      throw new Error(`[plan] unknown database ${stmt.name}`)
    }
    if (stmt.temporary && schema !== "temp") {
      throw new Error("temporary table name must be unqualified")
    }
    if (schema[stmt.name]) {
      throw new Error(`[plan] ${schema[stmt.name].type} ${stmt.name} already exists`)
    }
    if (schema[stmt.name].dropped) {
      throw new Error(`[plan] view ${schemaName}.${stmt.name} define multiple times`)
    }

    const view = {
      index,
      type: "view",
      name: stmt.name,
      temporary: !!stmt.temporary,
      dropped: false,
    }
    schema[stmt.name] = view
    return view
  }

  private handleDropViewStatement(index: number, stmt: DropViewStatement, vdb: any) {
    const schemaName = stmt.schemaName || (vdb.temp[stmt.name] && !vdb.temp[stmt.name].dropped ? "temp" : "main")
    const schema = vdb.schemas[schemaName]
    if (!schema) {
      throw new Error(`[plan] unknown database ${stmt.name}`)
    }

    if ((!schema[stmt.name] || schema[stmt.name].dropped) && stmt.ifExists) {
      const view = {
        index,
        type: "view",
        name: stmt.name,
        dropped: true,
      }
      schema[stmt.name] = view
      return view
    }
    if (!schema[stmt.name] || schema[stmt.name].dropped || schema[stmt.name].type !== "view") {
      throw new Error(`[plan] no such view: ${stmt.name}`)
    }

    const view = schema[stmt.name]
    view.dropped = true
    return view
  }

  private handleCreateTriggerStatement(index: number, stmt: CreateTriggerStatement, vdb: any) {
    const schemaName = stmt.schemaName || (stmt.temporary ? "temp" : "main")
    const schema = vdb.schemas[schemaName]
    if (!schema) {
      throw new Error(`[plan] unknown database ${stmt.name}`)
    }
    if (stmt.temporary && schema !== "temp") {
      throw new Error("temporary table name must be unqualified")
    }
    if (schema[stmt.name]) {
      throw new Error(`[plan] ${schema[stmt.name].type} ${stmt.name} already exists`)
    }
    if (schema[stmt.name].dropped) {
      throw new Error(`[plan] trigger ${schemaName}.${stmt.name} define multiple times`)
    }

    const trigger = {
      index,
      type: "trigger",
      name: stmt.name,
      temporary: !!stmt.temporary,
      dropped: false,
    }
    schema[stmt.name] = trigger
    return trigger
  }

  private handleDropTriggerStatement(index: number, stmt: DropTriggerStatement, vdb: any) {
    const schemaName = stmt.schemaName || (vdb.temp[stmt.name] && !vdb.temp[stmt.name].dropped ? "temp" : "main")
    const schema = vdb.schemas[schemaName]
    if (!schema) {
      throw new Error(`[plan] unknown database ${stmt.name}`)
    }

    if ((!schema[stmt.name] || schema[stmt.name].dropped) && stmt.ifExists) {
      const trigger = {
        index,
        type: "trigger",
        name: stmt.name,
        dropped: true,
      }
      schema[stmt.name] = trigger
      return trigger
    }
    if (!schema[stmt.name] || schema[stmt.name].dropped || schema[stmt.name].type !== "trigger") {
      throw new Error(`[plan] no such trigger: ${stmt.name}`)
    }

    const trigger = schema[stmt.name]
    trigger.dropped = true
    return trigger
  }
}
