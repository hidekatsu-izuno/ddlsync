import path from "path"
import rechoir from "rechoir"
import interpret from "interpret"
import colorette from "colorette"
import io from "../util/io"

const Extensions = ["ts", "js", "coffee", "eg", "ls"]

export async function initConfig(args: string[], options: { [key: string]: any }) {
  let cwd = process.cwd()
  let configPath = null
  if (options.knexfile) {
    if (typeof options.knexfile === "string") {
      configPath = path.resolve(cwd, options.knexfile)
    }
  } else {
    for (let ext of Extensions) {
      const filePath = path.resolve(cwd, `knexfile.${ext}`)
      if (await io.isFile(filePath)) {
        configPath = filePath
      }
    }
  }

  if (!configPath) {
    throw new Error("knexfile is not found.")
  }

  const autoloads = rechoir.prepare(
    interpret.jsVariants,
    configPath,
    cwd,
    true
  );
  if (autoloads instanceof Error) {
    (autoloads as any).failures.forEach(function (failed: any) {
      console.log(
        colorette.red('Failed to load external module'),
        colorette.magenta(failed.moduleName)
      );
    });
  } else if (Array.isArray(autoloads)) {
    const succeeded = autoloads[autoloads.length - 1];
    console.log(
      'Requiring external module',
      colorette.magenta(succeeded.moduleName)
    );
  }

  let config = require(configPath)
  if (config && config.default) {
    config = config.default;
  }
  if (typeof config === 'function') {
    config = await config();
  }

  const env = options.env || process.env.NODE_ENV || 'development';
  console.log(env)
  if (config[env]) {
    console.log('Using environment:', colorette.magenta(env));
  }

  config = config[env] || config;
  if (!config) {
    console.log(colorette.red('Warning: unable to read knexfile config'));
    process.exit(1);
  }

  if (!config.ddlsync) {
    config.ddlsync = {}
  }
  if (!config.ddlsync.include) {
    config.ddlsync.include = "./ddl/**/*.sql"
  }

  return config;
}
