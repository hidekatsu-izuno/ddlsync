import { Command } from "commander"
import colorette from "colorette"
import pkg from "../package.json"
import planCommand from "./commands/plan"
import applyCommand from "./commands/apply"
import testCommand from "./commands/test"
import { exit } from "process"

(async () => {
  const program = new Command() as Command;
  program.name("ddlsync")
    .version(`v${pkg.version}`)

  planCommand(program)
  applyCommand(program)
  testCommand(program)

  try {
    await program.parseAsync(process.argv)
    if (!program.args.length) {
      program.help()
    }
  } catch (e) {
    //console.log(colorette.red(e.message))
    //exit(1)
    throw e
  }
})()

