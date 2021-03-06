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
import * as model from "./sqlite3_models"

export class TokenType implements ITokenType {
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
  static ADD = new Keyword("ADD", { reserved: true })
  static ALL = new Keyword("ALL", { reserved: true })
  static ALTER = new Keyword("ALTER", { reserved: true })
  static ALWAYS = new Keyword("ALWAYS", { reserved: function(options: { [key: string]: any }) {
    return options.compileOptions?.has("SQLITE_OMIT_GENERATED_COLUMNS")
  }})
  static AND = new Keyword("AND", { reserved: true })
  static ANALYZE = new Keyword("ANALYZE")
  static AS = new Keyword("AS", { reserved: true })
  static ASC = new Keyword("ASC")
  static ATTACH = new Keyword("ATTACH")
  static AUTOINCREMENT = new Keyword("AUTOINCREMENT", { reserved: true })
  static BEGIN = new Keyword("BEGIN")
  static BETWEEN = new Keyword("BETWEEN", { reserved: true })
  static CASE = new Keyword("CASE", { reserved: true })
  static CHECK = new Keyword("CHECK", { reserved: true })
  static COLLATE = new Keyword("COLLATE", { reserved: true })
  static COLUMN = new Keyword("COLUMN")
  static COMMIT = new Keyword("COMMIT", { reserved: true })
  static CONFLICT = new Keyword("CONFLICT")
  static CONSTRAINT = new Keyword("CONSTRAINT", { reserved: true })
  static CREATE = new Keyword("CREATE", { reserved: true })
  static CROSS = new Keyword("CROSS", { reserved: true })
  static CURRENT = new Keyword("CURRENT", { reserved: function(options: { [key: string]: any }) {
    return options.compileOptions?.has("SQLITE_OMIT_WINDOWFUNC")
  }})
  static CURRENT_DATE = new Keyword("CURRENT_DATE", { reserved: true })
  static CURRENT_TIME = new Keyword("CURRENT_TIME", { reserved: true })
  static CURRENT_TIMESTAMP = new Keyword("CURRENT_TIMESTAMP", { reserved: true })
  static DATABASE = new Keyword("DATABASE")
  static DEFAULT = new Keyword("DEFAULT", { reserved: true })
  static DEFERRED = new Keyword("DEFERRED")
  static DEFERRABLE = new Keyword("DEFERRABLE", { reserved: true })
  static DELETE = new Keyword("DELETE", { reserved: true })
  static DESC = new Keyword("DESC")
  static DETACH = new Keyword("DETACH")
  static DISTINCT = new Keyword("DISTINCT", { reserved: true })
  static DROP = new Keyword("DROP")
  static ELSE = new Keyword("ELSE", { reserved: true })
  static ESCAPE = new Keyword("ESCAPE", { reserved: true })
  static EXCEPT = new Keyword("EXCEPT", { reserved: function(options: { [key: string]: any }) {
    return !options.compileOptions?.has("SQLITE_OMIT_COMPOUND_SELECT")
  }})
  static EXISTS = new Keyword("EXISTS", { reserved: true })
  static EXCLUDE = new Keyword("EXCLUDE", { reserved: function(options: { [key: string]: any }) {
    return options.compileOptions?.has("SQLITE_OMIT_WINDOWFUNC")
  }})
  static EXCLUSIVE = new Keyword("EXCLUSIVE")
  static END = new Keyword("END")
  static EXPLAIN = new Keyword("EXPLAIN")
  static FAIL = new Keyword("FAIL")
  static FALSE = new Keyword("FALSE")
  static FILTER = new Keyword("FILTER", { reserved: true })
  static FOLLOWING = new Keyword("FOLLOWING", { reserved: function(options: { [key: string]: any }) {
    return options.compileOptions?.has("SQLITE_OMIT_WINDOWFUNC")
  }})
  static FOREIGN = new Keyword("FOREIGN", { reserved: true })
  static FROM = new Keyword("FROM", { reserved: true })
  static GENERATED = new Keyword("GENERATED", { reserved: function(options: { [key: string]: any }) {
    return options.compileOptions?.has("SQLITE_OMIT_GENERATED_COLUMNS")
  }})
  static GLOB = new Keyword("GLOB", { reserved: true })
  static GROUP = new Keyword("GROUP", { reserved: true })
  static GROUPS = new Keyword("GROUPS", { reserved: function(options: { [key: string]: any }) {
    return options.compileOptions?.has("SQLITE_OMIT_WINDOWFUNC")
  }})
  static HAVING = new Keyword("HAVING", { reserved: true })
  static IGNORE = new Keyword("IGNORE")
  static IMMEDIATE = new Keyword("IMMEDIATE")
  static IN = new Keyword("IN", { reserved: true })
  static INDEX = new Keyword("INDEX", { reserved: true })
  static INDEXED = new Keyword("INDEXED", { reserved: true })
  static INNER = new Keyword("INNER", { reserved: true })
  static INSERT = new Keyword("INSERT", { reserved: true })
  static INTERSECT = new Keyword("INTERSECT", { reserved: function(options: { [key: string]: any }) {
    return !options.compileOptions?.has("SQLITE_OMIT_COMPOUND_SELECT")
  }})
  static INTO = new Keyword("INTO", { reserved: true })
  static IF = new Keyword("IF")
  static IS = new Keyword("IS", { reserved: true })
  static ISNULL = new Keyword("ISNULL", { reserved: true })
  static JOIN = new Keyword("JOIN", { reserved: true })
  static KEY = new Keyword("KEY")
  static LEFT = new Keyword("LEFT", { reserved: true })
  static LIMIT = new Keyword("LIMIT", { reserved: true })
  static MATERIALIZED = new Keyword("MATERIALIZED")
  static NATURAL = new Keyword("NATURAL", { reserved: true })
  static NOT = new Keyword("NOT", { reserved: true })
  static NOTHING = new Keyword("NOTHING", { reserved: true })
  static NOTNULL = new Keyword("NOTNULL", { reserved: true })
  static NULL = new Keyword("NULL", { reserved: true })
  static ON = new Keyword("ON", { reserved: true })
  static OR = new Keyword("OR", { reserved: true })
  static ORDER = new Keyword("ORDER", { reserved: true })
  static OTHERS = new Keyword("OTHERS", { reserved: function(options: { [key: string]: any }) {
    return options.compileOptions?.has("SQLITE_OMIT_WINDOWFUNC")
  }})
  static OUTER = new Keyword("OUTER", { reserved: true })
  static OVER = new Keyword("OVER", { reserved: true })
  static PARTITION = new Keyword("PARTITION", { reserved: function(options: { [key: string]: any }) {
    return options.compileOptions?.has("SQLITE_OMIT_WINDOWFUNC")
  }})
  static PRAGMA = new Keyword("PRAGMA")
  static PRECEDING = new Keyword("PRECEDING", { reserved: function(options: { [key: string]: any }) {
    return options.compileOptions?.has("SQLITE_OMIT_WINDOWFUNC")
  }})
  static PRIMARY = new Keyword("PRIMARY", { reserved: true })
  static PLAN = new Keyword("PLAN")
  static QUERY = new Keyword("QUERY")
  static RANGE = new Keyword("RANGE", { reserved: function(options: { [key: string]: any }) {
    return options.compileOptions?.has("SQLITE_OMIT_WINDOWFUNC")
  }})
  static RECURSIVE = new Keyword("RECURSIVE")
  static REFERENCES = new Keyword("REFERENCES", { reserved: true })
  static REGEXP = new Keyword("REGEXP", { reserved: true })
  static RENAME = new Keyword("RENAME")
  static RELEASE = new Keyword("RELEASE")
  static REINDEX = new Keyword("REINDEX")
  static REPLACE = new Keyword("REPLACE")
  static RETURNING = new Keyword("RETURNING", { reserved: true })
  static RIGHT = new Keyword("RIGHT", { reserved: true })
  static ROLLBACK = new Keyword("ROLLBACK")
  static ROWID = new Keyword("ROWID")
  static SAVEPOINT = new Keyword("SAVEPOINT")
  static SCHEMA = new Keyword("SCHEMA")
  static SELECT = new Keyword("SELECT", { reserved: true })
  static SET = new Keyword("SET", { reserved: true })
  static TABLE = new Keyword("TABLE", { reserved: true })
  static TEMP = new Keyword("TEMP")
  static TEMPORARY = new Keyword("TEMPORARY", { reserved: true })
  static THEN = new Keyword("THEN", { reserved: true })
  static TIES = new Keyword("TIES", { reserved: function(options: { [key: string]: any }) {
    return options.compileOptions?.has("SQLITE_OMIT_WINDOWFUNC")
  }})
  static TO = new Keyword("TO", { reserved: true })
  static TRANSACTION = new Keyword("TRANSACTION", { reserved: true })
  static TRIGGER = new Keyword("TRIGGER")
  static TRUE = new Keyword("TRUE")
  static UNBOUNDED = new Keyword("UNBOUNDED", { reserved: function(options: { [key: string]: any }) {
    return options.compileOptions?.has("SQLITE_OMIT_WINDOWFUNC")
  }})
  static UNION = new Keyword("UNION", { reserved: function(options: { [key: string]: any }) {
    return !options.compileOptions?.has("SQLITE_OMIT_COMPOUND_SELECT")
  }})
  static UNIQUE = new Keyword("UNIQUE", { reserved: true })
  static UPDATE = new Keyword("UPDATE", { reserved: true })
  static USING = new Keyword("USING", { reserved: true })
  static VACUUM = new Keyword("VACUUM")
  static VALUES = new Keyword("VALUES", { reserved: true })
  static VIEW = new Keyword("VIEW")
  static VIRTUAL = new Keyword("VIRTUAL")
  static WHEN = new Keyword("WHEN", { reserved: true })
  static WHERE = new Keyword("WHERE", { reserved: true })
  static WINDOW = new Keyword("WINDOW", { reserved: true })
  static WITH = new Keyword("WITH")
  static WITHOUT = new Keyword("WITHOUT")

  static OPE_EQ = new Keyword("=")
  static OPE_PLUS = new Keyword("+")
  static OPE_MINUS = new Keyword("-")

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

export class Sqlite3Lexer extends Lexer {
  private reserved = new Set<Keyword>()

  constructor(
    private options: { [key: string]: any } = {}
  ) {
    super("sqlite3", [
      { type: TokenType.BlockComment, re: /\/\*.*?\*\//sy },
      { type: TokenType.LineComment, re: /--.*/y },
      { type: TokenType.WhiteSpace, re: /[ \t]+/y },
      { type: TokenType.Command, re: /^\..+$/my },
      { type: TokenType.LineBreak, re: /(?:\r\n?|\n)/y },
      { type: TokenType.SemiColon, re: /;/y },
      { type: TokenType.LeftParen, re: /\(/y },
      { type: TokenType.RightParen, re: /\)/y },
      { type: TokenType.Comma, re: /,/y },
      { type: TokenType.Number, re: /0[xX][0-9a-fA-F]+|((0|[1-9][0-9]*)(\.[0-9]+)?|(\.[0-9]+))([eE][+-]?[0-9]+)?/y },
      { type: TokenType.Dot, re: /\./y },
      { type: TokenType.String, re: /[Xx]?'([^']|'')*'/y },
      { type: TokenType.QuotedValue, re: /"([^"]|"")*"/y },
      { type: TokenType.QuotedIdentifier, re: /(`([^`]|``)*`|\[[^\]]*\])/y },
      { type: TokenType.BindVariable, re: /\?([1-9][0-9]*)?/y },
      { type: TokenType.BindVariable, re: /[$@:#][a-zA-Z_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y },
      { type: TokenType.Identifier, re: /[a-zA-Z_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y },
      { type: TokenType.Operator, re: /\|\||<<|>>|<>|[=<>!]=?|[~&|*/%+-]/y },
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

export class Sqlite3Parser extends Parser {
  private stmtStart = 0

  constructor(
    input: string,
    options: { [key: string]: any} = {},
  ) {
    super(input, new Sqlite3Lexer(options), options)
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
      const re = /([ \t]+)|"([^"]*)"|'([^']*)'|([^ \t"']+)/y
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

    let explain = false
    let queryPlan = false
    if (this.consumeIf(Keyword.EXPLAIN)) {
      explain = true
      if (this.consumeIf(Keyword.QUERY)) {
        this.consume(Keyword.PLAN)
        queryPlan = true
      }
    }

    if (this.consumeIf(Keyword.CREATE)) {
      if (
        this.consumeIf(Keyword.TEMPORARY, Keyword.TABLE) ||
        this.consumeIf(Keyword.TEMP, Keyword.TABLE)
      ) {
        stmt = new model.CreateTableStatement()
        stmt.temporary = true
        this.parseCreateTableStatement(stmt)
      } else if (this.consumeIf(Keyword.VIRTUAL, Keyword.TABLE)) {
        stmt = new model.CreateTableStatement()
        stmt.virtual = true
        this.parseCreateTableStatement(stmt)
      } else if (this.consumeIf(Keyword.TABLE)) {
        stmt = new model.CreateTableStatement()
        this.parseCreateTableStatement(stmt)
      } else if (
        this.consumeIf(Keyword.TEMPORARY, Keyword.VIEW) ||
        this.consumeIf(Keyword.TEMP, Keyword.VIEW)
      ) {
        stmt = new model.CreateViewStatement()
        stmt.temporary = true
        this.parseCreateViewStatement(stmt)
      } else if (this.consumeIf(Keyword.VIEW)) {
        stmt = new model.CreateViewStatement()
        this.parseCreateViewStatement(stmt)
      } else if (
        this.consumeIf(Keyword.TEMPORARY, Keyword.TRIGGER) ||
        this.consumeIf(Keyword.TEMP, Keyword.TRIGGER)
      ) {
        stmt = new model.CreateTriggerStatement()
        stmt.temporary = true
        this.parseCreateTriggerStatement(stmt)
      } else if (this.consumeIf(Keyword.TRIGGER)) {
        stmt = new model.CreateTriggerStatement()
        this.parseCreateTriggerStatement(stmt)
      } else if (this.consumeIf(Keyword.UNIQUE, Keyword.INDEX)) {
        stmt = new model.CreateIndexStatement()
        stmt.type = model.IndexType.UNIQUE
        this.parseCreateIndexStatement(stmt)
      } else if (this.consumeIf(Keyword.INDEX)) {
        stmt = new model.CreateIndexStatement()
        this.parseCreateIndexStatement(stmt)
      } else if (
        this.consumeIf(Keyword.TEMPORARY) ||
        this.consumeIf(Keyword.TEMP) ||
        this.consumeIf(Keyword.VIRTUAL) ||
        this.consumeIf(Keyword.UNIQUE)
      ) {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.ALTER)) {
      if (this.consumeIf(Keyword.TABLE)) {
        stmt = new model.AlterTableStatement()
        this.parseAlterTableStatement(stmt)
      }
    } else if (this.consumeIf(Keyword.DROP)) {
      if (this.consumeIf(Keyword.TABLE)) {
        stmt = new model.DropTableStatement()
        this.parseDropTableStatement(stmt)
      } else if (this.consumeIf(Keyword.VIEW)) {
        stmt = new model.DropViewStatement()
        this.parseDropViewStatement(stmt)
      } else if (this.consumeIf(Keyword.TRIGGER)) {
        stmt = new model.DropTriggerStatement()
        this.parseDropTriggerStatement(stmt)
      } else if (this.consumeIf(Keyword.INDEX)) {
        stmt = new model.DropIndexStatement()
        this.parseDropIndexStatement(stmt)
      }
    } else if (this.consumeIf(Keyword.ATTACH)) {
      if (this.consumeIf(Keyword.DATABASE)) {
        stmt = new model.AttachDatabaseStatement()
        this.parseAttachDatabaseStatement(stmt)
      }
    } else if (this.consumeIf(Keyword.DETACH)) {
      if (this.consumeIf(Keyword.DATABASE)) {
        stmt = new model.DetachDatabaseStatement()
        this.parseDetachDatabaseStatement(stmt)
      }
    } else if (this.consumeIf(Keyword.ANALYZE)) {
      stmt = new model.AnalyzeStatement()
      this.parseAnalyzeStatement(stmt)
    } else if (this.consumeIf(Keyword.REINDEX)) {
      stmt = new model.ReindexStatement()
      this.parseReindexStatement(stmt)
    } else if (this.consumeIf(Keyword.VACUUM)) {
      stmt = new model.VacuumStatement()
      this.parseVacuumStatement(stmt)
    } else if (this.consumeIf(Keyword.PRAGMA)) {
      stmt = new model.PragmaStatement()
      this.parsePragmaStatement(stmt)
    } else if (this.consumeIf(Keyword.BEGIN)) {
      stmt = new model.BeginTransactionStatement()
      if (this.consumeIf(Keyword.DEFERRED)) {
        stmt.transactionBehavior = model.TransactionBehavior.DEFERRED
      } else if (this.consumeIf(Keyword.IMMEDIATE)) {
        stmt.transactionBehavior = model.TransactionBehavior.IMMEDIATE
      } else if (this.consumeIf(Keyword.EXCLUSIVE)) {
        stmt.transactionBehavior = model.TransactionBehavior.EXCLUSIVE
      }
      this.consumeIf(Keyword.TRANSACTION)
      this.parseBeginTransactionStatement(stmt)
    } else if (this.consumeIf(Keyword.SAVEPOINT)) {
      stmt = new model.SavepointStatement()
      this.parseSavepointStatement(stmt)
    } else if (this.consumeIf(Keyword.RELEASE)) {
      this.consumeIf(Keyword.SAVEPOINT)
      stmt = new model.ReleaseSavepointStatement()
      this.parseReleaseSavepointStatement(stmt)
    } else if (this.consumeIf(Keyword.COMMIT) || this.consumeIf(Keyword.END)) {
      this.consumeIf(Keyword.TRANSACTION)
      stmt = new model.CommitTransactionStatement()
      this.parseCommitTransactionStatement(stmt)
    } else if (this.consumeIf(Keyword.ROLLBACK)) {
      this.consumeIf(Keyword.TRANSACTION)
      stmt = new model.RollbackTransactionStatement()
      this.parseRollbackTransactionStatement(stmt)
    } else {
      if (this.peekIf(Keyword.WITH)) {
        this.withClause()
      }
      if (this.consumeIf(Keyword.INSERT)) {
        stmt = new model.InsertStatement()
        if (this.consumeIf(Keyword.OR)) {
          stmt.conflictAction = this.conflictAction()
        }
        this.parseInsertStatement(stmt)
      } else if (this.consumeIf(Keyword.REPLACE)) {
        stmt = new model.InsertStatement()
        stmt.conflictAction = model.ConflictAction.REPLACE
        this.parseInsertStatement(stmt)
      } else if (this.consumeIf(Keyword.UPDATE)) {
        stmt = new model.UpdateStatement()
        if (this.consumeIf(Keyword.OR)) {
          stmt.conflictAction = this.conflictAction()
        }
        this.parseUpdateStatement(stmt)
      } else if (this.consumeIf(Keyword.DELETE)) {
        this.consume(Keyword.FROM)
        stmt = new model.DeleteStatement()
        this.parseDeleteStatement(stmt)
      } else if (this.peekIf(Keyword.SELECT)) {
        stmt = new model.SelectStatement()
        this.parseSelectStatement(stmt)
      }
    }

    if (!stmt) {
      throw this.createParseError()
    }

    if (explain) {
      stmt = new model.ExplainStatement(stmt)
      stmt.queryPlan = queryPlan
    }

    if (typeof this.options.filename === "string") {
      stmt.filename = this.options.filename
    }
    stmt.tokens = this.tokens.slice(this.stmtStart, this.pos)

    return stmt
  }

  private parseCreateTableStatement(stmt: model.CreateTableStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.NOT, Keyword.EXISTS)
      stmt.ifNotExists = true
    }

    stmt.markers.set("nameStart", this.pos - this.stmtStart)
    stmt.name = this.identifier()
    if (this.consumeIf(TokenType.Dot)) {
      stmt.schema = stmt.name
      stmt.markers.set("nameStart", this.pos - this.stmtStart)
      stmt.name = this.identifier()
    }
    stmt.markers.set("nameEnd", this.pos - this.stmtStart)

    if (stmt.virtual) {
      this.consume(Keyword.USING)
      stmt.moduleName = this.identifier()
      stmt.moduleArgs = []
      if (this.consumeIf(TokenType.LeftParen)) {
        for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
          stmt.moduleArgs.push(this.moduleArg())
        }
        this.consume(TokenType.RightParen)
      }
    } else if (this.consumeIf(TokenType.LeftParen)) {
      stmt.columns = []
      stmt.constraints = []

      stmt.columns.push(this.tableColumn())
      while (this.consumeIf(TokenType.Comma)) {
        if (
          !this.peekIf(Keyword.CONSTRAINT) &&
          !this.peekIf(Keyword.PRIMARY) &&
          !this.peekIf(Keyword.NOT) &&
          !this.peekIf(Keyword.NULL) &&
          !this.peekIf(Keyword.UNIQUE) &&
          !this.peekIf(Keyword.CHECK) &&
          !this.peekIf(Keyword.DEFAULT) &&
          !this.peekIf(Keyword.COLLATE) &&
          !this.peekIf(Keyword.REFERENCES) &&
          !this.peekIf(Keyword.GENERATED) &&
          !this.peekIf(Keyword.AS)
        ) {
          stmt.columns.push(this.tableColumn())
        } else {
          stmt.constraints.push(this.tableConstraint())
          while (this.consumeIf(TokenType.Comma)) {
            stmt.constraints.push(this.tableConstraint())
          }
          break
        }
      }

      this.consume(TokenType.RightParen)
      while (this.token() && !this.peekIf(TokenType.SemiColon)) {
        if (this.consumeIf(Keyword.WITHOUT)) {
          if (this.consume(Keyword.ROWID)) {
            stmt.withoutRowid = true
          }
        } else {
          this.consume()
        }
      }
    } else if (this.consumeIf(Keyword.AS)) {
      stmt.asSelect = true
      stmt.markers.set("selectStart", this.pos - this.stmtStart)
      this.selectClause()
      stmt.markers.set("selectEnd", this.pos - this.stmtStart)
    } else {
      throw this.createParseError()
    }
  }

  private parseCreateViewStatement(stmt: model.CreateViewStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.NOT, Keyword.EXISTS)
      stmt.ifNotExists = true
    }

    stmt.markers.set("nameStart", this.pos - this.stmtStart)
    stmt.name = this.identifier()
    if (this.consumeIf(TokenType.Dot)) {
      stmt.schema = stmt.name
      stmt.markers.set("nameStart", this.pos - this.stmtStart)
      stmt.name = this.identifier()
    }
    stmt.markers.set("nameEnd", this.pos - this.stmtStart)

    this.consume(Keyword.AS)
    if (this.consumeIf(TokenType.LeftParen)) {
      stmt.columns = []
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        stmt.columns.push(this.identifier())
      }
      this.consume(TokenType.RightParen)
    }
    stmt.markers.set("selectStart", this.pos - this.stmtStart)
    this.selectClause()
    stmt.markers.set("selectEnd", this.pos - this.stmtStart)
  }

  private parseCreateTriggerStatement(stmt: model.CreateTriggerStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.NOT, Keyword.EXISTS)
      stmt.ifNotExists = true
    }

    stmt.markers.set("nameStart", this.pos - this.stmtStart)
    stmt.name = this.identifier()
    if (this.consumeIf(TokenType.Dot)) {
      stmt.schema = stmt.name
      stmt.markers.set("nameStart", this.pos - this.stmtStart)
      stmt.name = this.identifier()
    }
    stmt.markers.set("nameEnd", this.pos - this.stmtStart)

    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      if (this.consumeIf(Keyword.BEGIN)) {
        while (this.token() && !this.peekIf(Keyword.END)) {
          this.consume()
        }
      } else {
        this.consume()
      }
    }
  }

  private parseCreateIndexStatement(stmt: model.CreateIndexStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.NOT, Keyword.EXISTS)
      stmt.ifNotExists = true
    }

    stmt.markers.set("nameStart", this.pos - this.stmtStart)
    stmt.name = this.identifier()
    if (this.consumeIf(TokenType.Dot)) {
      stmt.schema = stmt.name
      stmt.markers.set("nameStart", this.pos - this.stmtStart)
      stmt.name = this.identifier()
    }
    stmt.markers.set("nameEnd", this.pos - this.stmtStart)

    this.consume(Keyword.ON)
    stmt.table.name = this.identifier()
    this.consume(TokenType.LeftParen)
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.columns.push(this.indexColumn(stmt.type === model.IndexType.UNIQUE))
    }
    this.consume(TokenType.RightParen)
    if (this.consumeIf(Keyword.WHERE)) {
      while (this.token() && !this.peekIf(TokenType.SemiColon)) {
        this.consume()
      }
    }
  }

  private parseAlterTableStatement(stmt: model.AlterTableStatement) {
    stmt.table = this.schemaObject()
    if (this.consumeIf(Keyword.RENAME)) {
      if (this.consumeIf(Keyword.TO)) {
        const alterTableAction = new model.RenameTableAction()
        alterTableAction.newName = this.identifier()
        stmt.action = alterTableAction
      } else {
        this.consumeIf(Keyword.COLUMN)
        const alterTableAction = new model.RenameColumnAction()
        alterTableAction.name = this.identifier()
        this.consume(Keyword.TO)
        alterTableAction.newName = this.identifier()
        stmt.action = alterTableAction
      }
    } else if (this.consumeIf(Keyword.ADD)) {
      this.consumeIf(Keyword.COLUMN)
      const alterTableAction = new model.AddColumnAction()
      alterTableAction.newColumn = this.tableColumn()
      stmt.action = alterTableAction
    } else if (this.consumeIf(Keyword.DROP)) {
      this.consumeIf(Keyword.COLUMN)
      const alterTableAction = new model.DropColumnAction()
      alterTableAction.name = this.identifier()
      stmt.action = alterTableAction
    } else {
      throw this.createParseError()
    }
  }

  private parseDropTableStatement(stmt: model.DropTableStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.table = this.schemaObject()
  }

  private parseDropViewStatement(stmt: model.DropViewStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.view = this.schemaObject()
  }

  private parseDropTriggerStatement(stmt: model.DropTriggerStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.trigger = this.schemaObject()
  }

  private parseDropIndexStatement(stmt: model.DropIndexStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }

    stmt.index = this.schemaObject()
  }

  private parseAttachDatabaseStatement(stmt: model.AttachDatabaseStatement) {
    stmt.expr = this.expression()
    this.consume(Keyword.AS)
    stmt.name = this.identifier()
  }

  private parseDetachDatabaseStatement(stmt: model.DetachDatabaseStatement) {
    stmt.name = this.identifier()
  }

  private parseAnalyzeStatement(stmt: model.AnalyzeStatement) {
    stmt.name = this.identifier()
    if (this.consumeIf(TokenType.Dot)) {
      stmt.schema = stmt.name
      stmt.name = this.identifier()
    }
  }

  private parseReindexStatement(stmt: model.ReindexStatement) {
    stmt.name = this.identifier()
    if (this.consumeIf(TokenType.Dot)) {
      stmt.schema = stmt.name
      stmt.name = this.identifier()
    }
  }

  private parseVacuumStatement(stmt: model.VacuumStatement) {
    if (this.token() && !this.peekIf(Keyword.TO)) {
      stmt.schema = this.identifier()
    }
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parsePragmaStatement(stmt: model.PragmaStatement) {
    stmt.name = this.identifier()
    if (this.consumeIf(TokenType.Dot)) {
      stmt.schema = stmt.name
      stmt.name = this.identifier()
    }
    if (this.consumeIf(Keyword.OPE_EQ)) {
      stmt.value = this.pragmaValue()
    } else if (this.consumeIf(TokenType.LeftParen)) {
      stmt.value = this.pragmaValue()
      this.consume(TokenType.RightParen)
    }
  }

  private parseBeginTransactionStatement(stmt: model.BeginTransactionStatement) {
    // do nothing
  }

  private parseSavepointStatement(stmt: model.SavepointStatement) {
    stmt.name = this.identifier()
  }

  private parseReleaseSavepointStatement(stmt: model.ReleaseSavepointStatement) {
    stmt.savepoint = this.identifier()
  }

  private parseCommitTransactionStatement(stmt: model.CommitTransactionStatement) {
    // do nothing
  }

  private parseRollbackTransactionStatement(stmt: model.RollbackTransactionStatement) {
    if (this.consumeIf(Keyword.TO)) {
      this.consumeIf(Keyword.SAVEPOINT)
      stmt.savepoint = this.identifier()
    }
  }

  private parseInsertStatement(stmt: model.InsertStatement) {
    this.consume(Keyword.INTO)
    stmt.table.name = this.identifier()
    if (this.consumeIf(TokenType.Dot)) {
      stmt.table.schema = stmt.table.name
      stmt.table.name = this.identifier()
    }
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseUpdateStatement(stmt: model.UpdateStatement) {
    stmt.table.name = this.identifier()
    if (this.consumeIf(TokenType.Dot)) {
      stmt.table.schema = stmt.table.name
      stmt.table.name = this.identifier()
    }
    while (this.token() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
  }

  private parseDeleteStatement(stmt: model.DeleteStatement) {
    stmt.table.name = this.identifier()
    if (this.consumeIf(TokenType.Dot)) {
      stmt.table.schema = stmt.table.name
      stmt.table.name = this.identifier()
    }
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
      (depth == 0 && !this.peekIf(TokenType.RightParen))
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
      if (this.consumeIf(Keyword.NOT)) {
        this.consume(Keyword.MATERIALIZED)
      } else {
        this.consumeIf(Keyword.MATERIALIZED)
      }
      this.consume(TokenType.LeftParen)
      this.selectClause()
      this.consume(TokenType.RightParen)
    }
    return this.tokens.slice(start, this.pos)
  }

  private tableColumn() {
    const column = new model.TableColumn()
    column.name = this.identifier()
    if (
      this.peekIf(TokenType.QuotedIdentifier) ||
      this.peekIf(TokenType.Identifier) ||
      this.peekIf(TokenType.QuotedValue)
    ) {
      column.dataType = this.dataType()
    }

    while (
      this.token() &&
      !this.peekIf(TokenType.SemiColon) &&
      !this.peekIf(TokenType.RightParen) &&
      !this.peekIf(TokenType.Comma)
    ) {
      column.constraints.push(this.columnConstraint())
    }

    return column
  }

  private columnConstraint() {
    let constraint, name;
    if (this.consumeIf(Keyword.CONSTRAINT)) {
      name = this.identifier()
    }
    if (this.consumeIf(Keyword.PRIMARY)) {
      this.consume(Keyword.KEY)
      constraint = new model.PrimaryKeyColumnConstraint()
      constraint.name = name
      if (this.consumeIf(Keyword.ASC)) {
        constraint.sortOrder = model.SortOrder.ASC
      } else if (this.consumeIf(Keyword.DESC)) {
        constraint.sortOrder = model.SortOrder.DESC
      }
      if (this.consumeIf(Keyword.ON)) {
        this.consume(Keyword.CONFLICT)
        constraint.conflictAction = this.conflictAction()
      }
      if (this.consumeIf(Keyword.AUTOINCREMENT)) {
        constraint.autoIncrement = false
      }
    } else if (this.peekIf(Keyword.NOT) || this.peekIf(Keyword.NULL)) {
      if (this.consumeIf(Keyword.NOT)) {
        constraint = new model.NotNullColumnConstraint()
      } else {
        constraint = new model.NullColumnConstraint()
      }
      this.consume(Keyword.NULL)
      constraint.name = name
      if (this.consumeIf(Keyword.ON)) {
        this.consume(Keyword.CONFLICT)
        constraint.conflictAction = this.conflictAction()
      }
    } else if (this.consumeIf(Keyword.UNIQUE)) {
      constraint = new model.UniqueColumnConstraint()
      constraint.name = name
      if (this.consumeIf(Keyword.ON)) {
        this.consume(Keyword.CONFLICT)
        constraint.conflictAction = this.conflictAction()
      }
    } else if (this.consumeIf(Keyword.CHECK)) {
      constraint = new model.CheckColumnConstraint()
      constraint.name = name
      this.consume(TokenType.LeftParen)
      while (this.token() && !this.peekIf(TokenType.RightParen)) {
        this.consume()
        constraint.conditions.push(this.token(-1))
      }
      this.consume(TokenType.RightParen)
    } else if (this.consumeIf(Keyword.DEFAULT)) {
      constraint = new model.DefaultColumnConstraint()
      constraint.name = name
      const start = this.pos
      if (this.consumeIf(TokenType.LeftParen)) {
        constraint.expr = this.expression()
        this.consume(TokenType.RightParen)
      } else if (
        this.consumeIf(Keyword.OPE_PLUS) ||
        this.consumeIf(Keyword.OPE_MINUS)
      ) {
        this.consume(TokenType.Number)
        constraint.expr = this.tokens.slice(start, this.pos)
      } else if (
        this.consumeIf(Keyword.NULL) ||
        this.consumeIf(Keyword.TRUE) ||
        this.consumeIf(Keyword.FALSE) ||
        this.consumeIf(Keyword.CURRENT_DATE) ||
        this.consumeIf(Keyword.CURRENT_TIME) ||
        this.consumeIf(Keyword.CURRENT_TIMESTAMP) ||
        this.consumeIf(TokenType.String) ||
        this.consumeIf(TokenType.Number)
      ) {
        constraint.expr = this.tokens.slice(start, this.pos)
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.COLLATE)) {
      constraint = new model.CollateColumnConstraint()
      constraint.name = name
      constraint.collation = this.identifier()
    } else if (this.consumeIf(Keyword.REFERENCES)) {
      constraint = new model.ReferencesKeyColumnConstraint()
      constraint.name = name
      constraint.table = this.identifier()
      this.consume(TokenType.LeftParen)
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        constraint.columns.push(this.identifier())
      }
      this.consume(TokenType.RightParen)
    } else if (this.peekIf(Keyword.GENERATED) || this.peekIf(Keyword.AS)) {
      if (this.consumeIf(Keyword.GENERATED)) {
        this.consume(Keyword.ALWAYS)
      }
      this.consume(Keyword.AS)
      constraint = new model.GeneratedColumnConstraint()
      constraint.name = name
      this.consume(TokenType.LeftParen)
      constraint.expr = this.expression()
      this.consume(TokenType.RightParen)
      if (this.consumeIf(TokenType.Identifier)) {
        constraint.storeType = model.StoreType.STORED
      } else if (this.consumeIf(Keyword.VIRTUAL)) {
        constraint.storeType = model.StoreType.VIRTUAL
      }
    } else {
      throw this.createParseError()
    }
    return constraint
  }

  private tableConstraint() {
    let constraint, name;
    if (this.consumeIf(Keyword.CONSTRAINT)) {
      name = this.identifier()
    }
    if (this.consumeIf(Keyword.PRIMARY)) {
      this.consume(Keyword.KEY)
      constraint = new model.PrimaryKeyTableConstraint()
      constraint.name = name
      this.consume(TokenType.LeftParen)
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        constraint.columns.push(this.indexColumn(true))
      }
      this.consume(TokenType.RightParen)
      if (this.consumeIf(Keyword.ON)) {
        this.consume(Keyword.CONFLICT)
        constraint.conflictAction = this.conflictAction()
      }
    } else if (this.consumeIf(Keyword.UNIQUE)) {
      constraint = new model.UniqueTableConstraint()
      constraint.name = name
      this.consume(TokenType.LeftParen)
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        constraint.columns.push(this.indexColumn(true))
      }
      this.consume(TokenType.RightParen)
      if (this.consumeIf(Keyword.ON)) {
        this.consume(Keyword.CONFLICT)
        constraint.conflictAction = this.conflictAction()
      }
    } else if (this.consumeIf(Keyword.CHECK)) {
      constraint = new model.CheckTableConstraint()
      constraint.name = name
      this.consume(TokenType.LeftParen)
      while (this.token() && !this.peekIf(TokenType.RightParen)) {
        this.consume()
        constraint.conditions.push(this.token(-1))
      }
      this.consume(TokenType.RightParen)
    } else if (this.consumeIf(Keyword.FOREIGN)) {
      this.consume(Keyword.KEY)
      constraint = new model.ForeignKeyTableConstraint()
      constraint.name = name
      this.consume(TokenType.LeftParen)
      constraint.columns.push(this.identifier())
      while (this.consumeIf(TokenType.Comma)) {
        constraint.columns.push(this.identifier())
      }
      this.consume(TokenType.RightParen)
    } else {
      throw this.createParseError()
    }
    return constraint
  }

  private dataType() {
    const dataType = new model.DataType()

    const typeNames = []
    typeNames.push(this.identifier())
    while (
      this.peekIf(TokenType.QuotedIdentifier) ||
      this.peekIf(TokenType.QuotedValue) ||
      this.peekIf(TokenType.Identifier)
    ) {
      typeNames.push(this.identifier())
    }
    dataType.name = typeNames.join(" ")

    if (this.consumeIf(TokenType.LeftParen)) {
      dataType.length = this.numberValue()
      if (this.consumeIf(TokenType.Comma)) {
        dataType.scale = this.numberValue()
      }
      this.consume(TokenType.RightParen)
    }
    return dataType
  }

  private conflictAction() {
    if (this.consumeIf(Keyword.ROLLBACK)) {
      return model.ConflictAction.ROLLBACK
    } else if (this.consumeIf(Keyword.ABORT)) {
      return model.ConflictAction.ABORT
    } else if (this.consumeIf(Keyword.FAIL)) {
      return model.ConflictAction.FAIL
    } else if (this.consumeIf(Keyword.IGNORE)) {
      return model.ConflictAction.IGNORE
    } else if (this.consumeIf(Keyword.REPLACE)) {
      return model.ConflictAction.REPLACE
    } else {
      throw this.createParseError()
    }
  }

  private moduleArg() {
    let tokens: Token[] = []
    while (this.token() &&
      !this.peekIf(TokenType.Comma) &&
      !this.peekIf(TokenType.RightParen)
    ) {
      if (tokens[tokens.length-1] && tokens[tokens.length-1].after) {
        for (let token of tokens[tokens.length-1].after) {
          tokens.push(token)
        }
      }
      this.consume()
      tokens.push(this.token(-1))
    }
    return tokens.map(token => token.text).join();
  }

  private indexColumn(unique = false) {
    const column = new model.IndexColumn()
    const start = this.pos
    const tokens = this.expression()
    if (tokens.length === 1) {
      this.pos = start
      column.name = this.identifier()
    } else {
      column.expr = tokens
    }
    if (this.consumeIf(Keyword.ASC)) {
      column.sortOrder = model.SortOrder.ASC
    } else if (this.consumeIf(Keyword.DESC)) {
      column.sortOrder = model.SortOrder.DESC
    }
    return column
  }

  private pragmaValue() {
    const start = this.pos
    if (this.consumeIf(Keyword.OPE_PLUS) || this.consumeIf(Keyword.OPE_MINUS)) {
      this.consume(TokenType.Number)
    } else if (this.consumeIf(TokenType.Number)) {
    } else if (this.consumeIf(TokenType.String) || this.consumeIf(TokenType.QuotedValue)) {
    } else if (this.consumeIf(TokenType.Identifier)) {
    } else {
      throw this.createParseError()
    }
    return this.tokens.slice(start, this.pos)
  }

  schemaObject(stmt?: Statement) {
    const sobj = new model.SchemaObject()
    sobj.name = this.identifier()
    if (this.consumeIf(TokenType.Dot)) {
      sobj.schema = sobj.name
      sobj.name = this.identifier()
    }
    return sobj
  }

  private identifier() {
    let text
    if (this.consumeIf(TokenType.QuotedIdentifier)) {
      text = dequote(this.token(-1).text)
    } else if (this.consumeIf(TokenType.QuotedValue)) {
      text = dequote(this.token(-1).text)
    } else if (this.consumeIf(TokenType.String)) {
      text = dequote(this.token(-1).text)
    } else if (this.consumeIf(TokenType.Identifier)) {
      text = this.token(-1).text
    } else {
      throw this.createParseError()
    }
    return text
  }

  private numberValue() {
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

  private expression() {
    const start = this.pos
    let depth = 0
    while (this.token() &&
      (depth == 0 && !this.peekIf(TokenType.Comma)) &&
      (depth == 0 && !this.peekIf(TokenType.RightParen)) &&
      (depth == 0 && !this.peekIf(Keyword.AS)) &&
      (depth == 0 && !this.peekIf(Keyword.ASC)) &&
      (depth == 0 && !this.peekIf(Keyword.DESC)) &&
      !this.peekIf(TokenType.SemiColon)
    ) {
      if (this.consumeIf(TokenType.LeftParen)) {
        depth++
      } else if (this.consumeIf(TokenType.RightParen)) {
        depth--
      } else {
        this.consume()
      }
    }
    return this.tokens.slice(start, this.pos)
  }
}

const ReplaceReMap: {[key: string]: RegExp} = {
  '"': /""/g,
  "'": /''/g,
  "`": /``/g,
}

function dequote(text: string) {
  if (text.length >= 2) {
    const sc = text.charAt(0)
    const ec = text.charAt(text.length-1)
    if (sc === "[" && ec === "]" || sc === ec) {
      const re = ReplaceReMap[sc]
      let value = text.substring(1, text.length - 1)
      if (re != null) {
        value = value.replace(re, sc)
      }
      return value
    }
  }
  return text
}
