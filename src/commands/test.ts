import { Command, Option } from 'commander'
import knex, { Knex } from 'knex'
import path from "path"
import fs from "fs"
import zlib from "zlib"
import { Transform } from 'stream'
import { createDddlSyncProcessor } from '../util/config'
import sqlite3 from "sqlite3"

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
  /*
  const processor = await createDddlSyncProcessor(args, options)
  try {
    const con = ((processor as any).con as Knex)
    await con.raw("drop table test")
    await con.raw("create table test as select 1, 2 as a, 3, 4 as bc, 5, 6 as d")
    const result = await con.raw("select * from test")
    for (let row of result) {
      for (let key of Object.keys(row)) {
        console.log(key)
      }
    }
  } finally {
    await processor.destroy()
  }*/
}
