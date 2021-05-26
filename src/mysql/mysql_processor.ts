import mysql2 from "mysql2"
import { Statement } from "../models"
import { DdlSyncProcessor } from "../processor"
import { MySqlParser } from "./mysql_parser"

export default class MysqlProcessor extends DdlSyncProcessor {
  private con

  constructor(
    config: { [key: string]: any },
    dryrun: boolean,
  ) {
    super(config, dryrun)
    this.con = mysql2.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
    })
  }

  protected async init() {
    const options = {} as any
    const result = await this.con.promise().query("SELECT version() AS version") as [any[], any[]]
    if (result[0].length) {
      options.version = result[0][0].version
    }
    return options
  }

  protected async parse(input: string, options: { [key: string]: any }) {
    const parser = new MySqlParser(input)
    return parser.root()
  }

  protected async run(stmts: Statement[], options: { [key: string]: any }) {
  }

  async destroy() {
    this.con.destroy()
  }
}
