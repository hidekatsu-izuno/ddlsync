export const TokenType = {
  Command: "Command",
  WhiteSpace: "WhiteSpace",
  LineBreak: "LineBreak",
  BlockComment: "BlockComment",
  LineComment: "LineComment",
  Delimiter: "Delimiter",
  SemiColon: "SemiColon",
  LeftParen: "LeftParen",
  RightParen: "RightParen",
  Number: "Number",
  HexNumber: "HexNumber",
  String: "String",
  BindVariable: "BindVariable",
  Variable: "Variable",
  QuotedValue: "QuotedValue",
  QuotedIdentifier: "QuotedIdentifier",
  Identifier: "Identifier",
  Operator: "Operator",
  Error: "Error",
} as const
type TokenType = typeof TokenType[keyof typeof TokenType]

export class Reserved {
  static CREATE = new Reserved("create")

  private static MAP = new Map<string, Reserved>()

  constructor(public name: string) {
    Reserved.MAP.set(name, this)
  }

  static valueOf(name: string) {
    return Reserved.MAP.get(name)
  }

  toString() {
    return this.name
  }
}

export class Token {
  constructor(
    public type: TokenType,
    public text: string,
    public value: any,
    public start: number,
    public end: number,
  ) {
  }
}

class Lexer {
  private reserved = new Map<string, Reserved>()
  private patterns: {type: TokenType, re: RegExp}[] = []
  private delimiter = { type: TokenType.Delimiter, re: /;/y }

  constructor(
    public client: string,
  ) {
    if (client === "sqlite3") {
      this.patterns.push({ type: TokenType.BlockComment, re: /\/\*.*?\*\//sy })
      this.patterns.push({ type: TokenType.LineComment, re: /--.*/y })
      this.patterns.push({ type: TokenType.WhiteSpace, re: /[ \t]+/y })
      this.patterns.push({ type: TokenType.LineBreak, re: /(?:\r\n?|\n)/y })
      this.patterns.push(this.delimiter)
    } else if (client === "mysql" || client === "mysql2") {
      this.patterns.push({ type: TokenType.BlockComment, re: /\/\*.*?\*\//sy })
      this.patterns.push({ type: TokenType.LineComment, re: /(#.*|--([ \t].*)$)/my })
      this.patterns.push({ type: TokenType.Command, re: /^[ \t]*delimiter(?:[ \t]+(.*)?$)/imy })
      this.patterns.push({ type: TokenType.WhiteSpace, re: /[ \t]+/y })
      this.patterns.push({ type: TokenType.LineBreak, re: /(?:\r\n?|\n)/y })
      this.patterns.push(this.delimiter)
    } else if (client === "mssql") {
      this.patterns.push({ type: TokenType.WhiteSpace, re: /[ \t]+/y })
      this.patterns.push({ type: TokenType.BlockComment, re: /\/\*(?:(?!\/\*|\*\/).)*\*\//sy })
      this.patterns.push({ type: TokenType.LineComment, re: /--.*/y })
      this.patterns.push({ type: TokenType.Delimiter, re: /^[ \t]*go(?=[ \t-]|$)/imy })
      this.patterns.push({ type: TokenType.LineBreak, re: /(?:\r\n?|\n)/y })
      this.patterns.push({ type: TokenType.SemiColon, re: /;/y })
    } else if (client === "oracledb") {
      this.patterns.push({ type: TokenType.WhiteSpace, re: /[ \t]+/y })
      this.patterns.push({ type: TokenType.BlockComment, re: /\/\*.*?\*\//sy })
      this.patterns.push({ type: TokenType.LineComment, re: /--.*/y })
      this.patterns.push({ type: TokenType.Delimiter, re: /^[ \t]*[./](?=[ \t]|$)/my })
      this.patterns.push({ type: TokenType.LineBreak, re: /(?:\r\n?|\n)/y })
      this.patterns.push({ type: TokenType.SemiColon, re: /;/y })
    } else {
      this.patterns.push({ type: TokenType.WhiteSpace, re: /[ \t]+/y })
      this.patterns.push({ type: TokenType.LineBreak, re: /(?:\r\n?|\n)/y })
      this.patterns.push({ type: TokenType.BlockComment, re: /\/\*(?:(?!\/\*|\*\/).)*\*\//sy })
      this.patterns.push({ type: TokenType.LineComment, re: /--.*/y })
      this.patterns.push(this.delimiter)
    }

    this.patterns.push({ type: TokenType.LeftParen, re: /\(/y })
    this.patterns.push({ type: TokenType.RightParen, re: /\(/y })
    this.patterns.push({ type: TokenType.Number, re: /((0|[1-9][0-9]*)(\.[0-9]+)?|(\.[0-9]+))([eE][+-]?[0-9]+)?/y })
    this.patterns.push({ type: TokenType.HexNumber, re : /0x[0-9a-fA-F]+/})

    if (client === "sqlite3") {
      this.patterns.push({ type: TokenType.String, re: /'([^']|'')*'/y })
      this.patterns.push({ type: TokenType.QuotedValue, re: /"([^"]|"")*"/y })
      this.patterns.push({ type: TokenType.QuotedIdentifier, re: /(`([^`]|``)*`|\[([^]]|\]\])*\])/y })
      this.patterns.push({ type: TokenType.BindVariable, re: /\?([1-9][0-9]*)?/y })
      this.patterns.push({ type: TokenType.BindVariable, re: /[:@$][a-zA-Z_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Identifier, re: /[a-zA-Z_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Operator, re: /[*/<>=~!#%^&|+-]+/y })
    } else if (client === "mysql" || client === "mysql2") {
      this.patterns.push({ type: TokenType.String, re: /([bBnN]|_[a-zA-Z]+)?'([^']|'')*'/y })
      this.patterns.push({ type: TokenType.QuotedValue, re: /([bBnN]|_[a-zA-Z]+)?"([^"]|"")*"/y })
      this.patterns.push({ type: TokenType.QuotedIdentifier, re: /`([^`]|``)*`/y })
      this.patterns.push({ type: TokenType.BindVariable, re: /\?/y })
      this.patterns.push({ type: TokenType.Variable, re: /@@?[a-zA-Z_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Variable, re: /@('([^']|'')*'|"([^"]|"")*")/y })
      this.patterns.push({ type: TokenType.Identifier, re: /[a-zA-Z_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Operator, re: /[*/<>=~!%^&|+-]+/y })
    } else if (client === "pg") {
      this.patterns.push({ type: TokenType.String, re: /([uU]&|[bBxX])?'([^']|'')*'/y })
      this.patterns.push({ type: TokenType.String, re: /\$([^$]+)\$.*\$\1\$/my })
      this.patterns.push({ type: TokenType.String, re: /\$\$.*\$\$/my })
      this.patterns.push({ type: TokenType.QuotedIdentifier, re: /([uU]&)?"([^"]|"")*"/y })
      this.patterns.push({ type: TokenType.BindVariable, re: /\$([1-9][0-9]*)?/y })
      this.patterns.push({ type: TokenType.BindVariable, re: /:[a-zA-Z_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Identifier, re: /[a-zA-Z_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Operator, re: /[*/<>=~!@#%^&|?:`+-]+/y })
    } else if (client === "mssql") {
      this.patterns.push({ type: TokenType.String, re: /'([^']|'')*'/y })
      this.patterns.push({ type: TokenType.QuotedIdentifier, re: /("([^"]|"")*"|\[([^]]|\]\])*\])/y })
      this.patterns.push({ type: TokenType.Variable, re: /@@?[a-zA-Z\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Identifier, re: /[a-zA-Z\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Operator, re: /[*/<>=~!%^&|?`+-]+/y })
    } else if (client === "oracledb") {
      this.patterns.push({ type: TokenType.String, re: /'([^']|'')*'/y })
      this.patterns.push({ type: TokenType.QuotedIdentifier, re: /"([^"]|"")*"/y })
      this.patterns.push({ type: TokenType.BindVariable, re: /:[a-zA-Z\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Identifier, re: /[a-zA-Z\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Operator, re: /[*/<>=~!@%^&|?`+-]+/y })
    } else {
      this.patterns.push({ type: TokenType.String, re: /'([^']|'')*'/y })
      this.patterns.push({ type: TokenType.QuotedIdentifier, re: /"([^"]|"")*"/y })
      this.patterns.push({ type: TokenType.BindVariable, re: /:[a-zA-Z\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Identifier, re: /[a-zA-Z\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Operator, re: /[*/<>=~!@#%^&|?`+-]+/y })
    }

    this.patterns.push({ type: TokenType.Error, re: /./y })
  }

  exec(input: string, options: { [key: string]: any} = {} ): Token[]  {
    const tokens: Token[] = []
    let pos = 0

    if (input.startsWith("\uFEFF")) {
      pos = 1
    }

    while (pos < input.length) {
      let token
      for (let pattern of this.patterns) {
        pattern.re.lastIndex = pos
        const m = pattern.re.exec(input)
        if (m) {
          let value: any = m[0]
          if (pattern.type === TokenType.Identifier) {
            const lvalue = value.toLowerCase()
            value = Reserved.valueOf(lvalue) || lvalue
          } else if (pattern.type === TokenType.Command) {
            const args = value.trim().split(/[ \t]+/g)
            args[0] = args[0].toLowerCase()
            value = args
          }

          token = new Token(pattern.type, m[0], value, pos, pattern.re.lastIndex)
          pos = pattern.re.lastIndex
          break
        }
      }

      if (!token) {
        throw new Error(`Failed to tokenize: ${pos}`)
      }

      if (token.type === TokenType.Command && token.value[0] === "delimiter" && token.value[1]) {
        this.delimiter.re = new RegExp(token.value[1].replace(/[.*+?^=!:${}()|[\]\/\\]/g, '\\$&'), "y")
      } else if (
        token.type !== TokenType.WhiteSpace &&
        token.type !== TokenType.LineBreak &&
        token.type !== TokenType.BlockComment &&
        token.type !== TokenType.LineComment
      ) {
        tokens.push(token)
      }
    }

    return tokens
  }
}

let lexer: Lexer

export function tokenize(input: string, client: string) {
  if (!lexer || lexer.client !== client) {
    lexer = new Lexer(client)
  }
  return lexer.exec(input)
}
