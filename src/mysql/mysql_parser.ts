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
  static ACCESSIBLE = new Keyword("ACCESSIBLE", { reserved: true })
  static ADD = new Keyword("ADD", { reserved: true })
  static ALL = new Keyword("ALL", { reserved: true })
  static ALTER = new Keyword("ALTER", { reserved: true })
  static ANALYSE = new Keyword("ANALYSE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies("<8.0.0", options.version || "0")
  } })
  static ANALYZE = new Keyword("ANALYZE", { reserved: true })
  static AND = new Keyword("AND", { reserved: true })
  static AS = new Keyword("AS", { reserved: true })
  static ASC = new Keyword("ASC", { reserved: true })
  static ASENSITIVE = new Keyword("ASENSITIVE", { reserved: true })
  static BEFORE = new Keyword("BEFORE", { reserved: true })
  static BETWEEN = new Keyword("BETWEEN", { reserved: true })
  static BIGINT = new Keyword("BIGINT", { reserved: true })
  static BINARY = new Keyword("BINARY", { reserved: true })
  static BLOB = new Keyword("BLOB", { reserved: true })
  static BOTH = new Keyword("BOTH", { reserved: true })
  static BY = new Keyword("BY", { reserved: true })
  static CALL = new Keyword("CALL", { reserved: true })
  static CASCADE = new Keyword("CASCADE", { reserved: true })
  static CASE = new Keyword("CASE", { reserved: true })
  static CHANGE = new Keyword("CHANGE", { reserved: true })
  static CHAR = new Keyword("CHAR", { reserved: true })
  static CHARACTER = new Keyword("CHARACTER", { reserved: true })
  static CHECK = new Keyword("CHECK", { reserved: true })
  static COLLATE = new Keyword("COLLATE", { reserved: true })
  static COLUMN = new Keyword("COLUMN", { reserved: true })
  static CONDITION = new Keyword("CONDITION", { reserved: true })
  static CONSTRAINT = new Keyword("CONSTRAINT", { reserved: true })
  static CONTINUE = new Keyword("CONTINUE", { reserved: true })
  static CONVERT = new Keyword("CONVERT", { reserved: true })
  static CREATE = new Keyword("CREATE", { reserved: true })
  static CROSS = new Keyword("CROSS", { reserved: true })
  static CUBE = new Keyword("CUBE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.1", options.version || "0")
  } })
  static CUME_DIST = new Keyword("CUME_DIST", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static CURRENT_DATE = new Keyword("CURRENT_DATE", { reserved: true })
  static CURRENT_TIME = new Keyword("CURRENT_TIME", { reserved: true })
  static CURRENT_TIMESTAMP = new Keyword("CURRENT_TIMESTAMP", { reserved: true })
  static CURRENT_USER = new Keyword("CURRENT_USER", { reserved: true })
  static CURSOR = new Keyword("CURSOR", { reserved: true })
  static DATABASE = new Keyword("DATABASE", { reserved: true })
  static DATABASES = new Keyword("DATABASES", { reserved: true })
  static DAY_HOUR = new Keyword("DAY_HOUR", { reserved: true })
  static DAY_MICROSECOND = new Keyword("DAY_MICROSECOND", { reserved: true })
  static DAY_MINUTE = new Keyword("DAY_MINUTE", { reserved: true })
  static DAY_SECOND = new Keyword("DAY_SECOND", { reserved: true })
  static DEC = new Keyword("DEC", { reserved: true })
  static DECIMAL = new Keyword("DECIMAL", { reserved: true })
  static DECLARE = new Keyword("DECLARE", { reserved: true })
  static DEFAULT = new Keyword("DEFAULT", { reserved: true })
  static DELAYED = new Keyword("DELAYED", { reserved: true })
  static DELETE = new Keyword("DELETE", { reserved: true })
  static DENSE_RANK = new Keyword("DENSE_RANK", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static DESC = new Keyword("DESC", { reserved: true })
  static DESCRIBE = new Keyword("DESCRIBE", { reserved: true })
  static DES_KEY_FILE = new Keyword("DES_KEY_FILE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies("<8.0.0", options.version || "0")
  } })
  static DETERMINISTIC = new Keyword("DETERMINISTIC", { reserved: true })
  static DISTINCT = new Keyword("DISTINCT", { reserved: true })
  static DISTINCTROW = new Keyword("DISTINCTROW", { reserved: true })
  static DIV = new Keyword("DIV", { reserved: true })
  static DOUBLE = new Keyword("DOUBLE", { reserved: true })
  static DROP = new Keyword("DROP", { reserved: true })
  static DUAL = new Keyword("DUAL", { reserved: true })
  static EACH = new Keyword("EACH", { reserved: true })
  static ELSE = new Keyword("ELSE", { reserved: true })
  static ELSEIF = new Keyword("ELSEIF", { reserved: true })
  static EMPTY = new Keyword("EMPTY", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.4", options.version || "0")
  } })
  static ENCLOSED = new Keyword("ENCLOSED", { reserved: true })
  static ESCAPED = new Keyword("ESCAPED", { reserved: true })
  static EXCEPT = new Keyword("EXCEPT", { reserved: true })
  static EXISTS = new Keyword("EXISTS", { reserved: true })
  static EXIT = new Keyword("EXIT", { reserved: true })
  static EXPLAIN = new Keyword("EXPLAIN", { reserved: true })
  static FALSE = new Keyword("FALSE", { reserved: true })
  static FETCH = new Keyword("FETCH", { reserved: true })
  static FIRST_VALUE = new Keyword("FIRST_VALUE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static FLOAT = new Keyword("FLOAT", { reserved: true })
  static FOR = new Keyword("FOR", { reserved: true })
  static FORCE = new Keyword("FORCE", { reserved: true })
  static FOREIGN = new Keyword("FOREIGN", { reserved: true })
  static FROM = new Keyword("FROM", { reserved: true })
  static FULLTEXT = new Keyword("FULLTEXT", { reserved: true })
  static FUNCTION = new Keyword("FUNCTION", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.1", options.version || "0")
  } })
  static GENERATED = new Keyword("GENERATED", { reserved: true })
  static GET = new Keyword("GET", { reserved: true })
  static GRANT = new Keyword("GRANT", { reserved: true })
  static GROUP = new Keyword("GROUP", { reserved: true })
  static GROUPING = new Keyword("GROUPING", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.1", options.version || "0")
  } })
  static GROUPS = new Keyword("GROUPS", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static HAVING = new Keyword("HAVING", { reserved: true })
  static HIGH_PRIORITY = new Keyword("HIGH_PRIORITY", { reserved: true })
  static HOUR_MICROSECOND = new Keyword("HOUR_MICROSECOND", { reserved: true })
  static HOUR_MINUTE = new Keyword("HOUR_MINUTE", { reserved: true })
  static HOUR_SECOND = new Keyword("HOUR_SECOND", { reserved: true })
  static IF = new Keyword("IF", { reserved: true })
  static IGNORE = new Keyword("IGNORE", { reserved: true })
  static IN = new Keyword("IN", { reserved: true })
  static INDEX = new Keyword("INDEX", { reserved: true })
  static INFILE = new Keyword("INFILE", { reserved: true })
  static INNER = new Keyword("INNER", { reserved: true })
  static INOUT = new Keyword("INOUT", { reserved: true })
  static INSENSITIVE = new Keyword("INSENSITIVE", { reserved: true })
  static INSERT = new Keyword("INSERT", { reserved: true })
  static INT = new Keyword("INT", { reserved: true })
  static INTEGER = new Keyword("INTEGER", { reserved: true })
  static INTERVAL = new Keyword("INTERVAL", { reserved: true })
  static INTO = new Keyword("INTO", { reserved: true })
  static IO_AFTER_GTIDS = new Keyword("IO_AFTER_GTIDS", { reserved: true })
  static IO_BEFORE_GTIDS = new Keyword("IO_BEFORE_GTIDS", { reserved: true })
  static IS = new Keyword("IS", { reserved: true })
  static ITERATE = new Keyword("ITERATE", { reserved: true })
  static JOIN = new Keyword("JOIN", { reserved: true })
  static JSON_TABLE = new Keyword("JSON_TABLE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.4", options.version || "0")
  } })
  static KEY = new Keyword("KEY", { reserved: true })
  static KEYS = new Keyword("KEYS", { reserved: true })
  static KILL = new Keyword("KILL", { reserved: true })
  static LAG = new Keyword("LAG", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static LAST_VALUE = new Keyword("LAST_VALUE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static LATERAL = new Keyword("LATERAL", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.14", options.version || "0")
  } })
  static LEAD = new Keyword("LEAD", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static LEADING = new Keyword("LEADING", { reserved: true })
  static LEAVE = new Keyword("LEAVE", { reserved: true })
  static LEFT = new Keyword("LEFT", { reserved: true })
  static LIKE = new Keyword("LIKE", { reserved: true })
  static LIMIT = new Keyword("LIMIT", { reserved: true })
  static LINEAR = new Keyword("LINEAR", { reserved: true })
  static LINES = new Keyword("LINES", { reserved: true })
  static LOAD = new Keyword("LOAD", { reserved: true })
  static LOCALTIME = new Keyword("LOCALTIME", { reserved: true })
  static LOCALTIMESTAMP = new Keyword("LOCALTIMESTAMP", { reserved: true })
  static LOCK = new Keyword("LOCK", { reserved: true })
  static LONG = new Keyword("LONG", { reserved: true })
  static LONGBLOB = new Keyword("LONGBLOB", { reserved: true })
  static LONGTEXT = new Keyword("LONGTEXT", { reserved: true })
  static LOOP = new Keyword("LOOP", { reserved: true })
  static LOW_PRIORITY = new Keyword("LOW_PRIORITY", { reserved: true })
  static MASTER_BIND = new Keyword("MASTER_BIND", { reserved: true })
  static MASTER_SERVER_ID = new Keyword("MASTER_SERVER_ID", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies("<8.0.0", options.version || "0")
  } })
  static MASTER_SSL_VERIFY_SERVER_CERT = new Keyword("MASTER_SSL_VERIFY_SERVER_CERT", { reserved: true })
  static MATCH = new Keyword("MATCH", { reserved: true })
  static MAXVALUE = new Keyword("MAXVALUE", { reserved: true })
  static MEDIUMBLOB = new Keyword("MEDIUMBLOB", { reserved: true })
  static MEDIUMINT = new Keyword("MEDIUMINT", { reserved: true })
  static MEDIUMTEXT = new Keyword("MEDIUMTEXT", { reserved: true })
  static MIDDLEINT = new Keyword("MIDDLEINT", { reserved: true })
  static MINUTE_MICROSECOND = new Keyword("MINUTE_MICROSECOND", { reserved: true })
  static MINUTE_SECOND = new Keyword("MINUTE_SECOND", { reserved: true })
  static MOD = new Keyword("MOD", { reserved: true })
  static MODIFIES = new Keyword("MODIFIES", { reserved: true })
  static NATURAL = new Keyword("NATURAL", { reserved: true })
  static NOT = new Keyword("NOT", { reserved: true })
  static NO_WRITE_TO_BINLOG = new Keyword("NO_WRITE_TO_BINLOG", { reserved: true })
  static NTH_VALUE = new Keyword("NTH_VALUE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static NTILE = new Keyword("NTILE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static NULL = new Keyword("NULL", { reserved: true })
  static NUMERIC = new Keyword("NUMERIC", { reserved: true })
  static OF = new Keyword("OF", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.1", options.version || "0")
  } })
  static ON = new Keyword("ON", { reserved: true })
  static OPTIMIZE = new Keyword("OPTIMIZE", { reserved: true })
  static OPTIMIZER_COSTS = new Keyword("OPTIMIZER_COSTS", { reserved: true })
  static OPTION = new Keyword("OPTION", { reserved: true })
  static OPTIONALLY = new Keyword("OPTIONALLY", { reserved: true })
  static OR = new Keyword("OR", { reserved: true })
  static ORDER = new Keyword("ORDER", { reserved: true })
  static OUT = new Keyword("OUT", { reserved: true })
  static OUTER = new Keyword("OUTER", { reserved: true })
  static OUTFILE = new Keyword("OUTFILE", { reserved: true })
  static OVER = new Keyword("OVER", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static PARSE_GCOL_EXPR = new Keyword("PARSE_GCOL_EXPR", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies("<8.0.0", options.version || "0")
  } })
  static PARTITION = new Keyword("PARTITION", { reserved: true })
  static PERCENT_RANK = new Keyword("PERCENT_RANK", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static PRECISION = new Keyword("PRECISION", { reserved: true })
  static PRIMARY = new Keyword("PRIMARY", { reserved: true })
  static PROCEDURE = new Keyword("PROCEDURE", { reserved: true })
  static PURGE = new Keyword("PURGE", { reserved: true })
  static RANGE = new Keyword("RANGE", { reserved: true })
  static RANK = new Keyword("RANK", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static READ = new Keyword("READ", { reserved: true })
  static READS = new Keyword("READS", { reserved: true })
  static READ_WRITE = new Keyword("READ_WRITE", { reserved: true })
  static REAL = new Keyword("REAL", { reserved: true })
  static RECURSIVE = new Keyword("RECURSIVE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.1", options.version || "0")
  } })
  static REDOFILE = new Keyword("REDOFILE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies("<8.0.0", options.version || "0")
  } })
  static REFERENCES = new Keyword("REFERENCES", { reserved: true })
  static REGEXP = new Keyword("REGEXP", { reserved: true })
  static RELEASE = new Keyword("RELEASE", { reserved: true })
  static RENAME = new Keyword("RENAME", { reserved: true })
  static REPEAT = new Keyword("REPEAT", { reserved: true })
  static REPLACE = new Keyword("REPLACE", { reserved: true })
  static REQUIRE = new Keyword("REQUIRE", { reserved: true })
  static RESIGNAL = new Keyword("RESIGNAL", { reserved: true })
  static RESTRICT = new Keyword("RESTRICT", { reserved: true })
  static RETURN = new Keyword("RETURN", { reserved: true })
  static REVOKE = new Keyword("REVOKE", { reserved: true })
  static RIGHT = new Keyword("RIGHT", { reserved: true })
  static RLIKE = new Keyword("RLIKE", { reserved: true })
  static ROW = new Keyword("ROW", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static ROWS = new Keyword("ROWS", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static ROW_NUMBER = new Keyword("ROW_NUMBER", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static SCHEMA = new Keyword("SCHEMA", { reserved: true })
  static SCHEMAS = new Keyword("SCHEMAS", { reserved: true })
  static SECOND_MICROSECOND = new Keyword("SECOND_MICROSECOND", { reserved: true })
  static SELECT = new Keyword("SELECT", { reserved: true })
  static SENSITIVE = new Keyword("SENSITIVE", { reserved: true })
  static SEPARATOR = new Keyword("SEPARATOR", { reserved: true })
  static SET = new Keyword("SET", { reserved: true })
  static SHOW = new Keyword("SHOW", { reserved: true })
  static SIGNAL = new Keyword("SIGNAL", { reserved: true })
  static SMALLINT = new Keyword("SMALLINT", { reserved: true })
  static SPATIAL = new Keyword("SPATIAL", { reserved: true })
  static SPECIFIC = new Keyword("SPECIFIC", { reserved: true })
  static SQL = new Keyword("SQL", { reserved: true })
  static SQLEXCEPTION = new Keyword("SQLEXCEPTION", { reserved: true })
  static SQLSTATE = new Keyword("SQLSTATE", { reserved: true })
  static SQLWARNING = new Keyword("SQLWARNING", { reserved: true })
  static SQL_BIG_RESULT = new Keyword("SQL_BIG_RESULT", { reserved: true })
  static SQL_CACHE = new Keyword("SQL_CACHE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies("<8.0.0", options.version || "0")
  } })
  static SQL_CALC_FOUND_ROWS = new Keyword("SQL_CALC_FOUND_ROWS", { reserved: true })
  static SQL_SMALL_RESULT = new Keyword("SQL_SMALL_RESULT", { reserved: true })
  static SSL = new Keyword("SSL", { reserved: true })
  static STARTING = new Keyword("STARTING", { reserved: true })
  static STORED = new Keyword("STORED", { reserved: true })
  static STRAIGHT_JOIN = new Keyword("STRAIGHT_JOIN", { reserved: true })
  static SYSTEM = new Keyword("SYSTEM", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.3", options.version || "0")
  } })
  static TABLE = new Keyword("TABLE", { reserved: true })
  static TERMINATED = new Keyword("TERMINATED", { reserved: true })
  static THEN = new Keyword("THEN", { reserved: true })
  static TINYBLOB = new Keyword("TINYBLOB", { reserved: true })
  static TINYINT = new Keyword("TINYINT", { reserved: true })
  static TINYTEXT = new Keyword("TINYTEXT", { reserved: true })
  static TO = new Keyword("TO", { reserved: true })
  static TRAILING = new Keyword("TRAILING", { reserved: true })
  static TRIGGER = new Keyword("TRIGGER", { reserved: true })
  static TRUE = new Keyword("TRUE", { reserved: true })
  static UNDO = new Keyword("UNDO", { reserved: true })
  static UNION = new Keyword("UNION", { reserved: true })
  static UNIQUE = new Keyword("UNIQUE", { reserved: true })
  static UNLOCK = new Keyword("UNLOCK", { reserved: true })
  static UNSIGNED = new Keyword("UNSIGNED", { reserved: true })
  static UPDATE = new Keyword("UPDATE", { reserved: true })
  static USAGE = new Keyword("USAGE", { reserved: true })
  static USE = new Keyword("USE", { reserved: true })
  static USING = new Keyword("USING", { reserved: true })
  static UTC_DATE = new Keyword("UTC_DATE", { reserved: true })
  static UTC_TIME = new Keyword("UTC_TIME", { reserved: true })
  static UTC_TIMESTAMP = new Keyword("UTC_TIMESTAMP", { reserved: true })
  static VALUES = new Keyword("VALUES", { reserved: true })
  static VARBINARY = new Keyword("VARBINARY", { reserved: true })
  static VARCHAR = new Keyword("VARCHAR", { reserved: true })
  static VARCHARACTER = new Keyword("VARCHARACTER", { reserved: true })
  static VARYING = new Keyword("VARYING", { reserved: true })
  static VIRTUAL = new Keyword("VIRTUAL", { reserved: true })
  static WHEN = new Keyword("WHEN", { reserved: true })
  static WHERE = new Keyword("WHERE", { reserved: true })
  static WHILE = new Keyword("WHILE", { reserved: true })
  static WINDOW = new Keyword("WINDOW", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static WITH = new Keyword("WITH", { reserved: true })
  static WRITE = new Keyword("WRITE", { reserved: true })
  static XOR = new Keyword("XOR", { reserved: true })
  static YEAR_MONTH = new Keyword("YEAR_MONTH", { reserved: true })
  static ZEROFILL = new Keyword("ZEROFILL", { reserved: true })

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

    for (const keyword of KeywordMap.values()) {
      if (typeof keyword.options.reserved === "function") {
        if (keyword.options.reserved(options)) {
          this.reserved.add(keyword)
        }
      } else if (keyword.options.reserved === true) {
        this.reserved.add(keyword)
      }
    }
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
