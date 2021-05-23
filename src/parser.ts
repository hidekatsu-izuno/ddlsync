import { Statement } from "./models"

export class TokenType {
  static Delimiter = new TokenType("Delimiter")
  static Command = new TokenType("Command")
  static WhiteSpace = new TokenType("WhiteSpace", { skip: true })
  static LineBreak = new TokenType("LineBreak", { skip: true })
  static HintComment = new TokenType("HintComment", { skip: true })
  static BlockComment = new TokenType("BlockComment", { skip: true })
  static LineComment = new TokenType("LineComment", { skip: true })
  static SemiColon = new TokenType("SemiColon")
  static LeftParen = new TokenType("LeftParen")
  static RightParen = new TokenType("RightParen")
  static LeftBracket = new TokenType("LeftBracket")
  static RightBracket = new TokenType("RightBracket")
  static Comma = new TokenType("Comma")
  static Dot = new TokenType("Dot")
  static Operator = new TokenType("Operator", { operator: true })
  static Number = new TokenType("Number")
  static String = new TokenType("String")
  static BindVariable = new TokenType("BindVariable")
  static Variable = new TokenType("Variable")
  static QuotedValue = new TokenType("QuotedValue")
  static QuotedIdentifier = new TokenType("QuotedIdentifier")
  static Identifier = new TokenType("Identifier")
  static Error = new TokenType("Error")

  constructor(
    public name: string,
    public options: { [key: string]: any } = {}
  ) {}

  toString() {
    return this.name
  }
}

const KeywordMap = new Map<string, Keyword>()
export class Keyword {
  static ABORT = new Keyword("ABORT")
  static ADD = new Keyword("ADD")
  static ALTER = new Keyword("ALTER")
  static ALWAYS = new Keyword("ALWAYS")
  static AND = new Keyword("AND")
  static ANALYZE = new Keyword("ANALYZE")
  static AS = new Keyword("AS")
  static ASC = new Keyword("ASC")
  static ATTACH = new Keyword("ATTACH")
  static AUTOINCREMENT = new Keyword("AUTOINCREMENT")
  static BEGIN = new Keyword("BEGIN")
  static CHECK = new Keyword("CHECK")
  static COLLATE = new Keyword("COLLATE")
  static COLUMN = new Keyword("COLUMN")
  static COMMIT = new Keyword("COMMIT")
  static CONFLICT = new Keyword("CONFLICT")
  static CONSTRAINT = new Keyword("CONSTRAINT")
  static CREATE = new Keyword("CREATE")
  static CURRENT_DATE = new Keyword("CURRENT_DATE")
  static CURRENT_TIME = new Keyword("CURRENT_TIME")
  static CURRENT_TIMESTAMP = new Keyword("CURRENT_TIMESTAMP")
  static DATABASE = new Keyword("DATABASE")
  static DEFAULT = new Keyword("DEFAULT")
  static DEFERRED = new Keyword("DEFERRED")
  static DELETE = new Keyword("DELETE")
  static DESC = new Keyword("DESC")
  static DETACH = new Keyword("DETACH")
  static DROP = new Keyword("DROP")
  static EXCLUSIVE = new Keyword("EXCLUSIVE")
  static EXISTS = new Keyword("EXISTS")
  static END = new Keyword("END")
  static EXPLAIN = new Keyword("EXPLAIN")
  static FAIL = new Keyword("FAIL")
  static FALSE = new Keyword("FALSE")
  static FOREIGN = new Keyword("FOREIGN")
  static FROM = new Keyword("FROM")
  static GENERATED = new Keyword("GENERATED")
  static IGNORE = new Keyword("IGNORE")
  static IMMEDIATE = new Keyword("IMMEDIATE")
  static INDEX = new Keyword("INDEX")
  static INSERT = new Keyword("INSERT")
  static INTO = new Keyword("INTO")
  static IF = new Keyword("IF")
  static KEY = new Keyword("KEY")
  static MATERIALIZED = new Keyword("MATERIALIZED")
  static NOT = new Keyword("NOT")
  static NULL = new Keyword("NULL")
  static ON = new Keyword("ON")
  static OR = new Keyword("OR")
  static PRAGMA = new Keyword("PRAGMA")
  static PRIMARY = new Keyword("PRIMARY")
  static PLAN = new Keyword("PLAN")
  static QUERY = new Keyword("QUERY")
  static RECURSIVE = new Keyword("RECURSIVE")
  static REFERENCES = new Keyword("REFERENCES")
  static RENAME = new Keyword("RENAME")
  static RELEASE = new Keyword("RELEASE")
  static REINDEX = new Keyword("REINDEX")
  static REPLACE = new Keyword("REPLACE")
  static ROLLBACK = new Keyword("ROLLBACK")
  static ROWID = new Keyword("ROWID")
  static SAVEPOINT = new Keyword("SAVEPOINT")
  static SELECT = new Keyword("SELECT")
  static TABLE = new Keyword("TABLE")
  static TEMP = new Keyword("TEMP")
  static TEMPORARY = new Keyword("TEMPORARY")
  static TO = new Keyword("TO")
  static TRANSACTION = new Keyword("TRANSACTION")
  static TRIGGER = new Keyword("TRIGGER")
  static TRUE = new Keyword("TRUE")
  static USING = new Keyword("USING")
  static UNION = new Keyword("UNION")
  static UNIQUE = new Keyword("UNIQUE")
  static UPDATE = new Keyword("UPDATE")
  static VACUUM = new Keyword("VACUUM")
  static VIEW = new Keyword("VIEW")
  static VIRTUAL = new Keyword("VIRTUAL")
  static WHERE = new Keyword("WHERE")
  static WITH = new Keyword("WITH")
  static WITHOUT = new Keyword("WITHOUT")

  constructor(
    name: string,
    public options: { [key: string]: any } = {}
  ) {
    KeywordMap.set(name, this)
  }

  static valueOf(name: string) {
    return KeywordMap.get(name)
  }
}

const OperatorMap = new Map<string, Operator>()
export class Operator {
  static EQ = new Operator("=")
  static PLUS = new Operator("+")
  static MINUS = new Operator("-")

  constructor(
    name: string,
    public options: { [key: string]: any } = {}
  ) {
    KeywordMap.set(name, this)
  }

  static valueOf(name: string) {
    return OperatorMap.get(name)
  }
}

export class Token {
  public subtype?: Keyword
  public before: Token[] = []
  public after: Token[] = []

  constructor(
    public type: TokenType,
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
    private patterns: {type: TokenType, re: RegExp | (() => RegExp) }[],
  ) {
  }

  lex(input: string) {
    const tokens = []
    let pos = 0

    input = input.replace(/(\/\*<ddlsync>)(.*)(<\/ddlsync>\*\/)/sg, (m, p1, p2, p3) => {
      return `${" ".repeat(p1.length)}${p2.replace(/\/\+(.*)\+\//sg, "/*$1*/")}${" ".repeat(p3.length)}`
    })
    input = input.replace(/\/\*(<noddlsync>\*\/)(.*)(\/\*<\/noddlsync>)\*\//sg, (m, p1, p2, p3) => {
      return `/*${" ".repeat(p1.length)}${p2.replace(/\/\*(.*)\*\//sg, "/+$1+/")}${" ".repeat(p3.length)}*/`
    })

    console.log(input)

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

      if (token.type === TokenType.Identifier) {
        const keyword = Keyword.valueOf(token.text.toUpperCase())
        if (keyword) {
          token.subtype = keyword
        }
      } else if (token.type === TokenType.Operator) {
        const operator = Operator.valueOf(token.text.toUpperCase())
        if (operator) {
          token.subtype = operator
        }
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

  filter(input: string) {
    return input
  }

  process(token: Token) {
    return token
  }
}

export abstract class Parser {
  protected tokens: Token[]
  protected pos = 0

  constructor(
    protected input: string,
    lexer: Lexer,
    protected options: { [key: string]: any} = {},
  ) {
    this.tokens = lexer.lex(input)
  }

  abstract root(): Statement[]

  peek(pos: number = 0) {
    return this.tokens[this.pos + pos]
  }

  peekIf(type?: TokenType | Keyword) {
    const token = this.peek()
    if (!token) {
      return null
    }

    if (type && !(type === token.type || type === token.subtype)) {
      return null
    }

    return token
  }

  consumeIf(type?: TokenType | Keyword) {
    const token = this.peekIf(type)
    if (token) {
      this.pos++
    }
    return token
  }

  consume(type?: TokenType | Keyword) {
    const token = this.consumeIf(type)
    if (token == null) {
      throw this.createParseError()
    }
    return token
  }

  createParseError(message?: string) {
    const token = this.peek()
    const lines = this.input.substring(0, token.start).split(/\r\n?|\n/g)
    let last = lines[lines.length-1]
    const rows = lines.length + 1
    const cols = last.length
    if (!last && lines.length - 2 >= 0) {
      const last2 = lines[lines.length-2].replace(/^[ \t]+/, "").substr(-16)
      last = `${last2}\u21B5 ${last}`
    }
    const fileName = this.options.fileName || ""
    const text = message || `Unexpected token: ${last}"${token.text}"`
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
