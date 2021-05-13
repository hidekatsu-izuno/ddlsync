import { Command } from "commander"
import getopts from "getopts"
import path from "path"
import pkg from "../package.json"

import initCommand from "./commands/init"
import setupCommand from "./commands/setup"
import planCommand from "./commands/plan"
import applyCommand from "./commands/apply"

const argv = getopts(process.argv.slice(2))
if (argv.cwd) {
  process.chdir(argv.cwd);
}

const cwd = argv.knexfile
  ? path.dirname(path.resolve(argv.knexfile))
  : process.cwd()



const program = new Command() as Command;
program.name("ddlsync")
  .version(`v${pkg.version}`)
  .option("--debug", "run with debugging.")
  .option("--knexfile [path]", "specify the knexfile path.")
  .option("--knexpath [path]", "specify the path to knex instance.")
  .option("--cwd [path]", "specify the working directory.")
  .option("--client [name]", "set DB client without a knexfile.")
  .option("--connection [address]", "set DB connection without a knexfile.")
  .option("--env [name]", "environment, default: process.env.NODE_ENV || development")
  .option("--ddl-directory [path]", "set ddl directory without a knexfile.")

initCommand(program)
setupCommand(program)
planCommand(program)
applyCommand(program)

program.parse(process.argv)
if (!program.args.length) {
  program.help()
}
