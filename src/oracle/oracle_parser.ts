import { Statement } from "../models"
import {
  ITokenType,
  Token,
  Lexer,
  Parser,
  ParseError,
  AggregateParseError,
} from "../parser"

export class TokenType implements ITokenType {
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
  static ACCESS = new Keyword("ACCESS", { reserved: true })
  static ADD = new Keyword("ADD", { reserved: true })
  static ALL = new Keyword("ALL", { reserved: true })
  static ALTER = new Keyword("ALTER", { reserved: true })
  static AND = new Keyword("AND", { reserved: true })
  static ANY = new Keyword("ANY", { reserved: true })
  static AS = new Keyword("AS", { reserved: true })
  static ASC = new Keyword("ASC", { reserved: true })
  static AT = new Keyword("AT", { reserved: true })
  static AUDIT = new Keyword("AUDIT", { reserved: true })
  static BEGIN = new Keyword("BEGIN", { reserved: true })
  static BETWEEN = new Keyword("BETWEEN", { reserved: true })
  static BY = new Keyword("BY", { reserved: true })
  static CASE = new Keyword("CASE", { reserved: true })
  static CHAR = new Keyword("CHAR", { reserved: true })
  static CHECK = new Keyword("CHECK", { reserved: true })
  static CLUSTER = new Keyword("CLUSTER", { reserved: true })
  static CLUSTERS = new Keyword("CLUSTERS", { reserved: true })
  static COLAUTH = new Keyword("COLAUTH", { reserved: true })
  static COLUMN = new Keyword("COLUMN", { reserved: true })
  static COLUMNS = new Keyword("COLUMNS", { reserved: true })
  static COLUMN_VALUE = new Keyword("COLUMN_VALUE")
  static COMMENT = new Keyword("COMMENT", { reserved: true })
  static COMPRESS = new Keyword("COMPRESS", { reserved: true })
  static CONNECT = new Keyword("CONNECT", { reserved: true })
  static CRASH = new Keyword("CRASH", { reserved: true })
  static CREATE = new Keyword("CREATE", { reserved: true })
  static CURRENT = new Keyword("CURRENT", { reserved: true })
  static CURSOR = new Keyword("CURSOR", { reserved: true })
  static DATE = new Keyword("DATE", { reserved: true })
  static DECIMAL = new Keyword("DECIMAL", { reserved: true })
  static DECLARE = new Keyword("DECLARE", { reserved: true })
  static DEFAULT = new Keyword("DEFAULT", { reserved: true })
  static DELETE = new Keyword("DELETE", { reserved: true })
  static DESC = new Keyword("DESC", { reserved: true })
  static DISTINCT = new Keyword("DISTINCT", { reserved: true })
  static DROP = new Keyword("DROP", { reserved: true })
  static ELSE = new Keyword("ELSE", { reserved: true })
  static END = new Keyword("END", { reserved: true })
  static EXCEPTION = new Keyword("EXCEPTION", { reserved: true })
  static EXCLUSIVE = new Keyword("EXCLUSIVE", { reserved: true })
  static EXISTS = new Keyword("EXISTS", { reserved: true })
  static FETCH = new Keyword("FETCH", { reserved: true })
  static FILE = new Keyword("FILE", { reserved: true })
  static FLOAT = new Keyword("FLOAT", { reserved: true })
  static FOR = new Keyword("FOR", { reserved: true })
  static FROM = new Keyword("FROM", { reserved: true })
  static FUNCTION = new Keyword("FUNCTION", { reserved: true })
  static GOTO = new Keyword("GOTO", { reserved: true })
  static GRANT = new Keyword("GRANT", { reserved: true })
  static GROUP = new Keyword("GROUP", { reserved: true })
  static HAVING = new Keyword("HAVING", { reserved: true })
  static IDENTIFIED = new Keyword("IDENTIFIED", { reserved: true })
  static IF = new Keyword("IF", { reserved: true })
  static IMMEDIATE = new Keyword("IMMEDIATE", { reserved: true })
  static IN = new Keyword("IN", { reserved: true })
  static INCREMENT = new Keyword("INCREMENT", { reserved: true })
  static INDEX = new Keyword("INDEX", { reserved: true })
  static INDEXES = new Keyword("INDEXES", { reserved: true })
  static INITIAL = new Keyword("INITIAL", { reserved: true })
  static INSERT = new Keyword("INSERT", { reserved: true })
  static INTEGER = new Keyword("INTEGER", { reserved: true })
  static INTERSECT = new Keyword("INTERSECT", { reserved: true })
  static INTO = new Keyword("INTO", { reserved: true })
  static IS = new Keyword("IS", { reserved: true })
  static LEVEL = new Keyword("LEVEL", { reserved: true })
  static LIKE = new Keyword("LIKE", { reserved: true })
  static LOCK = new Keyword("LOCK", { reserved: true })
  static LONG = new Keyword("LONG", { reserved: true })
  static MAXEXTENTS = new Keyword("MAXEXTENTS", { reserved: true })
  static MINUS = new Keyword("MINUS", { reserved: true })
  static MLSLABEL = new Keyword("MLSLABEL", { reserved: true })
  static MODE = new Keyword("MODE", { reserved: true })
  static MODIFY = new Keyword("MODIFY", { reserved: true })
  static NESTED_TABLE_ID = new Keyword("NESTED_TABLE_ID",{ partial: true })
  static NOAUDIT = new Keyword("NOAUDIT", { reserved: true })
  static NOCOMPRESS = new Keyword("NOCOMPRESS", { reserved: true })
  static NOT = new Keyword("NOT", { reserved: true })
  static NOWAIT = new Keyword("NOWAIT", { reserved: true })
  static NULL = new Keyword("NULL", { reserved: true })
  static NUMBER = new Keyword("NUMBER", { reserved: true })
  static OF = new Keyword("OF", { reserved: true })
  static OFFLINE = new Keyword("OFFLINE", { reserved: true })
  static ON = new Keyword("ON", { reserved: true })
  static ONLINE = new Keyword("ONLINE", { reserved: true })
  static OPTION = new Keyword("OPTION", { reserved: true })
  static OR = new Keyword("OR", { reserved: true })
  static ORDER = new Keyword("ORDER", { reserved: true })
  static OVERLAPS = new Keyword("OVERLAPS", { reserved: true })
  static PCTFREE = new Keyword("PCTFREE", { reserved: true })
  static PRIOR = new Keyword("PRIOR", { reserved: true })
  static PROCEDURE = new Keyword("PROCEDURE", { reserved: true })
  static PUBLIC = new Keyword("PUBLIC", { reserved: true })
  static RAW = new Keyword("RAW", { reserved: true })
  static RENAME = new Keyword("RENAME", { reserved: true })
  static RESOURCE = new Keyword("RESOURCE", { reserved: true })
  static REVOKE = new Keyword("REVOKE", { reserved: true })
  static ROW = new Keyword("ROW", { reserved: true })
  static ROWID = new Keyword("ROWID", { reserved: true })
  static ROWNUM = new Keyword("ROWNUM", { reserved: true })
  static ROWS = new Keyword("ROWS", { reserved: true })
  static SELECT = new Keyword("SELECT", { reserved: true })
  static SESSION = new Keyword("SESSION", { reserved: true })
  static SET = new Keyword("SET", { reserved: true })
  static SHARE = new Keyword("SHARE", { reserved: true })
  static SIZE = new Keyword("SIZE", { reserved: true })
  static SMALLINT = new Keyword("SMALLINT", { reserved: true })
  static SQL = new Keyword("SQL", { reserved: true })
  static START = new Keyword("START", { reserved: true })
  static SUBTYPE = new Keyword("SUBTYPE", { reserved: true })
  static SUCCESSFUL = new Keyword("SUCCESSFUL", { reserved: true })
  static SYNONYM = new Keyword("SYNONYM", { reserved: true })
  static SYSDATE = new Keyword("SYSDATE", { reserved: true })
  static TABAUTH = new Keyword("TABAUTH", { reserved: true })
  static TABLE = new Keyword("TABLE", { reserved: true })
  static THEN = new Keyword("THEN", { reserved: true })
  static TO = new Keyword("TO", { reserved: true })
  static TRIGGER = new Keyword("TRIGGER", { reserved: true })
  static TYPE = new Keyword("TYPE", { reserved: true })
  static UID = new Keyword("UID", { reserved: true })
  static UNION = new Keyword("UNION", { reserved: true })
  static UNIQUE = new Keyword("UNIQUE", { reserved: true })
  static UPDATE = new Keyword("UPDATE", { reserved: true })
  static USER = new Keyword("USER", { reserved: true })
  static VALIDATE = new Keyword("VALIDATE", { reserved: true })
  static VALUES = new Keyword("VALUES", { reserved: true })
  static VARCHAR = new Keyword("VARCHAR", { reserved: true })
  static VARCHAR2 = new Keyword("VARCHAR2", { reserved: true })
  static VIEW = new Keyword("VIEW", { reserved: true })
  static VIEWS = new Keyword("VIEWS", { reserved: true })
  static WHEN = new Keyword("WHEN", { reserved: true })
  static WHENEVER = new Keyword("WHENEVER", { reserved: true })
  static WHERE = new Keyword("WHERE", { reserved: true })
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


export class OracleLexer extends Lexer {
  constructor(
    private options: { [key: string]: any } = {}
  ) {
    super("oracle", [
      { type: TokenType.WhiteSpace, re: /[ \t]+/y },
      { type: TokenType.HintComment, re: /\/\*\+.*?\*\//sy },
      { type: TokenType.BlockComment, re: /\/\*.*?\*\//sy },
      { type: TokenType.LineComment, re: /--.*/y },
      { type: TokenType.Delimiter, re: /^[ \t]*[./](?=[ \t]|$)/my },
      { type: TokenType.LineBreak, re: /(?:\r\n?|\n)/y },
      { type: TokenType.SemiColon, re: /;/y },
      { type: TokenType.Operator, re: /\(\+\)=?/y },
      { type: TokenType.LeftParen, re: /\(/y },
      { type: TokenType.RightParen, re: /\)/y },
      { type: TokenType.Comma, re: /,/y },
      { type: TokenType.Number, re: /0[xX][0-9a-fA-F]+|((0|[1-9][0-9]*)(\.[0-9]+)?|(\.[0-9]+))([eE][+-]?[0-9]+)?/y },
      { type: TokenType.String, re: /'([^']|'')*'/y },
      { type: TokenType.QuotedIdentifier, re: /"([^"]|"")*"/y },
      { type: TokenType.BindVariable, re: /:[a-zA-Z\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y },
      { type: TokenType.Identifier, re: /[a-zA-Z\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y },
      { type: TokenType.Operator, re: /\|\||<<|>>|<>|[=<>!^]=?|[~&|*/+-]/y },
      { type: TokenType.Error, re: /./y },
    ])
  }
}

export class OracleParser extends Parser {
  constructor(
    input: string,
    options: { [key: string]: any} = {},
  ) {
    super(input, new OracleLexer(options), options)
  }

  root() {
    const root: Statement[] = []
    return root
  }
}

