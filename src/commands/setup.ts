import { Command } from 'commander';
import fg from 'fast-glob'
import {promises as fs} from 'fs'
import { ChangePlan, ChangeType } from '../processor';
import { createDddlSyncProcessor } from '../util/config'
import { VdbDatabase } from '../vdb';

export default (program: Command) => {
  program.command('setup')
    .description('execute all statements.')
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

    // Test flight
    const db = new VdbDatabase()
    try {
      for (const stmt of stmts) {
        await processor.execute(db, stmt)
      }
    } finally {
      await db.destroy()
    }

    // Execute actually
    for (const stmt of stmts) {
      await processor.apply(new ChangePlan(stmt.summary(), [stmt]))
    }
  } finally {
    await processor.destroy()
  }
}
