import escapeRegExp from 'lodash.escaperegexp'

enum TokenKind {
  Skip,
}

export class TokenType {
  static Command = new TokenType("Command")
  static WhiteSpace = new TokenType("WhiteSpace", TokenKind.Skip)
  static LineBreak = new TokenType("LineBreak", TokenKind.Skip)
  static BlockComment = new TokenType("BlockComment", TokenKind.Skip)
  static LineComment = new TokenType("LineComment", TokenKind.Skip)
  static Delimiter = new TokenType("Delimiter")
  static SemiColon = new TokenType("SemiColon")
  static LeftParen = new TokenType("LeftParen")
  static RightParen = new TokenType("RightParen")
  static LeftBracket = new TokenType("LeftBracket")
  static RightBracket = new TokenType("RightBracket")
  static Number = new TokenType("Number")
  static HexNumber = new TokenType("HexNumber")
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
    public kind?: TokenKind,
  ) {
  }

  toString() {
    return this.name
  }
}

const ReservedMap = new Map<string, Reserved>()

export class Reserved extends TokenType {
  static After = new Reserved("after")
  static Alter = new Reserved("alter")
  static As = new Reserved("as")
  static Attach = new Reserved("attach")
  static Before = new Reserved("before")
  static Body = new Reserved("body")
  static Create = new Reserved("create")
  static Database = new Reserved("database")
  static Delete = new Reserved("delete")
  static Detach = new Reserved("detach")
  static Drop = new Reserved("drop")
  static Exists = new Reserved("exists")
  static Function = new Reserved("function")
  static If = new Reserved("if")
  static Index = new Reserved("index")
  static Insert = new Reserved("insert")
  static Library = new Reserved("library")
  static Not = new Reserved("not")
  static On = new Reserved("on")
  static Package = new Reserved("package")
  static Pragma = new Reserved("pragma")
  static Procedure = new Reserved("procedure")
  static Rowid = new Reserved("rowid")
  static Select = new Reserved("select")
  static Table = new Reserved("table")
  static Temp = new Reserved("temp")
  static Temporary = new Reserved("temporary")
  static Trigger = new Reserved("trigger")
  static Type = new Reserved("type")
  static Unique = new Reserved("unique")
  static Update = new Reserved("unique")
  static Using = new Reserved("using")
  static View = new Reserved("view")
  static Virtual = new Reserved("virtual")
  static With = new Reserved("with")
  static Without = new Reserved("without")

  static valueOf(name: string) {
    return ReservedMap.get(name)
  }

  constructor(name: string) {
    super(name)
    ReservedMap.set(name, this)
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
  private patterns: {type: TokenType, re: RegExp}[] = []
  private delimiter = { type: TokenType.Delimiter, re: /;/y }

  private plSqlTargets?: Set<Reserved>

  constructor(
    public client: string,
  ) {
    if (client === "oracledb") {
      this.plSqlTargets = new Set()
      this.plSqlTargets.add(Reserved.Function)
      this.plSqlTargets.add(Reserved.Library)
      this.plSqlTargets.add(Reserved.Package)
      this.plSqlTargets.add(Reserved.Procedure)
      this.plSqlTargets.add(Reserved.Trigger)
      this.plSqlTargets.add(Reserved.Type)
    }

    if (client === "sqlite3") {
      this.patterns.push({ type: TokenType.BlockComment, re: /\/\*.*?\*\//sy })
      this.patterns.push({ type: TokenType.LineComment, re: /--.*/y })
      this.patterns.push({ type: TokenType.WhiteSpace, re: /[ \t]+/y })
      this.patterns.push({ type: TokenType.LineBreak, re: /(?:\r\n?|\n)/y })
      this.patterns.push({ type: TokenType.SemiColon, re: /;/y })
    } else if (client === "mysql" || client === "mysql2") {
      this.patterns.push({ type: TokenType.BlockComment, re: /\/\*.*?\*\//sy })
      this.patterns.push({ type: TokenType.LineComment, re: /(#.*|--([ \t].*)$)/my })
      this.patterns.push({ type: TokenType.Command, re: /^[ \t]*delimiter(?:[ \t]+.*)?$/imy })
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
      this.patterns.push({ type: TokenType.Operator, re: /\(\+\)=?/y })
    } else {
      this.patterns.push({ type: TokenType.WhiteSpace, re: /[ \t]+/y })
      this.patterns.push({ type: TokenType.LineBreak, re: /(?:\r\n?|\n)/y })
      this.patterns.push({ type: TokenType.BlockComment, re: /\/\*(?:(?!\/\*|\*\/).)*\*\//sy })
      this.patterns.push({ type: TokenType.LineComment, re: /--.*/y })
      this.patterns.push({ type: TokenType.SemiColon, re: /;/y })
    }

    this.patterns.push({ type: TokenType.LeftParen, re: /\(/y })
    this.patterns.push({ type: TokenType.RightParen, re: /\(/y })
    this.patterns.push({ type: TokenType.Number, re: /((0|[1-9][0-9]*)(\.[0-9]+)?|(\.[0-9]+))([eE][+-]?[0-9]+)?/y })
    this.patterns.push({ type: TokenType.HexNumber, re : /0x[0-9a-fA-F]+/})
    this.patterns.push({ type: TokenType.Dot, re: /\./y })

    if (client === "sqlite3") {
      this.patterns.push({ type: TokenType.String, re: /'([^']|'')*'/y })
      this.patterns.push({ type: TokenType.QuotedValue, re: /"([^"]|"")*"/y })
      this.patterns.push({ type: TokenType.QuotedIdentifier, re: /(`([^`]|``)*`|\[[^\]]*\])/y })
      this.patterns.push({ type: TokenType.BindVariable, re: /\?([1-9][0-9]*)?/y })
      this.patterns.push({ type: TokenType.BindVariable, re: /[:@$][a-zA-Z_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Identifier, re: /[a-zA-Z_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Operator, re: /\|\||<<|>>|<>|[=<>!]=?|[~&|*/%+-]/y })
    } else if (client === "mysql" || client === "mysql2") {
      this.patterns.push({ type: TokenType.String, re: /([bBnN]|_[a-zA-Z]+)?'([^']|'')*'/y })
      this.patterns.push({ type: TokenType.QuotedValue, re: /([bBnN]|_[a-zA-Z]+)?"([^"]|"")*"/y })
      this.patterns.push({ type: TokenType.QuotedIdentifier, re: /`([^`]|``)*`/y })
      this.patterns.push({ type: TokenType.BindVariable, re: /\?/y })
      this.patterns.push({ type: TokenType.Variable, re: /@@?[a-zA-Z_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Variable, re: /@('([^']|'')*'|"([^"]|"")*")/y })
      this.patterns.push({ type: TokenType.Identifier, re: /[a-zA-Z_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Operator, re: /\|\|&&|<=>|<<|>>|<>|->>?|[=<>!:]=?|[~&|^*/%+-]/y })
    } else if (client === "pg") {
      this.patterns.push({ type: TokenType.LeftBracket, re: /\[/y })
      this.patterns.push({ type: TokenType.RightBracket, re: /\]/y })
      this.patterns.push({ type: TokenType.String, re: /([uU]&|[bBxX])?'([^']|'')*'/y })
      this.patterns.push({ type: TokenType.String, re: /\$([^$]+)\$.*\$\1\$/my })
      this.patterns.push({ type: TokenType.String, re: /\$\$.*\$\$/my })
      this.patterns.push({ type: TokenType.QuotedIdentifier, re: /([uU]&)?"([^"]|"")*"/y })
      this.patterns.push({ type: TokenType.BindVariable, re: /\$([1-9][0-9]*)?/y })
      this.patterns.push({ type: TokenType.BindVariable, re: /:[a-zA-Z_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Identifier, re: /[a-zA-Z_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Operator, re: /::|[*/<>=~!@#%^&|`?+-]+/y })
    } else if (client === "mssql") {
      this.patterns.push({ type: TokenType.String, re: /'([^']|'')*'/y })
      this.patterns.push({ type: TokenType.QuotedIdentifier, re: /("([^"]|"")*"|\[([^]]|\]\])*\])/y })
      this.patterns.push({ type: TokenType.Variable, re: /@@?[a-zA-Z\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Identifier, re: /[a-zA-Z\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Operator, re: /::|<<|>>|!<|!>|<>|[=<>!&|^*/%+-]=?|=*|~/y })
    } else if (client === "oracledb") {
      this.patterns.push({ type: TokenType.String, re: /'([^']|'')*'/y })
      this.patterns.push({ type: TokenType.QuotedIdentifier, re: /"([^"]|"")*"/y })
      this.patterns.push({ type: TokenType.BindVariable, re: /:[a-zA-Z\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Identifier, re: /[a-zA-Z\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Operator, re: /\|\||<<|>>|<>|[=<>!^]=?|[~&|*/+-]/y })
    } else {
      this.patterns.push({ type: TokenType.String, re: /[BbXxNn]?'([^']|'')*'/y })
      this.patterns.push({ type: TokenType.QuotedIdentifier, re: /"([^"]|"")*"/y })
      this.patterns.push({ type: TokenType.BindVariable, re: /:[a-zA-Z\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Identifier, re: /[a-zA-Z\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y })
      this.patterns.push({ type: TokenType.Operator, re: /\|\||<<|>>|<>|[=<>]=?|[*/+-]+/y })
    }

    this.patterns.push({ type: TokenType.Error, re: /./y })
  }

  exec(input: string): Token[]  {
    const tokens: Token[] = []
    let pos = 0
    let plsqlMode = false

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
        this.delimiter.re = new RegExp(escapeRegExp(token.value[1]), "y")
      }

      if (token.type.kind !== TokenKind.Skip) {
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
