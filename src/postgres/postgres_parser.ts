import { Statement } from "../models"
import {
  ITokenType,
  Token,
  Lexer,
  Parser,
  ParseError,
  AggregateParseError,
} from "../parser"


class TokenType implements ITokenType {
  static Command = new TokenType("Command")
  static WhiteSpace = new TokenType("WhiteSpace", { skip: true })
  static LineBreak = new TokenType("LineBreak", { skip: true })
  static BlockComment = new TokenType("BlockComment", { skip: true })
  static LineComment = new TokenType("LineComment", { skip: true })
  static SemiColon = new TokenType("SemiColon")
  static LeftParen = new TokenType("LeftParen")
  static RightParen = new TokenType("RightParen")
  static LeftBracket = new TokenType("LeftBracket")
  static RightBracket = new TokenType("RightBracket")
  static Comma = new TokenType("Comma")
  static Dot = new TokenType("Dot")
  static Operator = new TokenType("Operator")
  static Number = new TokenType("Number")
  static String = new TokenType("String")
  static BindVariable = new TokenType("BindVariable")
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
export class Keyword implements ITokenType {
  static ALL = new Keyword("ALL", { reserved: true })
  static ANALYSE = new Keyword("ANALYSE", { reserved: true })
  static ANALYZE = new Keyword("ANALYZE", { reserved: true })
  static AND = new Keyword("AND", { reserved: true })
  static ANY = new Keyword("ANY", { reserved: true })
  static ARRAY = new Keyword("ARRAY", { reserved: true })
  static AS = new Keyword("AS", { reserved: true })
  static ASC = new Keyword("ASC", { reserved: true })
  static ASYMMETRIC = new Keyword("ASYMMETRIC", { reserved: true })
  static AUTHORIZATION = new Keyword("AUTHORIZATION")
  static BINARY = new Keyword("BINARY")
  static BOTH = new Keyword("BOTH", { reserved: true })
  static CASE = new Keyword("CASE", { reserved: true })
  static CAST = new Keyword("CAST", { reserved: true })
  static CHECK = new Keyword("CHECK", { reserved: true })
  static COLLATE = new Keyword("COLLATE", { reserved: true })
  static COLLATION = new Keyword("COLLATION")
  static COLUMN = new Keyword("COLUMN", { reserved: true })
  static CONCURRENTLY = new Keyword("CONCURRENTLY")
  static CONSTRAINT = new Keyword("CONSTRAINT", { reserved: true })
  static CREATE = new Keyword("CREATE", { reserved: true })
  static CROSS = new Keyword("CROSS")
  static CURRENT_CATALOG = new Keyword("CURRENT_CATALOG", { reserved: true })
  static CURRENT_DATE = new Keyword("CURRENT_DATE", { reserved: true })
  static CURRENT_ROLE = new Keyword("CURRENT_ROLE", { reserved: true })
  static CURRENT_SCHEMA = new Keyword("CURRENT_SCHEMA")
  static CURRENT_TIME = new Keyword("CURRENT_TIME", { reserved: true })
  static CURRENT_TIMESTAMP = new Keyword("CURRENT_TIMESTAMP", { reserved: true })
  static CURRENT_USER = new Keyword("CURRENT_USER", { reserved: true })
  static DEFAULT = new Keyword("DEFAULT", { reserved: true })
  static DEFERRABLE = new Keyword("DEFERRABLE", { reserved: true })
  static DESC = new Keyword("DESC", { reserved: true })
  static DISTINCT = new Keyword("DISTINCT", { reserved: true })
  static DO = new Keyword("DO", { reserved: true })
  static ELSE = new Keyword("ELSE", { reserved: true })
  static END = new Keyword("END", { reserved: true })
  static EXCEPT = new Keyword("EXCEPT", { reserved: true })
  static FALSE = new Keyword("FALSE", { reserved: true })
  static FETCH = new Keyword("FETCH", { reserved: true })
  static FOR = new Keyword("FOR", { reserved: true })
  static FOREIGN = new Keyword("FOREIGN", { reserved: true })
  static FREEZE = new Keyword("FREEZE")
  static FROM = new Keyword("FROM", { reserved: true })
  static FULL = new Keyword("FULL")
  static GRANT = new Keyword("GRANT", { reserved: true })
  static GROUP = new Keyword("GROUP", { reserved: true })
  static HAVING = new Keyword("HAVING", { reserved: true })
  static ILIKE = new Keyword("ILIKE")
  static IN = new Keyword("IN", { reserved: true })
  static INITIALLY = new Keyword("INITIALLY", { reserved: true })
  static INNER = new Keyword("INNER")
  static INTERSECT = new Keyword("INTERSECT", { reserved: true })
  static INTO = new Keyword("INTO", { reserved: true })
  static IS = new Keyword("IS")
  static ISNULL = new Keyword("ISNULL")
  static JOIN = new Keyword("JOIN")
  static LATERAL = new Keyword("LATERAL", { reserved: true })
  static LEADING = new Keyword("LEADING", { reserved: true })
  static LEFT = new Keyword("LEFT")
  static LIKE = new Keyword("LIKE")
  static LIMIT = new Keyword("LIMIT", { reserved: true })
  static LOCALTIME = new Keyword("LOCALTIME", { reserved: true })
  static LOCALTIMESTAMP = new Keyword("LOCALTIMESTAMP", { reserved: true })
  static NATURAL = new Keyword("NATURAL")
  static NOT = new Keyword("NOT", { reserved: true })
  static NOTNULL = new Keyword("NOTNULL")
  static NULL = new Keyword("NULL", { reserved: true })
  static OFFSET = new Keyword("OFFSET", { reserved: true })
  static ON = new Keyword("ON", { reserved: true })
  static ONLY = new Keyword("ONLY", { reserved: true })
  static OR = new Keyword("OR", { reserved: true })
  static ORDER = new Keyword("ORDER", { reserved: true })
  static OUTER = new Keyword("OUTER")
  static OVERLAPS = new Keyword("OVERLAPS")
  static PLACING = new Keyword("PLACING", { reserved: true })
  static PRIMARY = new Keyword("PRIMARY", { reserved: true })
  static REFERENCES = new Keyword("REFERENCES", { reserved: true })
  static RETURNING = new Keyword("RETURNING", { reserved: true })
  static RIGHT = new Keyword("RIGHT")
  static SELECT = new Keyword("SELECT", { reserved: true })
  static SESSION_USER = new Keyword("SESSION_USER", { reserved: true })
  static SIMILAR = new Keyword("SIMILAR")
  static SOME = new Keyword("SOME", { reserved: true })
  static SYMMETRIC = new Keyword("SYMMETRIC", { reserved: true })
  static TABLE = new Keyword("TABLE", { reserved: true })
  static TABLESAMPLE = new Keyword("TABLESAMPLE")
  static THEN = new Keyword("THEN", { reserved: true })
  static TO = new Keyword("TO", { reserved: true })
  static TRAILING = new Keyword("TRAILING", { reserved: true })
  static TRUE = new Keyword("TRUE", { reserved: true })
  static UNION = new Keyword("UNION", { reserved: true })
  static UNIQUE = new Keyword("UNIQUE", { reserved: true })
  static USER = new Keyword("USER", { reserved: true })
  static USING = new Keyword("USING", { reserved: true })
  static VARIADIC = new Keyword("VARIADIC", { reserved: true })
  static VERBOSE = new Keyword("VERBOSE")
  static WHEN = new Keyword("WHEN", { reserved: true })
  static WHERE = new Keyword("WHERE", { reserved: true })
  static WINDOW = new Keyword("WINDOW", { reserved: true })
  static WITH = new Keyword("WITH", { reserved: true })

  constructor(
    public name: string,
    public options: { [key: string]: any } = {}
  ) {
    KeywordMap.set(name, this)
  }

  toString() {
    return this.name
  }
}

export class PostgresLexer extends Lexer {
  constructor(
    private options: { [key: string]: any } = {}
  ) {
    super("postgres", [
      { type: TokenType.WhiteSpace, re: /[ \t]+/y },
      { type: TokenType.LineBreak, re: /(?:\r\n?|\n)/y },
      { type: TokenType.BlockComment, re: /\/\*(?:(?!\/\*|\*\/).)*\*\//sy },
      { type: TokenType.LineComment, re: /--.*/y },
      { type: TokenType.SemiColon, re: /;/y },
      { type: TokenType.LeftParen, re: /\(/y },
      { type: TokenType.RightParen, re: /\)/y },
      { type: TokenType.Comma, re: /,/y },
      { type: TokenType.Number, re: /0[xX][0-9a-fA-F]+|((0|[1-9][0-9]*)(\.[0-9]+)?|(\.[0-9]+))([eE][+-]?[0-9]+)?/y },
      { type: TokenType.Dot, re: /\./y },
      { type: TokenType.LeftBracket, re: /\[/y },
      { type: TokenType.RightBracket, re: /\]/y },
      { type: TokenType.String, re: /([uU]&|[bBxX])?'([^']|'')*'/y },
      { type: TokenType.String, re: /\$([^$]+)\$.*\$\1\$/my },
      { type: TokenType.String, re: /\$\$.*\$\$/my },
      { type: TokenType.QuotedIdentifier, re: /([uU]&)?"([^"]|"")*"/y },
      { type: TokenType.BindVariable, re: /\$([1-9][0-9]*)?/y },
      { type: TokenType.BindVariable, re: /:[a-zA-Z_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y },
      { type: TokenType.Identifier, re: /[a-zA-Z_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y },
      { type: TokenType.Operator, re: /::|[*/<>=~!@#%^&|`?+-]+/y },
      { type: TokenType.Error, re: /./y },
    ])
  }
}

export class PostgresParser extends Parser {
  constructor(
    input: string,
    options: { [key: string]: any} = {},
  ) {
    super(input, new PostgresLexer(options), options)
  }

  root() {
    const root: Statement[] = []
    return root
  }
}
