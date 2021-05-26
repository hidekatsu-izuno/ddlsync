import { Token } from "./parser"

export abstract class Statement {
  filename?: string
  tokens = new Array<Token>()
  markers = new Map<string, number>()

  validate() {

  }

  abstract summary(): string
}
