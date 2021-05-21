import { Command, Option } from 'commander'
import knex from 'knex'
import path from "path"
import fs from "fs"
import zlib from "zlib"
import { Transform } from 'stream'
import { createDddlSyncProcessor } from '../util/config'

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
    await (processor as any).con.raw("select 1")
      .stream((stream: any) => {
        stream
          .pipe(new Transform({
            objectMode: true,
            transform(chunk, encoding, callback) {
              this.push(JSON.stringify(chunk))
              callback()
            }
          }))
          .pipe(zlib.createGzip())
          .pipe(fs.createWriteStream("./.ddlsync/test.gz"))
      })
  } finally {
    await processor.destroy()
  }

}
