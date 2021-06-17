import os from "os"
import mariadb from "mariadb"
import { Statement, VDatabase, VObject, VRole, VSchema, VUser } from "../models"
import { DdlSyncProcessor } from "../processor"
import { MysqlLexer, MysqlParser, toExpression } from "./mysql_parser"
import * as model from "./mysql_models"
import { Token } from "../parser"
import { bquote, eqSet, formatDateTime, squote } from "../util/functions"

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

    vdb.addUser("root\0localhost", true)
    vdb.addUser("root\0127.0.0.1", true)
    vdb.addUser("root\0::1", true)
    vdb.addUser("root\0%", true)
    const hostname = os.hostname()
    if (hostname && !vdb.getUser(`root\0${hostname}`)) {
      vdb.addUser(`root\0${hostname}`, true)
    }

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
          await this.runCreateRoleStatement(i, stmt as model.CreateRoleStatement, refs[i] as Array<VUser>)
          break
        case model.CreateUserStatement:
          await this.runCreateUserStatement(i, stmt as model.CreateUserStatement, refs[i] as Array<VUser>)
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
    let oldStmt
    let rows
    if ((rows = await this.con.query(`SHOW CREATE DATABASE ${bquote(stmt.name)}`) as any[]).length) {
      const column = (rows as any).meta[0].name()
      if (rows[0][column]) oldStmt = new MysqlParser(rows[0][column]).root()[0]
      if (!(oldStmt instanceof model.CreateDatabaseStatement)) {
        throw new Error(`Failed to get metadata: ${stmt.name}`)
      }
    } else {
      await this.runScript(Token.concat(stmt.tokens))
      return
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

    let defaultEncryption = new model.Text("'N'")
    if ((rows = await this.con.query("SHOW GLOBAL VARIABLES LIKE 'default_table_encryption'") as any[]).length) {
      if (rows[0].Value === "ON") {
        defaultEncryption = new model.Text("'Y'")
      }
    }

    const sopts = []
    if ((oldStmt.characterSet || defaultCharacterSet) !== (stmt.characterSet || defaultCharacterSet)) {
      sopts.push(`CHARACTER SET = ${stmt.characterSet ? stmt.characterSet : defaultCharacterSet}`)
    }
    if ((oldStmt.collate || defaultCollate) !== (stmt.collate || defaultCollate)) {
      sopts.push(`COLLATE = ${stmt.collate || defaultCollate}`)
    }
    if (ematches(oldStmt.encryption || defaultEncryption, stmt.encryption || defaultEncryption)) {
      sopts.push(`ENCRYPTION = ${stmt.encryption || defaultEncryption}`)
    }
    if (!ematches(oldStmt.comment, stmt.comment)) {
      sopts.push(`COMMENT = ${stmt.comment ? stmt.comment : "''"}`)
    }

    if (sopts.length === 0) {
      console.log(`-- skip: schema ${ref.name} is unchangeed`)
    } else {
      await this.runScript(`ALTER TABLE ${bquote(stmt.name)} ${sopts.join(" ")}`)
    }
  }

  async runCreateRoleStatement(seq: number, stmt: model.CreateRoleStatement, ref: Array<VUser>) {
    const newRoles = new Array<string>()
  }

  async runCreateUserStatement(seq: number, stmt: model.CreateUserStatement, ref: Array<VUser>) {
    const newUsers = new Array<string>()
    for (const [i, user] of stmt.users.entries()) {
      let userName = user.name.toString()
      if (user.host) {
        userName += "@" + user.host
      }

      let oldStmt
      let rows
      if ((rows = await this.con.query(`SHOW CREATE USER ${userName}`) as any[]).length) {
        const column = (rows as any).meta[0].name()
        if (rows[0][column]) oldStmt = new MysqlParser(rows[0][column]).root()[0]
        if (!(oldStmt instanceof model.CreateUserStatement)) {
          throw new Error(`Failed to get metadata: ${userName}`)
        }

        const oldUser = oldStmt.users[0]
        let opts = ""

        const uopts = []
        if (user.randowmPassword || user.password) {
          let auth = "IDENTIFIED"
          if (user.authPlugin) {
            auth += ` WITH ${bquote(user.authPlugin)}`
          }
          if (user.randowmPassword) {
            auth += " BY RANDOM PASSWORD"
          } else if (user.asPassword) {
            auth += ` AS ${user.password}`
          } else {
            auth += ` BY ${user.password}`
          }
          uopts.push(auth)
        } else if (oldUser.randowmPassword || oldUser.password) {
          uopts.push("DISCARD OLD PASSWORD")
        }
        if (uopts.length) {
          opts += " " + uopts.join(" ")
        }

        if (
          (oldStmt.tlsOptions?.ssl || false) !== (stmt.tlsOptions?.ssl || false) ||
          (oldStmt.tlsOptions?.x509 || false) !== (stmt.tlsOptions?.x509 || false) ||
          !ematches(oldStmt.tlsOptions?.issuer, stmt.tlsOptions?.issuer) ||
          !ematches(oldStmt.tlsOptions?.subject, stmt.tlsOptions?.subject) ||
          !ematches(oldStmt.tlsOptions?.cipher, stmt.tlsOptions?.cipher)
        ) {
          if (stmt.tlsOptions) {
            const topts = []
            if (stmt.tlsOptions?.ssl) topts.push("SSL")
            if (stmt.tlsOptions?.x509) topts.push("X509")
            if (stmt.tlsOptions?.issuer) topts.push(`ISSUER ${stmt.tlsOptions?.issuer}`)
            if (stmt.tlsOptions?.subject) topts.push(`SUBJECT ${stmt.tlsOptions?.subject}`)
            if (stmt.tlsOptions?.cipher) topts.push(`CIPHER ${stmt.tlsOptions?.cipher}`)
            opts += ` REQUIRE ${topts.join(" ")}`
          } else {
            opts += " REQUIRE NONE"
          }
        }

        if (
          !ematches(oldStmt.resourceOptions.maxQueriesPerHour, stmt.resourceOptions.maxQueriesPerHour) ||
          !ematches(oldStmt.resourceOptions.maxUpdatesPerHour, stmt.resourceOptions.maxUpdatesPerHour) ||
          !ematches(oldStmt.resourceOptions.maxConnectionsPerHour, stmt.resourceOptions.maxConnectionsPerHour) ||
          !ematches(oldStmt.resourceOptions.maxUserConnections, stmt.resourceOptions.maxUserConnections)
        ) {
          const ropts = []
          ropts.push(`MAX_QUERIES_PER_HOUR ${stmt.resourceOptions?.maxQueriesPerHour || 0}`)
          ropts.push(`MAX_UPDATES_PER_HOUR ${stmt.resourceOptions?.maxUpdatesPerHour || 0}`)
          ropts.push(`MAX_CONNECTIONS_PER_HOUR ${stmt.resourceOptions?.maxConnectionsPerHour || 0}`)
          ropts.push(`MAX_USER_CONNECTIONS ${stmt.resourceOptions?.maxUserConnections || 0}`)
          opts += ` WITH ${ropts.join(" ")}`
        }

        if (!ematches(oldStmt.passwordExpire, stmt.passwordExpire)) {
          if (stmt.passwordExpire === true) {
            opts += ` PASSWORD EXPIRE`
          } else {
            opts += ` PASSWORD EXPIRE ${stmt.passwordExpire}`
          }
        }
        if (!ematches(oldStmt.passwordHistory, stmt.passwordHistory)) {
          opts += ` PASSWORD EXPIRE ${stmt.passwordHistory}`
        }
        if (!ematches(oldStmt.failedLoginAttempts, stmt.failedLoginAttempts)) {
          opts += ` FAILED_LOGIN_ATTEMPTS ${stmt.failedLoginAttempts}`
        }
        if (!ematches(oldStmt.passwordLockTime, stmt.passwordLockTime)) {
          opts += ` PASSWORD_LOCK_TIME ${stmt.passwordLockTime}`
        }
        if (oldStmt.accountLock !== stmt.accountLock) {
          opts += ` ACCOUNT ${stmt.accountLock ? "LOCK" : "UNLOCK"}`
        }

        if (
          !ematches(oldStmt.comment, stmt.comment) ||
          !ematches(oldStmt.attribute, stmt.attribute)
        ) {
          if (stmt.comment) {
            opts += ` COMMENT ${stmt.comment}`
          } else if (stmt.attribute) {
            opts += ` ATTRIBUTE ${stmt.attribute}`
          } else {
            opts += " ATTRIBUTE ''"
          }
        }

        if (opts.length > 0) {
          await this.runScript(`ALTER USER ${userName}${opts}`)
        }

        if (!eqSet(
          oldStmt.defaultRoles.map(role => role.host ? `${role.name}@${role.host}` : `${role.name}`),
          stmt.defaultRoles.map(role => role.host ? `${role.name}@${role.host}` : `${role.name}`),
        )) {
          if (!stmt.defaultRoles) {
            await this.runScript(`ALTER USER ${userName} NONE`)
          } else {
            await this.runScript(`ALTER USER ${userName} DEFAULT ROLE ${stmt.defaultRoles
              .map(role => role.host ? `${role.name}@${role.host}` : `${role.name}`)
              .join(",")
            }`)
          }
        }
      } else {
        const userStart = stmt.markers.get(`userStart.${i}`)
        const userEnd = stmt.markers.get(`userEnd.${i}`)
        if (userStart != null && userEnd != null) {
          let text = "CREATE USER " + Token.concat(stmt.tokens.slice(userStart, userEnd))
          const optionsStart = stmt.markers.get("optionsStart")
          const optionsEnd = stmt.markers.get("optionsEnd")
          if (optionsStart != null && optionsEnd != null) {
            text += " " + Token.concat(stmt.tokens.slice(optionsStart, optionsEnd))
          }
          newUsers.push(text)
        } else {
          throw new Error(`Failed to get user marker: ${user.name}`)
        }
        return
      }
    }

    if (newUsers.length === 0) {
      if (ref.length > 1) {
        console.log(`-- skip: users are unchangeed`)
      } else {
        console.log(`-- skip: user ${ref[0].name.replace("\0", "@")} is unchangeed`)
      }
    } else if (newUsers.length === ref.length) {
      await this.runScript(Token.concat(stmt.tokens))
    } else {
      for (const newUser of newUsers) {
        await this.runScript(newUser)
      }
    }
  }

  async runCreateTablespaceStatement(seq: number, stmt: model.CreateTablespaceStatement) {
    const oldStmt = new model.CreateTablespaceStatement()
    let rows
    if ((rows = await this.con.query(
      `SELECT * FROM information_schema.TABLESPACES WHERE TABLESPACE_NAME = ${bquote(stmt.name)}`
    ) as any[]).length) {
      oldStmt.autoextendSize = rows[0].AUTOEXTEND_SIZE
      oldStmt.fileBlockSize = rows[0].FILE_BLOCK_SIZE //TODO
      oldStmt.encryption = rows[0].ENCRYPTION && new model.Text(rows[0].ENCRYPTION, false)
      oldStmt.useLogfileGroup = rows[0].LOGFILE_GROUP_NAME
      oldStmt.extentSize = rows[0].EXTENT_SIZE
      oldStmt.initialSize = rows[0].INITIAL_SIZE //TODO
      oldStmt.maxSize = rows[0].MAXIMUM_SIZE
      oldStmt.nodeGroup = rows[0].NODE_GROUP_ID
      oldStmt.wait = false
      oldStmt.comment = rows[0].TABLESPACE_COMMENT
      oldStmt.engine = rows[0].ENGINE
      oldStmt.engineAttribute = rows[0].ENGINE_ATTRIBUTE && new model.Text(rows[0].ENGINE_ATTRIBUTE, false) //TODO

      if ((rows = await this.con.query(
        `SELECT * FROM information_schema.FILES WHERE TABLESPACE_NAME = ${bquote(stmt.name)}`
      ) as any[]).length) {
        oldStmt.undo = /UNDO LOG/.test(rows[0].FILE_TYPE)
        oldStmt.addDataFile = new model.Text(rows[0].FILE_NAME, true)
      }
    } else {
      await this.runScript(Token.concat(stmt.tokens))
      return
    }

    if (oldStmt.undo !== stmt.undo || !ematches(oldStmt.addDataFile, stmt.addDataFile)) {
      const backupTableName = `~${this.timestamp(seq)} ${stmt.name}`
      await this.runScript(`ALTER TABLESPACE ${bquote(stmt.name)}` +
        ` RENAME TO ${bquote(backupTableName)}`)
      await this.runScript(Token.concat(stmt.tokens))
      return
    }

    const sopts = []
    if ((oldStmt.autoextendSize || "0") !== (stmt.autoextendSize || "0")) {
      sopts.push(`AUTOEXTEND_SIZE ${stmt.autoextendSize}`)
    } else {
      console.log(`-- skip: schema ${stmt.name} is unchangeed`)
      return
    }

    await this.runScript(`ALTER TABLESPACE ${bquote(stmt.name)} ${sopts.join(" ")}`)
  }

  async runCreateServerStatement(seq: number, stmt: model.CreateServerStatement) {
    const oldStmt = new model.CreateServerStatement()
    let rows
    if ((rows = await this.con.query(
      `SELECT * FROM mysql.servers WHERE Server_name = ${bquote(stmt.name)}`
    ) as any[]).length) {
      if (rows[0].Wrapper != null) oldStmt.wrapper = rows[0].Wrapper
      if (rows[0].Host != null) oldStmt.host = new model.Text(rows[0].Host, true)
      if (rows[0].Db != null) oldStmt.database = new model.Text(rows[0].Db, true)
      if (rows[0].Username != null) oldStmt.user = new model.Text(rows[0].Username, true)
      if (rows[0].Password != null) oldStmt.password = new model.Text(rows[0].Password, true)
      if (rows[0].Port != null) oldStmt.port = new model.Numeric(rows[0].Port)
      if (rows[0].Socket != null) oldStmt.socket = new model.Text(rows[0].Socket, true)
      if (rows[0].Owner != null) oldStmt.owner = new model.Text(rows[0].Owner, true)
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
    if (!ematches(oldStmt.host, stmt.host)) {
      sopts.push(`HOST ${stmt.host || "''"}`)
    } else if (!ematches(oldStmt.database, stmt.database)) {
      sopts.push(`DATABASE ${stmt.database || "''"}`)
    } else if (!ematches(oldStmt.user, stmt.user)) {
      sopts.push(`USER ${stmt.user || "''"}`)
    } else if (!ematches(oldStmt.password, stmt.password)) {
      sopts.push(`PASSWORD ${stmt.password || "''"}`)
    } else if (!ematches(oldStmt.port, stmt.port)) {
      sopts.push(`PORT ${stmt.port || "''"}`)
    } else if (!ematches(oldStmt.socket, stmt.socket)) {
      sopts.push(`SOCKET ${stmt.socket || "''"}`)
    } else if (!ematches(oldStmt.owner, stmt.owner)) {
      sopts.push(`OWNER ${stmt.owner || "''"}`)
    } else {
      console.log(`-- skip: schema ${stmt.name} is unchangeed`)
      return
    }

    await this.runScript(`ALTER SERVER ${bquote(stmt.name)} OPTIONS (${sopts.join(",")})`)
  }

  async runCreateResourceGroupStatement(seq: number, stmt: model.CreateResourceGroupStatement) {
    const oldStmt = new model.CreateResourceGroupStatement()
    let rows
    if ((rows = await this.con.query(
      `SELECT * FROM information_schema.RESOURCE_GROUPS WHERE RESOURCE_GROUP_NAME = ${bquote(stmt.name)}`
    ) as any[]).length) {
      if (rows[0].RESOURCE_GROUP_TYPE != null) oldStmt.type = rows[0].RESOURCE_GROUP_TYPE
      if (rows[0].RESOURCE_GROUP_ENABLED != null) oldStmt.disable = rows[0].RESOURCE_GROUP_ENABLED !== 1
      if (rows[0].VCPU != null) oldStmt.vcpu = toExpression(new MysqlLexer().lex(rows[0].VCPU))
      if (rows[0].THREAD_PRIORITY != null) oldStmt.threadPriority = new model.Numeric(rows[0].THREAD_PRIORITY)
    } else {
      await this.runScript(Token.concat(stmt.tokens))
      return
    }

    const sopts = []
    if (oldStmt.type !== stmt.type) {
      sopts.push(`TYPE = ${stmt.type}`)
    } else if (oldStmt.disable !== stmt.disable) {
      sopts.push(stmt.disable ? "DISABLED" : "ENABLED")
    } else if (!ematches(oldStmt.vcpu, stmt.vcpu)) {
      sopts.push(`VCPU = ${stmt.vcpu}`)
    } else if (!ematches(oldStmt.threadPriority, stmt.threadPriority)) {
      sopts.push(`THREAD_PRIORITY = ${stmt.threadPriority}`)
    } else {
      console.log(`-- skip: resource group ${stmt.name} is unchangeed`)
      return
    }

    await this.runScript(`ALTER RESOURCE GROUP ${bquote(stmt.name)} ${sopts.join(" ")}`)
  }

  async runCreateLogfileGroupStatement(seq: number, stmt: model.CreateLogfileGroupStatement) {
    //TODO
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

  private timestamp(seq: number) {
    return formatDateTime(this.startTime, "uuuuMMddHHmmss") + ("0000" + seq).slice(-4)
  }
}

enum ResultType {
  NONE,
  COUNT,
  ROWS,
}

export function ematches(
  val1?: model.Expression | model.IValue | string | boolean,
  val2?: model.Expression | model.IValue | string | boolean,
) {
  const v1 = !(val1 instanceof model.Expression) ? val1 : val1.length > 1 ? val1[0] : val1
  const v2 = !(val2 instanceof model.Expression) ? val2 : val2.length > 1 ? val2[0] : val1

  if (!v1) {
    return !v2
  } else if (!v2) {
    return false
  } else if (v1.constructor !== v2.constructor) {
    return false
  }

  if (v1 instanceof model.Expression && v2 instanceof model.Expression) {
    if (v1.length !== v2.length) {
      return false
    }
    for (let i = 0; i < v1.length; i++) {
      if (v1[i].constructor !== v2[i].constructor || v1[i].value !== v2[i].value) {
        return false
      }
    }
  } else if (
    (typeof v1 === "string" && typeof v2 === "string") ||
    (typeof v1 === "boolean" && typeof v2 === "boolean")
  ) {
    if (v1 !== v2) {
      return false
    }
  } else {
    if ((v1 as model.IValue).value !== (v2 as model.IValue).value) {
      return false
    }
  }

  return true
}
