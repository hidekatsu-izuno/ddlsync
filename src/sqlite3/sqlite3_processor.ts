import { Knex } from "knex";
import { AlterTableStatement, AttachDatabaseStatement, CreateIndexStatement, CreateTableStatement, CreateTriggerStatement, CreateViewStatement, DetachDatabaseStatement, DropIndexStatement, DropTableStatement, DropTriggerStatement, DropViewStatement, Statement } from "../parser";
import { ChangePlan, DdlSyncProcessor } from "../processor";
import { Sqlite3Parser } from "./sqlite3_parser";

export default class Sqlite3Processor extends DdlSyncProcessor {
  constructor(config: { [key: string]: any }) {
    super("sqlite3", config)
  }

  async parse(input: string, options: { [key: string]: any}) {
    const parser = new Sqlite3Parser(input, options)
    return await parser.root()
  }

  async plan(stmts: Statement[]) {
    return new Array<ChangePlan>()
  }

  async apply(changePlan: ChangePlan) {
  }
}
