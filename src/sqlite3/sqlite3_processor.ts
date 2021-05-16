import { Knex } from "knex";
import { Statement } from "../parser";
import { ChangePlan, DdlSyncProcessor } from "../processor";
import { VdbDatabase } from "../vdb";
import { Sqlite3Parser } from "./sqlite3_parser";

export default class Sqlite3Processor extends DdlSyncProcessor {
  constructor(
    config: { [key: string]: any }
  ) {
    super("sqlite3", config)
  }

  async parse(input: string, options: { [key: string]: any}) {
    const parser = new Sqlite3Parser(input, options)
    return await parser.root()
  }

  async execute(srcDb: VdbDatabase, stmt: Statement) {
    throw new Error("Method not implemented.")
  }

  async plan(srcDb: VdbDatabase): Promise<ChangePlan[]> {
    throw new Error("Method not implemented.")
  }

  async apply(changeInfo: ChangePlan) {
    throw new Error("Method not implemented.")
  }
}
