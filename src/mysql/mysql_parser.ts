import semver from "semver"
import { Statement } from "../models"
import {
  TokenType,
  Token,
  Lexer,
  Parser,
  ParseError,
  AggregateParseError,
} from "../parser"
import { escapeRegExp } from "../util/functions"
import { CreateDatabaseStatement, CreateTableStatement } from "./mysql_models"


const KeywordMap = new Map<string, Keyword>()
export class Keyword extends TokenType {
  static ACCESSIBLE = new Keyword("ACCESSIBLE")
  static ADD = new Keyword("ADD")
  static ALL = new Keyword("ALL")
  static ALTER = new Keyword("ALTER")
  static ANALYSE = new Keyword("ANALYSE", { version: "<8.0.0"} )
  static ANALYZE = new Keyword("ANALYZE")
  static AND = new Keyword("AND")
  static AS = new Keyword("AS")
  static ASC = new Keyword("ASC")
  static ASENSITIVE = new Keyword("ASENSITIVE")
  static BEFORE = new Keyword("BEFORE")
  static BETWEEN = new Keyword("BETWEEN")
  static BIGINT = new Keyword("BIGINT")
  static BINARY = new Keyword("BINARY")
  static BLOB = new Keyword("BLOB")
  static BOTH = new Keyword("BOTH")
  static BY = new Keyword("BY")
  static CALL = new Keyword("CALL")
  static CASCADE = new Keyword("CASCADE")
  static CASE = new Keyword("CASE")
  static CHANGE = new Keyword("CHANGE")
  static CHAR = new Keyword("CHAR")
  static CHARACTER = new Keyword("CHARACTER")
  static CHECK = new Keyword("CHECK")
  static COLLATE = new Keyword("COLLATE")
  static COLUMN = new Keyword("COLUMN")
  static CONDITION = new Keyword("CONDITION")
  static CONSTRAINT = new Keyword("CONSTRAINT")
  static CONTINUE = new Keyword("CONTINUE")
  static CONVERT = new Keyword("CONVERT")
  static CREATE = new Keyword("CREATE")
  static CROSS = new Keyword("CROSS")
  static CUBE = new Keyword("CUBE", { version: ">=8.0.1" })
  static CUME_DIST = new Keyword("CUME_DIST", { version: ">=8.0.2" })
  static CURRENT_DATE = new Keyword("CURRENT_DATE")
  static CURRENT_TIME = new Keyword("CURRENT_TIME")
  static CURRENT_TIMESTAMP = new Keyword("CURRENT_TIMESTAMP")
  static CURRENT_USER = new Keyword("CURRENT_USER")
  static CURSOR = new Keyword("CURSOR")
  static DATABASE = new Keyword("DATABASE")
  static DATABASES = new Keyword("DATABASES")
  static DAY_HOUR = new Keyword("DAY_HOUR")
  static DAY_MICROSECOND = new Keyword("DAY_MICROSECOND")
  static DAY_MINUTE = new Keyword("DAY_MINUTE")
  static DAY_SECOND = new Keyword("DAY_SECOND")
  static DEC = new Keyword("DEC")
  static DECIMAL = new Keyword("DECIMAL")
  static DECLARE = new Keyword("DECLARE")
  static DEFAULT = new Keyword("DEFAULT")
  static DELAYED = new Keyword("DELAYED")
  static DELETE = new Keyword("DELETE")
  static DENSE_RANK = new Keyword("DENSE_RANK", { version: ">=8.0.2" })
  static DESC = new Keyword("DESC")
  static DESCRIBE = new Keyword("DESCRIBE")
  static DES_KEY_FILE = new Keyword("DES_KEY_FILE", { version: "<8.0.0" })
  static DETERMINISTIC = new Keyword("DETERMINISTIC")
  static DISTINCT = new Keyword("DISTINCT")
  static DISTINCTROW = new Keyword("DISTINCTROW")
  static DIV = new Keyword("DIV")
  static DOUBLE = new Keyword("DOUBLE")
  static DROP = new Keyword("DROP")
  static DUAL = new Keyword("DUAL")
  static EACH = new Keyword("EACH")
  static ELSE = new Keyword("ELSE")
  static ELSEIF = new Keyword("ELSEIF")
  static EMPTY = new Keyword("EMPTY", { version: ">=8.0.4" })
  static ENCLOSED = new Keyword("ENCLOSED")
  static ESCAPED = new Keyword("ESCAPED")
  static EXCEPT = new Keyword("EXCEPT")
  static EXISTS = new Keyword("EXISTS")
  static EXIT = new Keyword("EXIT")
  static EXPLAIN = new Keyword("EXPLAIN")
  static FALSE = new Keyword("FALSE")
  static FETCH = new Keyword("FETCH")
  static FIRST_VALUE = new Keyword("FIRST_VALUE", { version: ">=8.0.2" })
  static FLOAT = new Keyword("FLOAT")
  static FOR = new Keyword("FOR")
  static FORCE = new Keyword("FORCE")
  static FOREIGN = new Keyword("FOREIGN")
  static FROM = new Keyword("FROM")
  static FULLTEXT = new Keyword("FULLTEXT")
  static FUNCTION = new Keyword("FUNCTION", { version: ">=8.0.1" })
  static GENERATED = new Keyword("GENERATED")
  static GET = new Keyword("GET")
  static GRANT = new Keyword("GRANT")
  static GROUP = new Keyword("GROUP")
  static GROUPING = new Keyword("GROUPING", { version: ">=8.0.1" })
  static GROUPS = new Keyword("GROUPS", { version: ">=8.0.2" })
  static HAVING = new Keyword("HAVING")
  static HIGH_PRIORITY = new Keyword("HIGH_PRIORITY")
  static HOUR_MICROSECOND = new Keyword("HOUR_MICROSECOND")
  static HOUR_MINUTE = new Keyword("HOUR_MINUTE")
  static HOUR_SECOND = new Keyword("HOUR_SECOND")
  static IF = new Keyword("IF")
  static IGNORE = new Keyword("IGNORE")
  static IN = new Keyword("IN")
  static INDEX = new Keyword("INDEX")
  static INFILE = new Keyword("INFILE")
  static INNER = new Keyword("INNER")
  static INOUT = new Keyword("INOUT")
  static INSENSITIVE = new Keyword("INSENSITIVE")
  static INSERT = new Keyword("INSERT")
  static INT = new Keyword("INT")
  static INTEGER = new Keyword("INTEGER")
  static INTERVAL = new Keyword("INTERVAL")
  static INTO = new Keyword("INTO")
  static IO_AFTER_GTIDS = new Keyword("IO_AFTER_GTIDS")
  static IO_BEFORE_GTIDS = new Keyword("IO_BEFORE_GTIDS")
  static IS = new Keyword("IS")
  static ITERATE = new Keyword("ITERATE")
  static JOIN = new Keyword("JOIN")
  static JSON_TABLE = new Keyword("JSON_TABLE", { version: ">=8.0.4" })
  static KEY = new Keyword("KEY")
  static KEYS = new Keyword("KEYS")
  static KILL = new Keyword("KILL")
  static LAG = new Keyword("LAG", { version: ">=8.0.2" })
  static LAST_VALUE = new Keyword("LAST_VALUE", { version: ">=8.0.2" })
  static LATERAL = new Keyword("LATERAL", { version: ">=8.0.14" })
  static LEAD = new Keyword("LEAD", { version: ">=8.0.2" })
  static LEADING = new Keyword("LEADING")
  static LEAVE = new Keyword("LEAVE")
  static LEFT = new Keyword("LEFT")
  static LIKE = new Keyword("LIKE")
  static LIMIT = new Keyword("LIMIT")
  static LINEAR = new Keyword("LINEAR")
  static LINES = new Keyword("LINES")
  static LOAD = new Keyword("LOAD")
  static LOCALTIME = new Keyword("LOCALTIME")
  static LOCALTIMESTAMP = new Keyword("LOCALTIMESTAMP")
  static LOCK = new Keyword("LOCK")
  static LONG = new Keyword("LONG")
  static LONGBLOB = new Keyword("LONGBLOB")
  static LONGTEXT = new Keyword("LONGTEXT")
  static LOOP = new Keyword("LOOP")
  static LOW_PRIORITY = new Keyword("LOW_PRIORITY")
  static MASTER_BIND = new Keyword("MASTER_BIND")
  static MASTER_SERVER_ID = new Keyword("MASTER_SERVER_ID", { version: "<8.0.0" })
  static MASTER_SSL_VERIFY_SERVER_CERT = new Keyword("MASTER_SSL_VERIFY_SERVER_CERT")
  static MATCH = new Keyword("MATCH")
  static MAXVALUE = new Keyword("MAXVALUE")
  static MEDIUMBLOB = new Keyword("MEDIUMBLOB")
  static MEDIUMINT = new Keyword("MEDIUMINT")
  static MEDIUMTEXT = new Keyword("MEDIUMTEXT")
  static MIDDLEINT = new Keyword("MIDDLEINT")
  static MINUTE_MICROSECOND = new Keyword("MINUTE_MICROSECOND")
  static MINUTE_SECOND = new Keyword("MINUTE_SECOND")
  static MOD = new Keyword("MOD")
  static MODIFIES = new Keyword("MODIFIES")
  static NATURAL = new Keyword("NATURAL")
  static NOT = new Keyword("NOT")
  static NO_WRITE_TO_BINLOG = new Keyword("NO_WRITE_TO_BINLOG")
  static NTH_VALUE = new Keyword("NTH_VALUE", { version: ">=8.0.2" })
  static NTILE = new Keyword("NTILE", { version: ">=8.0.2" })
  static NULL = new Keyword("NULL")
  static NUMERIC = new Keyword("NUMERIC")
  static OF = new Keyword("OF", { version: ">=8.0.1" })
  static ON = new Keyword("ON")
  static OPTIMIZE = new Keyword("OPTIMIZE")
  static OPTIMIZER_COSTS = new Keyword("OPTIMIZER_COSTS")
  static OPTION = new Keyword("OPTION")
  static OPTIONALLY = new Keyword("OPTIONALLY")
  static OR = new Keyword("OR")
  static ORDER = new Keyword("ORDER")
  static OUT = new Keyword("OUT")
  static OUTER = new Keyword("OUTER")
  static OUTFILE = new Keyword("OUTFILE")
  static OVER = new Keyword("OVER", { version: ">=8.0.2" })
  static PARSE_GCOL_EXPR = new Keyword("PARSE_GCOL_EXPR", { version: "<8.0.0" })
  static PARTITION = new Keyword("PARTITION")
  static PERCENT_RANK = new Keyword("PERCENT_RANK", { version: ">=8.0.2" })
  static PRECISION = new Keyword("PRECISION")
  static PRIMARY = new Keyword("PRIMARY")
  static PROCEDURE = new Keyword("PROCEDURE")
  static PURGE = new Keyword("PURGE")
  static RANGE = new Keyword("RANGE")
  static RANK = new Keyword("RANK", { version: ">=8.0.2" })
  static READ = new Keyword("READ")
  static READS = new Keyword("READS")
  static READ_WRITE = new Keyword("READ_WRITE")
  static REAL = new Keyword("REAL")
  static RECURSIVE = new Keyword("RECURSIVE", { version: ">=8.0.1" })
  static REDOFILE = new Keyword("REDOFILE", { version: "<8.0.0" })
  static REFERENCES = new Keyword("REFERENCES")
  static REGEXP = new Keyword("REGEXP")
  static RELEASE = new Keyword("RELEASE")
  static RENAME = new Keyword("RENAME")
  static REPEAT = new Keyword("REPEAT")
  static REPLACE = new Keyword("REPLACE")
  static REQUIRE = new Keyword("REQUIRE")
  static RESIGNAL = new Keyword("RESIGNAL")
  static RESTRICT = new Keyword("RESTRICT")
  static RETURN = new Keyword("RETURN")
  static REVOKE = new Keyword("REVOKE")
  static RIGHT = new Keyword("RIGHT")
  static RLIKE = new Keyword("RLIKE")
  static ROW = new Keyword("ROW", { version: ">=8.0.2" })
  static ROWS = new Keyword("ROWS", { version: ">=8.0.2" })
  static ROW_NUMBER = new Keyword("ROW_NUMBER", { version: ">=8.0.2" })
  static SCHEMA = new Keyword("SCHEMA")
  static SCHEMAS = new Keyword("SCHEMAS")
  static SECOND_MICROSECOND = new Keyword("SECOND_MICROSECOND")
  static SELECT = new Keyword("SELECT")
  static SENSITIVE = new Keyword("SENSITIVE")
  static SEPARATOR = new Keyword("SEPARATOR")
  static SET = new Keyword("SET")
  static SHOW = new Keyword("SHOW")
  static SIGNAL = new Keyword("SIGNAL")
  static SMALLINT = new Keyword("SMALLINT")
  static SPATIAL = new Keyword("SPATIAL")
  static SPECIFIC = new Keyword("SPECIFIC")
  static SQL = new Keyword("SQL")
  static SQLEXCEPTION = new Keyword("SQLEXCEPTION")
  static SQLSTATE = new Keyword("SQLSTATE")
  static SQLWARNING = new Keyword("SQLWARNING")
  static SQL_BIG_RESULT = new Keyword("SQL_BIG_RESULT")
  static SQL_CACHE = new Keyword("SQL_CACHE", { version: "<8.0.0" })
  static SQL_CALC_FOUND_ROWS = new Keyword("SQL_CALC_FOUND_ROWS")
  static SQL_SMALL_RESULT = new Keyword("SQL_SMALL_RESULT")
  static SSL = new Keyword("SSL")
  static STARTING = new Keyword("STARTING")
  static STORED = new Keyword("STORED")
  static STRAIGHT_JOIN = new Keyword("STRAIGHT_JOIN")
  static SYSTEM = new Keyword("SYSTEM", { version: ">=8.0.3" })
  static TABLE = new Keyword("TABLE")
  static TERMINATED = new Keyword("TERMINATED")
  static THEN = new Keyword("THEN")
  static TINYBLOB = new Keyword("TINYBLOB")
  static TINYINT = new Keyword("TINYINT")
  static TINYTEXT = new Keyword("TINYTEXT")
  static TO = new Keyword("TO")
  static TRAILING = new Keyword("TRAILING")
  static TRIGGER = new Keyword("TRIGGER")
  static TRUE = new Keyword("TRUE")
  static UNDO = new Keyword("UNDO")
  static UNION = new Keyword("UNION")
  static UNIQUE = new Keyword("UNIQUE")
  static UNLOCK = new Keyword("UNLOCK")
  static UNSIGNED = new Keyword("UNSIGNED")
  static UPDATE = new Keyword("UPDATE")
  static USAGE = new Keyword("USAGE")
  static USE = new Keyword("USE")
  static USING = new Keyword("USING")
  static UTC_DATE = new Keyword("UTC_DATE")
  static UTC_TIME = new Keyword("UTC_TIME")
  static UTC_TIMESTAMP = new Keyword("UTC_TIMESTAMP")
  static VALUES = new Keyword("VALUES")
  static VARBINARY = new Keyword("VARBINARY")
  static VARCHAR = new Keyword("VARCHAR")
  static VARCHARACTER = new Keyword("VARCHARACTER")
  static VARYING = new Keyword("VARYING")
  static VIRTUAL = new Keyword("VIRTUAL")
  static WHEN = new Keyword("WHEN")
  static WHERE = new Keyword("WHERE")
  static WHILE = new Keyword("WHILE")
  static WINDOW = new Keyword("WINDOW", { version: ">=8.0.2" })
  static WITH = new Keyword("WITH")
  static WRITE = new Keyword("WRITE")
  static XOR = new Keyword("XOR")
  static YEAR_MONTH = new Keyword("YEAR_MONTH")
  static ZEROFILL = new Keyword("ZEROFILL")

  constructor(
    name: string,
    options: { [key: string]: any } = {}
  ) {
    super(name, options)
    KeywordMap.set(name, this)
  }
}

export class MySqlLexer extends Lexer {
  private reserved = new Set<Keyword>()
  private delimiter = /;/y

  constructor(
    private options: { [key: string]: any } = {}
  ) {
    super("mysql", [
      { type: TokenType.HintComment, re: /\/\*\+.*?\*\//sy },
      { type: TokenType.BlockComment, re: /\/\*.*?\*\//sy },
      { type: TokenType.LineComment, re: /(#.*|--([ \t].*)$)/my },
      { type: TokenType.Command, re: /^[ \t]*delimiter(?:[ \t]+.*)?$/imy },
      { type: TokenType.WhiteSpace, re: /[ \t]+/y },
      { type: TokenType.LineBreak, re: /(?:\r\n?|\n)/y },
      { type: TokenType.Delimiter, re: () => this.delimiter },
      { type: TokenType.LeftParen, re: /\(/y },
      { type: TokenType.RightParen, re: /\)/y },
      { type: TokenType.Comma, re: /,/y },
      { type: TokenType.Number, re: /0[xX][0-9a-fA-F]+|((0|[1-9][0-9]*)(\.[0-9]+)?|(\.[0-9]+))([eE][+-]?[0-9]+)?/y },
      { type: TokenType.Dot, re: /\./y },
      { type: TokenType.String, re: /([bBnN]|_[a-zA-Z]+)?'([^']|'')*'/y },
      { type: TokenType.QuotedValue, re: /([bBnN]|_[a-zA-Z]+)?"([^"]|"")*"/y },
      { type: TokenType.QuotedIdentifier, re: /`([^`]|``)*`/y },
      { type: TokenType.BindVariable, re: /\?/y },
      { type: TokenType.Variable, re: /@@?([a-zA-Z_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*|'([^']|'')*'|"([^"]|"")*")/y },
      { type: TokenType.Identifier, re: /[a-zA-Z_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y },
      { type: TokenType.Operator, re: /\|\|&&|<=>|<<|>>|<>|->>?|[=<>!:]=?|[~&|^*/%+-]/y },
      { type: TokenType.Error, re: /./y },
    ])
  }

  filter(input: string) {
    return input.replace(/\/\*!(0|[0-9][1-9]*)?(.*?)\*\//sg, (m, p1, p2) => {
      if (this.options.version && p1) {
        if (semver.lt(this.options.version, toSemverString(p1))) {
          return m
        }
      }
      return " ".repeat((p1 ? p1.length : 0) + 2) + p2 + "  "
    })
  }

  process(token: Token) {
    if (token.type === TokenType.Command) {
      const args = token.text.trim().split(/[ \t]+/g)
      if (/^delimiter$/i.test(args[0]) && args[1]) {
        this.delimiter = new RegExp(escapeRegExp(args[1]), "y")
      }
    } else if (token.type === TokenType.Identifier) {
      const keyword = KeywordMap.get(token.text.toUpperCase())
      if (keyword) {
        if (this.reserved.has(keyword)) {
          token.type = keyword
        } else {
          token.subtype = keyword
        }
      }
    }
    return token
  }
}

export class MySqlParser extends Parser {
  constructor(
    input: string,
    options: { [key: string]: any} = {},
  ) {
    super(input, new MySqlLexer(options), options)
  }

  root() {
    const root = []
    const errors = []
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Delimiter); i++) {
      if (this.peek() && !this.peekIf(TokenType.Delimiter)) {
        try {
          const stmt = this.statement()
          stmt.validate()
          root.push(stmt)
        } catch (e) {
          if (e instanceof ParseError) {
            errors.push(e)

            // skip tokens
            while (this.peek() && !this.peekIf(TokenType.Delimiter)) {
              this.consume()
            }
          } else {
            throw e
          }
        }
      }
    }

    if (this.peek() != null) {
      try {
        throw this.createParseError()
      } catch (e) {
        if (e instanceof ParseError) {
          errors.push(e)
        } else {
          throw e
        }
      }
    }

    if (errors.length) {
      throw new AggregateParseError(errors, `${errors.length} error found`)
    }

    return root
  }

  statement() {
    const start = this.pos

    let stmt
    if (this.consumeIf(Keyword.CREATE)) {
      if (this.consumeIf(Keyword.DATABASE) || this.consumeIf(Keyword.SCHEMA)) {
        stmt = new CreateDatabaseStatement()
        if (this.consumeIf(Keyword.IF)) {
          stmt.markers.set("ifNotExistsStart", this.pos - start - 1)
          this.consume(Keyword.NOT)
          this.consume(Keyword.EXISTS)
          stmt.ifNotExists = true
          stmt.markers.set("ifNotExistsEnd", this.pos - start)
        }
        //TODO
      }
    }
    return new CreateTableStatement()
  }
}

function toSemverString(version: string) {
  const value = Number.parseInt(version, 10)
  const major = Math.trunc(value / 10000)
  const minor = Math.trunc(value / 100 % 100)
  const patch = Math.trunc(value % 100)
  return `${major}.${minor}.${patch}`
}
