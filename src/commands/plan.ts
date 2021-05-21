import { Command, Option } from 'commander'
import { createDddlSyncProcessor } from '../util/config'

export default (program: Command) => {
  program.command('plan')
    .description("plan by sql")
    .addOption(new Option("-c, --config <path>", "specify the config file path."))
    .addOption(new Option("--include <pattern>", "set include file pattern without a config file.").default("ddl/**/*.sql"))
    .addOption(new Option("--exclude <pattern>", "set exclude file pattern without a config file."))
    .addOption(new Option("--workDir <dir>", "set working dir without a config file.").default("./.ddlsync"))
    .action(async function (options) {
      await main([], { ...program.opts(), ...options })
    })
}

async function main(
  args: string[],
  options: { [key: string]: any }
) {
  const processor = await createDddlSyncProcessor(args, options)
  processor.dryrun = true
  try {
    await processor.execute()
  } finally {
    await processor.destroy()
  }
}
