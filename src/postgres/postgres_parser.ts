import { Statement } from "../models"
import {
  ITokenType,
  Token,
  Lexer,
  Parser,
  ParseError,
  AggregateParseError,
} from "../parser"
import { CreateTriggerStatement } from "../sqlite3/sqlite3_models"
import { lcase, ucase } from "../util/functions"
import * as model from "./postgres_models"

export class TokenType implements ITokenType {
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
  static ABORT = new Keyword("ABORT")
  static ACCESS = new Keyword("ACCESS")
  static AGGREGATE = new Keyword("AGGREGATE")
  static ALL = new Keyword("ALL", { reserved: true })
  static ALTER = new Keyword("ALTER")
  static ANALYSE = new Keyword("ANALYSE", { reserved: true })
  static ANALYZE = new Keyword("ANALYZE", { reserved: true })
  static AND = new Keyword("AND", { reserved: true })
  static ANY = new Keyword("ANY", { reserved: true })
  static ARRAY = new Keyword("ARRAY", { reserved: true })
  static AS = new Keyword("AS", { reserved: true })
  static ASC = new Keyword("ASC", { reserved: true })
  static ASYMMETRIC = new Keyword("ASYMMETRIC", { reserved: true })
  static AUTHORIZATION = new Keyword("AUTHORIZATION")
  static BEGIN = new Keyword("BEGIN")
  static BINARY = new Keyword("BINARY")
  static BOTH = new Keyword("BOTH", { reserved: true })
  static CALL = new Keyword("CALL")
  static CASCADE = new Keyword("CASCADE")
  static CASE = new Keyword("CASE", { reserved: true })
  static CAST = new Keyword("CAST", { reserved: true })
  static CHECK = new Keyword("CHECK", { reserved: true })
  static CHECKPOINT = new Keyword("CHECKPOINT")
  static CLASS = new Keyword("CLASS")
  static CLOSE = new Keyword("CLOSE")
  static CLUSTER = new Keyword("CLUSTER")
  static COLLATE = new Keyword("COLLATE", { reserved: true })
  static COLLATION = new Keyword("COLLATION")
  static COLUMN = new Keyword("COLUMN", { reserved: true })
  static COMMENT = new Keyword("COMMENT")
  static COMMIT = new Keyword("COMMIT")
  static CONCURRENTLY = new Keyword("CONCURRENTLY")
  static CONFIGURATION = new Keyword("CONFIGURATION")
  static CONSTRAINT = new Keyword("CONSTRAINT", { reserved: true })
  static CONVERSION = new Keyword("CONVERSION")
  static COPY = new Keyword("COPY")
  static CREATE = new Keyword("CREATE", { reserved: true })
  static CROSS = new Keyword("CROSS")
  static CURRENT_CATALOG = new Keyword("CURRENT_CATALOG", { reserved: true })
  static CURRENT_DATE = new Keyword("CURRENT_DATE", { reserved: true })
  static CURRENT_ROLE = new Keyword("CURRENT_ROLE", { reserved: true })
  static CURRENT_SCHEMA = new Keyword("CURRENT_SCHEMA")
  static CURRENT_TIME = new Keyword("CURRENT_TIME", { reserved: true })
  static CURRENT_TIMESTAMP = new Keyword("CURRENT_TIMESTAMP", { reserved: true })
  static CURRENT_USER = new Keyword("CURRENT_USER", { reserved: true })
  static DATA = new Keyword("DATA")
  static DATABASE = new Keyword("DATABASE")
  static DEALLOCATE = new Keyword("DEALLOCATE")
  static DECLARE = new Keyword("DECLARE")
  static DEFAULT = new Keyword("DEFAULT", { reserved: true })
  static DEFERRABLE = new Keyword("DEFERRABLE", { reserved: true })
  static DELETE = new Keyword("DELETE")
  static DESC = new Keyword("DESC", { reserved: true })
  static DICTIONARY = new Keyword("DICTIONARY")
  static DISCARD = new Keyword("DISCARD")
  static DISTINCT = new Keyword("DISTINCT", { reserved: true })
  static DO = new Keyword("DO", { reserved: true })
  static DOMAIN = new Keyword("DOMAIN")
  static DROP = new Keyword("DROP")
  static ELSE = new Keyword("ELSE", { reserved: true })
  static END = new Keyword("END", { reserved: true })
  static EVENT = new Keyword("EVENT")
  static EXCEPT = new Keyword("EXCEPT", { reserved: true })
  static EXISTS = new Keyword("EXISTS")
  static EXECUTE = new Keyword("EXECUTE")
  static EXTENSION = new Keyword("EXTENSION")
  static EXPLAIN = new Keyword("EXPLAIN")
  static FALSE = new Keyword("FALSE", { reserved: true })
  static FAMILY = new Keyword("FAMILY")
  static FETCH = new Keyword("FETCH", { reserved: true })
  static FOR = new Keyword("FOR", { reserved: true })
  static FOREIGN = new Keyword("FOREIGN", { reserved: true })
  static FUNCTION = new Keyword("FUNCTION")
  static FREEZE = new Keyword("FREEZE")
  static FROM = new Keyword("FROM", { reserved: true })
  static FULL = new Keyword("FULL")
  static GLOBAL = new Keyword("GLOBAL")
  static GRANT = new Keyword("GRANT", { reserved: true })
  static GROUP = new Keyword("GROUP", { reserved: true })
  static HAVING = new Keyword("HAVING", { reserved: true })
  static IF = new Keyword("IF")
  static ILIKE = new Keyword("ILIKE")
  static IMPORT = new Keyword("IMPORT")
  static IN = new Keyword("IN", { reserved: true })
  static INITIALLY = new Keyword("INITIALLY", { reserved: true })
  static INDEX = new Keyword("INDEX")
  static INNER = new Keyword("INNER")
  static INSERT = new Keyword("INSERT")
  static INTERSECT = new Keyword("INTERSECT", { reserved: true })
  static INTO = new Keyword("INTO", { reserved: true })
  static IS = new Keyword("IS")
  static ISNULL = new Keyword("ISNULL")
  static JOIN = new Keyword("JOIN")
  static LABEL = new Keyword("LABEL")
  static LANGUAGE = new Keyword("LANGUAGE")
  static LATERAL = new Keyword("LATERAL", { reserved: true })
  static LARGE = new Keyword("LARGE")
  static LEADING = new Keyword("LEADING", { reserved: true })
  static LEFT = new Keyword("LEFT")
  static LIKE = new Keyword("LIKE")
  static LIMIT = new Keyword("LIMIT", { reserved: true })
  static LISTEN = new Keyword("LISTEN")
  static LOCAL = new Keyword("LOCAL")
  static LOCALTIME = new Keyword("LOCALTIME", { reserved: true })
  static LOCALTIMESTAMP = new Keyword("LOCALTIMESTAMP", { reserved: true })
  static LOCK = new Keyword("LOCK")
  static LOAD = new Keyword("LOAD")
  static MATERIALIZED = new Keyword("MATERIALIZED")
  static MAPPING = new Keyword("MAPPING")
  static METHOD = new Keyword("METHOD")
  static MOVE = new Keyword("MOVE")
  static NATURAL = new Keyword("NATURAL")
  static NOT = new Keyword("NOT", { reserved: true })
  static NOTIFY = new Keyword("NOTIFY")
  static NOTNULL = new Keyword("NOTNULL")
  static NULL = new Keyword("NULL", { reserved: true })
  static OBJECT = new Keyword("OBJECT")
  static OFFSET = new Keyword("OFFSET", { reserved: true })
  static ON = new Keyword("ON", { reserved: true })
  static ONLY = new Keyword("ONLY", { reserved: true })
  static OPERATOR = new Keyword("OPERATOR")
  static OR = new Keyword("OR", { reserved: true })
  static ORDER = new Keyword("ORDER", { reserved: true })
  static OUTER = new Keyword("OUTER")
  static OVERLAPS = new Keyword("OVERLAPS")
  static OWNED = new Keyword("OWNED")
  static PARSER = new Keyword("PARSER")
  static PLACING = new Keyword("PLACING", { reserved: true })
  static POLICY = new Keyword("POLICY")
  static PREPARE = new Keyword("PREPARE")
  static PREPARED = new Keyword("PREPARED")
  static PRIMARY = new Keyword("PRIMARY", { reserved: true })
  static PRIVILEGES = new Keyword("PRIVILEGES")
  static PROCEDURAL = new Keyword("PROCEDURAL")
  static PROCEDURE = new Keyword("PROCEDURE")
  static PUBLICATION = new Keyword("PUBLICATION")
  static REASSIGN = new Keyword("REASSIGN")
  static RECURSIVE = new Keyword("RECURSIVE")
  static REFERENCES = new Keyword("REFERENCES", { reserved: true })
  static REFRESH = new Keyword("REFRESH")
  static REINDEX = new Keyword("REINDEX")
  static RELEASE = new Keyword("RELEASE")
  static RESET = new Keyword("RESET")
  static RESTRICT = new Keyword("RESTRICT")
  static RETURNING = new Keyword("RETURNING", { reserved: true })
  static REVOKE = new Keyword("REVOKE")
  static RIGHT = new Keyword("RIGHT")
  static ROLE = new Keyword("ROLE")
  static ROLLBACK = new Keyword("ROLLBACK")
  static ROUTINE = new Keyword("ROUTINE")
  static RULE = new Keyword("RULE")
  static REPLACE = new Keyword("REPLACE")
  static SAVEPOINT = new Keyword("SAVEPOINT")
  static SCHEMA = new Keyword("SCHEMA")
  static SEARCH = new Keyword("SEARCH")
  static SECURITY = new Keyword("SECURITY")
  static SERVER = new Keyword("SERVER")
  static SELECT = new Keyword("SELECT", { reserved: true })
  static SEQUENCE = new Keyword("SEQUENCE")
  static SHOW = new Keyword("SHOW")
  static SESSION = new Keyword("SESSION")
  static SESSION_USER = new Keyword("SESSION_USER", { reserved: true })
  static SET = new Keyword("SET")
  static SIMILAR = new Keyword("SIMILAR")
  static SOME = new Keyword("SOME", { reserved: true })
  static START = new Keyword("START")
  static STATISTICS = new Keyword("STATISTICS")
  static SUBSCRIPTION = new Keyword("SUBSCRIPTION")
  static SYMMETRIC = new Keyword("SYMMETRIC", { reserved: true })
  static SYSTEM = new Keyword("SYSTEM")
  static TABLE = new Keyword("TABLE", { reserved: true })
  static TABLESPACE  = new Keyword("TABLESPACE")
  static TEMP = new Keyword("TEMP")
  static TEMPLATE = new Keyword("TEMPLATE")
  static TEMPORARY = new Keyword("TEMPORARY")
  static TEXT = new Keyword("TEXT")
  static THEN = new Keyword("THEN", { reserved: true })
  static TO = new Keyword("TO", { reserved: true })
  static TRAILING = new Keyword("TRAILING", { reserved: true })
  static TRANSACTION = new Keyword("TRANSACTION")
  static TRANSFORM = new Keyword("TRANSFORM")
  static TRIGGER = new Keyword("TRIGGER")
  static TRUE = new Keyword("TRUE", { reserved: true })
  static TRUNCATE = new Keyword("TRUNCATE")
  static TRUSTED = new Keyword("TRUSTED")
  static TYPE = new Keyword("TYPE")
  static UNION = new Keyword("UNION", { reserved: true })
  static UNIQUE = new Keyword("UNIQUE", { reserved: true })
  static UNLISTEN = new Keyword("UNLISTEN")
  static UNLOGGED = new Keyword("UNLOGGED")
  static UPDATE = new Keyword("UPDATE")
  static USER = new Keyword("USER", { reserved: true })
  static USING = new Keyword("USING", { reserved: true })
  static VACUUM = new Keyword("VACUUM")
  static VALUES = new Keyword("VALUES")
  static VARIADIC = new Keyword("VARIADIC", { reserved: true })
  static VERBOSE = new Keyword("VERBOSE")
  static VIEW = new Keyword("VIEW")
  static WRAPPER = new Keyword("WRAPPER")
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
  private reserved = new Set<Keyword>()

  constructor(
    private options: { [key: string]: any } = {}
  ) {
    super("postgres", [
      { type: TokenType.WhiteSpace, re: /[ \t]+/y },
      { type: TokenType.Command, re: /^\\[^ \t]+([ \t]+('([^\\']|\\')*'|"([^\\"]|\\")*"|`([^\\`]|\\`)*`|[^ \t'"`]+))*(\\|$)/my },
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

    if (Array.isArray(options.reservedWords)) {
      const reserved = new Set<string>()
      for (const keyword of options.reservedWords) {
        reserved.add(ucase(keyword))
      }
      for (const keyword of KeywordMap.values()) {
        if (reserved.has(keyword.name)) {
          this.reserved.add(keyword)
        }
      }
    } else {
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
  }

  protected process(token: Token) {
    if (token.type === TokenType.Identifier) {
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

export class PostgresParser extends Parser {
  constructor(
    input: string,
    options: { [key: string]: any} = {},
  ) {
    super(input, new PostgresLexer(options), options)
  }

  root() {
    const root = []
    const errors = []
    for (let i = 0;
      this.token() && (
        i === 0 ||
        this.consumeIf(TokenType.SemiColon) ||
        root[root.length - 1] instanceof model.CommandStatement
      );
      i++
    ) {
      try {
        if (this.peekIf(TokenType.Command)) {
          root.push(this.command())
        } else if (this.token() && !this.peekIf(TokenType.SemiColon)) {
          root.push(this.statement())
        }
      } catch (e) {
        if (e instanceof ParseError) {
          errors.push(e)

          // skip tokens
          while (this.token() && !this.peekIf(TokenType.SemiColon)) {
            this.consume()
          }
        } else {
          throw e
        }
      }
    }

    if (this.token() != null) {
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
      throw new AggregateParseError(errors, `${errors.length} error found\n${errors.map(
        e => e.message
      ).join("\n")}`)
    }

    return root
  }

  command() {
    const start = this.pos
    const stmt = new model.CommandStatement()
    this.consume(TokenType.Command)
    const token = this.token(-1)
    const sep = token.text.indexOf(" ")
    if (sep === -1) {
      stmt.name = token.text
    } else {
      stmt.name = token.text.substring(0, sep)
      const input = token.text.substring(sep)
      const re = /([ \t]+)|"([^"]*)"|'([^']*)'|`([^`]*)`|([^ \t"']+)/y
      let pos = 0
      while (pos < input.length) {
        re.lastIndex = pos
        const m = re.exec(input)
        if (m) {
          if (!m[1]) {
            stmt.args.push(m[2] || m[3] || m[4])
          }
          pos = re.lastIndex
        }
      }
    }
    stmt.tokens = this.tokens.slice(start, this.pos)
    return stmt
  }

  statement() {
    const start = this.pos

    let stmt
    if (this.consumeIf(Keyword.CREATE)) {
      if (this.consumeIf(Keyword.DATABASE)) {
        stmt = new model.CreateDatabaseStatement()
        this.parseCreateDatabaseStatement(stmt, start)
      } else if (this.consumeIf(Keyword.ACCESS)) {
        this.consume(Keyword.METHOD)
        stmt = new model.CreateAccessMethodStatement()
        this.parseCreateAccessMethodStatement(stmt, start)
      } else if (this.consumeIf(Keyword.CAST)) {
        stmt = new model.CreateCastStatement()
        this.parseCreateCastStatement(stmt, start)
      } else if (this.consumeIf(Keyword.EVENT)) {
        this.consume(Keyword.TRIGGER)
        stmt = new model.CreateEventTriggerStatement()
        this.parseCreateEventTriggerStatement(stmt, start)
      } else if (this.consumeIf(Keyword.EXTENSION)) {
        stmt = new model.CreateExtensionStatement()
        this.parseCreateExtensionStatement(stmt, start)
      } else if (this.consumeIf(Keyword.TRUSTED)) {
        stmt = new model.CreateLanguageStatement()
        stmt.trusted = true
        if (this.consumeIf(Keyword.PROCEDURAL)) {
          stmt.procedural = true
        }
        this.consume(Keyword.LANGUAGE)
        this.parseCreateLanguageStatement(stmt, start)
      } else if (this.consumeIf(Keyword.PROCEDURAL)) {
        this.consume(Keyword.LANGUAGE)
        stmt = new model.CreateLanguageStatement()
        stmt.procedural = true
        this.parseCreateLanguageStatement(stmt, start)
      } else if (this.consumeIf(Keyword.LANGUAGE)) {
        stmt = new model.CreateLanguageStatement()
        this.parseCreateLanguageStatement(stmt, start)
      } else if (this.consumeIf(Keyword.TRANSFORM)) {
        stmt = new model.CreateTransformStatement()
        this.parseCreateTransformStatement(stmt, start)
      } else if (this.consumeIf(Keyword.PUBLICATION)) {
        stmt = new model.CreatePublicationStatement()
        this.parseCreatePublicationStatement(stmt, start)
      } else if (this.consumeIf(Keyword.SUBSCRIPTION)) {
        stmt = new model.CreateSubscriptionStatement()
        this.parseCreateSubscriptionStatement(stmt, start)
      } else if (this.consumeIf(Keyword.SERVER)) {
        stmt = new model.CreateServerStatement()
        this.parseCreateServerStatement(stmt, start)
      } else if (this.consumeIf(Keyword.TABLESPACE)) {
        stmt = new model.CreateTablespaceStatement()
        this.parseCreateTablespaceStatement(stmt, start)
      } else if (this.consumeIf(Keyword.TYPE)) {
        stmt = new model.CreateTypeStatement()
        this.parseCreateTypeStatement(stmt, start)
      } else if (this.consumeIf(Keyword.GROUP) || this.consumeIf(Keyword.ROLE)) {
        stmt = new model.CreateRoleStatement()
        this.parseCreateRoleStatement(stmt, start)
      } else if (this.consumeIf(Keyword.USER)) {
        if (this.consumeIf(Keyword.MAPPING)) {
          stmt = new model.CreateUserMappingStatement()
          this.parseCreateUserMappingStatement(stmt, start)
        } else {
          stmt = new model.CreateRoleStatement()
          stmt.login = true
          this.parseCreateRoleStatement(stmt, start)
        }
      } else if (this.consumeIf(Keyword.SCHEMA)) {
        stmt = new model.CreateSchemaStatement()
        this.parseCreateSchemaStatement(stmt, start)
      } else if (this.consumeIf(Keyword.COLLATION)) {
        stmt = new model.CreateCollationStatement()
        this.parseCreateCollationStatement(stmt, start)
      } else if (this.consumeIf(Keyword.DEFAULT, Keyword.CONVERSION)) {
        stmt = new model.CreateConversionStatement()
        stmt.default = true
        this.parseCreateConversionStatement(stmt, start)
      } else if (this.consumeIf(Keyword.CONVERSION)) {
        stmt = new model.CreateConversionStatement()
        this.parseCreateConversionStatement(stmt, start)
      } else if (this.consumeIf(Keyword.DOMAIN)) {
        stmt = new model.CreateDomainStatement()
        this.parseCreateDomainStatement(stmt, start)
      } else if (this.consumeIf(Keyword.OPERATOR)) {
        if (this.consumeIf(Keyword.CLASS)) {
          stmt = new model.CreateOperatorClassStatement()
          this.parseCreateOperatorClassStatement(stmt, start)
        } else if (this.consumeIf(Keyword.FAMILY)) {
          stmt = new model.CreateOperatorFamilyStatement()
          this.parseCreateOperatorFamilyStatement(stmt, start)
        } else {
          stmt = new model.CreateOperatorStatement()
          this.parseCreateOperatorStatement(stmt, start)
        }
      } else if (this.consumeIf(Keyword.STATISTICS)) {
        stmt = new model.CreateStatisticsStatement()
        this.parseCreateStatisticsStatement(stmt, start)
      } else if (this.consumeIf(Keyword.GLOBAL) || this.consumeIf(Keyword.LOCAL)) {
        stmt = new model.CreateTableStatement()
        if (this.consumeIf(Keyword.TEMPORARY) || this.consumeIf(Keyword.TEMP)) {
          stmt.temporary = true
        }
        if (this.consumeIf(Keyword.UNLOGGED)) {
          stmt.unlogged = true
        }
        this.consume(Keyword.TABLE)
        this.parseCreateTableStatement(stmt, start)
      } else if (this.consumeIf(Keyword.OR)) {
        this.consume(Keyword.REPLACE)
        if (this.consumeIf(Keyword.TEMPORARY) || this.consumeIf(Keyword.TEMP)) {
          if (this.consumeIf(Keyword.TABLE)) {
            stmt = new model.CreateTableStatement()
            stmt.orReplace = true
            stmt.temporary = true
            this.parseCreateTableStatement(stmt, start)
          } else if (this.consumeIf(Keyword.SEQUENCE)) {
            stmt = new model.CreateSequenceStatement()
            stmt.orReplace = true
            stmt.temporary = true
            this.parseCreateSequenceStatement(stmt, start)
          } else if (this.consumeIf(Keyword.RECURSIVE, Keyword.VIEW)) {
            stmt = new model.CreateViewStatement()
            stmt.orReplace = true
            stmt.temporary = true
            stmt.recursive = true
            this.parseCreateViewStatement(stmt, start)
          } else if (this.consumeIf(Keyword.VIEW)) {
            stmt = new model.CreateViewStatement()
            stmt.orReplace = true
            stmt.temporary = true
            this.parseCreateViewStatement(stmt, start)
          }
        } else if (this.consumeIf(Keyword.LANGUAGE)) {
          stmt = new model.CreateLanguageStatement()
          stmt.orReplace = true
          this.parseCreateLanguageStatement(stmt, start)
        } else if (this.consumeIf(Keyword.TRANSFORM)) {
          stmt = new model.CreateTransformStatement()
          stmt.orReplace = true
          this.parseCreateTransformStatement(stmt, start)
        } else if (this.consumeIf(Keyword.SEQUENCE)) {
          stmt = new model.CreateSequenceStatement()
          stmt.orReplace = true
          this.parseCreateSequenceStatement(stmt, start)
        } else if (this.consumeIf(Keyword.RECURSIVE, Keyword.VIEW)) {
          stmt = new model.CreateViewStatement()
          stmt.orReplace = true
          stmt.recursive = true
          this.parseCreateViewStatement(stmt, start)
        } else if (this.consumeIf(Keyword.VIEW)) {
          stmt = new model.CreateViewStatement()
          stmt.orReplace = true
          this.parseCreateViewStatement(stmt, start)
        } else if (this.consumeIf(Keyword.PROCEDURE)) {
          stmt = new model.CreateProcedureStatement()
          stmt.orReplace = true
          this.parseCreateProcedureStatement(stmt, start)
        } else if (this.consumeIf(Keyword.FUNCTION)) {
          stmt = new model.CreateFunctionStatement()
          stmt.orReplace = true
          this.parseCreateFunctionStatement(stmt, start)
        } else if (this.consumeIf(Keyword.AGGREGATE)) {
          stmt = new model.CreateAggregateStatement()
          stmt.orReplace = true
          this.parseCreateAggregateStatement(stmt, start)
        } else if (this.consumeIf(Keyword.RULE)) {
          stmt = new model.CreateRuleStatement()
          stmt.orReplace = true
          this.parseCreateRuleStatement(stmt, start)
        } else {
          this.consumeIf(Keyword.RECURSIVE)
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.TEMPORARY) || this.consumeIf(Keyword.TEMP)) {
        if (this.consumeIf(Keyword.UNLOGGED, Keyword.TABLE)) {
          stmt = new model.CreateTableStatement()
          stmt.temporary = true
          stmt.unlogged = true
          this.parseCreateTableStatement(stmt, start)
        } else if (this.consumeIf(Keyword.TABLE)) {
          stmt = new model.CreateTableStatement()
          stmt.temporary = true
          this.parseCreateTableStatement(stmt, start)
        } else if (this.consumeIf(Keyword.SEQUENCE)) {
          stmt = new model.CreateSequenceStatement()
          stmt.temporary = true
          this.parseCreateSequenceStatement(stmt, start)
        } else if (this.consumeIf(Keyword.RECURSIVE, Keyword.VIEW)) {
          stmt = new model.CreateViewStatement()
          stmt.temporary = true
          stmt.recursive = true
          this.parseCreateViewStatement(stmt, start)
        } else if (this.consumeIf(Keyword.VIEW)) {
          stmt = new model.CreateViewStatement()
          stmt.temporary = true
        } else {
          this.consumeIf(Keyword.UNLOGGED) ||
          this.consumeIf(Keyword.RECURSIVE)
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.FOREIGN)) {
        if (this.consumeIf(Keyword.DATA)) {
          this.consume(Keyword.WRAPPER)
          stmt = new model.CreateForeignDataWrapperStatement()
          this.parseCreateForeignDataWrapperStatement(stmt, start)
        } else if (this.consumeIf(Keyword.TABLE)) {
          stmt = new model.CreateForeignTableStatement()
          this.parseCreateForeignTableStatement(stmt, start)
        }
      } else if (this.consumeIf(Keyword.UNLOGGED, Keyword.TABLE)) {
        stmt = new model.CreateTableStatement()
        stmt.unlogged = true
        this.parseCreateTableStatement(stmt, start)
      } else if (this.consumeIf(Keyword.TABLE)) {
        stmt = new model.CreateTableStatement()
        this.parseCreateTableStatement(stmt, start)
      } else if (this.consumeIf(Keyword.SEQUENCE)) {
        stmt = new model.CreateSequenceStatement()
        this.parseCreateSequenceStatement(stmt, start)
      } else if (this.consumeIf(Keyword.RECURSIVE, Keyword.VIEW)) {
        stmt = new model.CreateViewStatement()
        stmt.recursive = true
        this.parseCreateViewStatement(stmt, start)
      } else if (this.consumeIf(Keyword.VIEW)) {
        stmt = new model.CreateViewStatement()
        this.parseCreateViewStatement(stmt, start)
      } else if (this.consumeIf(Keyword.MATERIALIZED)) {
        stmt = new model.CreateMaterializedViewStatement()
        this.parseCreateMaterializedViewStatement(stmt, start)
      } else if (this.consumeIf(Keyword.PROCEDURE)) {
        stmt = new model.CreateProcedureStatement()
        this.parseCreateProcedureStatement(stmt, start)
      } else if (this.consumeIf(Keyword.FUNCTION)) {
        stmt = new model.CreateFunctionStatement()
        this.parseCreateFunctionStatement(stmt, start)
      } else if (this.consumeIf(Keyword.AGGREGATE)) {
        stmt = new model.CreateAggregateStatement()
        this.parseCreateAggregateStatement(stmt, start)
      } else if (this.consumeIf(Keyword.CONSTRAINT, Keyword.TRIGGER)) {
        stmt = new model.CreateTriggerStatement()
        stmt.constraint = true
        this.parseCreateTriggerStatement(stmt, start)
      } else if (this.consumeIf(Keyword.TRIGGER)) {
        stmt = new model.CreateTriggerStatement()
        this.parseCreateTriggerStatement(stmt, start)
      } else if (this.consumeIf(Keyword.TEXT)) {
        this.consume(Keyword.SEARCH)
        if (this.consumeIf(Keyword.CONFIGURATION)) {
          stmt = new model.CreateTextSearchConfigurationStatement()
          this.parseCreateTextSearchConfigurationStatement(stmt, start)
        } else if (this.consumeIf(Keyword.DICTIONARY)) {
          stmt = new model.CreateTextSearchDictionaryStatement()
          this.parseCreateTextSearchDictionaryStatement(stmt, start)
        } else if (this.consumeIf(Keyword.PARSER)) {
          stmt = new model.CreateTextSearchParserStatement()
          this.parseCreateTextSearchParserStatement(stmt, start)
        } else if (this.consumeIf(Keyword.TEMPLATE)) {
          stmt = new model.CreateTextSearchTemplateStatement()
          this.parseCreateTextSearchTemplateStatement(stmt, start)
        }
      } else if (this.consumeIf(Keyword.POLICY)) {
        stmt = new model.CreatePolicyStatement()
        this.parseCreatePolicyStatement(stmt, start)
      } else if (this.consumeIf(Keyword.RULE)) {
        stmt = new model.CreateRuleStatement()
        this.parseCreateRuleStatement(stmt, start)
      } else if (this.consumeIf(Keyword.UNIQUE, Keyword.INDEX)) {
        stmt = new model.CreateIndexStatement()
        this.parseCreateIndexStatement(stmt, start)
        stmt.type = "UNIQUE"
      } else if (this.consumeIf(Keyword.INDEX)) {
        stmt = new model.CreateIndexStatement()
        this.parseCreateIndexStatement(stmt, start)
      } else if (
        this.consumeIf(Keyword.DEFAULT) ||
        this.consumeIf(Keyword.TEMPORARY) ||
        this.consumeIf(Keyword.TEMP) ||
        this.consumeIf(Keyword.UNLOGGED) ||
        this.consumeIf(Keyword.RECURSIVE) ||
        this.consumeIf(Keyword.CONSTRAINT) ||
        this.consumeIf(Keyword.UNIQUE)
      ) {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.ALTER)) {
      if (this.consumeIf(Keyword.SYSTEM)) {
        stmt = new model.AlterSystemStatement()
        this.parseAlterSystemStatement(stmt, start)
      } else if (this.consumeIf(Keyword.DATABASE)) {
        stmt = new model.AlterDatabaseStatement()
        this.parseAlterDatabaseStatement(stmt, start)
      } else if (this.consumeIf(Keyword.EVENT)) {
        this.consume(Keyword.TRIGGER)
        stmt = new model.AlterEventTriggerStatement()
        this.parseAlterEventTriggerStatement(stmt, start)
      } else if (this.consumeIf(Keyword.EXTENSION)) {
        stmt = new model.AlterExtensionStatement()
        this.parseAlterExtensionStatement(stmt, start)
      } else if (this.consumeIf(Keyword.PROCEDURAL)) {
        this.consume(Keyword.LANGUAGE)
        stmt = new model.AlterLanguageStatement()
        stmt.procedural = true
        this.parseAlterLanguageStatement(stmt, start)
      } else if (this.consumeIf(Keyword.LANGUAGE)) {
        stmt = new model.AlterLanguageStatement()
        this.parseAlterLanguageStatement(stmt, start)
      } else if (this.consumeIf(Keyword.PUBLICATION)) {
        stmt = new model.AlterPublicationStatement()
        this.parseAlterPublicationStatement(stmt, start)
      } else if (this.consumeIf(Keyword.SUBSCRIPTION)) {
        stmt = new model.AlterSubscriptionStatement()
        this.parseAlterSubscriptionStatement(stmt, start)
      } else if (this.consumeIf(Keyword.SERVER)) {
        stmt = new model.AlterServerStatement()
        this.parseAlterServerStatement(stmt, start)
      } else if (this.consumeIf(Keyword.TABLESPACE)) {
        stmt = new model.AlterTablespaceStatement()
        this.parseAlterTablespaceStatement(stmt, start)
      } else if (this.consumeIf(Keyword.TYPE)) {
        stmt = new model.AlterTypeStatement()
        this.parseAlterTypeStatement(stmt, start)
      } else if (this.consumeIf(Keyword.GROUP) || this.consumeIf(Keyword.ROLE)) {
        stmt = new model.AlterRoleStatement()
        this.parseAlterRoleStatement(stmt, start)
      } else if (this.consumeIf(Keyword.USER)) {
        if (this.consumeIf(Keyword.MAPPING)) {
          stmt = new model.AlterUserMappingStatement()
          this.parseAlterUserMappingStatement(stmt, start)
        } else {
          stmt = new model.AlterRoleStatement()
          stmt.login = true
          this.parseAlterRoleStatement(stmt, start)
        }
      } else if (this.consumeIf(Keyword.LARGE)) {
        this.consume(Keyword.OBJECT)
        stmt = new model.AlterLargeObjectStatement()
        this.parseAlterLargeObjectStatement(stmt, start)
      } else if (this.consumeIf(Keyword.SCHEMA)) {
        stmt = new model.AlterSchemaStatement()
        this.parseAlterSchemaStatement(stmt, start)
      } else if (this.consumeIf(Keyword.COLLATION)) {
        stmt = new model.AlterCollationStatement()
        this.parseAlterCollationStatement(stmt, start)
      } else if (this.consumeIf(Keyword.DEFAULT, Keyword.PRIVILEGES)) {
        stmt = new model.AlterDefaultPrivilegesStatement()
        this.parseAlterDefaultPrivilegesStatement(stmt, start)
      } else if (this.consumeIf(Keyword.CONVERSION)) {
        stmt = new model.AlterConversionStatement()
        this.parseAlterConversionStatement(stmt, start)
      } else if (this.consumeIf(Keyword.DOMAIN)) {
        stmt = new model.AlterDomainStatement()
        this.parseAlterDomainStatement(stmt, start)
      } else if (this.consumeIf(Keyword.OPERATOR)) {
        if (this.consumeIf(Keyword.CLASS)) {
          stmt = new model.AlterOperatorClassStatement()
          this.parseAlterOperatorClassStatement(stmt, start)
        } else if (this.consumeIf(Keyword.FAMILY)) {
          stmt = new model.AlterOperatorFamilyStatement()
          this.parseAlterOperatorFamilyStatement(stmt, start)
        } else {
          stmt = new model.AlterOperatorStatement()
          this.parseAlterOperatorStatement(stmt, start)
        }
      } else if (this.consumeIf(Keyword.STATISTICS)) {
        stmt = new model.AlterStatisticsStatement()
        this.parseAlterStatisticsStatement(stmt, start)
      } else if (this.consumeIf(Keyword.FOREIGN)) {
        if (this.consumeIf(Keyword.DATA)) {
          this.consume(Keyword.WRAPPER)
          stmt = new model.AlterForeignDataWrapperStatement()
          this.parseAlterForeignDataWrapperStatement(stmt, start)
        } else if (this.consumeIf(Keyword.TABLE)) {
          stmt = new model.AlterForeignTableStatement()
          this.parseAlterForeignTableStatement(stmt, start)
        }
      } else if (this.consumeIf(Keyword.TABLE)) {
        stmt = new model.AlterTableStatement()
        this.parseAlterTableStatement(stmt, start)
      } else if (this.consumeIf(Keyword.SEQUENCE)) {
        stmt = new model.AlterSequenceStatement()
        this.parseAlterSequenceStatement(stmt, start)
      } else if (this.consumeIf(Keyword.VIEW)) {
        stmt = new model.AlterViewStatement()
        this.parseAlterViewStatement(stmt, start)
      } else if (this.consumeIf(Keyword.MATERIALIZED)) {
        stmt = new model.AlterMaterializedViewStatement()
        this.parseAlterMaterializedViewStatement(stmt, start)
      } else if (this.consumeIf(Keyword.PROCEDURE)) {
        stmt = new model.AlterProcedureStatement()
        this.parseAlterProcedureStatement(stmt, start)
      } else if (this.consumeIf(Keyword.FUNCTION)) {
        stmt = new model.AlterFunctionStatement()
        this.parseAlterFunctionStatement(stmt, start)
      } else if (this.consumeIf(Keyword.AGGREGATE)) {
        stmt = new model.AlterAggregateStatement()
        this.parseAlterAggregateStatement(stmt, start)
      } else if (this.consumeIf(Keyword.TRIGGER)) {
        stmt = new model.AlterTriggerStatement()
        this.parseAlterTriggerStatement(stmt, start)
      } else if (this.consumeIf(Keyword.ROUTINE)) {
        stmt = new model.AlterRoutineStatement()
        this.parseAlterRoutineStatement(stmt, start)
      } else if (this.consumeIf(Keyword.TEXT)) {
        this.consume(Keyword.SEARCH)
        if (this.consumeIf(Keyword.CONFIGURATION)) {
          stmt = new model.AlterTextSearchConfigurationStatement()
          this.parseAlterTextSearchConfigurationStatement(stmt, start)
        } else if (this.consumeIf(Keyword.DICTIONARY)) {
          stmt = new model.AlterTextSearchDictionaryStatement()
          this.parseAlterTextSearchDictionaryStatement(stmt, start)
        } else if (this.consumeIf(Keyword.PARSER)) {
          stmt = new model.AlterTextSearchParserStatement()
          this.parseAlterTextSearchParserStatement(stmt, start)
        } else if (this.consumeIf(Keyword.TEMPLATE)) {
          stmt = new model.AlterTextSearchTemplateStatement()
          this.parseAlterTextSearchTemplateStatement(stmt, start)
        }
      } else if (this.consumeIf(Keyword.POLICY)) {
        stmt = new model.AlterPolicyStatement()
        this.parseAlterPolicyStatement(stmt, start)
      } else if (this.consumeIf(Keyword.RULE)) {
        stmt = new model.AlterRuleStatement()
        this.parseAlterRuleStatement(stmt, start)
      } else if (this.consumeIf(Keyword.INDEX)) {
        stmt = new model.AlterIndexStatement()
        this.parseAlterIndexStatement(stmt, start)
      } else if (
        this.consumeIf(Keyword.DEFAULT)
      ) {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.DROP)) {
      if (this.consumeIf(Keyword.OWNED)) {
        stmt = new model.DropOwnedStatement()
        this.parseDropOwnedStatement(stmt, start)
      } else if (this.consumeIf(Keyword.DATABASE)) {
        stmt = new model.DropDatabaseStatement()
        this.parseDropDatabaseStatement(stmt, start)
      } else if (this.consumeIf(Keyword.ACCESS)) {
        this.consume(Keyword.METHOD)
        stmt = new model.DropAccessMethodStatement()
        this.parseDropAccessMethodStatement(stmt, start)
      } else if (this.consumeIf(Keyword.CAST)) {
        stmt = new model.DropCastStatement()
        this.parseDropCastStatement(stmt, start)
      } else if (this.consumeIf(Keyword.EVENT)) {
        this.consume(Keyword.TRIGGER)
        stmt = new model.DropEventTriggerStatement()
        this.parseDropEventTriggerStatement(stmt, start)
      } else if (this.consumeIf(Keyword.EXTENSION)) {
        stmt = new model.DropExtensionStatement()
        this.parseDropExtensionStatement(stmt, start)
      } else if (this.consumeIf(Keyword.PROCEDURAL)) {
        this.consume(Keyword.LANGUAGE)
        stmt = new model.DropLanguageStatement()
        stmt.procedural = true
        this.parseDropLanguageStatement(stmt, start)
      } else if (this.consumeIf(Keyword.LANGUAGE)) {
        stmt = new model.DropLanguageStatement()
        this.parseDropLanguageStatement(stmt, start)
      } else if (this.consumeIf(Keyword.TRANSFORM)) {
        stmt = new model.DropTransformStatement()
        this.parseDropTransformStatement(stmt, start)
      } else if (this.consumeIf(Keyword.PUBLICATION)) {
        stmt = new model.DropPublicationStatement()
        this.parseDropPublicationStatement(stmt, start)
      } else if (this.consumeIf(Keyword.SUBSCRIPTION)) {
        stmt = new model.DropSubscriptionStatement()
        this.parseDropSubscriptionStatement(stmt, start)
      } else if (this.consumeIf(Keyword.SERVER)) {
        stmt = new model.DropServerStatement()
        this.parseDropServerStatement(stmt, start)
      } else if (this.consumeIf(Keyword.TABLESPACE)) {
        stmt = new model.DropTablespaceStatement()
        this.parseDropTablespaceStatement(stmt, start)
      } else if (this.consumeIf(Keyword.TYPE)) {
        stmt = new model.DropTypeStatement()
        this.parseDropTypeStatement(stmt, start)
      } else if (this.consumeIf(Keyword.GROUP) || this.consumeIf(Keyword.ROLE)) {
        stmt = new model.DropRoleStatement()
        this.parseDropRoleStatement(stmt, start)
      } else if (this.consumeIf(Keyword.USER)) {
        if (this.consumeIf(Keyword.MAPPING)) {
          stmt = new model.DropUserMappingStatement()
          this.parseDropUserMappingStatement(stmt, start)
        } else {
          stmt = new model.DropRoleStatement()
          stmt.login = true
          this.parseDropRoleStatement(stmt, start)
        }
      } else if (this.consumeIf(Keyword.SCHEMA)) {
        stmt = new model.DropSchemaStatement()
        this.parseDropSchemaStatement(stmt, start)
      } else if (this.consumeIf(Keyword.COLLATION)) {
        stmt = new model.DropCollationStatement()
        this.parseDropCollationStatement(stmt, start)
      } else if (this.consumeIf(Keyword.CONVERSION)) {
        stmt = new model.DropConversionStatement()
        this.parseDropConversionStatement(stmt, start)
      } else if (this.consumeIf(Keyword.DOMAIN)) {
        stmt = new model.DropDomainStatement()
        this.parseDropDomainStatement(stmt, start)
      } else if (this.consumeIf(Keyword.OPERATOR)) {
        if (this.consumeIf(Keyword.CLASS)) {
          stmt = new model.DropOperatorClassStatement()
          this.parseDropOperatorClassStatement(stmt, start)
        } else if (this.consumeIf(Keyword.FAMILY)) {
          stmt = new model.DropOperatorFamilyStatement()
          this.parseDropOperatorFamilyStatement(stmt, start)
        } else {
          stmt = new model.DropOperatorStatement()
          this.parseDropOperatorStatement(stmt, start)
        }
      } else if (this.consumeIf(Keyword.STATISTICS)) {
        stmt = new model.DropStatisticsStatement()
        this.parseDropStatisticsStatement(stmt, start)
      } else if (this.consumeIf(Keyword.FOREIGN)) {
        if (this.consumeIf(Keyword.DATA)) {
          this.consume(Keyword.WRAPPER)
          stmt = new model.DropForeignDataWrapperStatement()
          this.parseDropForeignDataWrapperStatement(stmt, start)
        } else if (this.consumeIf(Keyword.TABLE)) {
          stmt = new model.DropForeignTableStatement()
          this.parseDropForeignTableStatement(stmt, start)
        } else if (this.consumeIf(Keyword.TABLE)) {
          stmt = new model.DropTableStatement()
          this.parseDropTableStatement(stmt, start)
        } else if (this.consumeIf(Keyword.SEQUENCE)) {
          stmt = new model.DropSequenceStatement()
          this.parseDropSequenceStatement(stmt, start)
        } else if (this.consumeIf(Keyword.VIEW)) {
          stmt = new model.DropViewStatement()
          this.parseDropViewStatement(stmt, start)
        } else if (this.consumeIf(Keyword.MATERIALIZED)) {
          stmt = new model.DropMaterializedViewStatement()
          this.parseDropMaterializedViewStatement(stmt, start)
        } else if (this.consumeIf(Keyword.PROCEDURE)) {
          stmt = new model.DropProcedureStatement()
          this.parseDropProcedureStatement(stmt, start)
        } else if (this.consumeIf(Keyword.FUNCTION)) {
          stmt = new model.DropFunctionStatement()
          this.parseDropFunctionStatement(stmt, start)
        } else if (this.consumeIf(Keyword.AGGREGATE)) {
          stmt = new model.DropAggregateStatement()
          this.parseDropAggregateStatement(stmt, start)
        } else if (this.consumeIf(Keyword.TRIGGER)) {
          stmt = new model.DropTriggerStatement()
          this.parseDropTriggerStatement(stmt, start)
        } else if (this.consumeIf(Keyword.TEXT)) {
          this.consume(Keyword.SEARCH)
          if (this.consumeIf(Keyword.CONFIGURATION)) {
            stmt = new model.DropTextSearchConfigurationStatement()
            this.parseDropTextSearchConfigurationStatement(stmt, start)
          } else if (this.consumeIf(Keyword.DICTIONARY)) {
            stmt = new model.DropTextSearchDictionaryStatement()
            this.parseDropTextSearchDictionaryStatement(stmt, start)
          } else if (this.consumeIf(Keyword.PARSER)) {
            stmt = new model.DropTextSearchParserStatement()
            this.parseDropTextSearchParserStatement(stmt, start)
          } else if (this.consumeIf(Keyword.TEMPLATE)) {
            stmt = new model.DropTextSearchTemplateStatement()
            this.parseDropTextSearchTemplateStatement(stmt, start)
          }
        } else if (this.consumeIf(Keyword.POLICY)) {
          stmt = new model.DropPolicyStatement()
          this.parseDropPolicyStatement(stmt, start)
        } else if (this.consumeIf(Keyword.RULE)) {
          stmt = new model.DropRuleStatement()
          this.parseDropRuleStatement(stmt, start)
        } else if (this.consumeIf(Keyword.INDEX)) {
          stmt = new model.DropIndexStatement()
          this.parseDropIndexStatement(stmt, start)
        }
      } else if (this.consumeIf(Keyword.REASSIGN)) {
        this.consume(Keyword.OWNED)
        stmt = new model.ReassignOwnedStatement()
        this.parseReassignOwnedStatement(stmt, start)
      } else if (this.consumeIf(Keyword.SECURITY)) {
        this.consume(Keyword.LABEL)
        stmt = new model.SecurityLabelStatement()
        this.parseSecurityLabelStatement(stmt, start)
      } else if (this.consumeIf(Keyword.TRUNCATE)) {
        stmt = new model.TruncateStatement()
        this.parseTruncateStatement(stmt, start)
      } else if (this.consumeIf(Keyword.COMMENT)) {
        stmt = new model.CommentStatement()
        this.parseCommentStatement(stmt, start)
      } else if (this.consumeIf(Keyword.GRANT)) {
        stmt = new model.GrantStatement()
        this.parseGrantStatement(stmt, start)
      } else if (this.consumeIf(Keyword.REVOKE)) {
        stmt = new model.RevokeStatement()
        this.parseRevokeStatement(stmt, start)
      } else if (this.consumeIf(Keyword.LOCK)) {
        stmt = new model.LockStatement()
        this.parseLockStatement(stmt, start)
      } else if (this.consumeIf(Keyword.START)) {
        this.consume(Keyword.TRANSACTION)
        stmt = new model.StartTransactionStatement()
        this.parseStartTransactionStatement(stmt, start)
      } else if (this.consumeIf(Keyword.BEGIN)) {
        stmt = new model.BeginStatement()
        this.parseBeginStatement(stmt, start)
      } else if (this.consumeIf(Keyword.SAVEPOINT)) {
        stmt = new model.SavepointStatement()
        this.parseSavepointStatement(stmt, start)
      } else if (this.consumeIf(Keyword.RELEASE)) {
        this.consume(Keyword.SAVEPOINT)
        stmt = new model.ReleaseSavepointStatement()
        this.parseReleaseSavepointStatement(stmt, start)
      } else if (this.consumeIf(Keyword.COMMIT)) {
        if (this.consumeIf(Keyword.PREPARED)) {
          stmt = new model.CommitPreparedStatement()
          this.parseCommitPreparedStatement(stmt, start)
        } else {
          stmt = new model.CommitStatement()
          this.parseCommitStatement(stmt, start)
        }
      } else if (this.consumeIf(Keyword.END)) {
        stmt = new model.EndStatement()
        this.parseEndStatement(stmt, start)
      } else if (this.consumeIf(Keyword.ROLLBACK)) {
        if (this.consumeIf(Keyword.PREPARED)) {
          stmt = new model.RollbackPreparedStatement()
          this.parseRollbackPreparedStatement(stmt, start)
        } else {
          stmt = new model.RollbackStatement()
          this.parseRollbackStatement(stmt, start)
        }
      } else if (this.consumeIf(Keyword.ABORT)) {
        stmt = new model.AbortStatement()
        this.parseAbortStatement(stmt, start)
      } else if (this.consumeIf(Keyword.DISCARD)) {
        stmt = new model.DiscardStatement()
        this.parseDiscardStatement(stmt, start)
      } else if (this.consumeIf(Keyword.EXPLAIN)) {
        stmt = new model.ExplainStatement()
        this.parseExplainStatement(stmt, start)
      } else if (this.consumeIf(Keyword.ANALYZE)) {
        stmt = new model.AnalyzeStatement()
        this.parseAnalyzeStatement(stmt, start)
      } else if (this.consumeIf(Keyword.CLUSTER)) {
        stmt = new model.ClusterStatement()
        this.parseClusterStatement(stmt, start)
      } else if (this.consumeIf(Keyword.REFRESH)) {
        this.consume(Keyword.MATERIALIZED, Keyword.VIEW)
        stmt = new model.RefreshMaterializedViewStatement()
        this.parseRefreshMaterializedViewStatement(stmt, start)
      } else if (this.consumeIf(Keyword.REINDEX)) {
        let verbose = false
        if (this.consumeIf(Keyword.VERBOSE)) {
          verbose = true
        }
        if (this.consumeIf(Keyword.SYSTEM)) {
          stmt = new model.ReindexSystemStatement()
          this.parseReindexSystemStatement(stmt, start)
        } else if (this.consumeIf(Keyword.DATABASE)) {
          stmt = new model.ReindexDatabaseStatement()
          this.parseReindexDatabaseStatement(stmt, start)
        } else if (this.consumeIf(Keyword.SCHEMA)) {
          stmt = new model.ReindexSchemaStatement()
          this.parseReindexSchemaStatement(stmt, start)
        } else if (this.consumeIf(Keyword.TABLE)) {
          stmt = new model.ReindexTableStatement()
          this.parseReindexTableStatement(stmt, start)
        } else if (this.consumeIf(Keyword.INDEX)) {
          stmt = new model.ReindexIndexStatement()
          this.parseReindexIndexStatement(stmt, start)
        }
      } else if (this.consumeIf(Keyword.VACUUM)) {
        stmt = new model.VacuumStatement()
        this.parseVacuumStatement(stmt, start)
      } else if (this.consumeIf(Keyword.LOAD)) {
        stmt = new model.LoadStatement()
        this.parseLoadStatement(stmt, start)
      } else if (this.consumeIf(Keyword.IMPORT)) {
        this.consume(Keyword.FOREIGN, Keyword.SCHEMA)
        stmt = new model.ImportForeignSchemaStatement()
        this.parseImportForeignSchemaStatement(stmt, start)
      } else if (this.consumeIf(Keyword.COPY)) {
        stmt = new model.CopyStatement()
        this.parseCopyStatement(stmt, start)
      } else if (this.consumeIf(Keyword.CHECKPOINT)) {
        stmt = new model.CheckpointStatement()
        this.parseCheckpointStatement(stmt, start)
      } else if (this.consumeIf(Keyword.PREPARE)) {
        if (this.consumeIf(Keyword.TRANSACTION)) {
          stmt = new model.PrepareTransactionStatement()
          this.parsePrepareTransactionStatement(stmt, start)
        } else {
          stmt = new model.PrepareStatement()
          this.parsePrepareStatement(stmt, start)
        }
      } else if (this.consumeIf(Keyword.EXECUTE)) {
        stmt = new model.ExecuteStatement()
        this.parseExecuteStatement(stmt, start)
      } else if (this.consumeIf(Keyword.DEALLOCATE)) {
        stmt = new model.DeallocateStatement()
        this.parseDeallocateStatement(stmt, start)
      } else if (this.consumeIf(Keyword.DECLARE)) {
        stmt = new model.DeclareStatement()
        this.parseDeclareStatement(stmt, start)
      } else if (this.consumeIf(Keyword.FETCH)) {
        stmt = new model.FetchStatement()
        this.parseFetchStatement(stmt, start)
      } else if (this.consumeIf(Keyword.MOVE)) {
        stmt = new model.MoveStatement()
        this.parseMoveStatement(stmt, start)
      } else if (this.consumeIf(Keyword.CLOSE)) {
        stmt = new model.CloseStatement()
        this.parseCloseStatement(stmt, start)
      } else if (this.consumeIf(Keyword.LISTEN)) {
        stmt = new model.ListenStatement()
        this.parseListenStatement(stmt, start)
      } else if (this.consumeIf(Keyword.NOTIFY)) {
        stmt = new model.NotifyStatement()
        this.parseNotifyStatement(stmt, start)
      } else if (this.consumeIf(Keyword.UNLISTEN)) {
        stmt = new model.UnlistenStatement()
        this.parseUnlistenStatement(stmt, start)
      } else if (this.consumeIf(Keyword.SET)) {
        if (this.consumeIf(Keyword.CONSTRAINT)) {
          stmt = new model.SetConstraintStatement()
          this.parseSetConstraintStatement(stmt, start)
        } else if (this.consumeIf(Keyword.ROLE)) {
          stmt = new model.SetRoleStatement()
          this.parseSetRoleStatement(stmt, start)
        } else if (this.consumeIf(Keyword.SESSION)) {
          this.consume(Keyword.AUTHORIZATION)
          stmt = new model.SetSessionAuthorizationStatement()
          this.parseSetSessionAuthorizationStatement(stmt, start)
        } else if (this.consumeIf(Keyword.TRANSACTION)) {
          stmt = new model.SetTransactionStatement()
          this.parseSetTransactionStatement(stmt, start)
        } else {
          stmt = new model.SetStatement()
          this.parseSetStatement(stmt, start)
        }
      } else if (this.consumeIf(Keyword.RESET)) {
        stmt = new model.ResetStatement()
        this.parseResetStatement(stmt, start)
      } else if (this.consumeIf(Keyword.SHOW)) {
        stmt = new model.ShowStatement()
        this.parseShowStatement(stmt, start)
      } else if (this.consumeIf(Keyword.CALL)) {
        stmt = new model.CallStatement()
        this.parseCallStatement(stmt, start)
      } else if (this.consumeIf(Keyword.DO)) {
        stmt = new model.DoStatement()
        this.parseDoStatement(stmt, start)
      } else if (this.consumeIf(Keyword.VALUES)) {
        stmt = new model.ValuesStatement()
        this.parseValuesStatement(stmt, start)
      } else {
        if (this.peekIf(Keyword.WITH)) {
          this.withClause()
        }
        if (this.consumeIf(Keyword.INSERT)) {
          stmt = new model.InsertStatement()
          this.parseInsertStatement(stmt, start)
        } else if (this.consumeIf(Keyword.UPDATE)) {
          stmt = new model.UpdateStatement()
          this.parseUpdateStatement(stmt, start)
        } else if (this.consumeIf(Keyword.DELETE)) {
          stmt = new model.DeleteStatement()
          this.parseDeleteStatement(stmt, start)
        } else if (this.peekIf(Keyword.SELECT)) {
          stmt = new model.SelectStatement()
          this.parseSelectStatement(stmt, start)
        }
      }
    }

    if (!stmt) {
      throw this.createParseError()
    }

    if (typeof this.options.filename === "string") {
      stmt.filename = this.options.filename
    }
    stmt.tokens = this.tokens.slice(start, this.pos)

    return stmt
  }

  private parseCreateDatabaseStatement(stmt: model.CreateDatabaseStatement, start: number) {

  }

  private parseCreateAccessMethodStatement(stmt: model.CreateAccessMethodStatement, start: number) {

  }

  private parseCreateCastStatement(stmt: model.CreateCastStatement, start: number) {

  }

  private parseCreateEventTriggerStatement(stmt: model.CreateEventTriggerStatement, start: number) {

  }

  private parseCreateExtensionStatement(stmt: model.CreateExtensionStatement, start: number) {

  }

  private parseCreateLanguageStatement(stmt: model.CreateLanguageStatement, start: number) {

  }

  private parseCreateTransformStatement(stmt: model.CreateTransformStatement, start: number) {

  }

  private parseCreatePublicationStatement(stmt: model.CreatePublicationStatement, start: number) {

  }

  private parseCreateSubscriptionStatement(stmt: model.CreateSubscriptionStatement, start: number) {

  }

  private parseCreateServerStatement(stmt: model.CreateServerStatement, start: number) {

  }

  private parseCreateTablespaceStatement(stmt: model.CreateTablespaceStatement, start: number) {

  }

  private parseCreateTypeStatement(stmt: model.CreateTypeStatement, start: number) {

  }

  private parseCreateRoleStatement(stmt: model.CreateRoleStatement, start: number) {

  }

  private parseCreateUserMappingStatement(stmt: model.CreateUserMappingStatement, start: number) {

  }

  private parseCreateSchemaStatement(stmt: model.CreateSchemaStatement, start: number) {

  }

  private parseCreateCollationStatement(stmt: model.CreateCollationStatement, start: number) {

  }

  private parseCreateConversionStatement(stmt: model.CreateConversionStatement, start: number) {

  }

  private parseCreateDomainStatement(stmt: model.CreateDomainStatement, start: number) {

  }

  private parseCreateOperatorClassStatement(stmt: model.CreateOperatorClassStatement, start: number) {

  }

  private parseCreateOperatorFamilyStatement(stmt: model.CreateOperatorFamilyStatement, start: number) {

  }

  private parseCreateOperatorStatement(stmt: model.CreateOperatorStatement, start: number) {

  }

  private parseCreateStatisticsStatement(stmt: model.CreateStatisticsStatement, start: number) {

  }

  private parseCreateTableStatement(stmt: model.CreateTableStatement, start: number) {

  }

  private parseCreateSequenceStatement(stmt: model.CreateSequenceStatement, start: number) {

  }

  private parseCreateViewStatement(stmt: model.CreateViewStatement, start: number) {

  }

  private parseCreateMaterializedViewStatement(stmt: model.CreateMaterializedViewStatement, start: number) {

  }

  private parseCreateProcedureStatement(stmt: model.CreateProcedureStatement, start: number) {

  }

  private parseCreateFunctionStatement(stmt: model.CreateFunctionStatement, start: number) {

  }

  private parseCreateAggregateStatement(stmt: model.CreateAggregateStatement, start: number) {

  }

  private parseCreateTriggerStatement(stmt: model.CreateTriggerStatement, start: number) {

  }

  private parseCreateRuleStatement(stmt: model.CreateRuleStatement, start: number) {

  }

  private parseCreateForeignDataWrapperStatement(stmt: model.CreateForeignDataWrapperStatement, start: number) {

  }

  private parseCreateForeignTableStatement(stmt: model.CreateForeignTableStatement, start: number) {

  }

  private parseCreateTextSearchConfigurationStatement(stmt: model.CreateTextSearchConfigurationStatement, start: number) {

  }

  private parseCreateTextSearchDictionaryStatement(stmt: model.CreateTextSearchDictionaryStatement, start: number) {

  }

  private parseCreateTextSearchParserStatement(stmt: model.CreateTextSearchParserStatement, start: number) {

  }

  private parseCreateTextSearchTemplateStatement(stmt: model.CreateTextSearchTemplateStatement, start: number) {

  }

  private parseCreatePolicyStatement(stmt: model.CreatePolicyStatement, start: number) {

  }

  private parseCreateIndexStatement(stmt: model.CreateIndexStatement, start: number) {

  }

  private parseAlterSystemStatement(stmt: model.AlterSystemStatement, start: number) {

  }

  private parseAlterDatabaseStatement(stmt: model.AlterDatabaseStatement, start: number) {

  }

  private parseAlterEventTriggerStatement(stmt: model.AlterEventTriggerStatement, start: number) {

  }

  private parseAlterExtensionStatement(stmt: model.AlterExtensionStatement, start: number) {

  }

  private parseAlterLanguageStatement(stmt: model.AlterLanguageStatement, start: number) {

  }

  private parseAlterPublicationStatement(stmt: model.AlterPublicationStatement, start: number) {

  }

  private parseAlterSubscriptionStatement(stmt: model.AlterSubscriptionStatement, start: number) {

  }

  private parseAlterServerStatement(stmt: model.AlterServerStatement, start: number) {

  }

  private parseAlterTablespaceStatement(stmt: model.AlterTablespaceStatement, start: number) {

  }

  private parseAlterTypeStatement(stmt: model.AlterTypeStatement, start: number) {

  }

  private parseAlterRoleStatement(stmt: model.AlterRoleStatement, start: number) {

  }

  private parseAlterUserMappingStatement(stmt: model.AlterUserMappingStatement, start: number) {

  }

  private parseAlterLargeObjectStatement(stmt: model.AlterLargeObjectStatement, start: number) {

  }

  private parseAlterSchemaStatement(stmt: model.AlterSchemaStatement, start: number) {

  }

  private parseAlterCollationStatement(stmt: model.AlterCollationStatement, start: number) {

  }

  private parseAlterDefaultPrivilegesStatement(stmt: model.AlterDefaultPrivilegesStatement, start: number) {

  }

  private parseAlterConversionStatement(stmt: model.AlterConversionStatement, start: number) {

  }

  private parseAlterDomainStatement(stmt: model.AlterDomainStatement, start: number) {

  }

  private parseAlterOperatorClassStatement(stmt: model.AlterOperatorClassStatement, start: number) {

  }

  private parseAlterOperatorFamilyStatement(stmt: model.AlterOperatorFamilyStatement, start: number) {

  }

  private parseAlterOperatorStatement(stmt: model.AlterOperatorStatement, start: number) {

  }

  private parseAlterStatisticsStatement(stmt: model.AlterStatisticsStatement, start: number) {

  }

  private parseAlterTableStatement(stmt: model.AlterTableStatement, start: number) {

  }

  private parseAlterSequenceStatement(stmt: model.AlterSequenceStatement, start: number) {

  }

  private parseAlterViewStatement(stmt: model.AlterViewStatement, start: number) {

  }

  private parseAlterMaterializedViewStatement(stmt: model.AlterMaterializedViewStatement, start: number) {

  }

  private parseAlterProcedureStatement(stmt: model.AlterProcedureStatement, start: number) {

  }

  private parseAlterFunctionStatement(stmt: model.AlterFunctionStatement, start: number) {

  }

  private parseAlterAggregateStatement(stmt: model.AlterAggregateStatement, start: number) {

  }

  private parseAlterTriggerStatement(stmt: model.AlterTriggerStatement, start: number) {

  }

  private parseAlterRuleStatement(stmt: model.AlterRuleStatement, start: number) {

  }

  private parseAlterForeignDataWrapperStatement(stmt: model.AlterForeignDataWrapperStatement, start: number) {

  }

  private parseAlterForeignTableStatement(stmt: model.AlterForeignTableStatement, start: number) {

  }

  private parseAlterRoutineStatement(stmt: model.AlterRoutineStatement, start: number) {

  }

  private parseAlterTextSearchConfigurationStatement(stmt: model.AlterTextSearchConfigurationStatement, start: number) {

  }

  private parseAlterTextSearchDictionaryStatement(stmt: model.AlterTextSearchDictionaryStatement, start: number) {

  }

  private parseAlterTextSearchParserStatement(stmt: model.AlterTextSearchParserStatement, start: number) {

  }

  private parseAlterTextSearchTemplateStatement(stmt: model.AlterTextSearchTemplateStatement, start: number) {

  }

  private parseAlterPolicyStatement(stmt: model.AlterPolicyStatement, start: number) {

  }

  private parseAlterIndexStatement(stmt: model.AlterIndexStatement, start: number) {

  }

  private parseDropOwnedStatement(stmt: model.DropOwnedStatement, start: number) {

  }

  private parseDropDatabaseStatement(stmt: model.DropDatabaseStatement, start: number) {

  }

  private parseDropAccessMethodStatement(stmt: model.DropAccessMethodStatement, start: number) {

  }

  private parseDropCastStatement(stmt: model.DropCastStatement, start: number) {

  }

  private parseDropEventTriggerStatement(stmt: model.DropEventTriggerStatement, start: number) {

  }

  private parseDropExtensionStatement(stmt: model.DropExtensionStatement, start: number) {

  }

  private parseDropLanguageStatement(stmt: model.DropLanguageStatement, start: number) {

  }

  private parseDropTransformStatement(stmt: model.DropTransformStatement, start: number) {

  }

  private parseDropPublicationStatement(stmt: model.DropPublicationStatement, start: number) {

  }

  private parseDropSubscriptionStatement(stmt: model.DropSubscriptionStatement, start: number) {

  }

  private parseDropServerStatement(stmt: model.DropServerStatement, start: number) {

  }

  private parseDropTablespaceStatement(stmt: model.DropTablespaceStatement, start: number) {

  }

  private parseDropTypeStatement(stmt: model.DropTypeStatement, start: number) {

  }

  private parseDropRoleStatement(stmt: model.DropRoleStatement, start: number) {

  }

  private parseDropUserMappingStatement(stmt: model.DropUserMappingStatement, start: number) {

  }

  private parseDropSchemaStatement(stmt: model.DropSchemaStatement, start: number) {

  }

  private parseDropCollationStatement(stmt: model.DropCollationStatement, start: number) {

  }

  private parseDropConversionStatement(stmt: model.DropConversionStatement, start: number) {

  }

  private parseDropDomainStatement(stmt: model.DropDomainStatement, start: number) {

  }

  private parseDropOperatorClassStatement(stmt: model.DropOperatorClassStatement, start: number) {

  }

  private parseDropOperatorFamilyStatement(stmt: model.DropOperatorFamilyStatement, start: number) {

  }

  private parseDropOperatorStatement(stmt: model.DropOperatorStatement, start: number) {

  }

  private parseDropStatisticsStatement(stmt: model.DropStatisticsStatement, start: number) {

  }

  private parseDropTableStatement(stmt: model.DropTableStatement, start: number) {

  }

  private parseDropSequenceStatement(stmt: model.DropSequenceStatement, start: number) {

  }

  private parseDropViewStatement(stmt: model.DropViewStatement, start: number) {

  }

  private parseDropMaterializedViewStatement(stmt: model.DropMaterializedViewStatement, start: number) {

  }

  private parseDropProcedureStatement(stmt: model.DropProcedureStatement, start: number) {

  }

  private parseDropFunctionStatement(stmt: model.DropFunctionStatement, start: number) {

  }

  private parseDropAggregateStatement(stmt: model.DropAggregateStatement, start: number) {

  }

  private parseDropForeignDataWrapperStatement(stmt: model.DropForeignDataWrapperStatement, start: number) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.foreignDataWrappers.push(this.identifier())
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = "CASCADE"
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = "RESTRICT"
    }
  }

  private parseDropForeignTableStatement(stmt: model.DropForeignTableStatement, start: number) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.foreignTables.push(this.schemaObject())
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = "CASCADE"
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = "RESTRICT"
    }
  }

  private parseDropTextSearchConfigurationStatement(stmt: model.DropTextSearchConfigurationStatement, start: number) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.textSearchConfiguration = this.schemaObject()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = "CASCADE"
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = "RESTRICT"
    }
  }

  private parseDropTextSearchDictionaryStatement(stmt: model.DropTextSearchDictionaryStatement, start: number) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.textSearchDictionary = this.schemaObject()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = "CASCADE"
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = "RESTRICT"
    }
  }

  private parseDropTextSearchParserStatement(stmt: model.DropTextSearchParserStatement, start: number) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.textSearchParser = this.schemaObject()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = "CASCADE"
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = "RESTRICT"
    }
  }

  private parseDropTextSearchTemplateStatement(stmt: model.DropTextSearchTemplateStatement, start: number) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.textSearchTemplate = this.schemaObject()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = "CASCADE"
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = "RESTRICT"
    }
  }

  private parseDropPolicyStatement(stmt: model.DropPolicyStatement, start: number) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.name = this.identifier()
    this.consume(Keyword.ON)
    stmt.table = this.schemaObject()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = "CASCADE"
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = "RESTRICT"
    }
  }

  private parseDropRuleStatement(stmt: model.DropRuleStatement, start: number) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.name = this.identifier()
    this.consume(Keyword.ON)
    stmt.table = this.schemaObject()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = "CASCADE"
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = "RESTRICT"
    }
  }

  private parseDropTriggerStatement(stmt: model.DropTriggerStatement, start: number) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.name = this.identifier()
    this.consume(Keyword.ON)
    stmt.table = this.schemaObject()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = "CASCADE"
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = "RESTRICT"
    }
  }

  private parseDropIndexStatement(stmt: model.DropIndexStatement, start: number) {
    if (this.consumeIf(Keyword.CONCURRENTLY)) {
      stmt.concurrently = true
    }
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.indexes.push(this.schemaObject())
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = "CASCADE"
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = "RESTRICT"
    }
  }

  private parseReassignOwnedStatement(stmt: model.ReassignOwnedStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseSecurityLabelStatement(stmt: model.SecurityLabelStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseTruncateStatement(stmt: model.TruncateStatement, start: number) {
    this.consumeIf(Keyword.TABLE)
    if (this.consumeIf(Keyword.ONLY)) {
      stmt.only = true
    }
    stmt.table = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseCommentStatement(stmt: model.CommentStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseGrantStatement(stmt: model.GrantStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseRevokeStatement(stmt: model.RevokeStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseLockStatement(stmt: model.LockStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseStartTransactionStatement(stmt: model.StartTransactionStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseBeginStatement(stmt: model.BeginStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseSavepointStatement(stmt: model.SavepointStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseReleaseSavepointStatement(stmt: model.ReleaseSavepointStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseCommitPreparedStatement(stmt: model.CommitPreparedStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseCommitStatement(stmt: model.CommitStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseEndStatement(stmt: model.EndStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseRollbackPreparedStatement(stmt: model.RollbackPreparedStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseRollbackStatement(stmt: model.RollbackStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAbortStatement(stmt: model.AbortStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseDiscardStatement(stmt: model.DiscardStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseExplainStatement(stmt: model.ExplainStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAnalyzeStatement(stmt: model.AnalyzeStatement, start: number) {
    //TODO
  }

  private parseClusterStatement(stmt: model.ClusterStatement, start: number) {
    if (this.consumeIf(Keyword.VERBOSE)) {
      stmt.verbose = true
    }
    if (this.token()) {
      stmt.table = this.schemaObject()
    }
  }

  private parseRefreshMaterializedViewStatement(stmt: model.RefreshMaterializedViewStatement, start: number) {
    if (this.consumeIf(Keyword.CONCURRENTLY)) {
      stmt.concurrently = true
    }
    stmt.materializedView = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseReindexSystemStatement(stmt: model.ReindexSystemStatement, start: number) {
    if (this.consumeIf(Keyword.CONCURRENTLY)) {
      stmt.concurrently = true
    }
    stmt.schema = this.identifier()
  }

  private parseReindexDatabaseStatement(stmt: model.ReindexDatabaseStatement, start: number) {
    if (this.consumeIf(Keyword.CONCURRENTLY)) {
      stmt.concurrently = true
    }
    stmt.schema = this.identifier()
  }

  private parseReindexSchemaStatement(stmt: model.ReindexSchemaStatement, start: number) {
    if (this.consumeIf(Keyword.CONCURRENTLY)) {
      stmt.concurrently = true
    }
    stmt.schema = this.identifier()
  }

  private parseReindexTableStatement(stmt: model.ReindexTableStatement, start: number) {
    if (this.consumeIf(Keyword.CONCURRENTLY)) {
      stmt.concurrently = true
    }
    stmt.table = this.schemaObject()
  }

  private parseReindexIndexStatement(stmt: model.ReindexIndexStatement, start: number) {
    if (this.consumeIf(Keyword.CONCURRENTLY)) {
      stmt.concurrently = true
    }
    stmt.index = this.schemaObject()
  }

  private parseVacuumStatement(stmt: model.VacuumStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseLoadStatement(stmt: model.LoadStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseImportForeignSchemaStatement(stmt: model.ImportForeignSchemaStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseCopyStatement(stmt: model.CopyStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseCheckpointStatement(stmt: model.CheckpointStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parsePrepareTransactionStatement(stmt: model.PrepareTransactionStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parsePrepareStatement(stmt: model.PrepareStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseExecuteStatement(stmt: model.ExecuteStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseDeallocateStatement(stmt: model.DeallocateStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseDeclareStatement(stmt: model.DeclareStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseFetchStatement(stmt: model.FetchStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseMoveStatement(stmt: model.MoveStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseCloseStatement(stmt: model.CloseStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseListenStatement(stmt: model.ListenStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseNotifyStatement(stmt: model.NotifyStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseUnlistenStatement(stmt: model.UnlistenStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseSetConstraintStatement(stmt: model.SetConstraintStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseSetRoleStatement(stmt: model.SetRoleStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseSetSessionAuthorizationStatement(stmt: model.SetSessionAuthorizationStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseSetTransactionStatement(stmt: model.SetTransactionStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseSetStatement(stmt: model.SetStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseResetStatement(stmt: model.ResetStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseShowStatement(stmt: model.ShowStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseCallStatement(stmt: model.CallStatement, start: number) {
    stmt.procedure = this.schemaObject()
    this.consume(TokenType.LeftParen)
    while (this.token() && !this.peekIf(TokenType.RightParen)) {
      this.consume()
    }
    this.consume(TokenType.RightParen)
  }

  private parseDoStatement(stmt: model.DoStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseValuesStatement(stmt: model.ValuesStatement, start: number) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseInsertStatement(stmt: model.InsertStatement, start: number) {
    this.consume(Keyword.INTO)
    stmt.table = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseUpdateStatement(stmt: model.UpdateStatement, start: number) {
    if (this.consumeIf(Keyword.ONLY)) {
      stmt.only = true
    }
    stmt.table = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseDeleteStatement(stmt: model.DeleteStatement, start: number) {
    if (this.consumeIf(Keyword.ONLY)) {
      stmt.only = true
    }
    this.consumeIf(Keyword.FROM)
    stmt.table = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseSelectStatement(stmt: model.SelectStatement, start: number) {
    if (this.peekIf(Keyword.WITH)) {
      throw this.createParseError()
    }
    this.selectClause()
  }

  private selectClause() {
    if (this.peekIf(Keyword.WITH)) {
      this.withClause()
    }
    this.consume(Keyword.SELECT)
    let depth = 0
    while (this.token() &&
      !this.peekIf(TokenType.SemiColon) &&
      (depth == 0 && !this.peekIf(TokenType.RightParen)) &&
      (depth == 0 && !this.peekIf(Keyword.WITH))
    ) {
      if (this.consumeIf(TokenType.LeftParen)) {
        depth++
      } else if (this.consumeIf(TokenType.RightParen)) {
        depth--
      } else {
        this.consume()
      }
    }
  }

  private withClause() {
    const start = this.pos
    this.consume(Keyword.WITH)
    this.consumeIf(Keyword.RECURSIVE)
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      this.identifier()
      if (this.consumeIf(TokenType.LeftParen)) {
        for (let j = 0; j === 0 || this.consumeIf(TokenType.Comma); j++) {
          this.identifier()
        }
        this.consume(TokenType.RightParen)
      }
      this.consume(Keyword.AS)
      this.consume(TokenType.LeftParen)
      this.selectClause()
      this.consume(TokenType.RightParen)
    }
    return this.tokens.slice(start, this.pos)
  }

  private schemaObject() {
    const sobj = new model.SchemaObject()
    sobj.name = this.identifier()
    if (this.consumeIf(TokenType.Dot)) {
      sobj.schemaName = sobj.name
      sobj.name = this.identifier()
    }
    return sobj
  }

  private identifier() {
    if (this.consumeIf(TokenType.Identifier)) {
      return lcase(this.token(-1).text)
    } else if (this.consumeIf(TokenType.QuotedIdentifier)) {
      return unescape(dequote(this.token(-1).text))
    } else {
      throw this.createParseError()
    }
  }
}

const ReplaceReMap: {[key: string]: RegExp} = {
  '"': /""/g,
  "'": /''|\\(.)/g,
}

function dequote(text: string) {
  if (text.length >= 2) {
    const sc = text.charAt(0)
    const ec = text.charAt(text.length-1)
    if (sc === ec) {
      const re = ReplaceReMap[sc]
      let value = text.substring(1, text.length - 1)
      if (re) {
        if (sc === '"') {
          value = value.replace(re, (m, g1) => {
            switch (m) {
              case '""': return '"'
              case '\\"': return '"'
              case "\\'": return "'"
              case "\\0": return "\0"
              case "\\b": return "\b"
              case "\\n": return "\n"
              case "\\r": return "\r"
              case "\\t": return "\t"
              case "\\Z": return "\x1A"
              case "\\\\": return "\\"
              default: return g1
            }
          })
        } else {
          value = value.replace(re, sc)
        }
      }
      return value
    }
  }
  return text
}
