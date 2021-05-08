import { Sqlite3Parser } from './sqlite3_parser'
import { MysqlParser } from './mysql_parser'

export function parse(input: string, client: string, options: { [key: string]: any} = {}) {
  let parser
  if (client === "sqlite3") {
    parser = new Sqlite3Parser(input)
  } else if (client === "mysql" || client === "mysql2") {
    parser = new MysqlParser(input.replace(/\/\*!(0|[0-9][1-9]*)?(.*?)\*\//g, (m, p1, p2) => {
      if (p1) {
        const targetVersion = Number.parseInt(p1, 10)
        const curretVersion = MysqlParser.toNumericMysqlVersion(options.version)
        if (curretVersion < targetVersion) {
          return m
        }
      }
      return " ".repeat((p1 ? p1.length : 0) + 2) + p2 + "  "
    }))
  } else {
    throw new Error(`Unsupported client type: ${client}`)
  }

  return parser.root()
}
