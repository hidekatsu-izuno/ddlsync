import { Statement } from "../models"
import {
  ITokenType,
  Token,
  Lexer,
  Parser,
  ParseError,
  AggregateParseError,
} from "../parser"
import { ucase } from "../util/functions"
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
  static ACCESS = new Keyword("ACCESS")
  static AGGREGATE = new Keyword("AGGREGATE")
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
  static CLASS = new Keyword("CLASS")
  static COLLATE = new Keyword("COLLATE", { reserved: true })
  static COLLATION = new Keyword("COLLATION")
  static COLUMN = new Keyword("COLUMN", { reserved: true })
  static CONCURRENTLY = new Keyword("CONCURRENTLY")
  static CONFIGURATION = new Keyword("CONFIGURATION")
  static CONSTRAINT = new Keyword("CONSTRAINT", { reserved: true })
  static CONVERSION = new Keyword("CONVERSION")
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
  static DEFAULT = new Keyword("DEFAULT", { reserved: true })
  static DEFERRABLE = new Keyword("DEFERRABLE", { reserved: true })
  static DESC = new Keyword("DESC", { reserved: true })
  static DICTIONARY = new Keyword("DICTIONARY")
  static DISTINCT = new Keyword("DISTINCT", { reserved: true })
  static DO = new Keyword("DO", { reserved: true })
  static DOMAIN = new Keyword("DOMAIN")
  static ELSE = new Keyword("ELSE", { reserved: true })
  static END = new Keyword("END", { reserved: true })
  static EVENT = new Keyword("EVENT")
  static EXCEPT = new Keyword("EXCEPT", { reserved: true })
  static EXTENSION = new Keyword("EXTENSION")
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
  static ILIKE = new Keyword("ILIKE")
  static IN = new Keyword("IN", { reserved: true })
  static INITIALLY = new Keyword("INITIALLY", { reserved: true })
  static INDEX = new Keyword("INDEX")
  static INNER = new Keyword("INNER")
  static INTERSECT = new Keyword("INTERSECT", { reserved: true })
  static INTO = new Keyword("INTO", { reserved: true })
  static IS = new Keyword("IS")
  static ISNULL = new Keyword("ISNULL")
  static JOIN = new Keyword("JOIN")
  static LANGUAGE = new Keyword("LANGUAGE")
  static LATERAL = new Keyword("LATERAL", { reserved: true })
  static LEADING = new Keyword("LEADING", { reserved: true })
  static LEFT = new Keyword("LEFT")
  static LIKE = new Keyword("LIKE")
  static LIMIT = new Keyword("LIMIT", { reserved: true })
  static LOCAL = new Keyword("LOCAL")
  static LOCALTIME = new Keyword("LOCALTIME", { reserved: true })
  static LOCALTIMESTAMP = new Keyword("LOCALTIMESTAMP", { reserved: true })
  static MATERIALIZED = new Keyword("MATERIALIZED")
  static MAPPING = new Keyword("MAPPING")
  static METHOD = new Keyword("METHOD")
  static NATURAL = new Keyword("NATURAL")
  static NOT = new Keyword("NOT", { reserved: true })
  static NOTNULL = new Keyword("NOTNULL")
  static NULL = new Keyword("NULL", { reserved: true })
  static OFFSET = new Keyword("OFFSET", { reserved: true })
  static ON = new Keyword("ON", { reserved: true })
  static ONLY = new Keyword("ONLY", { reserved: true })
  static OPERATOR = new Keyword("OPERATOR")
  static OR = new Keyword("OR", { reserved: true })
  static ORDER = new Keyword("ORDER", { reserved: true })
  static OUTER = new Keyword("OUTER")
  static OVERLAPS = new Keyword("OVERLAPS")
  static PARSER = new Keyword("PARSER")
  static PLACING = new Keyword("PLACING", { reserved: true })
  static POLICY = new Keyword("POLICY")
  static PRIMARY = new Keyword("PRIMARY", { reserved: true })
  static PROCEDURE = new Keyword("PROCEDURE")
  static PUBLICATION = new Keyword("PUBLICATION")
  static RECURSIVE = new Keyword("RECURSIVE")
  static REFERENCES = new Keyword("REFERENCES", { reserved: true })
  static RETURNING = new Keyword("RETURNING", { reserved: true })
  static RIGHT = new Keyword("RIGHT")
  static ROLE = new Keyword("ROLE")
  static RULE = new Keyword("RULE")
  static REPLACE = new Keyword("REPLACE")
  static SCHEMA = new Keyword("SCHEMA")
  static SEARCH = new Keyword("SEARCH")
  static SERVER = new Keyword("SERVER")
  static SELECT = new Keyword("SELECT", { reserved: true })
  static SEQUENCE = new Keyword("SEQUENCE")
  static SESSION_USER = new Keyword("SESSION_USER", { reserved: true })
  static SIMILAR = new Keyword("SIMILAR")
  static SOME = new Keyword("SOME", { reserved: true })
  static STATISTICS = new Keyword("STATISTICS")
  static SUBSCRIPTION = new Keyword("SUBSCRIPTION")
  static SYMMETRIC = new Keyword("SYMMETRIC", { reserved: true })
  static TABLE = new Keyword("TABLE", { reserved: true })
  static TABLESPACE  = new Keyword("TABLESPACE")
  static TEMP = new Keyword("TEMP")
  static TEMPLATE = new Keyword("TEMPLATE")
  static TEMPORARY = new Keyword("TEMPORARY")
  static TEXT = new Keyword("TEXT")
  static THEN = new Keyword("THEN", { reserved: true })
  static TO = new Keyword("TO", { reserved: true })
  static TRAILING = new Keyword("TRAILING", { reserved: true })
  static TRANSFORM = new Keyword("TRANSFORM")
  static TRIGGER = new Keyword("TRIGGER")
  static TRUE = new Keyword("TRUE", { reserved: true })
  static TYPE = new Keyword("TYPE")
  static UNION = new Keyword("UNION", { reserved: true })
  static UNIQUE = new Keyword("UNIQUE", { reserved: true })
  static UNLOGGED = new Keyword("UNLOGGED")
  static USER = new Keyword("USER", { reserved: true })
  static USING = new Keyword("USING", { reserved: true })
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
          const stmt = this.command()
          stmt.validate()
          root.push(stmt)
        } else if (this.token() && !this.peekIf(TokenType.SemiColon)) {
          const stmt = this.statement()
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
      } else if (this.consumeIf(Keyword.ACCESS)) {
        this.consume(Keyword.METHOD)
        stmt = new model.CreateAccessMethodStatement()
      } else if (this.consumeIf(Keyword.CAST)) {
        stmt = new model.CreateCastStatement()
      } else if (this.consumeIf(Keyword.EVENT)) {
        this.consume(Keyword.TRIGGER)
        stmt = new model.CreateEventTriggerStatement()
      } else if (this.consumeIf(Keyword.EXTENSION)) {
        stmt = new model.CreateExtensionStatement()
      } else if (this.consumeIf(Keyword.LANGUAGE)) {
        stmt = new model.CreateLanguageStatement()
      } else if (this.consumeIf(Keyword.TRANSFORM)) {
        stmt = new model.CreateTransformStatement()
      } else if (this.consumeIf(Keyword.PUBLICATION)) {
        stmt = new model.CreatePublicationStatement()
      } else if (this.consumeIf(Keyword.SUBSCRIPTION)) {
        stmt = new model.CreateSubscriptionStatement()
      } else if (this.consumeIf(Keyword.SERVER)) {
        stmt = new model.CreateServerStatement()
      } else if (this.consumeIf(Keyword.TABLESPACE)) {
        stmt = new model.CreateTablespaceStatement()
      } else if (this.consumeIf(Keyword.TYPE)) {
        stmt = new model.CreateTypeStatement()
      } else if (this.consumeIf(Keyword.GROUP) || this.consumeIf(Keyword.ROLE)) {
        stmt = new model.CreateRoleStatement()
      } else if (this.consumeIf(Keyword.USER)) {
        if (this.consumeIf(Keyword.MAPPING)) {
          stmt = new model.CreateUserMappingStatement()
        } else {
          stmt = new model.CreateRoleStatement()
          stmt.login = true
        }
      } else if (this.consumeIf(Keyword.SCHEMA)) {
        stmt = new model.CreateSchemaStatement()
      } else if (this.consumeIf(Keyword.COLLATION)) {
        stmt = new model.CreateCollationStatement()
      } else if (this.peekIf(Keyword.DEFAULT) || this.consumeIf(Keyword.CONVERSION)) {
        stmt = new model.CreateConversionStatement()
        if (this.consumeIf(Keyword.DEFAULT)) {
          stmt.default = true
          this.consume(Keyword.CONVERSION)
        }
      } else if (this.consumeIf(Keyword.DOMAIN)) {
        stmt = new model.CreateDomainStatement()
      } else if (this.consumeIf(Keyword.OPERATOR)) {
        if (this.consumeIf(Keyword.CLASS)) {
          stmt = new model.CreateOperatorClassStatement()
        } else if (this.consumeIf(Keyword.FAMILY)) {
          stmt = new model.CreateOperatorFamilyStatement()
        } else {
          stmt = new model.CreateOperatorStatement()
        }
      } else if (this.consumeIf(Keyword.STATISTICS)) {
        stmt = new model.CreateStatisticsClassStatement()
      } else if (this.consumeIf(Keyword.GLOBAL) || this.consumeIf(Keyword.LOCAL)) {
        stmt = new model.CreateTableStatement()
        if (this.consumeIf(Keyword.TEMPORARY) || this.consumeIf(Keyword.TEMP)) {
          stmt.temporary = true
        }
        if (this.consumeIf(Keyword.UNLOGGED)) {
          stmt.unlogged = true
        }
        this.consume(Keyword.TABLE)
      } else if (this.consumeIf(Keyword.OR)) {
        this.consume(Keyword.REPLACE)
        if (this.consumeIf(Keyword.LANGUAGE)) {
          stmt = new model.CreateLanguageStatement()
          stmt.orReplace = true
        } else if (this.consumeIf(Keyword.TRANSFORM)) {
          stmt = new model.CreateTransformStatement()
          stmt.orReplace = true
        } else if (this.peekIf(Keyword.RECURSIVE) || this.consumeIf(Keyword.VIEW)) {
          stmt = new model.CreateViewStatement()
          stmt.orReplace = true
          if (this.consumeIf(Keyword.RECURSIVE)) {
            this.consume(Keyword.VIEW)
            stmt.recursive = true
          }
        } else if (this.consumeIf(Keyword.PROCEDURE)) {
          stmt = new model.CreateProcedureStatement()
          stmt.orReplace = true
        } else if (this.consumeIf(Keyword.FUNCTION)) {
          stmt = new model.CreateFunctionStatement()
          stmt.orReplace = true
        } else if (this.consumeIf(Keyword.AGGREGATE)) {
          stmt = new model.CreateAggregateStatement()
          stmt.orReplace = true
        } else if (this.consumeIf(Keyword.RULE)) {
          stmt = new model.CreateRuleStatement()
          stmt.orReplace = true
        } else {
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.TEMPORARY) || this.consumeIf(Keyword.TEMP)) {
        if (this.peekIf(Keyword.UNLOGGED) || this.consumeIf(Keyword.TABLE)) {
          stmt = new model.CreateTableStatement()
          stmt.temporary = true
          if (this.consumeIf(Keyword.UNLOGGED)) {
            this.consume(Keyword.TABLE)
            stmt.unlogged = true
          }
        } else if (this.consumeIf(Keyword.SEQUENCE)) {
          stmt = new model.CreateSequenceStatement()
          stmt.temporary = true
        } else if (this.peekIf(Keyword.RECURSIVE) || this.consumeIf(Keyword.VIEW)) {
          stmt = new model.CreateViewStatement()
          stmt.temporary = true
          if (this.consumeIf(Keyword.RECURSIVE)) {
            this.consume(Keyword.VIEW)
            stmt.recursive = true
          }
        }
      } else if (this.consumeIf(Keyword.FOREIGN)) {
        if (this.consumeIf(Keyword.DATA)) {
          this.consume(Keyword.WRAPPER)
          stmt = new model.CreateForeignDataWrapperStatement()
        } else if (this.consumeIf(Keyword.TABLE)) {
          stmt = new model.CreateForeignTableStatement()
        } else {
          throw this.createParseError()
        }
      } else if (this.peekIf(Keyword.UNLOGGED) || this.consumeIf(Keyword.TABLE)) {
        stmt = new model.CreateTableStatement()
        if (this.consumeIf(Keyword.UNLOGGED)) {
          this.consume(Keyword.TABLE)
          stmt.unlogged = true
        }
      } else if (this.consumeIf(Keyword.SEQUENCE)) {
        stmt = new model.CreateSequenceStatement()
      } else if (this.peekIf(Keyword.RECURSIVE) || this.consumeIf(Keyword.VIEW)) {
        stmt = new model.CreateViewStatement()
        if (this.consumeIf(Keyword.RECURSIVE)) {
          stmt.recursive = true
          this.consume(Keyword.VIEW)
        }
      } else if (this.consumeIf(Keyword.MATERIALIZED)) {
        stmt = new model.CreateMaterializedViewStatement()
      } else if (this.consumeIf(Keyword.PROCEDURE)) {
        stmt = new model.CreateProcedureStatement()
      } else if (this.consumeIf(Keyword.FUNCTION)) {
        stmt = new model.CreateFunctionStatement()
      } else if (this.consumeIf(Keyword.AGGREGATE)) {
        stmt = new model.CreateAggregateStatement()
      } else if (this.peekIf(Keyword.CONSTRAINT) || this.consumeIf(Keyword.TRIGGER)) {
        stmt = new model.CreateTriggerStatement()
        if (this.consumeIf(Keyword.CONSTRAINT)) {
          stmt.constraint = true
          this.consume(Keyword.TRIGGER)
        }
      } else if (this.consumeIf(Keyword.TEXT)) {
        this.consume(Keyword.SEARCH)
        if (this.consumeIf(Keyword.CONFIGURATION)) {
          stmt = new model.CreateTextSearchConfigurationStatement()
        } else if (this.consumeIf(Keyword.DICTIONARY)) {
          stmt = new model.CreateTextSearchDictionaryStatement()
        } else if (this.consumeIf(Keyword.PARSER)) {
          stmt = new model.CreateTextSearchParserStatement()
        } else if (this.consumeIf(Keyword.TEMPLATE)) {
          stmt = new model.CreateTextSearchTemplateStatement()
        } else {
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.POLICY)) {
        stmt = new model.CreatePolicyStatement()
      } else if (this.consumeIf(Keyword.RULE)) {
        stmt = new model.CreateRuleStatement()
      } else if (this.peekIf(Keyword.UNIQUE) || this.consumeIf(Keyword.INDEX)) {
        stmt = new model.CreateIndexStatement()
        if (this.consumeIf(Keyword.UNIQUE)) {
          stmt.type = model.IndexType.UNIQUE
          this.consume(Keyword.INDEX)
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
}
