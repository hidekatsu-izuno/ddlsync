import { Command, Option } from 'commander'
import fs from "fs"
import zlib from "zlib"
import { Readable, Transform } from 'stream'
import { createDddlSyncProcessor } from '../util/config'
import sqlite3 from "better-sqlite3"

export default (program: Command) => {
  program.command('test')
    .description("test")
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
  try {
    const con = ((processor as any).con as sqlite3.Database)
    const stmt = con.prepare(`SELECT * FROM sqlite_master`)
    await new Promise(function(resolve, reject) {
      Readable.from((async function *() {
        yield stmt.columns().map(column => column.name);
        yield* stmt.raw().iterate();
      })())
        .pipe(new Transform({
          objectMode: true,
          transform(chunk, encoding, done) {
            this.push(chunk.join(',') + '\n')
            done()
          },
        }))
        .pipe(zlib.createGzip())
        .pipe(fs.createWriteStream("./.ddlsync/test.csv.gz"))
        .on('error', reject)
        .on("finish", resolve)
    })
  } finally {
    await processor.destroy()
  }
}
