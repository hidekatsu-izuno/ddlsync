import mariadb from "mariadb"
import { Statement, VDatabase, VObject, VSchema } from "../models"
import { DdlSyncProcessor } from "../processor"
import { MysqlParser } from "./mysql_parser"
import * as model from "./mysql_models"
import { Token } from "../parser"
import { bquote } from "../util/functions"

export default class MysqlProcessor extends DdlSyncProcessor {
  static create = async (config: { [key: string]: any }) => {
    return new MysqlProcessor(config, await mariadb.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
    }))
  }

  private constructor(
    config: { [key: string]: any },
    private con: mariadb.Connection,
  ) {
    super(config)
  }

  protected async init() {
    const versions = await this.con.query("SELECT version() AS v") as any[]
    if (versions.length) {
      const vparts = (versions[0].v || "").split("-")
      this.options.variant = /mariadb/i.test(vparts[1]) ? "mariadb" : "mysql"
      this.options.version = vparts[0]
    }

    const sqlModes = await this.con.query("SELECT @@sql_mode AS sql_mode") as any[]
    if (sqlModes.length) {
      this.options.sqlMode = sqlModes[0].sql_mode
    }

    const keywordsSchema = await this.con.query("SELECT TABLE_NAME" +
      " FROM INFORMATION_SCHEMA.TABLES" +
      " WHERE TABLE_SCHEMA = 'information_schema'" +
      " AND TABLE_NAME = 'KEYWORDS'" +
      " AND TABLE_TYPE = 'SYSTEM VIEW'"
    ) as any[]
    if (keywordsSchema.length) {
      this.options.reservedWords = []
      for await (const row of await this.con.queryStream("SELECT WORD " +
        " FROM INFORMATION_SCHEMA.KEYWORDS" +
        " WHERE WHERE RESERVED = 1"
      )) {
        this.options.reservedWords.push(row.WORD)
      }
    }
  }

  protected async parse(input: string, fileName: string) {
    const parser = new MysqlParser(input, {
      ...this.options,
      fileName
    })
    return parser.root()
  }

  protected async run(stmts: Statement[]) {
    const vdb = new VDatabase()
    vdb.addSchema("mysql", true)
    vdb.addSchema("sys", true)
    vdb.addSchema("information_schema", true)
    vdb.addSchema("performance_schema", true)
    vdb.defaultSchema = await this.getCurrentSchema()

    const refs = []
    for (const [i, stmt] of stmts.entries()) {
      refs[i] = stmt.process(vdb)
    }

    for (const [i, stmt] of stmts.entries()) {
      console.log(`-- ## statement ${i + 1}: ${stmt.summary()}`)
      switch (stmt.constructor) {
        case model.CommandStatement:
          await this.runCommandStatement(i, stmt as model.CommandStatement)
          break
        case model.CreateDatabaseStatement:
          await this.runCreateDatabaseStatement(i, stmt as model.CreateDatabaseStatement, refs[i] as VSchema)
          break
        case model.CreateRoleStatement:
          await this.runCreateRoleStatement(i, stmt as model.CreateRoleStatement)
          break
        case model.CreateUserStatement:
          await this.runCreateUserStatement(i, stmt as model.CreateUserStatement)
          break
        case model.CreateTablespaceStatement:
          await this.runCreateTablespaceStatement(i, stmt as model.CreateTablespaceStatement)
          break
        case model.CreateServerStatement:
          await this.runCreateServerStatement(i, stmt as model.CreateServerStatement)
          break
        case model.CreateResourceGroupStatement:
          await this.runCreateResourceGroupStatement(i, stmt as model.CreateResourceGroupStatement)
          break
        case model.CreateLogfileGroupStatement:
          await this.runCreateLogfileGroupStatement(i, stmt as model.CreateLogfileGroupStatement)
          break
        case model.CreateSpatialReferenceSystemStatement:
          await this.runCreateSpatialReferenceSystemStatement(i, stmt as model.CreateSpatialReferenceSystemStatement)
          break
        case model.CreateTableStatement:
        case model.CreateSequenceStatement:
        case model.CreateViewStatement:
        case model.CreatePackageStatement:
        case model.CreatePackageBodyStatement:
        case model.CreateProcedureStatement:
        case model.CreateFunctionStatement:
        case model.CreateTriggerStatement:
        case model.CreateEventStatement:
          await this.runCreateObjectStatement(i, stmt, refs[i] as VObject)
          break
        case model.InsertStatement:
        case model.UpdateStatement:
        case model.ReplaceStatement:
        case model.DeleteStatement:
          await this.runStatement(i, stmt, ResultType.COUNT)
          break
        case model.SelectStatement:
        case model.ShowStatement:
          await this.runStatement(i, stmt, ResultType.ROWS)
          break
        default:
          await this.runStatement(i, stmt)
      }
      console.log()
    }
  }

  async destroy() {
    this.con?.destroy()
  }

  async runCommandStatement(seq: number, stmt: model.CommandStatement) {
    if (stmt.name === "use") {
      await this.runScript(`USE ${stmt.args.join(" ")}`)
    } else {
      console.log(`-- skip: command "${stmt.name}" is not supported.`)
    }
  }

  async runCreateDatabaseStatement(seq: number, stmt: model.CreateDatabaseStatement, ref: VSchema) {
    let rows, ddl
    if ((rows = await this.con.query(`SHOW CREATE DATABASE ${bquote(ref.name)}`) as any[]).length) {
      ddl = rows[0]["Create Database"] || ""
    } else {
      await this.runScript(Token.concat(stmt.tokens))
      return
    }

    const oldStmt = new MysqlParser(ddl).root()[0]
    if (!(oldStmt instanceof model.CreateDatabaseStatement)) {
      throw new Error(`Failed to get metadata: ${ref.name}`)
    }

    let defaultCharacterSet = "latin1"
    if ((rows = await this.con.query("SHOW SESSION VARIABLES LIKE 'character_set_server'") as any[]).length) {
      if (rows[0].Value) {
        defaultCharacterSet = rows[0].Value
      }
    }

    let defaultCollate = "latin1_swedish_ci"
    if ((rows = await this.con.query("SHOW SESSION VARIABLES LIKE 'collation_server'") as any[]).length) {
      if (rows[0].Value) {
        defaultCollate = rows[0].Value
      }
    }

    let defaultEncryption = model.Expression.string("N")
    if ((rows = await this.con.query("SHOW GLOBAL VARIABLES LIKE 'default_table_encryption'") as any[]).length) {
      if (rows[0].Value === "ON") {
        defaultEncryption = model.Expression.string("Y")
      }
    }

    const sopts = []
    if ((oldStmt.characterSet || defaultCharacterSet) !== (stmt.characterSet || defaultCharacterSet)) {
      sopts.push(`CHARACTER SET = ${stmt.characterSet ? stmt.characterSet : defaultCharacterSet}`)
    } else if ((oldStmt.collate || defaultCollate) !== (stmt.collate || defaultCollate)) {
      sopts.push(`COLLATE = ${stmt.collate || defaultCollate}`)
    } else if (!model.Expression.eq(oldStmt.encryption || defaultEncryption, stmt.encryption || defaultEncryption)) {
      sopts.push(`ENCRYPTION = ${stmt.encryption || defaultEncryption}`)
    } else if (!model.Expression.eq(oldStmt.comment, stmt.comment)) {
      sopts.push(`COMMENT = ${stmt.comment ? stmt.comment : "''"}`)
    } else {
      console.log(`-- skip: schema ${ref.name} is unchangeed`)
      return
    }

    await this.runScript(`ALTER TABLE ${bquote(ref.name)} ${sopts.join(" ")}`)
  }

  async runCreateRoleStatement(seq: number, stmt: model.CreateRoleStatement) {
  }

  async runCreateUserStatement(seq: number, stmt: model.CreateUserStatement) {
  }

  async runCreateTablespaceStatement(seq: number, stmt: model.CreateTablespaceStatement) {
  }

  async runCreateServerStatement(seq: number, stmt: model.CreateServerStatement) {
    const oldStmt = new model.CreateServerStatement()
    let rows
    if ((rows = await this.con.query(
      `SELECT * FROM mysql.servers WHERE Server_name = ${bquote(stmt.name)}`
    ) as any[]).length) {
      oldStmt.wrapper = rows[0].Wrapper
      oldStmt.host = rows[0].Host && model.Expression.string(rows[0].Host)
      oldStmt.database = rows[0].Db && model.Expression.string(rows[0].Db)
      oldStmt.user = rows[0].Username && model.Expression.string(rows[0].Username)
      oldStmt.password = rows[0].Password && model.Expression.string(rows[0].Password)
      oldStmt.port = rows[0].Port && model.Expression.string(rows[0].Port)
      oldStmt.socket = rows[0].Socket && model.Expression.string(rows[0].Socket)
      oldStmt.owner = rows[0].Owner && model.Expression.string(rows[0].Owner)
    } else {
      await this.runScript(Token.concat(stmt.tokens))
      return
    }

    if ((oldStmt.wrapper || "") !== (stmt.wrapper || "")) {
      await this.runScript(`DROP SERVER ${bquote(stmt.name)}`)
      await this.runScript(Token.concat(stmt.tokens))
      return
    }

    const sopts = []
    if (!model.Expression.eq(oldStmt.host, stmt.host)) {
      sopts.push(`HOST ${stmt.host || "''"}`)
    } else if (!model.Expression.eq(oldStmt.database, stmt.database)) {
      sopts.push(`DATABASE ${stmt.database || "''"}`)
    } else if (!model.Expression.eq(oldStmt.user, stmt.user)) {
      sopts.push(`USER ${stmt.user || "''"}`)
    } else if (!model.Expression.eq(oldStmt.password, stmt.password)) {
      sopts.push(`PASSWORD ${stmt.password || "''"}`)
    } else if (!model.Expression.eq(oldStmt.port, stmt.port)) {
      sopts.push(`PORT ${stmt.port || "''"}`)
    } else if (!model.Expression.eq(oldStmt.socket, stmt.socket)) {
      sopts.push(`SOCKET ${stmt.socket || "''"}`)
    } else if (!model.Expression.eq(oldStmt.owner, stmt.owner)) {
      sopts.push(`OWNER ${stmt.owner || "''"}`)
    } else {
      console.log(`-- skip: schema ${stmt.name} is unchangeed`)
      return
    }

    await this.runScript(`ALTER SERVER ${bquote(stmt.name)} OPTIONS (${sopts.join(",")})`)
  }

  async runCreateResourceGroupStatement(seq: number, stmt: model.CreateResourceGroupStatement) {
    let rows, oldStmt
    if ((rows = await this.con.query(
      `SELECT * FROM information_schema.RESOURCE_GROUPS WHERE RESOURCE_GROUP_NAME = ${bquote(stmt.name)}`
    ) as any[]).length) {
      oldStmt = rows[0] || {}
    } else {
      await this.runScript(Token.concat(stmt.tokens))
      return
    }

    const sopts = []
    if (oldStmt.RESOURCE_GROUP_TYPE !== stmt.type) {
      sopts.push(`TYPE = ${stmt.type}`)
    } else if ((oldStmt.RESOURCE_GROUP_ENABLED.toString() !== "1") !== stmt.disable) {
      sopts.push(stmt.disable ? "DISABLED" : "ENABLED")
    } else if ((oldStmt.VCPU || "") !== (stmt.vcpu || "")) {
      sopts.push(`VCPU = ${stmt.vcpu}`)
    } else if (oldStmt.THREAD_PRIORITY !== stmt.threadPriority) {
      sopts.push(`THREAD_PRIORITY = ${stmt.threadPriority}`)
    } else {
      console.log(`-- skip: resource group ${stmt.name} is unchangeed`)
      return
    }

    await this.runScript(`ALTER RESOURCE GROUP ${bquote(stmt.name)} ${sopts.join(" ")}`)
  }

  async runCreateLogfileGroupStatement(seq: number, stmt: model.CreateLogfileGroupStatement) {
  }

  async runCreateSpatialReferenceSystemStatement(seq: number, stmt: model.CreateSpatialReferenceSystemStatement) {
  }

  async runCreateObjectStatement(seq: number, stmt: Statement, ref: VObject) {
  }

  private async runStatement(seq: number, stmt: Statement, type?: ResultType) {
    this.runScript(Token.concat(stmt.tokens), type)
  }

  private async runScript(script: string, type?: ResultType) {
    console.log(script + ";")
    if (this.config.dryrun || !this.con) {
      return;
    }

    if (type === ResultType.ROWS) {
      let count = 0
      for await (const row of await this.con.queryStream(script)) {
        count++
      }
      console.log(`-- result: ${count} records`)
    } else if (type === ResultType.COUNT) {
      const result = await this.con.query(script)
      console.log(`-- result: ${result.affectedRows} records`)
    } else {
      this.con.query(script)
    }
  }

  private async getCurrentSchema() {
    const result = await this.con?.query("SELECT database() ad schema") as any[]
    return result[0]?.schema
  }
}

enum ResultType {
  NONE,
  COUNT,
  ROWS,
}
