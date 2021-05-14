import { Command } from 'commander';
import fg from 'fast-glob'
import {promises as fs} from 'fs'
import { Parser } from '../parser/common'
import { MysqlParser } from '../parser/mysql_parser'
import { Sqlite3Parser } from '../parser/sqlite3_parser'
import { initKnex } from '../util/config'

export default (program: Command) => {
  program.command('setup')
    .description('execute all statements.')
    .action(async function (options) {
      await process([], { ...program.opts(), ...options })
    })
}

async function process(
  args: string[],
  options: { [key: string]: any }
) {
  let config = await initKnex(args, options)

  const list = await fg('ddl/**/*.sql')
  for (const filename of list) {
    const contents = await fs.readFile(filename, 'utf-8')
    const root = parseSql('sqlite3', contents)
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
}
