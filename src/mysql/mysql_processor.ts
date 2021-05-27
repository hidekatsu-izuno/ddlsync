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

    const versions = await this.con.promise().query("SELECT version() AS version") as [any[], any[]]
    if (versions[0].length) {
      options.version = versions[0][0].version
    }

    const sqlModes = await this.con.promise().query("SELECT @@sql_mode AS sql_mode") as [any[], any[]]
    if (sqlModes[0].length) {
      options.sqlModes = (sqlModes[0][0].sql_mode || "").split(/,/g)
    }

    return options
  }

  protected async parse(input: string, options: { [key: string]: any }) {
    const parser = new MySqlParser(input)
    return await parser.root()
  }

  protected async run(stmts: Statement[], options: { [key: string]: any }) {
  }

  async destroy() {
    this.con.destroy()
  }
}

function dquote(text: string) {
  return '"' + text.replace(/"/g, '""') + '"'
}

function bquote(text: string) {
  return "`" + text.replace(/`/g, "``") + "`"
}
