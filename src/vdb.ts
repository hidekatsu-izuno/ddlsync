import { knex, Knex } from "knex"

export class VdbDatabase {
  private con?: Knex

  public async connection() {
    if (!this.con) {
      this.con = await knex({
        client: "sqlite3"
      })
    }
    return this.con
  }

  async destroy() {
    if (this.con) {
      this.con.destroy()
    }
  }
}
