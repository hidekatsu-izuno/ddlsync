import { knex, Knex } from "knex";
import { Statement } from "./parser";

export abstract class DdlSyncProcessor {
  protected con: Knex

  protected constructor(public name: string, public config: { [key: string]: any }) {
    this.con = knex(config)
  }

  abstract parse(input: string, options: { [key: string]: any}): Promise<Statement[]>

  abstract run(stmts: Statement[], dryrun?: boolean): Promise<void>

  async destroy() {
    await this.con.destroy()
  }
}
