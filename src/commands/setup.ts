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
    let changes
    const vdb = new VdbDatabase()
    try {
      await vdb.init()

      for (const stmt of stmts) {
        await processor.execute(vdb, stmt)
      }

      changes = await processor.plan(vdb)
    } finally {
      await vdb.destroy()
    }

    // Check changes
    for (const change of changes) {
      if (
        change.type !== ChangeType.CREATE_OBJECT &&
        change.type !== ChangeType.CHANGE_STATE &&
        change.type !== ChangeType.OTHER
      ) {
        throw new Error("Unexpected changes are found.")
      }
    }

    // Execute actually
    for (const [i, stmt] of stmts.entries()) {
      const change = new ChangePlan(ChangeType.OTHER, stmt.summary(), [stmt])
      console.log(`${i+1}: ${change.summary}`)
      await processor.apply(change)
    }
  } catch (e) {
    console.error(e)
  } finally {
    await processor.destroy()
  }
}
