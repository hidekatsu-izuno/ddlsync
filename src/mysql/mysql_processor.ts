import mariadb from "mariadb"
import { Statement } from "../models"
import { DdlSyncProcessor } from "../processor"
import { ucase } from "../util/functions"
import { MySqlParser } from "./mysql_parser"

export default class MysqlProcessor extends DdlSyncProcessor {
  private con?: mariadb.Connection

  constructor(
    config: { [key: string]: any },
    dryrun: boolean,
  ) {
    super(config, dryrun)
  }

  protected async init() {
    const options = {} as any

    this.con = await mariadb.createConnection({
      host: this.config.host,
      port: this.config.port,
      user: this.config.username,
      password: this.config.password,
      database: this.config.database,
    })

    const versions = await this.con.query("SELECT version() AS version") as any[]
    if (versions.length) {
      options.version = versions[0].version
    }

    const sqlModes = await this.con.query("SELECT @@sql_mode AS sql_mode") as any[]
    if (sqlModes.length) {
      options.sqlMode = sqlModes[0].sql_mode
    }

    const keywordsSchema = await this.con.query("SELECT TABLE_NAME" +
      " FROM INFORMATION_SCHEMA.TABLES" +
      " WHERE TABLE_SCHEMA = 'information_schema'" +
      " AND TABLE_NAME = 'KEYWORDS'" +
      " AND TABLE_TYPE = 'SYSTEM VIEW'"
    ) as any[]
    if (keywordsSchema.length) {
      options.reservedWords = []
      for await (const row of await this.con.queryStream("SELECT WORD " +
        " FROM INFORMATION_SCHEMA.KEYWORDS" +
        " WHERE WHERE RESERVED = 1"
      )) {
        options.reservedWords.push(row.WORD)
      }
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
    this.con?.destroy()
  }
}

function dquote(text: string) {
  return '"' + text.replace(/"/g, '""') + '"'
}

function bquote(text: string) {
  return "`" + text.replace(/`/g, "``") + "`"
}
