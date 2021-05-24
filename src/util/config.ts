import path from "path"
import rechoir from "rechoir"
import interpret from "interpret"
import colorette from "colorette"
import io from "../util/io"
import Sqlite3Processor from "../sqlite3/sqlite3_processor"

const Extensions = ["ts", "js", "json", "yml", "coffee", "eg", "ls"]

export async function createDddlSyncProcessor(
  args: string[],
  options: { [key: string]: any },
  dryrun: boolean = false
) {
  const config = await initConfig(args, options)
  if (config.type === "sqlite3") {
    return new Sqlite3Processor(config, dryrun)
  }
  throw new Error(`Unsupported database type: ${config.type}`)
}

async function initConfig(args: string[], options: { [key: string]: any }) {
  let cwd = process.cwd()
  let configType = null
  let configPath = null
  if (options.config) {
    if (typeof options.knexfile === "string") {
      configPath = path.resolve(cwd, options.config)
    }
  } else {
    loop: for (const fileType of [
      { prefix: "ddlsync.config", type: "ddlsync" },
      { prefix: "ormconfig", type: "typeorm" },
      { prefix: "knexfile", type: "knex" },
      { prefix: "config/config", type: "sequelize" },
    ]) {
      for (let ext of Extensions) {
        const filePath = path.resolve(cwd, `${fileType.prefix}.${ext}`)
        if (await io.isFile(filePath)) {
          configType = fileType.type
          configPath = filePath
          break loop
        }
      }
    }
  }

  if (!configPath) {
    throw new Error("A config file is not found.")
  }

  const autoloads = rechoir.prepare(
    interpret.jsVariants,
    configPath,
    cwd,
    true
  )
  if (autoloads instanceof Error) {
    (autoloads as any).failures.forEach(function (failed: any) {
      console.log(colorette.red("Failed to load external module"), colorette.magenta(failed.moduleName))
    })
  } else if (Array.isArray(autoloads)) {
    const succeeded = autoloads[autoloads.length - 1]
    console.log("Requiring external module", colorette.magenta(succeeded.moduleName))
  }

  let config = require(configPath)
  if (config && config.default) {
    config = config.default
  }
  if (typeof config === 'function') {
    config = await config()
  }

  const env = options.env || process.env.NODE_ENV || 'development'
  if (config[env]) {
    console.log('Using environment:', colorette.magenta(env))
  }

  config = config[env] || config
  if (!config) {
    throw new Error(`Warning: unable to read a config file: ${configPath}`)
  }

  let ddlSyncConfg
  if (configType === "typeorm") {
    ddlSyncConfg = { ...config, ...config.ddlsync, ddlsync: undefined }
  } else if (configType === "sequelize") {
    ddlSyncConfg = { ...config.ddlsync, ddlsync: undefined }
    if (config.dialect === "sqlite") {
      ddlSyncConfg.type = "sqlite3"
      ddlSyncConfg.database = config.storage
    } else {
      ddlSyncConfg.type = config.dialect
      ddlSyncConfg.host = config.host
      ddlSyncConfg.port = config.port
      ddlSyncConfg.username = config.username
      ddlSyncConfg.password = config.password
      ddlSyncConfg.database = config.database
    }
  } else if (configType === "knex") {
    ddlSyncConfg = { ...config.ddlsync, ddlsync: undefined }
    if (config.client === "sqlite3") {
      ddlSyncConfg.type = config.client
      ddlSyncConfg.database = config.connection?.filename
    } else {
      if (config.client === "mysql2" || config.client === "mariadb") {
        ddlSyncConfg.type = "mysql"
      } else if (config.client === "pg") {
        ddlSyncConfg.type = "postgres"
      } else if (config.client === "tedious") {
        ddlSyncConfg.type = "mssql"
        } else if (config.client === "oracledb") {
        ddlSyncConfg.type = "oracle"
      } else {
        ddlSyncConfg.type = config.client
      }
      ddlSyncConfg.host = config.connection?.host
      ddlSyncConfg.port = config.connection?.port
      ddlSyncConfg.username = config.connection?.username
      ddlSyncConfg.password = config.connection?.password
      ddlSyncConfg.database = config.connection?.database
    }
  } else {
    ddlSyncConfg = config
  }

  // override settings
  if (options.include) {
    ddlSyncConfg.include = options.include
  }
  if (options.exclude) {
    ddlSyncConfg.exclude = options.exclude
  }
  if (options.workDir) {
    ddlSyncConfg.workDir = options.workDir
  }
  if (options.backupMode) {
    ddlSyncConfg.backupMode = options.backupMode
  }

  // normalize config
  if (ddlSyncConfg.include && !Array.isArray(ddlSyncConfg.include)) {
    ddlSyncConfg.include = [ ddlSyncConfg.include ]
  }
  if (ddlSyncConfg.exclude && !Array.isArray(ddlSyncConfg.exclude)) {
    ddlSyncConfg.exclude = [ ddlSyncConfg.exclude ]
  }

  return ddlSyncConfg;
}
