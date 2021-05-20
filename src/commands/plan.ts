import { Command } from 'commander';
import fg from 'fast-glob'
import {promises as fs} from 'fs'
import {createDddlSyncProcessor } from '../util/config'

export default (program: Command) => {
  program.command('plan')
    .description("plan by sql")
    .action(async function (options) {
      await main([], { ...program.opts(), ...options })
    })
}

async function main(
  args: string[],
  options: { [key: string]: any }
) {
  const processor = await createDddlSyncProcessor(args, options)
  try {
    const files = await fg(processor.config.ddlsync.include)

    const stmts = []
    for (const fileName of files) {
      const contents = await fs.readFile(fileName, 'utf-8')
      for (const stmt of await processor.parse(contents, {
        fileName
      })) {
        stmts.push(stmt)
      }
    }

    // Dry run
    await processor.run(stmts, true)
  } finally {
    await processor.destroy()
  }
}
