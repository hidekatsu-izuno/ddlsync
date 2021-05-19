import { Command } from "commander"
import pkg from "../package.json"
import planCommand from "./commands/plan"
import applyCommand from "./commands/apply"
import { exit } from "process"

(async () => {
  const program = new Command() as Command;
  program.name("ddlsync")
    .version(`v${pkg.version}`)
    .option("--knexfile [path]", "specify the knexfile path.")
    .option("--ddldir [path]", "set ddl directory without a knexfile.")

  planCommand(program)
  applyCommand(program)

  try {
    await program.parseAsync(process.argv)
    if (!program.args.length) {
      program.help()
    }
  } catch (e) {
    console.error(e.message)
    exit(1)
  }
})()

