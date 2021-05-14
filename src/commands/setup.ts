import { Command } from 'commander';
import fg from 'fast-glob'
import {promises as fs} from 'fs'
import { knex } from 'knex'
import { Parser } from '../parser/common'
import { MysqlParser } from '../parser/mysql_parser'
import { Sqlite3Parser } from '../parser/sqlite3_parser'
import { initConfig } from '../util/config'

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
  const config = await initConfig(args, options)
  const con = await knex(config)

  const list = await fg(config.ddlsync.include)
  for (const filename of list) {
    console.log(filename)
    const contents = await fs.readFile(filename, 'utf-8')
    const root = parseSql(config.client, contents)
    console.log(root)
  }
}

function parseSql(client: string, input: string) {
  let parser
  if (client === "sqlite3") {
    parser = new Sqlite3Parser(input, {})
  } else if (client === "mysql" || client === "mysql2") {
    parser = new MysqlParser(input, {})
  } else {
    throw new Error(`Unsupported client type: ${client}`)
  }
  return parser.root()
}
