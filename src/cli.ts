import { Command } from "commander"
import colorette from "colorette"
import planCommand from "./commands/plan"
import applyCommand from "./commands/apply"
import { exit } from "process"
import { AggregateParseError } from "./parser"

(async () => {
  const program = new Command() as Command;
  program.name("ddlsync")
    .version(`v0.0.1`)

  planCommand(program)
  applyCommand(program)

  try {
    await program.parseAsync(process.argv)
    if (!program.args.length) {
      program.help()
    }
  } catch (e) {
    if (e instanceof AggregateParseError) {
      for (const detail of e.errors) {
        console.log(colorette.red(detail.message))
      }
    }
    //console.log(colorette.red(e.message))
    //exit(1)
    throw e
  }
})()

