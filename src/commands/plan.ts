import { Command } from 'commander';
import fg from 'fast-glob'
import {promises as fs} from 'fs'
import { Sqlite3Parser } from '../parser/sqlite3_parser'
import { PgParser } from '../parser/pg_parser'
import { MysqlParser } from '../parser/mysql_parser'

export default (program: Command) => {
  program.command('plan')
    .description("plan by sql")
    .action(async function (options) {
      await process([], { ...program.opts(), ...options })
    })
}

async function process(
  args: string[],
  options: { [key: string]: any }
) {
  console.log(args, options)

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
  } else if (client === "pg") {
    parser = new PgParser(input, {})
  } else {
    throw new Error(`Unsupported client type: ${client}`)
  }
}
