import { Command } from 'commander'
import fg from 'fast-glob'
import {promises as fs} from 'fs'
import { createDddlSyncProcessor } from '../util/config'

export default (program: Command) => {
  program.command('apply')
    .description("apply changes.")
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
    for (const filename of files) {
      const contents = await fs.readFile(filename, 'utf-8')
      for (const stmt of await processor.parse(contents, {
        filename
      })) {
        stmts.push(stmt)
      }
    }

    // Execute actually
    await processor.run(stmts)
  } finally {
    await processor.destroy()
  }
}
