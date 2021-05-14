import { knex } from 'knex'
import path from "path"
import rechoir from "rechoir"
import interpret from "interpret"
import colorette from "colorette"
import io from "../util/io"

const Extensions = ["ts", "js", "coffee", "eg", "ls"]

export async function initKnex(args: string[], options: { [key: string]: any }) {
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

  const config = require(configPath)
  console.log(config)
  return knex(config);
}
