import { CAC } from 'cac'
import fg from 'fast-glob'
import {promises as fs} from 'fs'
import {parseSql} from '../utils/sql_parser'

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
