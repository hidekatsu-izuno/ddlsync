import { knex, Knex } from "knex"

export class VdbDatabase {
  private con: Knex

  constructor() {
    this.con = knex({
      client: "sqlite3",
      connection: ':memory:',
      useNullAsDefault: true,
    })
  }

  async init() {
    await this.con.schema.createTable('objects', table => {
      table.string('schemaName').notNullable()
      table.string('objectName').notNullable()
      table.string('objectType').notNullable()
      table.primary(['schemaName', 'objectName'])
    })
    await this.con.schema.createTable('tables', table => {
      table.string('schemaName').notNullable()
      table.string('tableName').notNullable()
      table.boolean('temporary').notNullable().defaultTo(false)
      table.boolean('virtual').notNullable().defaultTo(false)
      table.primary(['schemaName', 'tableName'])
    })
    await this.con.schema.createTable('views', table => {
      table.string('schemaName').notNullable()
      table.string('viewName').notNullable()
      table.boolean('temporary').notNullable().defaultTo(false)
      table.primary(['schemaName', 'viewName'])
    })
    await this.con.schema.createTable('tableColumns', table => {
      table.string('schemaName').notNullable()
      table.string('tableName').notNullable()
      table.string('columnName').notNullable()
      table.integer('ordinalPosition').notNullable()
      table.primary(['schemaName', 'tableName', 'columnName'])
    })

    await this.con.schema.createTable('tableConstraints', table => {
      table.string('schemaName').notNullable()
      table.string('tableName').notNullable()
      table.string('constraintName').notNullable()
      table.primary(['schemaName', 'tableName', 'constraintName'])
    })

    await this.con.schema.createTable('tableConstraintsColumns', table => {
      table.string('schemaName').notNullable()
      table.string('tableName').notNullable()
      table.string('constraintName').notNullable()
      table.string('columnName').notNullable()
      table.primary(['schemaName', 'tableName', 'constraintName', 'columnName'])
    })
  }

  async createTable(tableInfo: {[key: string]: any}) {
    await this.con("objects").insert({
      schemaName: tableInfo.schemaName,
      objectName: tableInfo.tableName,
      objectType: "table",
    })
    await this.con("tables").insert(tableInfo)
  }

  async createView(tableInfo: {[key: string]: any}) {
    await this.con("objects").insert({
      schemaName: tableInfo.schemaName,
      objectName: tableInfo.tableName,
      objectType: "view",
    })
    await this.con("views").insert(tableInfo)
  }

  async destroy() {
    await this.con.destroy()
  }
}
