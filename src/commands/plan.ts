import { CAC } from 'cac'
import fg from 'fast-glob'
import {promises as fs} from 'fs'
import { MysqlParser } from '../parser/mysql_parser'
import { Sqlite3Parser } from '../parser/sqlite3_parser'

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

export default (cli: CAC) => {
  cli.command('plan', 'Build given files')
    .action(async args => {
      const list = await fg('ddl/**/*.sql')
      for (const filename of list) {
        const contents = await fs.readFile(filename, 'utf-8')
        const root = parseSql('sqlite3', contents)
        console.log(root)
      }
    })
}
