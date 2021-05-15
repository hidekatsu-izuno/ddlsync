export class TokenType {
  static Delimiter = new TokenType("Delimiter")
  static Command = new TokenType("Command")
  static WhiteSpace = new TokenType("WhiteSpace", true)
  static LineBreak = new TokenType("LineBreak", true)
  static HintComment = new TokenType("HintComment", true)
  static BlockComment = new TokenType("BlockComment", true)
  static LineComment = new TokenType("LineComment", true)
  static SemiColon = new TokenType("SemiColon")
  static LeftParen = new TokenType("LeftParen")
  static RightParen = new TokenType("RightParen")
  static LeftBracket = new TokenType("LeftBracket")
  static RightBracket = new TokenType("RightBracket")
  static Comma = new TokenType("Comma")
  static Number = new TokenType("Number")
  static Dot = new TokenType("Dot")
  static String = new TokenType("String")
  static BindVariable = new TokenType("BindVariable")
  static Variable = new TokenType("Variable")
  static QuotedValue = new TokenType("QuotedValue")
  static QuotedIdentifier = new TokenType("QuotedIdentifier")
  static Identifier = new TokenType("Identifier")
  static Operator = new TokenType("Operator")
  static Error = new TokenType("Error")

  constructor(
    public name: string,
    public skip = false,
  ) {}

  toString() {
    return this.name
  }
}

export class Token {
  public skips:Token[] = []

  constructor(
    public type: TokenType,
    public text: string,
    public start: number,
    public end: number,
  ) {
  }
}

export abstract class Lexer {
  constructor(
    private patterns: {type: TokenType, re: RegExp | (() => RegExp) }[],
  ) {
  }

  toReserved(text: string): TokenType | undefined {
    return undefined
  }

  process(token: Token) {
    return token
  }

  lex(input: string) {
    const tokens = []
    let pos = 0

    if (input.startsWith("\uFEFF")) {
      pos = 1
    }

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

      this.process(token)

      if (token.type.skip) {
        const prev = tokens[tokens.length-1]
        if (prev) {
          prev.skips.push(token)
        }
      } else {
        tokens.push(token)
      }
    }
    return tokens
  }
}

export abstract class Parser {
  protected tokens: Token[]
  protected pos = 0

  constructor(
    protected input: string,
    lexer: Lexer
  ) {
    this.tokens = lexer.lex(input)
  }

  abstract root(): Statement[]

  peek(pos: number = 0) {
    return this.tokens[this.pos + pos]
  }

  peekIf(type?: TokenType, text?: RegExp) {
    const token = this.peek()
    if (!token) {
      return null
    } else if (type && token.type !== type) {
      return null
    } else if (text && !text.test(token.text)) {
      return null
    }
    return token
  }

  consumeIf(type?: TokenType, text?: RegExp) {
    const token = this.peekIf(type, text)
    if (token) {
      this.pos++
    }
    return token
  }

  consume(type?: TokenType, text?: RegExp) {
    const token = this.consumeIf(type, text)
    if (token == null) {
      throw this.createParseError()
    }
    return token
  }

  createParseError() {
    const token = this.peek()
    const lines = this.input.substring(0, token.start).split(/\r\n?|\n/g)
    let last = lines[lines.length-1]
    const rows = lines.length + 1
    const cols = last.length
    if (!last && lines.length - 2 >= 0) {
      const last2 = lines[lines.length-2].replace(/^[ \t]+/, "").substr(-16)
      last = `${last2}\u21B5 ${last}`
    }
    return new Error(`[${rows},${cols}] Unexpected token: ${last}"${token.text}"`)
  }
}


export abstract class Statement {
  public text?: string
}

export abstract class TableConstraint {
  public name?: string
}

export abstract class ColumnConstraint {
  public name?: string
}

export interface IExpression {

}

export class Expression implements IExpression {
  constructor(public value: Token[]) {
  }
}

export class Idnetifier implements IExpression {
  static NULL = new Idnetifier("NULL")

  constructor(public value: string) {
  }
}

export class StringValue implements IExpression {
  constructor(public value: string) {
  }
}

export class NumberValue implements IExpression {
  constructor(public value: string) {
  }
}
