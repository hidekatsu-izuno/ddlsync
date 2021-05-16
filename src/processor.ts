import { knex, Knex } from "knex";
import { Statement } from "./parser";
import { VdbDatabase } from "./vdb";

export abstract class DdlSyncProcessor {
  protected con: Knex

  protected constructor(public name: string, public config: { [key: string]: any }) {
    this.con = knex(config)
  }

  abstract parse(input: string, options: { [key: string]: any}): Promise<Statement[]>

  abstract execute(vdb: VdbDatabase, stmt: Statement): Promise<void>

  abstract plan(vdb: VdbDatabase): Promise<ChangePlan[]>

  abstract apply(changeInfo: ChangePlan): Promise<void>

  async destroy() {
    await this.con.destroy()
  }
}

export enum ChangeType {
  CREATE_OBJECT,
  ALTER_OBJECT,
  ADD_COLUMN,
  DROP_COLUMN,
  DROP_OBJECT,
  CHANGE_STATE,
  OTHER,
}

export class ChangePlan {
  constructor(
    public type: ChangeType,
    public summary: string,
    public stmts: Statement[]
  ) {
  }
}
