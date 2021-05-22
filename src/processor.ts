import fs from 'fs'
import fg from 'fast-glob'
import { Statement } from "./parser"
import { formatDateTime } from "./util/functions"

export abstract class DdlSyncProcessor {
  public dryrun = false
  private startTime = Date.now()

  protected constructor(
    public config: { [key: string]: any },
  ) {
  }

  async execute() {
    const files = await fg(this.config.ddlsync.include, {
      ignore: this.config.ddlsync.exclude
    })

    const stmts = []
    for (const filename of files) {
      const contents = await fs.promises.readFile(filename, 'utf-8')
      for (const stmt of await this.parse(contents, {
        filename
      })) {
        stmts.push(stmt)
      }
    }

    await this.run(stmts)
  }

  abstract parse(input: string, options: { [key: string]: any}): Promise<Statement[]>

  abstract run(stmts: Statement[]): Promise<void>

  abstract destroy(): Promise<void>

  protected timestamp(format: string = "uuuuMMddHHmmssSSS") {
    return formatDateTime(this.startTime, format)
  }
}
