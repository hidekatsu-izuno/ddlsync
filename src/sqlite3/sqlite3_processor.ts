import fs from 'fs'
import path from "path"
import sqlite3 from "better-sqlite3"
import { Statement, VCollation, VDatabase, VObject, VSchema } from "../models"
import { Token } from "../parser"
import { DdlSyncProcessor } from "../processor"
import * as model from "./sqlite3_models";
import { Sqlite3Parser, TokenType } from "./sqlite3_parser"
import { formatDateTime, lcase, ucase } from "../util/functions"
import { writeGzippedCsv } from "../util/io"

export default class Sqlite3Processor extends DdlSyncProcessor {
  static create = async (config: { [key: string]: any }) => {
    return new Sqlite3Processor(config, sqlite3(config.database || ":memory:"))
  }

  constructor(
    config: { [key: string]: any },
    private con: sqlite3.Database,
  ) {
    super(config)
  }

  protected async init() {
    this.options.compileOptions = new Set<string>()
    for (const row of await this.con.prepare("PRAGMA compile_options").iterate()) {
      this.options.compileOptions.add(row.compile_options)
    }
  }

  protected async parse(input: string, fileName: string) {
    const parser = new Sqlite3Parser(input, {
      ...this.options,
      fileName
    })
    return parser.root()
  }

  protected async run(stmts: Statement[]) {
    const vdb = new VDatabase(lcase)
    vdb.addSchema("main", true)
    vdb.addSchema("temp", true)
    vdb.defaultSchema = "main"

    for (const row of await this.con.prepare("PRAGMA collation_list").iterate()) {
      vdb.addCollation(row.name)
    }

    const refs = []
    for (const [i, stmt] of stmts.entries()) {
      refs[i] = stmt.process(vdb)
    }

    for (const [i, stmt] of stmts.entries()) {
      console.log(`-- ## statement ${i + 1}: ${stmt.summary()}`)
      switch (stmt.constructor) {
        case model.CommandStatement:
          await this.runCommandStatement(i, stmt as model.CommandStatement)
          break
        case model.CreateTableStatement:
        case model.CreateViewStatement:
        case model.CreateTriggerStatement:
        case model.CreateIndexStatement:
          await this.runCreateObjectStatement(i, stmt, refs[i] as VObject)
          break
        case model.InsertStatement:
        case model.UpdateStatement:
        case model.DeleteStatement:
          await this.runStatement(i, stmt, ResultType.COUNT)
          break
        case model.SelectStatement:
          await this.runStatement(i, stmt, ResultType.ROWS)
          break
        default:
          await this.runStatement(i, stmt)
      }
      console.log()
    }
  }

  async destroy() {
    this.con.close()
  }

  private async runCommandStatement(seq: number, stmt: model.CommandStatement) {
    console.log(`-- skip: command "${stmt.name}" is not`)
  }

  private async runCreateObjectStatement(seq: number, stmt: Statement, obj: VObject) {
    if (obj.dropped) {
      console.log(`-- skip: ${obj.type} ${obj.schema.name}.${obj.name} is dropped`)
    } else if (lcase(obj.schema.name) === "temp") {
      this.runScript(Token.concat(stmt.tokens))
    } else {
      const meta = this.getTableMetaData(obj.schema.name, obj.name)
      if (!meta) {
        // create new object if not exists
        this.runScript(Token.concat(stmt.tokens))
      } else {
        const oldStmt = new Sqlite3Parser(meta.sql || "").root()[0]
        if (!oldStmt) {
          throw new Error(`Failed to get metadata: ${obj.schema.name}.${obj.name}`)
        }

        if (!this.isSame(stmt, oldStmt)) {
          if (
            stmt instanceof model.CreateTableStatement && !stmt.virtual && !(stmt as any).asSelect &&
            oldStmt instanceof model.CreateTableStatement && !oldStmt.virtual
          ) {
            if (this.hasData(obj.schema.name, obj.name)) {
              const columnMappings = this.mapColumns(stmt, oldStmt)
              const backupTableName = `~${this.timestamp(seq)} ${obj.name}`

              if (!columnMappings.compatible && this.config.backupMode === "file") {
                const backupFilename = await this.backupTableData(seq, obj.schema.name, obj.name)
                console.log(`-- backup: ${obj.type} ${obj.schema.name}.${obj.name} is backuped to ${dquote(backupFilename)}. you may need to resolve manually`)
              }

              // backup src table
              this.runScript(`ALTER TABLE ${bquote(obj.schema.name)}.${bquote(obj.name)} RENAME TO ${bquote(backupTableName)}`)
              if (!columnMappings.compatible && this.config.backupMode === "table") {
                console.log(`-- backup: ${obj.type} ${obj.schema.name}.${obj.name} is backuped as table ${dquote(backupTableName)}. you may need to resolve manually`)
              }

              // create new table
              this.runScript(Token.concat(stmt.tokens))
              // restore data
              this.runScript(`INSERT INTO ${bquote(obj.schema.name)}.${bquote(obj.name)} ` +
                `(${columnMappings.destColumns.join(", ")}) ` +
                `SELECT ${columnMappings.srcColumns.join(", ")} ` +
                `FROM ${bquote(obj.schema.name)}.${bquote(backupTableName)} ` +
                `ORDER BY ${columnMappings.sortColumns.join(", ")}`, ResultType.COUNT)
              if (columnMappings.compatible || this.config.backupMode === "file") {
                // drop backup table
                this.runScript(`DROP TABLE IF EXISTS ${bquote(obj.schema.name)}.${bquote(backupTableName)}`)
              }
            } else {
              // drop object
              this.runScript(`DROP ${ucase(meta.type)} IF EXISTS ${bquote(obj.schema.name)}.${bquote(obj.name)}`)
              // create new object
              this.runScript(Token.concat(stmt.tokens))
            }
          } else {
            // backup src table if object is a normal table
            if (
              oldStmt instanceof model.CreateTableStatement && !oldStmt.virtual &&
              this.hasData(obj.schema.name, obj.name)
            ) {
              // backup src table
              if (this.config.backupMode === "file") {
                const backupFilename = await this.backupTableData(seq, obj.schema.name, obj.name)
                console.log(`-- backup: ${obj.type} ${obj.schema.name}.${obj.name} is backuped to ${dquote(backupFilename)}. you may need to resolve manually`)
                this.runScript(`DROP ${ucase(meta.type)} IF EXISTS ${bquote(obj.schema.name)}.${bquote(obj.name)}`)
              } else {
                const backupTableName = `~${this.timestamp(seq)} ${obj.name}`
                this.runScript(`ALTER TABLE ${bquote(obj.schema.name)}.${bquote(obj.name)} RENAME TO ${bquote(backupTableName)}`)
                console.log(`-- backup: ${obj.type} ${obj.schema.name}.${obj.name} is backuped as table ${dquote(backupTableName)}. you may need to resolve manually`)
              }

              // create new object
              this.runScript(Token.concat(stmt.tokens))
            } else {
              // drop object
              this.runScript(`DROP ${ucase(meta.type)} IF EXISTS ${bquote(obj.schema.name)}.${bquote(obj.name)}`)
              // create new object
              this.runScript(Token.concat(stmt.tokens))
            }
          }
        } else {
          console.log(`-- skip: ${obj.type} ${obj.schema.name}.${obj.name} is unchangeed`)
        }
      }
    }
  }

  private async runStatement(seq: number, stmt: Statement, type?: ResultType) {
    this.runScript(Token.concat(stmt.tokens), type)
  }

  private getTableMetaData(schemaName: string, name: string) {
    return this.con
      .prepare(`SELECT type, sql FROM ${bquote(schemaName)}.sqlite_master WHERE name = ? COLLATE NOCASE LIMIT 1`)
      .get(name)
  }

  private hasData(schemaName: string, name: string) {
    return !!this.con
      .prepare(`SELECT 1 FROM ${bquote(schemaName)}.${bquote(name)} LIMIT 1`)
      .get()
  }

  private isSame(newStmt: Statement, oldStmt: Statement) {
    if (newStmt.constructor.name !== oldStmt.constructor.name) {
      return false
    }

    if ((newStmt as any).virtual !== (oldStmt as any).virtual) {
      return false
    }

    let tokens1 = newStmt.tokens
    let startPos1 = newStmt.markers.get("nameStart") || 0
    if ((newStmt as any).asSelect) {
      const nameEnd = newStmt.markers.get("nameEnd") || 0
      const selectStart = newStmt.markers.get("selectStart") || 0
      const selectEnd = newStmt.markers.get("selectEnd") || 0
      const columns = this.con.prepare(Token.concat(tokens1.slice(selectStart, selectEnd))).columns()
      const newTokens = [...tokens1.slice(0, nameEnd)]
      newTokens.push(new Token(TokenType.LeftParen, "("))
      for (let i = 0; i < columns.length; i++) {
        if (i > 0) {
          newTokens.push(new Token(TokenType.Comma, ","))
        }
        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columns[i].name)) {
          newTokens.push(new Token(TokenType.Identifier, columns[i].name))
        } else {
          newTokens.push(new Token(TokenType.QuotedValue, dquote(columns[i].name)))
        }
      }
      newTokens.push(new Token(TokenType.RightParen, ")"))
      tokens1 = newTokens
    }

    const tokens2 = oldStmt.tokens
    const startPos2 = oldStmt.markers.get("nameStart") || 0

    if (tokens1.length - startPos1 !== tokens2.length - startPos2) {
      return false
    }

    for (let i = 0; i < tokens1.length - startPos1; i++) {
      const token1 = tokens1[startPos1 + i]
      const token2 = tokens2[startPos2 + i]
      if (token1.text !== token2.text) {
        return false
      }
    }

    return true
  }

  private mapColumns(newStmt: model.CreateTableStatement, oldStmt: model.CreateTableStatement) {
    const oldColumns = (oldStmt.columns || []).reduce((prev, current) => {
      prev.set(lcase(current.name), current)
      return prev
    }, new Map<string, model.TableColumn>())

    const droppedColumns = new Map<string, model.TableColumn>(oldColumns)
    const srcColumns = []
    const destColumns = []
    let sortColumns = []

    let newPkeyColumns = new Map<string, string>()
    for (const newCnst of newStmt.constraints || []) {
      if (newPkeyColumns.size === 0 && newCnst instanceof model.PrimaryKeyTableConstraint) {
        for (const newCnstCols of newCnst.columns) {
          let sortColumn = bquote(newCnstCols.name || "")
          if (newCnstCols.sortOrder === model.SortOrder.DESC) {
            sortColumn += " DESC"
          }
          newPkeyColumns.set(lcase(newCnstCols.name || ""), sortColumn)
        }
      }
    }
    for (const newColumn of newStmt.columns || []) {
      let autoIncrement = false
      let notNull = false
      let defaultValue = false
      let generated = false
      for (const newCnst of newColumn.constraints) {
        if (newPkeyColumns.size === 0 && newCnst instanceof model.PrimaryKeyColumnConstraint) {
          if (newCnst.autoIncrement) {
            autoIncrement = true
          }
          let sortColumn = bquote(newColumn.name)
          if (newCnst.sortOrder === model.SortOrder.DESC) {
            sortColumn += " DESC"
          }
          newPkeyColumns.set(lcase(newColumn.name), sortColumn)
        } else if (newCnst instanceof model.NotNullColumnConstraint) {
          notNull = true
        } else if (newCnst instanceof model.DefaultColumnConstraint) {
          defaultValue = true
        } else if (newCnst instanceof model.GeneratedColumnConstraint) {
          generated = true
        }
      }

      if (generated) {
        // skip
      } else {
        const oldColumn = oldColumns.get(lcase(newColumn.name))
        if (oldColumn) {
          srcColumns.push(bquote(oldColumn.name))
          destColumns.push(bquote(newColumn.name))
          droppedColumns.delete(lcase(newColumn.name))
        } else if (autoIncrement || defaultValue) {
          // skip
        } else if (notNull) {
          const atype = getAffinityType(newColumn.dataType?.name)
          if (atype === AffinityType.TEXT) {
            srcColumns.push(`'' AS ${bquote(newColumn.name)}`)
          } else if (atype === AffinityType.BLOB) {
            srcColumns.push(`X'00' AS ${bquote(newColumn.name)}`)
          } else {
            srcColumns.push(`0 AS ${bquote(newColumn.name)}`)
          }
          destColumns.push(bquote(newColumn.name))
        } else {
          srcColumns.push(`NULL AS ${bquote(newColumn.name)}`)
          destColumns.push(bquote(newColumn.name))
        }
      }
    }
    if (newPkeyColumns.size > 0) {
      sortColumns = Array.from(newPkeyColumns.values())
    } else {
      sortColumns = destColumns
    }

    return {
      compatible: droppedColumns.size === 0,
      srcColumns,
      destColumns,
      sortColumns,
    }
  }

  private runScript(script: string, type?: ResultType) {
    console.log(script + ";")
    if (this.config.dryrun) {
      return
    }

    const stmt = this.con.prepare(script)
    if (type === ResultType.ROWS) {
      let count = 0
      for (const row of stmt.iterate()) {
        count++
      }
      console.log(`-- result: ${count} records`)
    } else if (type === ResultType.COUNT) {
      const result = stmt.run()
      console.log(`-- result: ${result.changes} records`)
    } else {
      stmt.run()
    }
  }

  private async backupTableData(seq: number, schemaName: string, name: string) {
    const backupDir = path.join(this.config.workDir, "backup")
    await fs.promises.mkdir(backupDir, { recursive: true })

    const backupFileName = path.join(
      backupDir,
      `~${this.timestamp(seq)}-${schemaName}-${name}.csv.gz`
    )

    const stmt = this.con.prepare(`SELECT * FROM ${bquote(schemaName)}.${bquote(name)}`)
    await writeGzippedCsv(backupFileName, (async function* () {
      yield stmt.columns().map(column => column.name);
      yield* stmt.raw().iterate();
    })())

    return backupFileName
  }

  private timestamp(seq: number) {
    return formatDateTime(this.startTime, "uuuuMMddHHmmss") + ("0000" + seq).slice(-4)
  }
}

enum ResultType {
  NONE,
  COUNT,
  ROWS,
}

function dquote(text: string) {
  return '"' + text.replace(/"/g, '""') + '"'
}

function bquote(text: string) {
  return "`" + text.replace(/`/g, "``") + "`"
}

enum AffinityType {
  INTEGER = "INTEGER",
  TEXT = "TEXT",
  BLOB = "BLOB",
  REAL = "REAL",
  NUMERIC = "NUMERIC",
}

function getAffinityType(type?: string) {
  if (!type) {
    return AffinityType.BLOB
  } else if (/INT/i.test(type)) {
    return AffinityType.INTEGER
  } else if (/CHAR|CLOB|TEXT/i.test(type)) {
    return AffinityType.TEXT
  } else if (/BLOB/i.test(type)) {
    return AffinityType.BLOB
  } else if (/REAL|FLOA|DOUB/i.test(type)) {
    return AffinityType.REAL
  } else {
    return AffinityType.NUMERIC
  }
}

