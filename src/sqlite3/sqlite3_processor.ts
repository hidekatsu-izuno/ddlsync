import { Knex } from "knex";
import { CreateTableStatement, CreateViewStatement, Statement } from "../parser";
import { ChangePlan, DdlSyncProcessor } from "../processor";
import { VdbDatabase } from "../vdb";
import { Sqlite3Parser } from "./sqlite3_parser";

export default class Sqlite3Processor extends DdlSyncProcessor {
  constructor(config: { [key: string]: any }) {
    super("sqlite3", config)
  }

  async parse(input: string, options: { [key: string]: any}) {
    const parser = new Sqlite3Parser(input, options)
    return await parser.root()
  }

  async execute(vdb: VdbDatabase, stmt: Statement) {
    if (stmt instanceof CreateTableStatement) {
      const table = {
        schemaName: stmt.schemaName || (stmt.temporary ? "temp" : "main"),
        tableName: stmt.name,
        temporary: stmt.temporary,
        virtual: stmt.virtual
      }
      await vdb.createTable(table)
    } else if (stmt instanceof CreateViewStatement) {

    }
  }

  async plan(vdb: VdbDatabase) {
    return new Array<ChangePlan>()
  }

  async apply(changePlan: ChangePlan) {
  }
}
