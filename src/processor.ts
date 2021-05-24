import fs from 'fs'
import fg from 'fast-glob'
import { Statement } from "./models"
import { formatDateTime } from "./util/functions"

export abstract class DdlSyncProcessor {
  private startTime = Date.now()

  protected constructor(
    public config: { [key: string]: any },
    public dryrun: boolean,
  ) {
  }

  async execute() {
    const options = await this.init()

    const files = await fg(this.config.include, {
      ignore: this.config.exclude
    })

    const stmts = []
    for (const fileName of files) {
      const contents = await fs.promises.readFile(fileName, 'utf-8')
      for (const stmt of await this.parse(contents, {
        ...options,
        fileName
      })) {
        stmts.push(stmt)
      }
    }

    await this.run(stmts)
  }

  protected abstract init(): Promise<{ [ key: string ]: any }>

  protected abstract parse(input: string, options: { [ key: string ]: any }): Promise<Statement[]>

  protected abstract run(stmts: Statement[]): Promise<void>

  abstract destroy(): Promise<void>

  protected timestamp(seq: number) {
    return formatDateTime(this.startTime, "uuuuMMddHHmmss") + ("0000" + seq).slice(-4)
  }
}
