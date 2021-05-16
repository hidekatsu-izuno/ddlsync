import { knex, Knex } from "knex";
import { Statement } from "./parser";
import { VdbDatabase } from "./vdb";

export abstract class DdlSyncProcessor {
  private con?: Knex

  constructor(
    public name: string,
    public config: { [key: string]: any }
  ) {
  }

  public async connection() {
    if (!this.con) {
      this.con = await knex(this.config)
    }
    return this.con
  }

  abstract parse(input: string, options: { [key: string]: any}): Promise<Statement[]>

  abstract execute(db: VdbDatabase, stmt: Statement): Promise<void>

  abstract plan(db: VdbDatabase): Promise<ChangePlan[]>

  abstract apply(changeInfo: ChangePlan): Promise<void>

  async destroy() {
    if (this.con) {
      this.con.destroy()
    }
  }
}

export enum ChangeType {
  CREATE,
  ALTER,
  DROP,
  OTHER
}

export class ChangePlan {
  constructor(
    public summary: string,
    public stmts: Statement[]
  ) {
  }
}
