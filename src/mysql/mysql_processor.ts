import { Statement } from "../models"
import { DdlSyncProcessor } from "../processor"
import { MySqlParser } from "./mysql_parser"

export default class MysqlProcessor extends DdlSyncProcessor {
  constructor(
    config: { [key: string]: any },
    dryrun: boolean,
  ) {
    super(config, dryrun)
  }

  protected async init() {
    return {}
  }

  protected async parse(input: string, options: { [key: string]: any }) {
    const parser = new MySqlParser(input)
    return parser.root()
  }

  protected async run(stmts: Statement[], options: { [key: string]: any }) {
  }

  async destroy() {
  }
}
