import { Command } from 'commander';
import fg from 'fast-glob'
import {promises as fs} from 'fs'
import {createDddlSyncProcessor } from '../util/config'
import { VdbDatabase } from '../vdb';

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
    let changes
    try {
      for (const stmt of stmts) {
        await processor.execute(db, stmt)
      }

      changes = await processor.plan(db)
    } finally {
      await db.destroy()
    }

    // Show changeset
    for (const change of changes) {
      console.log(change)
    }
  } finally {
    await processor.destroy()
  }
}
