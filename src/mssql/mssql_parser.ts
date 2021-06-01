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
  static BlockComment = new TokenType("BlockComment", { skip: true })
  static LineComment = new TokenType("LineComment", { skip: true })
  static SemiColon = new TokenType("SemiColon")
  static LeftParen = new TokenType("LeftParen")
  static RightParen = new TokenType("RightParen")
  static Comma = new TokenType("Comma")
  static Dot = new TokenType("Dot")
  static Operator = new TokenType("Operator")
  static Number = new TokenType("Number")
  static String = new TokenType("String")
  static BindVariable = new TokenType("BindVariable")
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
  static ADD = new Keyword("ADD", { reserved: true })
  static ALL = new Keyword("ALL", { reserved: true })
  static ALTER = new Keyword("ALTER", { reserved: true })
  static AND = new Keyword("AND", { reserved: true })
  static ANY = new Keyword("ANY", { reserved: true })
  static AS = new Keyword("AS", { reserved: true })
  static ASC = new Keyword("ASC", { reserved: true })
  static AUTHORIZATION = new Keyword("AUTHORIZATION", { reserved: true })
  static BACKUP = new Keyword("BACKUP", { reserved: true })
  static BEGIN = new Keyword("BEGIN", { reserved: true })
  static BETWEEN = new Keyword("BETWEEN", { reserved: true })
  static BREAK = new Keyword("BREAK", { reserved: true })
  static BROWSE = new Keyword("BROWSE", { reserved: true })
  static BULK = new Keyword("BULK", { reserved: true })
  static BY = new Keyword("BY", { reserved: true })
  static CASCADE = new Keyword("CASCADE", { reserved: true })
  static CASE = new Keyword("CASE", { reserved: true })
  static CHECK = new Keyword("CHECK", { reserved: true })
  static CHECKPOINT = new Keyword("CHECKPOINT", { reserved: true })
  static CLOSE = new Keyword("CLOSE", { reserved: true })
  static CLUSTERED = new Keyword("CLUSTERED", { reserved: true })
  static COALESCE = new Keyword("COALESCE", { reserved: true })
  static COLLATE = new Keyword("COLLATE", { reserved: true })
  static COLUMN = new Keyword("COLUMN", { reserved: true })
  static COMMIT = new Keyword("COMMIT", { reserved: true })
  static COMPUTE = new Keyword("COMPUTE", { reserved: true })
  static CONSTRAINT = new Keyword("CONSTRAINT", { reserved: true })
  static CONTAINS = new Keyword("CONTAINS", { reserved: true })
  static CONTAINSTABLE = new Keyword("CONTAINSTABLE", { reserved: true })
  static CONTINUE = new Keyword("CONTINUE", { reserved: true })
  static CONVERT = new Keyword("CONVERT", { reserved: true })
  static CREATE = new Keyword("CREATE", { reserved: true })
  static CROSS = new Keyword("CROSS", { reserved: true })
  static CURRENT = new Keyword("CURRENT", { reserved: true })
  static CURRENT_DATE = new Keyword("CURRENT_DATE", { reserved: true })
  static CURRENT_TIME = new Keyword("CURRENT_TIME", { reserved: true })
  static CURRENT_TIMESTAMP = new Keyword("CURRENT_TIMESTAMP", { reserved: true })
  static CURRENT_USER = new Keyword("CURRENT_USER", { reserved: true })
  static CURSOR = new Keyword("CURSOR", { reserved: true })
  static DATABASE = new Keyword("DATABASE", { reserved: true })
  static DBCC = new Keyword("DBCC", { reserved: true })
  static DEALLOCATE = new Keyword("DEALLOCATE", { reserved: true })
  static DECLARE = new Keyword("DECLARE", { reserved: true })
  static DEFAULT = new Keyword("DEFAULT", { reserved: true })
  static DELETE = new Keyword("DELETE", { reserved: true })
  static DENY = new Keyword("DENY", { reserved: true })
  static DESC = new Keyword("DESC", { reserved: true })
  static DISK = new Keyword("DISK", { reserved: true })
  static DISTINCT = new Keyword("DISTINCT", { reserved: true })
  static DISTRIBUTED = new Keyword("DISTRIBUTED", { reserved: true })
  static DOUBLE = new Keyword("DOUBLE", { reserved: true })
  static DROP = new Keyword("DROP", { reserved: true })
  static DUMP = new Keyword("DUMP", { reserved: true })
  static ELSE = new Keyword("ELSE", { reserved: true })
  static END = new Keyword("END", { reserved: true })
  static ERRLVL = new Keyword("ERRLVL", { reserved: true })
  static ESCAPE = new Keyword("ESCAPE", { reserved: true })
  static EXCEPT = new Keyword("EXCEPT", { reserved: true })
  static EXEC = new Keyword("EXEC", { reserved: true })
  static EXECUTE = new Keyword("EXECUTE", { reserved: true })
  static EXISTS = new Keyword("EXISTS", { reserved: true })
  static EXIT = new Keyword("EXIT", { reserved: true })
  static EXTERNAL = new Keyword("EXTERNAL", { reserved: true })
  static FETCH = new Keyword("FETCH", { reserved: true })
  static FILE = new Keyword("FILE", { reserved: true })
  static FILLFACTOR = new Keyword("FILLFACTOR", { reserved: true })
  static FOR = new Keyword("FOR", { reserved: true })
  static FOREIGN = new Keyword("FOREIGN", { reserved: true })
  static FREETEXT = new Keyword("FREETEXT", { reserved: true })
  static FREETEXTTABLE = new Keyword("FREETEXTTABLE", { reserved: true })
  static FROM = new Keyword("FROM", { reserved: true })
  static FULL = new Keyword("FULL", { reserved: true })
  static FUNCTION = new Keyword("FUNCTION", { reserved: true })
  static GOTO = new Keyword("GOTO", { reserved: true })
  static GRANT = new Keyword("GRANT", { reserved: true })
  static GROUP = new Keyword("GROUP", { reserved: true })
  static HAVING = new Keyword("HAVING", { reserved: true })
  static HOLDLOCK = new Keyword("HOLDLOCK", { reserved: true })
  static IDENTITY = new Keyword("IDENTITY", { reserved: true })
  static IDENTITYCOL = new Keyword("IDENTITYCOL", { reserved: true })
  static IDENTITY_INSERT = new Keyword("IDENTITY_INSERT", { reserved: true })
  static IF = new Keyword("IF", { reserved: true })
  static IN = new Keyword("IN", { reserved: true })
  static INDEX = new Keyword("INDEX", { reserved: true })
  static INNER = new Keyword("INNER", { reserved: true })
  static INSERT = new Keyword("INSERT", { reserved: true })
  static INTERSECT = new Keyword("INTERSECT", { reserved: true })
  static INTO = new Keyword("INTO", { reserved: true })
  static IS = new Keyword("IS", { reserved: true })
  static JOIN = new Keyword("JOIN", { reserved: true })
  static KEY = new Keyword("KEY", { reserved: true })
  static KILL = new Keyword("KILL", { reserved: true })
  static LEFT = new Keyword("LEFT", { reserved: true })
  static LIKE = new Keyword("LIKE", { reserved: true })
  static LINENO = new Keyword("LINENO", { reserved: true })
  static LOAD = new Keyword("LOAD", { reserved: true })
  static MERGE = new Keyword("MERGE", { reserved: true })
  static NATIONAL = new Keyword("NATIONAL", { reserved: true })
  static NOCHECK = new Keyword("NOCHECK", { reserved: true })
  static NONCLUSTERED = new Keyword("NONCLUSTERED", { reserved: true })
  static NOT = new Keyword("NOT", { reserved: true })
  static NULL = new Keyword("NULL", { reserved: true })
  static NULLIF = new Keyword("NULLIF", { reserved: true })
  static OF = new Keyword("OF", { reserved: true })
  static OFF = new Keyword("OFF", { reserved: true })
  static OFFSETS = new Keyword("OFFSETS", { reserved: true })
  static ON = new Keyword("ON", { reserved: true })
  static OPEN = new Keyword("OPEN", { reserved: true })
  static OPENDATASOURCE = new Keyword("OPENDATASOURCE", { reserved: true })
  static OPENQUERY = new Keyword("OPENQUERY", { reserved: true })
  static OPENROWSET = new Keyword("OPENROWSET", { reserved: true })
  static OPENXML = new Keyword("OPENXML", { reserved: true })
  static OPTION = new Keyword("OPTION", { reserved: true })
  static OR = new Keyword("OR", { reserved: true })
  static ORDER = new Keyword("ORDER", { reserved: true })
  static OUTER = new Keyword("OUTER", { reserved: true })
  static OVER = new Keyword("OVER", { reserved: true })
  static PERCENT = new Keyword("PERCENT", { reserved: true })
  static PIVOT = new Keyword("PIVOT", { reserved: true })
  static PLAN = new Keyword("PLAN", { reserved: true })
  static PRECISION = new Keyword("PRECISION", { reserved: true })
  static PRIMARY = new Keyword("PRIMARY", { reserved: true })
  static PRINT = new Keyword("PRINT", { reserved: true })
  static PROC = new Keyword("PROC", { reserved: true })
  static PROCEDURE = new Keyword("PROCEDURE", { reserved: true })
  static PUBLIC = new Keyword("PUBLIC", { reserved: true })
  static RAISERROR = new Keyword("RAISERROR", { reserved: true })
  static READ = new Keyword("READ", { reserved: true })
  static READTEXT = new Keyword("READTEXT", { reserved: true })
  static RECONFIGURE = new Keyword("RECONFIGURE", { reserved: true })
  static REFERENCES = new Keyword("REFERENCES", { reserved: true })
  static REPLICATION = new Keyword("REPLICATION", { reserved: true })
  static RESTORE = new Keyword("RESTORE", { reserved: true })
  static RESTRICT = new Keyword("RESTRICT", { reserved: true })
  static RETURN = new Keyword("RETURN", { reserved: true })
  static REVERT = new Keyword("REVERT", { reserved: true })
  static REVOKE = new Keyword("REVOKE", { reserved: true })
  static RIGHT = new Keyword("RIGHT", { reserved: true })
  static ROLLBACK = new Keyword("ROLLBACK", { reserved: true })
  static ROWCOUNT = new Keyword("ROWCOUNT", { reserved: true })
  static ROWGUIDCOL = new Keyword("ROWGUIDCOL", { reserved: true })
  static RULE = new Keyword("RULE", { reserved: true })
  static SAVE = new Keyword("SAVE", { reserved: true })
  static SCHEMA = new Keyword("SCHEMA", { reserved: true })
  static SECURITYAUDIT = new Keyword("SECURITYAUDIT", { reserved: true })
  static SELECT = new Keyword("SELECT", { reserved: true })
  static SEMANTICKEYPHRASETABLE = new Keyword("SEMANTICKEYPHRASETABLE", { reserved: true })
  static SEMANTICSIMILARITYDETAILSTABLE = new Keyword("SEMANTICSIMILARITYDETAILSTABLE", { reserved: true })
  static SEMANTICSIMILARITYTABLE = new Keyword("SEMANTICSIMILARITYTABLE", { reserved: true })
  static SESSION_USER = new Keyword("SESSION_USER", { reserved: true })
  static SET = new Keyword("SET", { reserved: true })
  static SETUSER = new Keyword("SETUSER", { reserved: true })
  static SHUTDOWN = new Keyword("SHUTDOWN", { reserved: true })
  static SOME = new Keyword("SOME", { reserved: true })
  static STATISTICS = new Keyword("STATISTICS", { reserved: true })
  static SYSTEM_USER = new Keyword("SYSTEM_USER", { reserved: true })
  static TABLE = new Keyword("TABLE", { reserved: true })
  static TABLESAMPLE = new Keyword("TABLESAMPLE", { reserved: true })
  static TEXTSIZE = new Keyword("TEXTSIZE", { reserved: true })
  static THEN = new Keyword("THEN", { reserved: true })
  static TO = new Keyword("TO", { reserved: true })
  static TOP = new Keyword("TOP", { reserved: true })
  static TRAN = new Keyword("TRAN", { reserved: true })
  static TRANSACTION = new Keyword("TRANSACTION", { reserved: true })
  static TRIGGER = new Keyword("TRIGGER", { reserved: true })
  static TRUNCATE = new Keyword("TRUNCATE", { reserved: true })
  static TRY_CONVERT = new Keyword("TRY_CONVERT", { reserved: true })
  static TSEQUAL = new Keyword("TSEQUAL", { reserved: true })
  static UNION = new Keyword("UNION", { reserved: true })
  static UNIQUE = new Keyword("UNIQUE", { reserved: true })
  static UNPIVOT = new Keyword("UNPIVOT", { reserved: true })
  static UPDATE = new Keyword("UPDATE", { reserved: true })
  static UPDATETEXT = new Keyword("UPDATETEXT", { reserved: true })
  static USE = new Keyword("USE", { reserved: true })
  static USER = new Keyword("USER", { reserved: true })
  static VALUES = new Keyword("VALUES", { reserved: true })
  static VARYING = new Keyword("VARYING", { reserved: true })
  static VIEW = new Keyword("VIEW", { reserved: true })
  static WAITFOR = new Keyword("WAITFOR", { reserved: true })
  static WHEN = new Keyword("WHEN", { reserved: true })
  static WHERE = new Keyword("WHERE", { reserved: true })
  static WHILE = new Keyword("WHILE", { reserved: true })
  static WITH = new Keyword("WITH", { reserved: true })
  static WITHIN = new Keyword("WITHIN", { reserved: true })
  static WRITETEXT = new Keyword("WRITETEXT", { reserved: true })

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

export class MsSqlLexer extends Lexer {
  constructor(
    private options: { [key: string]: any } = {}
  ) {
    super("mssql", [
      { type: TokenType.WhiteSpace, re: /[ \t]+/y },
      { type: TokenType.BlockComment, re: /\/\*(?:(?!\/\*|\*\/).)*\*\//sy },
      { type: TokenType.LineComment, re: /--.*/y },
      { type: TokenType.Delimiter, re: /^[ \t]*go(?=[ \t-]|$)/imy },
      { type: TokenType.LineBreak, re: /(?:\r\n?|\n)/y },
      { type: TokenType.SemiColon, re: /;/y },
      { type: TokenType.LeftParen, re: /\(/y },
      { type: TokenType.RightParen, re: /\)/y },
      { type: TokenType.Comma, re: /,/y },
      { type: TokenType.Number, re: /0[xX][0-9a-fA-F]+|((0|[1-9][0-9]*)(\.[0-9]+)?|(\.[0-9]+))([eE][+-]?[0-9]+)?/y },
      { type: TokenType.Dot, re: /\./y },
      { type: TokenType.String, re: /'([^']|'')*'/y },
      { type: TokenType.QuotedIdentifier, re: /"([^"]|"")*"/y },
      { type: TokenType.BindVariable, re: /:[a-zA-Z\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y },
      { type: TokenType.Identifier, re: /[a-zA-Z\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y },
      { type: TokenType.Operator, re: /\|\||<<|>>|<>|[=<>!^]=?|[~&|*/+-]/y },
      { type: TokenType.Error, re: /./y },
    ])
  }
}

export class MsSqlParser extends Parser {
  constructor(
    input: string,
    options: { [key: string]: any} = {},
  ) {
    super(input, new MsSqlLexer(options), options)
  }

  root() {
    const root: Statement[] = []
    return root
  }
}
