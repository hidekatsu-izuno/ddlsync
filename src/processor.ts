import { knex, Knex } from "knex"
import fs from 'fs'
import fg from 'fast-glob'
import path from "path"
import { Transform } from "stream"
import zlib from "zlib"
import { Statement } from "./parser"
import { formatDateTime } from "./util/functions"
import { SortOrder } from "./sqlite3/sqlite3_models"

export abstract class DdlSyncProcessor {
  protected con: Knex
  public dryrun = false
  private startTime = Date.now()

  protected constructor(
    public name: string,
    public config: { [key: string]: any },
  ) {
    this.con = knex(config)
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

  protected async runScript(script: string) {
    console.log(script + ";")
    if (!this.dryrun) {
      const result = await this.con.raw(script)
      if (result && result.length) {
        console.log(`-- result: ${result.length} records`)
      }
    }
  }

  protected timestamp(format: string = "uuuuMMddHHmmssSSS") {
    return formatDateTime(this.startTime, format)
  }

  protected async backupTableData(schemaName: string, name: string) {
    const backupDir = path.join(this.config.ddlsync.workDir, "backup")
    await fs.promises.mkdir(backupDir, { recursive: true })

    const backupFileName = path.join(
      backupDir,
      `${schemaName}-${name}-${this.timestamp()}.csv.gz`
    )

    let count = 0
    await this.con
      .withSchema(schemaName)
      .select("*")
      .from(name)
      .stream(stream => {
        stream
          .pipe(new Transform({
            objectMode: true,
            transform(chunk, encoding, done) {
              if (count == 0) {
                this.push(`header\n`)
              }
              count++
              done()
            },
          }))
          .pipe(zlib.createGzip())
          .pipe(fs.createWriteStream(backupFileName))
      })
  }

  async destroy() {
    await this.con.destroy()
  }
}
