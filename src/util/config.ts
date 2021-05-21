import path from "path"
import rechoir from "rechoir"
import interpret from "interpret"
import colorette from "colorette"
import io from "../util/io"
import Sqlite3Processor from "../sqlite3/sqlite3_processor"

const Extensions = ["ts", "js", "coffee", "eg", "ls"]

export async function createDddlSyncProcessor(args: string[], options: { [key: string]: any }) {
  const config = await initConfig(args, options)
  if (config.client === "sqlite3") {
    return new Sqlite3Processor(config)
  }
  throw new Error(`Unsupported client: ${config.client}`)
}

async function initConfig(args: string[], options: { [key: string]: any }) {
  let cwd = process.cwd()
  let configPath = null
  if (options.config) {
    if (typeof options.knexfile === "string") {
      configPath = path.resolve(cwd, options.config)
    }
  } else {
    for (let ext of Extensions) {
      const filePath = path.resolve(cwd, `ddlsync.config.${ext}`)
      if (await io.isFile(filePath)) {
        configPath = filePath
      }
    }
    if (!configPath) {
      for (let ext of Extensions) {
        const filePath = path.resolve(cwd, `knexfile.${ext}`)
        if (await io.isFile(filePath)) {
          configPath = filePath
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

  if (!config.ddlsync) {
    config.ddlsync = {}
  }

  if (options.include) {
    config.ddlsync.include = options.include
  }
  if (config.ddlsync.include && !Array.isArray(config.ddlsync.include)) {
    config.ddlsync.include = [ config.ddlsync.include ]
  }

  if (options.exclude) {
    config.ddlsync.exclude = options.exclude
  }
  if (config.ddlsync.exclude && !Array.isArray(config.ddlsync.exclude)) {
    config.ddlsync.exclude = [ config.ddlsync.exclude ]
  }

  if (options.workDir) {
    config.ddlsync.workDir = options.workDir
  }

  return config;
}
