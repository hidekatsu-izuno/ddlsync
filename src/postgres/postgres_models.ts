import { Statement } from "../models"
import { Token } from "../parser"

export class CommandStatement extends Statement {
  name = ""
  args = new Array<string>()
}

export class CreateDatabaseStatement extends Statement {
  name = ""
}
