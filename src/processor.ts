import fs from 'fs'
import fg from 'fast-glob'
import { Statement } from "./models"
import { formatDateTime } from "./util/functions"

export abstract class DdlSyncProcessor {
  protected startTime = Date.now()
  protected options: { [key: string]: any } = {}

  protected constructor(
    public config: { [key: string]: any },
  ) {
  }

  async execute() {
    await this.init()

    const files = await fg(this.config.include, {
      ignore: this.config.exclude
    })

    const stmts = []
    for (const fileName of files) {
      const contents = await fs.promises.readFile(fileName, 'utf-8')
      for (const stmt of await this.parse(contents, fileName)) {
        stmts.push(stmt)
      }
    }

    await this.run(stmts)
  }

  protected abstract init(): Promise<void>

  protected abstract parse(input: string, fileName: string): Promise<Statement[]>

  protected abstract run(stmts: Statement[]): Promise<void>

  abstract destroy(): Promise<void>
}
