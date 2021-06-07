import mariadb from "mariadb"
import { Statement, VCollation, VDatabase, VObject, VSchema } from "../models"
import { DdlSyncProcessor } from "../processor"
import { MysqlParser } from "./mysql_parser"
import * as model from "./mysql_models"
import { lcase, ucamel } from "../util/functions"

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

    const versions = await this.con.query("SELECT version() AS v") as any[]
    if (versions.length) {
      const vparts = (versions[0].v || "").split("-")
      options.package = /mariadb/i.test(vparts[1]) ? "mariadb" : "mysql"
      options.version = vparts[0]
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
    const parser = new MysqlParser(input, options)
    return parser.root()
  }

  protected async run(stmts: Statement[], options: { [key: string]: any }) {
    const vdb = new VDatabase()
    vdb.addSchema("mysql", true)
    vdb.addSchema("sys", true)
    vdb.addSchema("information_schema", true)
    vdb.addSchema("performance_schema", true)
    vdb.defaultSchemaName = await this.getCurrentSchemaName()

    const refs = []
    for (const [i, stmt] of stmts.entries()) {
      refs[i] = stmt.process(vdb)
    }

    for (const [i, stmt] of stmts.entries()) {
      console.log(`-- ## statement ${i + 1}: ${stmt.summary()}`)
      switch (stmt.constructor) {
      }
      console.log()
    }
  }

  async destroy() {
    this.con?.destroy()
  }

  private async getCurrentSchemaName() {
    const result = await this.con?.query("SELECT database() ad schemaName") as any[]
    return result[0]?.schemaName
  }
}

function dquote(text: string) {
  return '"' + text.replace(/"/g, '""') + '"'
}

function bquote(text: string) {
  return "`" + text.replace(/`/g, "``") + "`"
}
