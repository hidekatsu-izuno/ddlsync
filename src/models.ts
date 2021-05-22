import { Token } from "./parser"

export abstract class Statement {
  filename?: string
  tokens = new Array<Token>()
  markers = new Map<string, number>()

  abstract validate(): void

  abstract summary(): string
}
