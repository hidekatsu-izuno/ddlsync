import { Statement } from "./models"

export interface ITokenType {
  name: string
  options: { [key: string]: any }
}

export class Token {
  public subtype?: ITokenType
  public before: Token[] = []
  public after: Token[] = []

  constructor(
    public type: ITokenType,
    public text: string,
    public start: number = -1,
    public end: number = -1,
  ) {
  }

  static concat(tokens: Token[], options: {
    left?: boolean,
    right?: boolean,
    space?: string,
    start?: number,
    end?: number,
  } = {}) {
    let text = ""
    const start = (options.start || 0)
    const end = (options.end || tokens.length)
    for (let i = start; i < end; i++) {
      const token = tokens[i]
      if (options.left || i > start) {
        if (token.before.length > 0 && options.space) {
          text += options.space
        } else {
          for (const ws of token.before) {
            text += ws.text
          }
        }
      }
      text += token.text
      if (options.right && i === tokens.length - 1) {
        if (token.after.length > 0 && options.space) {
          text += options.space
        } else {
          for (const ws of token.after) {
            text += ws.text
          }
        }
      }
    }
    return text
  }
}

export abstract class Lexer {
  constructor(
    private type: string,
    private patterns: {type: ITokenType, re: RegExp | (() => RegExp) }[]
  ) {
  }

  lex(input: string) {
    const tokens = []
    let pos = 0

    input = input.replace(/(\/\*<ddlsync>)(.*?)(<\/ddlsync>\*\/)/sg, (m, p1, p2, p3) => {
      return `${" ".repeat(p1.length)}${p2.replace(/\/\+(.*)\+\//sg, "/*$1*/")}${" ".repeat(p3.length)}`
    })
    input = input.replace(/\/\*(<noddlsync>\*\/)(.*?)(\/\*<\/noddlsync>)\*\//sg, (m, p1, p2, p3) => {
      return `/*${" ".repeat(p1.length)}${p2.replace(/\/\*(.*)\*\//sg, "/+$1+/")}${" ".repeat(p3.length)}*/`
    })
    input = this.filter(input)

    if (input.startsWith("\uFEFF")) {
      pos = 1
    }

    const before = new Array<Token>()
    while (pos < input.length) {
      let token
      for (let pattern of this.patterns) {
        const re = (typeof pattern.re  === 'function') ?
          pattern.re() : pattern.re

        re.lastIndex = pos
        const m = re.exec(input)
        if (m) {
          token = new Token(pattern.type, m[0], pos, re.lastIndex)
          pos = re.lastIndex
          break
        }
      }

      if (!token) {
        throw new Error(`Failed to tokenize: ${pos}`)
      }

      token = this.process(token)

      const prev = tokens[tokens.length - 1]
      if (token.type.options.skip) {
        if (prev) {
          prev.after.push(token)
        } else {
          before.push(token)
        }
      } else {
        if (prev) {
          token.before = prev.after
        } else {
          token.before = before
        }
        tokens.push(token)
      }
    }

    return tokens
  }

  protected filter(input: string) {
    return input
  }

  protected process(token: Token) {
    return token
  }
}

export abstract class Parser {
  protected tokens: Token[]
  protected pos = 0

  constructor(
    protected input: string,
    protected lexer: Lexer,
    protected options: { [key: string]: any} = {},
  ) {
    this.tokens = lexer.lex(input)
  }

  abstract root(): Statement[]

  token(pos: number = 0) {
    return this.tokens[this.pos + pos]
  }

  peekIf(...types: ITokenType[]) {
    for (let i = 0; i < types.length; i++) {
      const type = types[i]
      if (!type) {
        continue
      }

      const token = this.token(i)
      if (!token) {
        return false
      }
      if (type !== token.type && type !== token.subtype) {
        return false
      }
    }
    return true
  }

  consumeIf(...types: ITokenType[]) {
    if (!this.peekIf(...types)) {
      return false
    }
    this.pos += types.length
    return true
  }

  consume(...types: ITokenType[]) {
    if (types.length > 0) {
      if (!this.consumeIf(...types)) {
        throw this.createParseError()
      }
    } else {
      const token = this.token()
      if (token == null) {
        throw this.createParseError()
      }
      this.pos++
    }
    return true
  }

  createParseError(message?: string) {
    const token = this.token()
    const lines = this.input.substring(0, token?.start || 0).split(/\r\n?|\n/g)
    let last = lines[lines.length-1]
    const rows = lines.length + 1
    const cols = last.length
    if (!last && lines.length - 2 >= 0) {
      const last2 = lines[lines.length-2].replace(/^[ \t]+/, "").substr(-16)
      last = `${last2}\u21B5 ${last}`
    }
    const fileName = this.options.fileName || ""
    const text = message || `Unexpected token: ${last}"${token ? token.text : "<EOF>"}"`
    return new ParseError(
      `${fileName}[${rows},${cols}] ${text}`,
      fileName,
      rows,
      cols
    )
  }
}

export class AggregateParseError extends Error {
  constructor(
    public errors: Error[],
    message: string
  ) {
    super(message)
  }
}

export class ParseError extends Error {
  constructor(
    public message: string,
    public fileName: string,
    public lineNumber: number,
    public columnNumber: number,
  ) {
    super(message)
  }
}
