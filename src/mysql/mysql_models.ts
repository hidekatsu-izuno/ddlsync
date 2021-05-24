import semver from "semver"
import { Statement } from "../models"
import { TokenType } from "../parser"

export class CreateDatabaseStatement extends Statement {
  name: string = ""
  ifNotExists = false

  validate() {

  }

  summary() {
    return ""
  }
}


export class CreateTableStatement extends Statement {
  schemaName?: string
  name: string = ""
  temporary = false
  ifNotExists = false
  asSelect = false

  validate() {

  }

  summary() {
    return ""
  }
}
