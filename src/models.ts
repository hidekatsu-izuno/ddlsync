import { Token } from "./parser"

export abstract class Statement {
  filename?: string
  tokens = new Array<Token>()
  markers = new Map<string, number>()

  validate() {

  }

  summary() {
    let text = ""
    for (const token of this.tokens) {
      const hasSpace = text.length > 0 && token.before.length > 0
      const len = text.length + token.text.length + (hasSpace ? 1 : 0)
      if (len > 50) {
        return text + " ..."
      } else {
        text += (hasSpace ? " " : "") + token.text
      }
    }
    return text
  }
}
