import Decimal from "decimal.js"
import { Statement } from "../models"
import {
  ITokenType,
  Token,
  Lexer,
  Parser,
  ParseError,
  AggregateParseError,
} from "../parser"
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
  static ALLOW_CONNECTIONS = new Keyword("ALLOW_CONNECTIONS")
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
  static BY = new Keyword("BY")
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
  static CONNECTION = new Keyword("CONNECTION")
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
  static ENCODING = new Keyword("ENCODING")
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
  static INOUT = new Keyword("INOUT")
  static INITIALLY = new Keyword("INITIALLY", { reserved: true })
  static INDEX = new Keyword("INDEX")
  static INNER = new Keyword("INNER")
  static INSERT = new Keyword("INSERT")
  static INTERSECT = new Keyword("INTERSECT", { reserved: true })
  static INTO = new Keyword("INTO", { reserved: true })
  static IS = new Keyword("IS")
  static IS_TEMPLATE = new Keyword("IS_TEMPLATE")
  static ISNULL = new Keyword("ISNULL")
  static JOIN = new Keyword("JOIN")
  static LABEL = new Keyword("LABEL")
  static LANGUAGE = new Keyword("LANGUAGE")
  static LATERAL = new Keyword("LATERAL", { reserved: true })
  static LARGE = new Keyword("LARGE")
  static LC_COLLATE = new Keyword("LC_COLLATE")
  static LC_CTYPE = new Keyword("LC_CTYPE")
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
  static NONE = new Keyword("NONE")
  static NOT = new Keyword("NOT", { reserved: true })
  static NOTIFY = new Keyword("NOTIFY")
  static NOTNULL = new Keyword("NOTNULL")
  static NULL = new Keyword("NULL", { reserved: true })
  static OBJECT = new Keyword("OBJECT")
  static OFF = new Keyword("OFF")
  static OFFSET = new Keyword("OFFSET", { reserved: true })
  static ON = new Keyword("ON", { reserved: true })
  static ONLY = new Keyword("ONLY", { reserved: true })
  static OPERATOR = new Keyword("OPERATOR")
  static OR = new Keyword("OR", { reserved: true })
  static ORDER = new Keyword("ORDER", { reserved: true })
  static OUT = new Keyword("OUT")
  static OUTER = new Keyword("OUTER")
  static OVERLAPS = new Keyword("OVERLAPS")
  static OWNED = new Keyword("OWNED")
  static OWNER = new Keyword("OWNER")
  static PARSER = new Keyword("PARSER")
  static PLACING = new Keyword("PLACING", { reserved: true })
  static POLICY = new Keyword("POLICY")
  static PREPARE = new Keyword("PREPARE")
  static PREPARED = new Keyword("PREPARED")
  static PRIMARY = new Keyword("PRIMARY", { reserved: true })
  static PRIVILEGES = new Keyword("PRIVILEGES")
  static PROCEDURAL = new Keyword("PROCEDURAL")
  static PROCEDURE = new Keyword("PROCEDURE")
  static PUBLIC = new Keyword("PUBLIC")
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
  static SKIP_LOCKED = new Keyword("SKIP_LOCKED")
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

  static OPE_EQ = new Keyword("=")
  static OPE_PLUS = new Keyword("+")
  static OPE_MINUS = new Keyword("-")
  static OPE_ASTER = new Keyword("*")

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
    if (
      token.type === TokenType.Identifier ||
      token.type === TokenType.Operator
    ) {
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
  private stmtStart = 0

  constructor(
    input: string,
    options: { [key: string]: any} = {},
  ) {
    super(input, new PostgresLexer(options), options)
  }

  root(): Statement[] {
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
        if (this.token() && !this.peekIf(TokenType.SemiColon)) {
          this.stmtStart = this.pos

          let stmt
          if (this.peekIf(TokenType.Command)) {
            stmt = this.command()
          } else {
            stmt = this.statement()
          }
          stmt.validate()
          root.push(stmt)
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
    stmt.tokens = this.tokens.slice(this.stmtStart, this.pos)
    return stmt
  }

  statement(): Statement {
    let stmt
    if (this.consumeIf(Keyword.CREATE)) {
      if (this.consumeIf(Keyword.DATABASE)) {
        stmt = new model.CreateDatabaseStatement()
        this.parseCreateDatabaseStatement(stmt)
      } else if (this.consumeIf(Keyword.ACCESS)) {
        this.consume(Keyword.METHOD)
        stmt = new model.CreateAccessMethodStatement()
        this.parseCreateAccessMethodStatement(stmt)
      } else if (this.consumeIf(Keyword.CAST)) {
        stmt = new model.CreateCastStatement()
        this.parseCreateCastStatement(stmt)
      } else if (this.consumeIf(Keyword.EVENT)) {
        this.consume(Keyword.TRIGGER)
        stmt = new model.CreateEventTriggerStatement()
        this.parseCreateEventTriggerStatement(stmt)
      } else if (this.consumeIf(Keyword.EXTENSION)) {
        stmt = new model.CreateExtensionStatement()
        this.parseCreateExtensionStatement(stmt)
      } else if (this.consumeIf(Keyword.TRUSTED)) {
        stmt = new model.CreateLanguageStatement()
        stmt.trusted = true
        if (this.consumeIf(Keyword.PROCEDURAL)) {
          stmt.procedural = true
        }
        this.consume(Keyword.LANGUAGE)
        this.parseCreateLanguageStatement(stmt)
      } else if (this.consumeIf(Keyword.PROCEDURAL)) {
        this.consume(Keyword.LANGUAGE)
        stmt = new model.CreateLanguageStatement()
        stmt.procedural = true
        this.parseCreateLanguageStatement(stmt)
      } else if (this.consumeIf(Keyword.LANGUAGE)) {
        stmt = new model.CreateLanguageStatement()
        this.parseCreateLanguageStatement(stmt)
      } else if (this.consumeIf(Keyword.TRANSFORM)) {
        stmt = new model.CreateTransformStatement()
        this.parseCreateTransformStatement(stmt)
      } else if (this.consumeIf(Keyword.PUBLICATION)) {
        stmt = new model.CreatePublicationStatement()
        this.parseCreatePublicationStatement(stmt)
      } else if (this.consumeIf(Keyword.SUBSCRIPTION)) {
        stmt = new model.CreateSubscriptionStatement()
        this.parseCreateSubscriptionStatement(stmt)
      } else if (this.consumeIf(Keyword.SERVER)) {
        stmt = new model.CreateServerStatement()
        this.parseCreateServerStatement(stmt)
      } else if (this.consumeIf(Keyword.TABLESPACE)) {
        stmt = new model.CreateTablespaceStatement()
        this.parseCreateTablespaceStatement(stmt)
      } else if (this.consumeIf(Keyword.TYPE)) {
        stmt = new model.CreateTypeStatement()
        this.parseCreateTypeStatement(stmt)
      } else if (this.consumeIf(Keyword.GROUP) || this.consumeIf(Keyword.ROLE)) {
        stmt = new model.CreateRoleStatement()
        this.parseCreateRoleStatement(stmt)
      } else if (this.consumeIf(Keyword.USER)) {
        if (this.consumeIf(Keyword.MAPPING)) {
          stmt = new model.CreateUserMappingStatement()
          this.parseCreateUserMappingStatement(stmt)
        } else {
          stmt = new model.CreateRoleStatement()
          stmt.login = true
          this.parseCreateRoleStatement(stmt)
        }
      } else if (this.consumeIf(Keyword.SCHEMA)) {
        stmt = new model.CreateSchemaStatement()
        this.parseCreateSchemaStatement(stmt)
      } else if (this.consumeIf(Keyword.COLLATION)) {
        stmt = new model.CreateCollationStatement()
        this.parseCreateCollationStatement(stmt)
      } else if (this.consumeIf(Keyword.DEFAULT, Keyword.CONVERSION)) {
        stmt = new model.CreateConversionStatement()
        stmt.default = true
        this.parseCreateConversionStatement(stmt)
      } else if (this.consumeIf(Keyword.CONVERSION)) {
        stmt = new model.CreateConversionStatement()
        this.parseCreateConversionStatement(stmt)
      } else if (this.consumeIf(Keyword.DOMAIN)) {
        stmt = new model.CreateDomainStatement()
        this.parseCreateDomainStatement(stmt)
      } else if (this.consumeIf(Keyword.OPERATOR)) {
        if (this.consumeIf(Keyword.CLASS)) {
          stmt = new model.CreateOperatorClassStatement()
          this.parseCreateOperatorClassStatement(stmt)
        } else if (this.consumeIf(Keyword.FAMILY)) {
          stmt = new model.CreateOperatorFamilyStatement()
          this.parseCreateOperatorFamilyStatement(stmt)
        } else {
          stmt = new model.CreateOperatorStatement()
          this.parseCreateOperatorStatement(stmt)
        }
      } else if (this.consumeIf(Keyword.STATISTICS)) {
        stmt = new model.CreateStatisticsStatement()
        this.parseCreateStatisticsStatement(stmt)
      } else if (this.consumeIf(Keyword.GLOBAL) || this.consumeIf(Keyword.LOCAL)) {
        stmt = new model.CreateTableStatement()
        if (this.consumeIf(Keyword.TEMPORARY) || this.consumeIf(Keyword.TEMP)) {
          stmt.temporary = true
        }
        if (this.consumeIf(Keyword.UNLOGGED)) {
          stmt.unlogged = true
        }
        this.consume(Keyword.TABLE)
        this.parseCreateTableStatement(stmt)
      } else if (this.consumeIf(Keyword.OR)) {
        this.consume(Keyword.REPLACE)
        if (this.consumeIf(Keyword.TEMPORARY) || this.consumeIf(Keyword.TEMP)) {
          if (this.consumeIf(Keyword.TABLE)) {
            stmt = new model.CreateTableStatement()
            stmt.orReplace = true
            stmt.temporary = true
            this.parseCreateTableStatement(stmt)
          } else if (this.consumeIf(Keyword.SEQUENCE)) {
            stmt = new model.CreateSequenceStatement()
            stmt.orReplace = true
            stmt.temporary = true
            this.parseCreateSequenceStatement(stmt)
          } else if (this.consumeIf(Keyword.RECURSIVE, Keyword.VIEW)) {
            stmt = new model.CreateViewStatement()
            stmt.orReplace = true
            stmt.temporary = true
            stmt.recursive = true
            this.parseCreateViewStatement(stmt)
          } else if (this.consumeIf(Keyword.VIEW)) {
            stmt = new model.CreateViewStatement()
            stmt.orReplace = true
            stmt.temporary = true
            this.parseCreateViewStatement(stmt)
          }
        } else if (this.consumeIf(Keyword.LANGUAGE)) {
          stmt = new model.CreateLanguageStatement()
          stmt.orReplace = true
          this.parseCreateLanguageStatement(stmt)
        } else if (this.consumeIf(Keyword.TRANSFORM)) {
          stmt = new model.CreateTransformStatement()
          stmt.orReplace = true
          this.parseCreateTransformStatement(stmt)
        } else if (this.consumeIf(Keyword.SEQUENCE)) {
          stmt = new model.CreateSequenceStatement()
          stmt.orReplace = true
          this.parseCreateSequenceStatement(stmt)
        } else if (this.consumeIf(Keyword.RECURSIVE, Keyword.VIEW)) {
          stmt = new model.CreateViewStatement()
          stmt.orReplace = true
          stmt.recursive = true
          this.parseCreateViewStatement(stmt)
        } else if (this.consumeIf(Keyword.VIEW)) {
          stmt = new model.CreateViewStatement()
          stmt.orReplace = true
          this.parseCreateViewStatement(stmt)
        } else if (this.consumeIf(Keyword.PROCEDURE)) {
          stmt = new model.CreateProcedureStatement()
          stmt.orReplace = true
          this.parseCreateProcedureStatement(stmt)
        } else if (this.consumeIf(Keyword.FUNCTION)) {
          stmt = new model.CreateFunctionStatement()
          stmt.orReplace = true
          this.parseCreateFunctionStatement(stmt)
        } else if (this.consumeIf(Keyword.AGGREGATE)) {
          stmt = new model.CreateAggregateStatement()
          stmt.orReplace = true
          this.parseCreateAggregateStatement(stmt)
        } else if (this.consumeIf(Keyword.RULE)) {
          stmt = new model.CreateRuleStatement()
          stmt.orReplace = true
          this.parseCreateRuleStatement(stmt)
        } else {
          this.consumeIf(Keyword.RECURSIVE)
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.TEMPORARY) || this.consumeIf(Keyword.TEMP)) {
        if (this.consumeIf(Keyword.UNLOGGED, Keyword.TABLE)) {
          stmt = new model.CreateTableStatement()
          stmt.temporary = true
          stmt.unlogged = true
          this.parseCreateTableStatement(stmt)
        } else if (this.consumeIf(Keyword.TABLE)) {
          stmt = new model.CreateTableStatement()
          stmt.temporary = true
          this.parseCreateTableStatement(stmt)
        } else if (this.consumeIf(Keyword.SEQUENCE)) {
          stmt = new model.CreateSequenceStatement()
          stmt.temporary = true
          this.parseCreateSequenceStatement(stmt)
        } else if (this.consumeIf(Keyword.RECURSIVE, Keyword.VIEW)) {
          stmt = new model.CreateViewStatement()
          stmt.temporary = true
          stmt.recursive = true
          this.parseCreateViewStatement(stmt)
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
          this.parseCreateForeignDataWrapperStatement(stmt)
        } else if (this.consumeIf(Keyword.TABLE)) {
          stmt = new model.CreateForeignTableStatement()
          this.parseCreateForeignTableStatement(stmt)
        }
      } else if (this.consumeIf(Keyword.UNLOGGED, Keyword.TABLE)) {
        stmt = new model.CreateTableStatement()
        stmt.unlogged = true
        this.parseCreateTableStatement(stmt)
      } else if (this.consumeIf(Keyword.TABLE)) {
        stmt = new model.CreateTableStatement()
        this.parseCreateTableStatement(stmt)
      } else if (this.consumeIf(Keyword.SEQUENCE)) {
        stmt = new model.CreateSequenceStatement()
        this.parseCreateSequenceStatement(stmt)
      } else if (this.consumeIf(Keyword.RECURSIVE, Keyword.VIEW)) {
        stmt = new model.CreateViewStatement()
        stmt.recursive = true
        this.parseCreateViewStatement(stmt)
      } else if (this.consumeIf(Keyword.VIEW)) {
        stmt = new model.CreateViewStatement()
        this.parseCreateViewStatement(stmt)
      } else if (this.consumeIf(Keyword.MATERIALIZED)) {
        stmt = new model.CreateMaterializedViewStatement()
        this.parseCreateMaterializedViewStatement(stmt)
      } else if (this.consumeIf(Keyword.PROCEDURE)) {
        stmt = new model.CreateProcedureStatement()
        this.parseCreateProcedureStatement(stmt)
      } else if (this.consumeIf(Keyword.FUNCTION)) {
        stmt = new model.CreateFunctionStatement()
        this.parseCreateFunctionStatement(stmt)
      } else if (this.consumeIf(Keyword.AGGREGATE)) {
        stmt = new model.CreateAggregateStatement()
        this.parseCreateAggregateStatement(stmt)
      } else if (this.consumeIf(Keyword.CONSTRAINT, Keyword.TRIGGER)) {
        stmt = new model.CreateTriggerStatement()
        stmt.constraint = true
        this.parseCreateTriggerStatement(stmt)
      } else if (this.consumeIf(Keyword.TRIGGER)) {
        stmt = new model.CreateTriggerStatement()
        this.parseCreateTriggerStatement(stmt)
      } else if (this.consumeIf(Keyword.TEXT)) {
        this.consume(Keyword.SEARCH)
        if (this.consumeIf(Keyword.CONFIGURATION)) {
          stmt = new model.CreateTextSearchConfigurationStatement()
          this.parseCreateTextSearchConfigurationStatement(stmt)
        } else if (this.consumeIf(Keyword.DICTIONARY)) {
          stmt = new model.CreateTextSearchDictionaryStatement()
          this.parseCreateTextSearchDictionaryStatement(stmt)
        } else if (this.consumeIf(Keyword.PARSER)) {
          stmt = new model.CreateTextSearchParserStatement()
          this.parseCreateTextSearchParserStatement(stmt)
        } else if (this.consumeIf(Keyword.TEMPLATE)) {
          stmt = new model.CreateTextSearchTemplateStatement()
          this.parseCreateTextSearchTemplateStatement(stmt)
        }
      } else if (this.consumeIf(Keyword.POLICY)) {
        stmt = new model.CreatePolicyStatement()
        this.parseCreatePolicyStatement(stmt)
      } else if (this.consumeIf(Keyword.RULE)) {
        stmt = new model.CreateRuleStatement()
        this.parseCreateRuleStatement(stmt)
      } else if (this.consumeIf(Keyword.UNIQUE, Keyword.INDEX)) {
        stmt = new model.CreateIndexStatement()
        this.parseCreateIndexStatement(stmt)
        stmt.type = "UNIQUE"
      } else if (this.consumeIf(Keyword.INDEX)) {
        stmt = new model.CreateIndexStatement()
        this.parseCreateIndexStatement(stmt)
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
        this.parseAlterSystemStatement(stmt)
      } else if (this.consumeIf(Keyword.DATABASE)) {
        stmt = new model.AlterDatabaseStatement()
        this.parseAlterDatabaseStatement(stmt)
      } else if (this.consumeIf(Keyword.EVENT)) {
        this.consume(Keyword.TRIGGER)
        stmt = new model.AlterEventTriggerStatement()
        this.parseAlterEventTriggerStatement(stmt)
      } else if (this.consumeIf(Keyword.EXTENSION)) {
        stmt = new model.AlterExtensionStatement()
        this.parseAlterExtensionStatement(stmt)
      } else if (this.consumeIf(Keyword.PROCEDURAL)) {
        this.consume(Keyword.LANGUAGE)
        stmt = new model.AlterLanguageStatement()
        stmt.procedural = true
        this.parseAlterLanguageStatement(stmt)
      } else if (this.consumeIf(Keyword.LANGUAGE)) {
        stmt = new model.AlterLanguageStatement()
        this.parseAlterLanguageStatement(stmt)
      } else if (this.consumeIf(Keyword.PUBLICATION)) {
        stmt = new model.AlterPublicationStatement()
        this.parseAlterPublicationStatement(stmt)
      } else if (this.consumeIf(Keyword.SUBSCRIPTION)) {
        stmt = new model.AlterSubscriptionStatement()
        this.parseAlterSubscriptionStatement(stmt)
      } else if (this.consumeIf(Keyword.SERVER)) {
        stmt = new model.AlterServerStatement()
        this.parseAlterServerStatement(stmt)
      } else if (this.consumeIf(Keyword.TABLESPACE)) {
        stmt = new model.AlterTablespaceStatement()
        this.parseAlterTablespaceStatement(stmt)
      } else if (this.consumeIf(Keyword.TYPE)) {
        stmt = new model.AlterTypeStatement()
        this.parseAlterTypeStatement(stmt)
      } else if (this.consumeIf(Keyword.GROUP) || this.consumeIf(Keyword.ROLE)) {
        stmt = new model.AlterRoleStatement()
        this.parseAlterRoleStatement(stmt)
      } else if (this.consumeIf(Keyword.USER)) {
        if (this.consumeIf(Keyword.MAPPING)) {
          stmt = new model.AlterUserMappingStatement()
          this.parseAlterUserMappingStatement(stmt)
        } else {
          stmt = new model.AlterRoleStatement()
          this.parseAlterRoleStatement(stmt)
        }
      } else if (this.consumeIf(Keyword.LARGE)) {
        this.consume(Keyword.OBJECT)
        stmt = new model.AlterLargeObjectStatement()
        this.parseAlterLargeObjectStatement(stmt)
      } else if (this.consumeIf(Keyword.SCHEMA)) {
        stmt = new model.AlterSchemaStatement()
        this.parseAlterSchemaStatement(stmt)
      } else if (this.consumeIf(Keyword.COLLATION)) {
        stmt = new model.AlterCollationStatement()
        this.parseAlterCollationStatement(stmt)
      } else if (this.consumeIf(Keyword.DEFAULT, Keyword.PRIVILEGES)) {
        stmt = new model.AlterDefaultPrivilegesStatement()
        this.parseAlterDefaultPrivilegesStatement(stmt)
      } else if (this.consumeIf(Keyword.CONVERSION)) {
        stmt = new model.AlterConversionStatement()
        this.parseAlterConversionStatement(stmt)
      } else if (this.consumeIf(Keyword.DOMAIN)) {
        stmt = new model.AlterDomainStatement()
        this.parseAlterDomainStatement(stmt)
      } else if (this.consumeIf(Keyword.OPERATOR)) {
        if (this.consumeIf(Keyword.CLASS)) {
          stmt = new model.AlterOperatorClassStatement()
          this.parseAlterOperatorClassStatement(stmt)
        } else if (this.consumeIf(Keyword.FAMILY)) {
          stmt = new model.AlterOperatorFamilyStatement()
          this.parseAlterOperatorFamilyStatement(stmt)
        } else {
          stmt = new model.AlterOperatorStatement()
          this.parseAlterOperatorStatement(stmt)
        }
      } else if (this.consumeIf(Keyword.STATISTICS)) {
        stmt = new model.AlterStatisticsStatement()
        this.parseAlterStatisticsStatement(stmt)
      } else if (this.consumeIf(Keyword.FOREIGN)) {
        if (this.consumeIf(Keyword.DATA)) {
          this.consume(Keyword.WRAPPER)
          stmt = new model.AlterForeignDataWrapperStatement()
          this.parseAlterForeignDataWrapperStatement(stmt)
        } else if (this.consumeIf(Keyword.TABLE)) {
          stmt = new model.AlterForeignTableStatement()
          this.parseAlterForeignTableStatement(stmt)
        }
      } else if (this.consumeIf(Keyword.TABLE)) {
        stmt = new model.AlterTableStatement()
        this.parseAlterTableStatement(stmt)
      } else if (this.consumeIf(Keyword.SEQUENCE)) {
        stmt = new model.AlterSequenceStatement()
        this.parseAlterSequenceStatement(stmt)
      } else if (this.consumeIf(Keyword.VIEW)) {
        stmt = new model.AlterViewStatement()
        this.parseAlterViewStatement(stmt)
      } else if (this.consumeIf(Keyword.MATERIALIZED)) {
        stmt = new model.AlterMaterializedViewStatement()
        this.parseAlterMaterializedViewStatement(stmt)
      } else if (this.consumeIf(Keyword.PROCEDURE)) {
        stmt = new model.AlterProcedureStatement()
        this.parseAlterProcedureStatement(stmt)
      } else if (this.consumeIf(Keyword.FUNCTION)) {
        stmt = new model.AlterFunctionStatement()
        this.parseAlterFunctionStatement(stmt)
      } else if (this.consumeIf(Keyword.AGGREGATE)) {
        stmt = new model.AlterAggregateStatement()
        this.parseAlterAggregateStatement(stmt)
      } else if (this.consumeIf(Keyword.TRIGGER)) {
        stmt = new model.AlterTriggerStatement()
        this.parseAlterTriggerStatement(stmt)
      } else if (this.consumeIf(Keyword.ROUTINE)) {
        stmt = new model.AlterRoutineStatement()
        this.parseAlterRoutineStatement(stmt)
      } else if (this.consumeIf(Keyword.TEXT)) {
        this.consume(Keyword.SEARCH)
        if (this.consumeIf(Keyword.CONFIGURATION)) {
          stmt = new model.AlterTextSearchConfigurationStatement()
          this.parseAlterTextSearchConfigurationStatement(stmt)
        } else if (this.consumeIf(Keyword.DICTIONARY)) {
          stmt = new model.AlterTextSearchDictionaryStatement()
          this.parseAlterTextSearchDictionaryStatement(stmt)
        } else if (this.consumeIf(Keyword.PARSER)) {
          stmt = new model.AlterTextSearchParserStatement()
          this.parseAlterTextSearchParserStatement(stmt)
        } else if (this.consumeIf(Keyword.TEMPLATE)) {
          stmt = new model.AlterTextSearchTemplateStatement()
          this.parseAlterTextSearchTemplateStatement(stmt)
        }
      } else if (this.consumeIf(Keyword.POLICY)) {
        stmt = new model.AlterPolicyStatement()
        this.parseAlterPolicyStatement(stmt)
      } else if (this.consumeIf(Keyword.RULE)) {
        stmt = new model.AlterRuleStatement()
        this.parseAlterRuleStatement(stmt)
      } else if (this.consumeIf(Keyword.INDEX)) {
        stmt = new model.AlterIndexStatement()
        this.parseAlterIndexStatement(stmt)
      } else if (
        this.consumeIf(Keyword.DEFAULT)
      ) {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.DROP)) {
      if (this.consumeIf(Keyword.OWNED)) {
        stmt = new model.DropOwnedStatement()
        this.parseDropOwnedStatement(stmt)
      } else if (this.consumeIf(Keyword.DATABASE)) {
        stmt = new model.DropDatabaseStatement()
        this.parseDropDatabaseStatement(stmt)
      } else if (this.consumeIf(Keyword.ACCESS)) {
        this.consume(Keyword.METHOD)
        stmt = new model.DropAccessMethodStatement()
        this.parseDropAccessMethodStatement(stmt)
      } else if (this.consumeIf(Keyword.CAST)) {
        stmt = new model.DropCastStatement()
        this.parseDropCastStatement(stmt)
      } else if (this.consumeIf(Keyword.EVENT)) {
        this.consume(Keyword.TRIGGER)
        stmt = new model.DropEventTriggerStatement()
        this.parseDropEventTriggerStatement(stmt)
      } else if (this.consumeIf(Keyword.EXTENSION)) {
        stmt = new model.DropExtensionStatement()
        this.parseDropExtensionStatement(stmt)
      } else if (this.consumeIf(Keyword.PROCEDURAL)) {
        this.consume(Keyword.LANGUAGE)
        stmt = new model.DropLanguageStatement()
        stmt.procedural = true
        this.parseDropLanguageStatement(stmt)
      } else if (this.consumeIf(Keyword.LANGUAGE)) {
        stmt = new model.DropLanguageStatement()
        this.parseDropLanguageStatement(stmt)
      } else if (this.consumeIf(Keyword.TRANSFORM)) {
        stmt = new model.DropTransformStatement()
        this.parseDropTransformStatement(stmt)
      } else if (this.consumeIf(Keyword.PUBLICATION)) {
        stmt = new model.DropPublicationStatement()
        this.parseDropPublicationStatement(stmt)
      } else if (this.consumeIf(Keyword.SUBSCRIPTION)) {
        stmt = new model.DropSubscriptionStatement()
        this.parseDropSubscriptionStatement(stmt)
      } else if (this.consumeIf(Keyword.SERVER)) {
        stmt = new model.DropServerStatement()
        this.parseDropServerStatement(stmt)
      } else if (this.consumeIf(Keyword.TABLESPACE)) {
        stmt = new model.DropTablespaceStatement()
        this.parseDropTablespaceStatement(stmt)
      } else if (this.consumeIf(Keyword.GROUP) || this.consumeIf(Keyword.ROLE)) {
        stmt = new model.DropRoleStatement()
        this.parseDropRoleStatement(stmt)
      } else if (this.consumeIf(Keyword.USER)) {
        if (this.consumeIf(Keyword.MAPPING)) {
          stmt = new model.DropUserMappingStatement()
          this.parseDropUserMappingStatement(stmt)
        } else {
          stmt = new model.DropRoleStatement()
          this.parseDropRoleStatement(stmt)
        }
      } else if (this.consumeIf(Keyword.SCHEMA)) {
        stmt = new model.DropSchemaStatement()
        this.parseDropSchemaStatement(stmt)
      } else if (this.consumeIf(Keyword.TYPE)) {
        stmt = new model.DropTypeStatement()
        this.parseDropTypeStatement(stmt)
      } else if (this.consumeIf(Keyword.COLLATION)) {
        stmt = new model.DropCollationStatement()
        this.parseDropCollationStatement(stmt)
      } else if (this.consumeIf(Keyword.CONVERSION)) {
        stmt = new model.DropConversionStatement()
        this.parseDropConversionStatement(stmt)
      } else if (this.consumeIf(Keyword.DOMAIN)) {
        stmt = new model.DropDomainStatement()
        this.parseDropDomainStatement(stmt)
      } else if (this.consumeIf(Keyword.OPERATOR)) {
        if (this.consumeIf(Keyword.CLASS)) {
          stmt = new model.DropOperatorClassStatement()
          this.parseDropOperatorClassStatement(stmt)
        } else if (this.consumeIf(Keyword.FAMILY)) {
          stmt = new model.DropOperatorFamilyStatement()
          this.parseDropOperatorFamilyStatement(stmt)
        } else {
          stmt = new model.DropOperatorStatement()
          this.parseDropOperatorStatement(stmt)
        }
      } else if (this.consumeIf(Keyword.STATISTICS)) {
        stmt = new model.DropStatisticsStatement()
        this.parseDropStatisticsStatement(stmt)
      } else if (this.consumeIf(Keyword.FOREIGN)) {
        if (this.consumeIf(Keyword.DATA)) {
          this.consume(Keyword.WRAPPER)
          stmt = new model.DropForeignDataWrapperStatement()
          this.parseDropForeignDataWrapperStatement(stmt)
        } else if (this.consumeIf(Keyword.TABLE)) {
          stmt = new model.DropForeignTableStatement()
          this.parseDropForeignTableStatement(stmt)
        } else if (this.consumeIf(Keyword.TABLE)) {
          stmt = new model.DropTableStatement()
          this.parseDropTableStatement(stmt)
        } else if (this.consumeIf(Keyword.SEQUENCE)) {
          stmt = new model.DropSequenceStatement()
          this.parseDropSequenceStatement(stmt)
        } else if (this.consumeIf(Keyword.VIEW)) {
          stmt = new model.DropViewStatement()
          this.parseDropViewStatement(stmt)
        } else if (this.consumeIf(Keyword.MATERIALIZED)) {
          stmt = new model.DropMaterializedViewStatement()
          this.parseDropMaterializedViewStatement(stmt)
        } else if (this.consumeIf(Keyword.PROCEDURE)) {
          stmt = new model.DropProcedureStatement()
          this.parseDropProcedureStatement(stmt)
        } else if (this.consumeIf(Keyword.FUNCTION)) {
          stmt = new model.DropFunctionStatement()
          this.parseDropFunctionStatement(stmt)
        } else if (this.consumeIf(Keyword.AGGREGATE)) {
          stmt = new model.DropAggregateStatement()
          this.parseDropAggregateStatement(stmt)
        } else if (this.consumeIf(Keyword.TRIGGER)) {
          stmt = new model.DropTriggerStatement()
          this.parseDropTriggerStatement(stmt)
        } else if (this.consumeIf(Keyword.TEXT)) {
          this.consume(Keyword.SEARCH)
          if (this.consumeIf(Keyword.CONFIGURATION)) {
            stmt = new model.DropTextSearchConfigurationStatement()
            this.parseDropTextSearchConfigurationStatement(stmt)
          } else if (this.consumeIf(Keyword.DICTIONARY)) {
            stmt = new model.DropTextSearchDictionaryStatement()
            this.parseDropTextSearchDictionaryStatement(stmt)
          } else if (this.consumeIf(Keyword.PARSER)) {
            stmt = new model.DropTextSearchParserStatement()
            this.parseDropTextSearchParserStatement(stmt)
          } else if (this.consumeIf(Keyword.TEMPLATE)) {
            stmt = new model.DropTextSearchTemplateStatement()
            this.parseDropTextSearchTemplateStatement(stmt)
          }
        } else if (this.consumeIf(Keyword.POLICY)) {
          stmt = new model.DropPolicyStatement()
          this.parseDropPolicyStatement(stmt)
        } else if (this.consumeIf(Keyword.RULE)) {
          stmt = new model.DropRuleStatement()
          this.parseDropRuleStatement(stmt)
        } else if (this.consumeIf(Keyword.INDEX)) {
          stmt = new model.DropIndexStatement()
          this.parseDropIndexStatement(stmt)
        }
      } else if (this.consumeIf(Keyword.REASSIGN)) {
        this.consume(Keyword.OWNED)
        stmt = new model.ReassignOwnedStatement()
        this.parseReassignOwnedStatement(stmt)
      } else if (this.consumeIf(Keyword.SECURITY)) {
        this.consume(Keyword.LABEL)
        stmt = new model.SecurityLabelStatement()
        this.parseSecurityLabelStatement(stmt)
      } else if (this.consumeIf(Keyword.TRUNCATE)) {
        stmt = new model.TruncateStatement()
        this.parseTruncateStatement(stmt)
      } else if (this.consumeIf(Keyword.COMMENT)) {
        stmt = new model.CommentStatement()
        this.parseCommentStatement(stmt)
      } else if (this.consumeIf(Keyword.GRANT)) {
        stmt = new model.GrantStatement()
        this.parseGrantStatement(stmt)
      } else if (this.consumeIf(Keyword.REVOKE)) {
        stmt = new model.RevokeStatement()
        this.parseRevokeStatement(stmt)
      } else if (this.consumeIf(Keyword.LOCK)) {
        stmt = new model.LockStatement()
        this.parseLockStatement(stmt)
      } else if (this.consumeIf(Keyword.START)) {
        this.consume(Keyword.TRANSACTION)
        stmt = new model.StartTransactionStatement()
        this.parseStartTransactionStatement(stmt)
      } else if (this.consumeIf(Keyword.BEGIN)) {
        stmt = new model.BeginStatement()
        this.parseBeginStatement(stmt)
      } else if (this.consumeIf(Keyword.SAVEPOINT)) {
        stmt = new model.SavepointStatement()
        this.parseSavepointStatement(stmt)
      } else if (this.consumeIf(Keyword.RELEASE)) {
        this.consume(Keyword.SAVEPOINT)
        stmt = new model.ReleaseSavepointStatement()
        this.parseReleaseSavepointStatement(stmt)
      } else if (this.consumeIf(Keyword.COMMIT)) {
        if (this.consumeIf(Keyword.PREPARED)) {
          stmt = new model.CommitPreparedStatement()
          this.parseCommitPreparedStatement(stmt)
        } else {
          stmt = new model.CommitStatement()
          this.parseCommitStatement(stmt)
        }
      } else if (this.consumeIf(Keyword.END)) {
        stmt = new model.EndStatement()
        this.parseEndStatement(stmt)
      } else if (this.consumeIf(Keyword.ROLLBACK)) {
        if (this.consumeIf(Keyword.PREPARED)) {
          stmt = new model.RollbackPreparedStatement()
          this.parseRollbackPreparedStatement(stmt)
        } else {
          stmt = new model.RollbackStatement()
          this.parseRollbackStatement(stmt)
        }
      } else if (this.consumeIf(Keyword.ABORT)) {
        stmt = new model.AbortStatement()
        this.parseAbortStatement(stmt)
      } else if (this.consumeIf(Keyword.DISCARD)) {
        stmt = new model.DiscardStatement()
        this.parseDiscardStatement(stmt)
      } else if (this.consumeIf(Keyword.EXPLAIN)) {
        stmt = new model.ExplainStatement()
        this.parseExplainStatement(stmt)
      } else if (this.consumeIf(Keyword.ANALYZE)) {
        stmt = new model.AnalyzeStatement()
        this.parseAnalyzeStatement(stmt)
      } else if (this.consumeIf(Keyword.CLUSTER)) {
        stmt = new model.ClusterStatement()
        this.parseClusterStatement(stmt)
      } else if (this.consumeIf(Keyword.REFRESH)) {
        this.consume(Keyword.MATERIALIZED, Keyword.VIEW)
        stmt = new model.RefreshMaterializedViewStatement()
        this.parseRefreshMaterializedViewStatement(stmt)
      } else if (this.consumeIf(Keyword.REINDEX)) {
        let verbose = false
        if (this.consumeIf(Keyword.VERBOSE)) {
          verbose = true
        }
        if (this.consumeIf(Keyword.SYSTEM)) {
          stmt = new model.ReindexSystemStatement()
          this.parseReindexSystemStatement(stmt)
        } else if (this.consumeIf(Keyword.DATABASE)) {
          stmt = new model.ReindexDatabaseStatement()
          this.parseReindexDatabaseStatement(stmt)
        } else if (this.consumeIf(Keyword.SCHEMA)) {
          stmt = new model.ReindexSchemaStatement()
          this.parseReindexSchemaStatement(stmt)
        } else if (this.consumeIf(Keyword.TABLE)) {
          stmt = new model.ReindexTableStatement()
          this.parseReindexTableStatement(stmt)
        } else if (this.consumeIf(Keyword.INDEX)) {
          stmt = new model.ReindexIndexStatement()
          this.parseReindexIndexStatement(stmt)
        }
      } else if (this.consumeIf(Keyword.VACUUM)) {
        stmt = new model.VacuumStatement()
        this.parseVacuumStatement(stmt)
      } else if (this.consumeIf(Keyword.LOAD)) {
        stmt = new model.LoadStatement()
        this.parseLoadStatement(stmt)
      } else if (this.consumeIf(Keyword.IMPORT)) {
        this.consume(Keyword.FOREIGN, Keyword.SCHEMA)
        stmt = new model.ImportForeignSchemaStatement()
        this.parseImportForeignSchemaStatement(stmt)
      } else if (this.consumeIf(Keyword.COPY)) {
        stmt = new model.CopyStatement()
        this.parseCopyStatement(stmt)
      } else if (this.consumeIf(Keyword.CHECKPOINT)) {
        stmt = new model.CheckpointStatement()
        this.parseCheckpointStatement(stmt)
      } else if (this.consumeIf(Keyword.PREPARE)) {
        if (this.consumeIf(Keyword.TRANSACTION)) {
          stmt = new model.PrepareTransactionStatement()
          this.parsePrepareTransactionStatement(stmt)
        } else {
          stmt = new model.PrepareStatement()
          this.parsePrepareStatement(stmt)
        }
      } else if (this.consumeIf(Keyword.EXECUTE)) {
        stmt = new model.ExecuteStatement()
        this.parseExecuteStatement(stmt)
      } else if (this.consumeIf(Keyword.DEALLOCATE)) {
        stmt = new model.DeallocateStatement()
        this.parseDeallocateStatement(stmt)
      } else if (this.consumeIf(Keyword.DECLARE)) {
        stmt = new model.DeclareStatement()
        this.parseDeclareStatement(stmt)
      } else if (this.consumeIf(Keyword.FETCH)) {
        stmt = new model.FetchStatement()
        this.parseFetchStatement(stmt)
      } else if (this.consumeIf(Keyword.MOVE)) {
        stmt = new model.MoveStatement()
        this.parseMoveStatement(stmt)
      } else if (this.consumeIf(Keyword.CLOSE)) {
        stmt = new model.CloseStatement()
        this.parseCloseStatement(stmt)
      } else if (this.consumeIf(Keyword.LISTEN)) {
        stmt = new model.ListenStatement()
        this.parseListenStatement(stmt)
      } else if (this.consumeIf(Keyword.NOTIFY)) {
        stmt = new model.NotifyStatement()
        this.parseNotifyStatement(stmt)
      } else if (this.consumeIf(Keyword.UNLISTEN)) {
        stmt = new model.UnlistenStatement()
        this.parseUnlistenStatement(stmt)
      } else if (this.consumeIf(Keyword.SET)) {
        if (this.consumeIf(Keyword.CONSTRAINT)) {
          stmt = new model.SetConstraintStatement()
          this.parseSetConstraintStatement(stmt)
        } else if (this.consumeIf(Keyword.ROLE)) {
          stmt = new model.SetRoleStatement()
          this.parseSetRoleStatement(stmt)
        } else if (this.consumeIf(Keyword.SESSION)) {
          this.consume(Keyword.AUTHORIZATION)
          stmt = new model.SetSessionAuthorizationStatement()
          this.parseSetSessionAuthorizationStatement(stmt)
        } else if (this.consumeIf(Keyword.TRANSACTION)) {
          stmt = new model.SetTransactionStatement()
          this.parseSetTransactionStatement(stmt)
        } else {
          stmt = new model.SetStatement()
          this.parseSetStatement(stmt)
        }
      } else if (this.consumeIf(Keyword.RESET)) {
        stmt = new model.ResetStatement()
        this.parseResetStatement(stmt)
      } else if (this.consumeIf(Keyword.SHOW)) {
        stmt = new model.ShowStatement()
        this.parseShowStatement(stmt)
      } else if (this.consumeIf(Keyword.CALL)) {
        stmt = new model.CallStatement()
        this.parseCallStatement(stmt)
      } else if (this.consumeIf(Keyword.DO)) {
        stmt = new model.DoStatement()
        this.parseDoStatement(stmt)
      } else if (this.consumeIf(Keyword.VALUES)) {
        stmt = new model.ValuesStatement()
        this.parseValuesStatement(stmt)
      } else {
        if (this.peekIf(Keyword.WITH)) {
          this.withClause()
        }
        if (this.consumeIf(Keyword.INSERT)) {
          stmt = new model.InsertStatement()
          this.parseInsertStatement(stmt)
        } else if (this.consumeIf(Keyword.UPDATE)) {
          stmt = new model.UpdateStatement()
          this.parseUpdateStatement(stmt)
        } else if (this.consumeIf(Keyword.DELETE)) {
          stmt = new model.DeleteStatement()
          this.parseDeleteStatement(stmt)
        } else if (this.peekIf(Keyword.SELECT)) {
          stmt = new model.SelectStatement()
          this.parseSelectStatement(stmt)
        }
      }
    }

    if (!stmt) {
      throw this.createParseError()
    }

    if (typeof this.options.filename === "string") {
      stmt.filename = this.options.filename
    }
    stmt.tokens = this.tokens.slice(this.stmtStart, this.pos)

    return stmt
  }

  private parseCreateDatabaseStatement(stmt: model.CreateDatabaseStatement) {
    stmt.name = this.identifier()
    this.consumeIf(Keyword.WITH)
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      if (this.consumeIf(Keyword.OWNER)) {
        this.consumeIf(Keyword.OPE_EQ)
        if (this.consumeIf(Keyword.DEFAULT)) {
          // no handle
        } else {
          stmt.owner = this.identifier()
        }
      } else if (this.consumeIf(Keyword.TEMPLATE)) {
        this.consumeIf(Keyword.OPE_EQ)
        if (!this.consumeIf(Keyword.DEFAULT)) {
          // no handle
        } else {
          stmt.template = this.stringValue()
        }
      } else if (this.consumeIf(Keyword.ENCODING)) {
        this.consumeIf(Keyword.OPE_EQ)
        if (!this.consumeIf(Keyword.DEFAULT)) {
          // no handle
        } else {
          stmt.encoding = this.stringValue()
        }
      } else if (this.consumeIf(Keyword.LC_COLLATE)) {
        this.consumeIf(Keyword.OPE_EQ)
        stmt.lcCollate = this.stringValue()
      } else if (this.consumeIf(Keyword.LC_CTYPE)) {
        this.consumeIf(Keyword.OPE_EQ)
        stmt.lcCtype = this.stringValue()
      } else if (this.consumeIf(Keyword.TABLESPACE)) {
        this.consumeIf(Keyword.OPE_EQ)
        if (!this.consumeIf(Keyword.DEFAULT)) {
          // no handle
        } else {
          stmt.tablespace = this.stringValue()
        }
      } else if (this.consumeIf(Keyword.ALLOW_CONNECTIONS)) {
        this.consumeIf(Keyword.OPE_EQ)
        stmt.allowConnections = this.booleanValue()
      } else if (this.consumeIf(Keyword.CONNECTION)) {
        this.consume(Keyword.LIMIT)
        this.consumeIf(Keyword.OPE_EQ)
        stmt.connectionLimit = this.numberValue()
      } else if (this.consumeIf(Keyword.IS_TEMPLATE)) {
        this.consumeIf(Keyword.OPE_EQ)
        stmt.isTemplate = this.booleanValue()
      } else {
        break
      }
    }
  }

  private parseCreateAccessMethodStatement(stmt: model.CreateAccessMethodStatement) {

  }

  private parseCreateCastStatement(stmt: model.CreateCastStatement) {

  }

  private parseCreateEventTriggerStatement(stmt: model.CreateEventTriggerStatement) {

  }

  private parseCreateExtensionStatement(stmt: model.CreateExtensionStatement) {

  }

  private parseCreateLanguageStatement(stmt: model.CreateLanguageStatement) {

  }

  private parseCreateTransformStatement(stmt: model.CreateTransformStatement) {

  }

  private parseCreatePublicationStatement(stmt: model.CreatePublicationStatement) {

  }

  private parseCreateSubscriptionStatement(stmt: model.CreateSubscriptionStatement) {

  }

  private parseCreateServerStatement(stmt: model.CreateServerStatement) {

  }

  private parseCreateTablespaceStatement(stmt: model.CreateTablespaceStatement) {

  }

  private parseCreateTypeStatement(stmt: model.CreateTypeStatement) {

  }

  private parseCreateRoleStatement(stmt: model.CreateRoleStatement) {

  }

  private parseCreateUserMappingStatement(stmt: model.CreateUserMappingStatement) {

  }

  private parseCreateSchemaStatement(stmt: model.CreateSchemaStatement) {

  }

  private parseCreateCollationStatement(stmt: model.CreateCollationStatement) {

  }

  private parseCreateConversionStatement(stmt: model.CreateConversionStatement) {

  }

  private parseCreateDomainStatement(stmt: model.CreateDomainStatement) {

  }

  private parseCreateOperatorClassStatement(stmt: model.CreateOperatorClassStatement) {

  }

  private parseCreateOperatorFamilyStatement(stmt: model.CreateOperatorFamilyStatement) {

  }

  private parseCreateOperatorStatement(stmt: model.CreateOperatorStatement) {

  }

  private parseCreateStatisticsStatement(stmt: model.CreateStatisticsStatement) {

  }

  private parseCreateTableStatement(stmt: model.CreateTableStatement) {

  }

  private parseCreateSequenceStatement(stmt: model.CreateSequenceStatement) {

  }

  private parseCreateViewStatement(stmt: model.CreateViewStatement) {

  }

  private parseCreateMaterializedViewStatement(stmt: model.CreateMaterializedViewStatement) {

  }

  private parseCreateProcedureStatement(stmt: model.CreateProcedureStatement) {

  }

  private parseCreateFunctionStatement(stmt: model.CreateFunctionStatement) {

  }

  private parseCreateAggregateStatement(stmt: model.CreateAggregateStatement) {

  }

  private parseCreateTriggerStatement(stmt: model.CreateTriggerStatement) {

  }

  private parseCreateRuleStatement(stmt: model.CreateRuleStatement) {

  }

  private parseCreateForeignDataWrapperStatement(stmt: model.CreateForeignDataWrapperStatement) {

  }

  private parseCreateForeignTableStatement(stmt: model.CreateForeignTableStatement) {

  }

  private parseCreateTextSearchConfigurationStatement(stmt: model.CreateTextSearchConfigurationStatement) {

  }

  private parseCreateTextSearchDictionaryStatement(stmt: model.CreateTextSearchDictionaryStatement) {

  }

  private parseCreateTextSearchParserStatement(stmt: model.CreateTextSearchParserStatement) {

  }

  private parseCreateTextSearchTemplateStatement(stmt: model.CreateTextSearchTemplateStatement) {

  }

  private parseCreatePolicyStatement(stmt: model.CreatePolicyStatement) {

  }

  private parseCreateIndexStatement(stmt: model.CreateIndexStatement) {

  }

  private parseAlterSystemStatement(stmt: model.AlterSystemStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterDatabaseStatement(stmt: model.AlterDatabaseStatement) {
    stmt.database = this.identifier()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterEventTriggerStatement(stmt: model.AlterEventTriggerStatement) {
    stmt.eventTrigger = this.identifier()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterExtensionStatement(stmt: model.AlterExtensionStatement) {
    stmt.extension = this.identifier()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterLanguageStatement(stmt: model.AlterLanguageStatement) {
    stmt.language = this.identifier()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterPublicationStatement(stmt: model.AlterPublicationStatement) {
    stmt.publication = this.identifier()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterSubscriptionStatement(stmt: model.AlterSubscriptionStatement) {
    stmt.subscription = this.identifier()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterServerStatement(stmt: model.AlterServerStatement) {
    stmt.server = this.identifier()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterTablespaceStatement(stmt: model.AlterTablespaceStatement) {
    stmt.tablespace = this.identifier()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterRoleStatement(stmt: model.AlterRoleStatement) {
    if (this.consumeIf(Keyword.CURRENT_USER)) {
      stmt.role.alias = model.CURRENT_USER
    } else if (this.consumeIf(Keyword.SESSION_USER)) {
      stmt.role.alias = model.SESSION_USER
    } else if (this.consumeIf(Keyword.ALL)) {
      stmt.role.alias = model.ALL
    } else {
      stmt.role.name = this.identifier()
    }
    if (this.consumeIf(Keyword.IN)) {
      this.consume(Keyword.DATABASE)
      stmt.database = this.identifier()
    }
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterUserMappingStatement(stmt: model.AlterUserMappingStatement) {
    this.consume(Keyword.FOR)
    if (this.consumeIf(Keyword.USER) || this.consumeIf(Keyword.CURRENT_USER)) {
      stmt.user.alias = model.CURRENT_USER
    } else if (this.consumeIf(Keyword.SESSION_USER)) {
      stmt.user.alias = model.SESSION_USER
    } else if (this.consumeIf(Keyword.PUBLIC)) {
      stmt.user.alias = model.PUBLIC
    } else {
      stmt.user.name = this.identifier()
    }
    this.consume(Keyword.SERVER)
    stmt.server = this.identifier()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterLargeObjectStatement(stmt: model.AlterLargeObjectStatement) {
    this.consume(TokenType.Number)
    stmt.largeObject = this.token(-1).text
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterSchemaStatement(stmt: model.AlterSchemaStatement) {
    stmt.schema = this.identifier()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterTypeStatement(stmt: model.AlterTypeStatement) {
    stmt.type = this.identifier()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterCollationStatement(stmt: model.AlterCollationStatement) {
    stmt.collation = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterDefaultPrivilegesStatement(stmt: model.AlterDefaultPrivilegesStatement) {
    if (this.consumeIf(Keyword.FOR)) {
      if (this.consumeIf(Keyword.ROLE) || this.consumeIf(Keyword.USER)) {
        for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
          const role = new model.Role()
          role.name = this.identifier()
          stmt.roles.push(role)
        }
      } else {
        throw this.createParseError()
      }
    }
    if (this.consumeIf(Keyword.IN)) {
      this.consume(Keyword.SCHEMA)
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        stmt.schemas.push(this.identifier())
      }
    }
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterConversionStatement(stmt: model.AlterConversionStatement) {
    stmt.conversion = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterDomainStatement(stmt: model.AlterDomainStatement) {
    stmt.domain = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterOperatorClassStatement(stmt: model.AlterOperatorClassStatement) {
    stmt.operatorClass = this.schemaObject()
    this.consume(Keyword.USING)
    stmt.indexAccessMethod = this.identifier()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterOperatorFamilyStatement(stmt: model.AlterOperatorFamilyStatement) {
    stmt.operatorFamily = this.schemaObject()
    this.consume(Keyword.USING)
    stmt.indexAccessMethod = this.identifier()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterOperatorStatement(stmt: model.AlterOperatorStatement) {
    stmt.operator = this.customOperator()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterStatisticsStatement(stmt: model.AlterStatisticsStatement) {
    stmt.statistic = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterTableStatement(stmt: model.AlterTableStatement) {
    if (this.consumeIf(Keyword.ALL)) {
      this.consume(Keyword.IN, Keyword.TABLESPACE)
      stmt.tablespace = this.identifier()
    } else {
      if (this.consumeIf(Keyword.IF)) {
        this.consume(Keyword.EXISTS)
        stmt.ifExists = true
      }
      if (this.consumeIf(Keyword.ONLY)) {
        stmt.only = true
      }
      stmt.table = this.schemaObject()
    }
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterForeignTableStatement(stmt: model.AlterForeignTableStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    if (this.consumeIf(Keyword.ONLY)) {
      stmt.only = true
    }
    stmt.foreignTable = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterSequenceStatement(stmt: model.AlterSequenceStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.sequence = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterViewStatement(stmt: model.AlterViewStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.view = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterMaterializedViewStatement(stmt: model.AlterMaterializedViewStatement) {
    if (this.consumeIf(Keyword.ALL)) {
      this.consume(Keyword.IN, Keyword.TABLESPACE)
      stmt.tablespace = this.identifier()
    } else {
      if (this.consumeIf(Keyword.IF)) {
        this.consume(Keyword.EXISTS)
        stmt.ifExists = true
      }
      stmt.materializedView = this.schemaObject()
    }
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterProcedureStatement(stmt: model.AlterProcedureStatement) {
    stmt.procedure = this.callable(CallableType.PROCEDURE)
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterFunctionStatement(stmt: model.AlterFunctionStatement) {
    stmt.function = this.callable(CallableType.FUNCTION)
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterAggregateStatement(stmt: model.AlterAggregateStatement) {
    stmt.aggregate = this.callable(CallableType.AGGREGATE)
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterRoutineStatement(stmt: model.AlterRoutineStatement) {
    stmt.routine = this.callable(CallableType.FUNCTION)
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterForeignDataWrapperStatement(stmt: model.AlterForeignDataWrapperStatement) {
    stmt.foreignDataWrapper = this.identifier()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterTextSearchConfigurationStatement(stmt: model.AlterTextSearchConfigurationStatement) {
    stmt.textSearchConfiguration = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterTextSearchDictionaryStatement(stmt: model.AlterTextSearchDictionaryStatement) {
    stmt.textSearchDictionary = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterTextSearchParserStatement(stmt: model.AlterTextSearchParserStatement) {
    stmt.textSearchParser = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterTextSearchTemplateStatement(stmt: model.AlterTextSearchTemplateStatement) {
    stmt.textSearchTemplate = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterPolicyStatement(stmt: model.AlterPolicyStatement) {
    stmt.name = this.identifier()
    this.consume(Keyword.ON)
    stmt.table = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterRuleStatement(stmt: model.AlterRuleStatement) {
    stmt.rule = this.identifier()
    this.consume(Keyword.ON)
    stmt.table = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterTriggerStatement(stmt: model.AlterTriggerStatement) {
    stmt.trigger = this.identifier()
    this.consume(Keyword.ON)
    stmt.table = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAlterIndexStatement(stmt: model.AlterIndexStatement) {
    if (this.consumeIf(Keyword.ALL)) {
      this.consume(Keyword.IN, Keyword.TABLESPACE)
      stmt.tablespace = this.identifier()
    } else {
      if (this.consumeIf(Keyword.IF)) {
        this.consume(Keyword.EXISTS)
        stmt.ifExists = true
      }
      stmt.index = this.schemaObject()
    }
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseDropOwnedStatement(stmt: model.DropOwnedStatement) {
    this.consume(Keyword.BY)
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      const role = new model.Role()
      if (this.consumeIf(Keyword.CURRENT_USER)) {
        role.alias = model.CURRENT_USER
      } else if (this.consumeIf(Keyword.SESSION_USER)) {
        role.alias = model.SESSION_USER
      } else {
        role.name = this.identifier()
      }
      stmt.roles.push(role)
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropDatabaseStatement(stmt: model.DropDatabaseStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.database = this.identifier()
  }

  private parseDropAccessMethodStatement(stmt: model.DropAccessMethodStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.accessMethod = this.identifier()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropCastStatement(stmt: model.DropCastStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    this.consume(TokenType.LeftParen)
    stmt.sourceType = this.schemaObject() //TODO
    this.consume(Keyword.AS)
    stmt.targetType = this.schemaObject() //TODO
    this.consume(TokenType.RightParen)
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropEventTriggerStatement(stmt: model.DropEventTriggerStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.eventTrigger = this.identifier()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropExtensionStatement(stmt: model.DropExtensionStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.extension = this.identifier()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropLanguageStatement(stmt: model.DropLanguageStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    if (this.consumeIf(TokenType.String)) {
      stmt.language = dequote(this.token(-1).text)
    } else {
      stmt.language = this.identifier()
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropTransformStatement(stmt: model.DropTransformStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    this.consume(Keyword.FOR)
    stmt.type = this.schemaObject()
    this.consume(Keyword.LANGUAGE)
    stmt.language = this.identifier()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropPublicationStatement(stmt: model.DropPublicationStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.publications.push(this.identifier())
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropSubscriptionStatement(stmt: model.DropSubscriptionStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.subscription = this.identifier()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropServerStatement(stmt: model.DropServerStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.servers.push(this.identifier())
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropTablespaceStatement(stmt: model.DropTablespaceStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.tablespace = this.identifier()
  }

  private parseDropRoleStatement(stmt: model.DropRoleStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      const role = new model.Role()
      role.name = this.identifier()
      stmt.roles.push(role)
    }
  }

  private parseDropUserMappingStatement(stmt: model.DropUserMappingStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    this.consume(Keyword.FOR)
    if (this.consumeIf(Keyword.USER) || this.consumeIf(Keyword.CURRENT_USER)) {
      stmt.user.alias = model.CURRENT_USER
    } else if (this.consumeIf(Keyword.PUBLIC)) {
      stmt.user.alias = model.PUBLIC
    } else {
      stmt.user.name = this.identifier()
    }
    this.consume(Keyword.SERVER)
    stmt.server = this.identifier()
  }

  private parseDropSchemaStatement(stmt: model.DropSchemaStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.schemas.push(this.identifier())
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropTypeStatement(stmt: model.DropTypeStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.types.push(this.schemaObject())
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }


  private parseDropCollationStatement(stmt: model.DropCollationStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.collation = this.schemaObject()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropConversionStatement(stmt: model.DropConversionStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.conversion = this.schemaObject()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropDomainStatement(stmt: model.DropDomainStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.domains.push(this.schemaObject())
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropOperatorClassStatement(stmt: model.DropOperatorClassStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.operatorClass = this.schemaObject()
    this.consume(Keyword.USING)
    stmt.indexAccessMethod = this.identifier()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropOperatorFamilyStatement(stmt: model.DropOperatorFamilyStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.operatorFamily = this.schemaObject()
    this.consume(Keyword.USING)
    stmt.indexAccessMethod = this.identifier()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropOperatorStatement(stmt: model.DropOperatorStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.operators.push(this.customOperator())
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropStatisticsStatement(stmt: model.DropStatisticsStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.statistics.push(this.schemaObject())
    }
  }

  private parseDropTableStatement(stmt: model.DropTableStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.tables.push(this.schemaObject())
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropSequenceStatement(stmt: model.DropSequenceStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.sequences.push(this.schemaObject())
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropViewStatement(stmt: model.DropViewStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.views.push(this.schemaObject())
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropMaterializedViewStatement(stmt: model.DropMaterializedViewStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.materializedViews.push(this.schemaObject())
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropProcedureStatement(stmt: model.DropProcedureStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.procedures.push(this.callable(CallableType.PROCEDURE))
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropFunctionStatement(stmt: model.DropFunctionStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.functions.push(this.callable(CallableType.FUNCTION))
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropAggregateStatement(stmt: model.DropAggregateStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.aggregates.push(this.callable(CallableType.AGGREGATE))
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropForeignDataWrapperStatement(stmt: model.DropForeignDataWrapperStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.foreignDataWrappers.push(this.identifier())
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropForeignTableStatement(stmt: model.DropForeignTableStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.foreignTables.push(this.schemaObject())
    }
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropTextSearchConfigurationStatement(stmt: model.DropTextSearchConfigurationStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.textSearchConfiguration = this.schemaObject()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropTextSearchDictionaryStatement(stmt: model.DropTextSearchDictionaryStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.textSearchDictionary = this.schemaObject()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropTextSearchParserStatement(stmt: model.DropTextSearchParserStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.textSearchParser = this.schemaObject()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropTextSearchTemplateStatement(stmt: model.DropTextSearchTemplateStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.textSearchTemplate = this.schemaObject()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropPolicyStatement(stmt: model.DropPolicyStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.name = this.identifier()
    this.consume(Keyword.ON)
    stmt.table = this.schemaObject()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropRuleStatement(stmt: model.DropRuleStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.rule = this.identifier()
    this.consume(Keyword.ON)
    stmt.table = this.schemaObject()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropTriggerStatement(stmt: model.DropTriggerStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.trigger = this.identifier()
    this.consume(Keyword.ON)
    stmt.table = this.schemaObject()
    if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseDropIndexStatement(stmt: model.DropIndexStatement) {
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
      stmt.dependent = model.CASCADE
    } else if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dependent = model.RESTRICT
    }
  }

  private parseReassignOwnedStatement(stmt: model.ReassignOwnedStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseSecurityLabelStatement(stmt: model.SecurityLabelStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseTruncateStatement(stmt: model.TruncateStatement) {
    this.consumeIf(Keyword.TABLE)
    if (this.consumeIf(Keyword.ONLY)) {
      stmt.only = true
    }
    stmt.table = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseCommentStatement(stmt: model.CommentStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseGrantStatement(stmt: model.GrantStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseRevokeStatement(stmt: model.RevokeStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseLockStatement(stmt: model.LockStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseStartTransactionStatement(stmt: model.StartTransactionStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseBeginStatement(stmt: model.BeginStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseSavepointStatement(stmt: model.SavepointStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseReleaseSavepointStatement(stmt: model.ReleaseSavepointStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseCommitPreparedStatement(stmt: model.CommitPreparedStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseCommitStatement(stmt: model.CommitStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseEndStatement(stmt: model.EndStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseRollbackPreparedStatement(stmt: model.RollbackPreparedStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseRollbackStatement(stmt: model.RollbackStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAbortStatement(stmt: model.AbortStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseDiscardStatement(stmt: model.DiscardStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseExplainStatement(stmt: model.ExplainStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseAnalyzeStatement(stmt: model.AnalyzeStatement) {
    if (this.consumeIf(Keyword.VERBOSE)) {
      stmt.verbose = true
    } else if (this.consumeIf(TokenType.LeftParen)) {
      while (this.token() && !this.peekIf(TokenType.RightParen)) {
        this.consume()
      }
      this.consume(TokenType.RightParen)
    }
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseClusterStatement(stmt: model.ClusterStatement) {
    if (this.consumeIf(Keyword.VERBOSE)) {
      stmt.verbose = true
    }
    if (this.token()) {
      stmt.table = this.schemaObject()
    }
  }

  private parseRefreshMaterializedViewStatement(stmt: model.RefreshMaterializedViewStatement) {
    if (this.consumeIf(Keyword.CONCURRENTLY)) {
      stmt.concurrently = true
    }
    stmt.materializedView = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseReindexSystemStatement(stmt: model.ReindexSystemStatement) {
    if (this.consumeIf(Keyword.CONCURRENTLY)) {
      stmt.concurrently = true
    }
    stmt.schema = this.identifier()
  }

  private parseReindexDatabaseStatement(stmt: model.ReindexDatabaseStatement) {
    if (this.consumeIf(Keyword.CONCURRENTLY)) {
      stmt.concurrently = true
    }
    stmt.schema = this.identifier()
  }

  private parseReindexSchemaStatement(stmt: model.ReindexSchemaStatement) {
    if (this.consumeIf(Keyword.CONCURRENTLY)) {
      stmt.concurrently = true
    }
    stmt.schema = this.identifier()
  }

  private parseReindexTableStatement(stmt: model.ReindexTableStatement) {
    if (this.consumeIf(Keyword.CONCURRENTLY)) {
      stmt.concurrently = true
    }
    stmt.table = this.schemaObject()
  }

  private parseReindexIndexStatement(stmt: model.ReindexIndexStatement) {
    if (this.consumeIf(Keyword.CONCURRENTLY)) {
      stmt.concurrently = true
    }
    stmt.index = this.schemaObject()
  }

  private parseVacuumStatement(stmt: model.VacuumStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseLoadStatement(stmt: model.LoadStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseImportForeignSchemaStatement(stmt: model.ImportForeignSchemaStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseCopyStatement(stmt: model.CopyStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseCheckpointStatement(stmt: model.CheckpointStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parsePrepareTransactionStatement(stmt: model.PrepareTransactionStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parsePrepareStatement(stmt: model.PrepareStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseExecuteStatement(stmt: model.ExecuteStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseDeallocateStatement(stmt: model.DeallocateStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseDeclareStatement(stmt: model.DeclareStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseFetchStatement(stmt: model.FetchStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseMoveStatement(stmt: model.MoveStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseCloseStatement(stmt: model.CloseStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseListenStatement(stmt: model.ListenStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseNotifyStatement(stmt: model.NotifyStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseUnlistenStatement(stmt: model.UnlistenStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseSetConstraintStatement(stmt: model.SetConstraintStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseSetRoleStatement(stmt: model.SetRoleStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseSetSessionAuthorizationStatement(stmt: model.SetSessionAuthorizationStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseSetTransactionStatement(stmt: model.SetTransactionStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseSetStatement(stmt: model.SetStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseResetStatement(stmt: model.ResetStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseShowStatement(stmt: model.ShowStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseCallStatement(stmt: model.CallStatement) {
    stmt.procedure = this.schemaObject()
    this.consume(TokenType.LeftParen)
    while (this.token() && !this.peekIf(TokenType.RightParen)) {
      this.consume()
    }
    this.consume(TokenType.RightParen)
  }

  private parseDoStatement(stmt: model.DoStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseValuesStatement(stmt: model.ValuesStatement) {
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseInsertStatement(stmt: model.InsertStatement) {
    this.consume(Keyword.INTO)
    stmt.table = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseUpdateStatement(stmt: model.UpdateStatement) {
    if (this.consumeIf(Keyword.ONLY)) {
      stmt.only = true
    }
    stmt.table = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseDeleteStatement(stmt: model.DeleteStatement) {
    if (this.consumeIf(Keyword.ONLY)) {
      stmt.only = true
    }
    this.consumeIf(Keyword.FROM)
    stmt.table = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseSelectStatement(stmt: model.SelectStatement) {
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
      sobj.schema = sobj.name
      sobj.name = this.identifier()
    }
    return sobj
  }

  private customOperator() {
    const ope = new model.CustomOpeartor()
    if (this.consumeIf(TokenType.Operator)) {
      ope.name = this.token(-1).text
    } else {
      ope.schema = this.identifier()
      this.consume(TokenType.Dot, TokenType.Operator)
      ope.name = this.token(-1).text
    }
    if (this.consumeIf(TokenType.LeftParen)) {
      if (this.consumeIf(Keyword.NONE)) {
        // no handle
      } else {
        ope.leftType = this.schemaObject() //TODO
      }
      if (this.consumeIf(TokenType.Comma)) {
        if (this.consumeIf(Keyword.NONE)) {
          // no handle
        } else {
          ope.rightType = this.schemaObject() //TODO
        }
      }
      this.consume(TokenType.RightParen)
    }
    return ope
  }

  private callable(type: CallableType) {
    const cobj = new model.Callable()
    cobj.name = this.identifier()
    if (
      type === CallableType.AGGREGATE && this.consume(TokenType.LeftParen) ||
      this.consumeIf(TokenType.LeftParen)
    ) {
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        if (type === CallableType.AGGREGATE && this.consumeIf(Keyword.OPE_ASTER)) {
          break
        }

        const arg = new model.CallableArgument()
        if (this.consumeIf(Keyword.IN)) {
          arg.mode = model.IN
        } else if (type === CallableType.FUNCTION && this.consumeIf(Keyword.OUT)) {
          arg.mode = model.OUT
        } else if (type === CallableType.FUNCTION && this.consumeIf(Keyword.INOUT)) {
          arg.mode = model.INOUT
        } else if (this.consumeIf(Keyword.VARIADIC)) {
          arg.mode = model.VARIADIC
        }
        arg.type.name = this.identifier()
        if (this.consumeIf(TokenType.Dot)) {
          arg.type.schema = arg.type.name
          arg.type.name = this.identifier() //TODO
        } else if (this.token() &&
          !this.peekIf(TokenType.Comma) &&
          !this.peekIf(TokenType.RightParen) &&
          !this.peekIf(Keyword.ORDER)
        ) {
          arg.name = arg.type.name
          arg.type = this.schemaObject() //TODO
        }
        cobj.args.push(arg)
        if (type === CallableType.AGGREGATE) {
          if (this.consumeIf(Keyword.ORDER)) {
            this.consume(Keyword.BY)
            cobj.orderBy = []
            for (let j = 0; j === 0 || this.consumeIf(TokenType.Comma); j++) {
              const arg2 = new model.CallableArgument()
              if (this.consumeIf(Keyword.IN)) {
                arg2.mode = model.IN
              } else if (this.consumeIf(Keyword.VARIADIC)) {
                arg2.mode = model.VARIADIC
              }
              arg2.type.name = this.identifier()
              if (this.consumeIf(TokenType.Dot)) {
                arg2.type.schema = arg2.type.name
                arg2.type.name = this.identifier() //TODO
              } else if (this.token() &&
                !this.peekIf(TokenType.Comma) &&
                !this.peekIf(TokenType.RightParen) &&
                !this.peekIf(Keyword.ORDER)
              ) {
                arg2.name = arg2.type.name
                arg2.type = this.schemaObject() //TODO
              }
              cobj.orderBy.push(arg2)
            }
            break
          }
        }
      }
      this.consume(TokenType.RightParen)
    }
    return cobj
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

  stringValue() {
    if (this.consumeIf(TokenType.String)) {
      return unescape(dequote(this.token(-1).text))
    } else {
      throw this.createParseError()
    }
  }

  numberValue() {
    let text
    if (this.consumeIf(Keyword.OPE_PLUS) || this.consumeIf(Keyword.OPE_MINUS)) {
      text = this.token(-1).text
      this.consume(TokenType.Number)
      text += this.token(-1).text
    } else {
      this.consume(TokenType.Number)
      text = this.token(-1).text
    }
    return new Decimal(text).toString()
  }

  booleanValue() {
    if (this.consumeIf(Keyword.TRUE)) {
      return true
    } else if (this.consumeIf(Keyword.FALSE)) {
      return false
    } else {
      throw this.createParseError()
    }
  }
}

enum CallableType {
  PROCEDURE,
  FUNCTION,
  AGGREGATE
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
