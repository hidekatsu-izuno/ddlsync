import Decimal from "decimal.js"
import {
  TokenType,
  Token,
  Lexer,
  Parser,
  ParseError,
  AggregateParseError,
} from "../parser"
import { AlterTableAction, AlterTableStatement, AnalyzeStatement, AttachDatabaseStatement, BeginTransactionStatement, CheckColumnConstraint, CheckTableConstraint, CollateColumnConstraint, ColumnDef, CommandStatement, CommitTransactionStatement, ConflictAction, CreateIndexStatement, CreateTableStatement, CreateTriggerStatement, CreateViewStatement, DefaultColumnConstraint, DeleteStatement, DetachDatabaseStatement, DropIndexStatement, DropTableStatement, DropTriggerStatement, DropViewStatement, ExplainStatement, ForeignKeyTableConstraint, GeneratedColumnConstraint, IndexedColumn, InsertStatement, NotNullColumnConstraint, NullColumnConstraint, PragmaStatement, PrimaryKeyColumnConstraint, PrimaryKeyTableConstraint, ReferencesKeyColumnConstraint, ReindexStatement, ReleaseSavepointStatement, RollbackTransactionStatement, SavepointStatement, SelectStatement, SortOrder, StoreType, TransactionBehavior, UniqueColumnConstraint, UniqueTableConstraint, UpdateStatement, VacuumStatement } from "./sqlite3_models"

const KeywordMap = new Map<string, Keyword>()
export class Keyword extends TokenType {
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

  constructor(
    name: string,
    options: { [key: string]: any } = {}
  ) {
    super(name, options)
    KeywordMap.set(name, this)
  }
}

const OperatorMap = new Map<string, Operator>()
export class Operator extends TokenType {
  static EQ = new Operator("=")
  static PLUS = new Operator("+")
  static MINUS = new Operator("-")

  constructor(
    name: string,
    options: { [key: string]: any } = {}
  ) {
    super(name, options)
    OperatorMap.set(name, this)
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
      { type: TokenType.String, re: /[Xx]'([^']|'')*'/y },
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

  process(token: Token) {
    if (token.type === TokenType.Identifier) {
      const keyword = KeywordMap.get(token.text.toUpperCase())
      if (keyword) {
        if (this.reserved.has(keyword)) {
          token.type = keyword
        } else {
          token.subtype = keyword
        }
      }
    } else if (token.type === TokenType.Operator) {
      const operator = OperatorMap.get(token.text.toUpperCase())
      if (operator) {
        token.subtype = operator
      }
    }
    return token
  }
}

export class Sqlite3Parser extends Parser {
  constructor(
    input: string,
    options: { [key: string]: any} = {},
  ) {
    super(input, new Sqlite3Lexer(options), options)
  }

  root() {
    const root = []
    const errors = []
    for (let i = 0;
      i === 0 ||
      this.consumeIf(TokenType.SemiColon) ||
      root[root.length - 1] instanceof CommandStatement;
      i++
    ) {
      if (this.peekIf(TokenType.Command)) {
        const stmt = this.command()
        root.push(stmt)
      } else if (this.peek() && !this.peekIf(TokenType.SemiColon)) {
        try {
          const stmt = this.statement()
          stmt.validate()
          root.push(stmt)
        } catch (e) {
          if (e instanceof ParseError) {
            errors.push(e)

            // skip tokens
            while (this.peek() && !this.peekIf(TokenType.SemiColon)) {
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

  command() {
    const start = this.pos
    const stmt = new CommandStatement()
    const token = this.consume(TokenType.Command)
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
    stmt.tokens = this.tokens.slice(start, this.pos)
    return stmt
  }

  statement() {
    const start = this.pos

    let explain = false
    if (this.consumeIf(Keyword.EXPLAIN)) {
      if (this.consumeIf(Keyword.QUERY)) {
        this.consume(Keyword.PLAN)
      }
      explain = true
    }

    let stmt
    if (this.consumeIf(Keyword.CREATE)) {
      if (this.consumeIf(Keyword.TEMP) || this.consumeIf(Keyword.TEMPORARY)) {
        if (this.consumeIf(Keyword.TABLE)) {
          stmt = new CreateTableStatement()
          stmt.temporary = true
        } else if (this.consumeIf(Keyword.VIEW)) {
          stmt = new CreateViewStatement()
          stmt.temporary = true
        } else if (this.consumeIf(Keyword.TRIGGER)) {
          stmt = new CreateTriggerStatement()
          stmt.temporary = true
        } else {
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.VIRTUAL)) {
        this.consume(Keyword.TABLE)
        stmt = new CreateTableStatement()
        stmt.virtual = true
      } else if (this.consumeIf(Keyword.TABLE)) {
        stmt = new CreateTableStatement()
      } else if (this.consumeIf(Keyword.VIEW)) {
        stmt = new CreateViewStatement()
      } else if (this.consumeIf(Keyword.TRIGGER)) {
        stmt = new CreateTriggerStatement()
      } else if (this.consumeIf(Keyword.INDEX)) {
        stmt = new CreateIndexStatement()
      } else if (this.consumeIf(Keyword.UNIQUE)) {
        this.consume(Keyword.INDEX)
        stmt = new CreateIndexStatement()
        stmt.unique = true
      } else {
        throw this.createParseError()
      }

      if (this.consumeIf(Keyword.IF)) {
        stmt.markers.set("ifNotExistsStart", this.pos - start - 1)
        this.consume(Keyword.NOT)
        this.consume(Keyword.EXISTS)
        stmt.ifNotExists = true
        stmt.markers.set("ifNotExistsEnd", this.pos - start)
      }

      stmt.markers.set("nameStart", this.pos - start)
      stmt.name = this.identifier()
      if (this.consumeIf(TokenType.Dot)) {
        stmt.schemaName = stmt.name
        stmt.markers.set("nameStart", this.pos - start)
        stmt.name = this.identifier()
      }
      stmt.markers.set("nameEnd", this.pos - start)

      if (stmt instanceof CreateTableStatement) {
        if (stmt.virtual) {
          this.consume(Keyword.USING)
          stmt.moduleName = this.identifier()
          if (this.consumeIf(TokenType.LeftParen)) {
            stmt.moduleArgs = []
            for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
              stmt.moduleArgs.push(this.moduleArgument())
            }
            this.consume(TokenType.RightParen)
          }
        } else {
          if (this.consumeIf(TokenType.LeftParen)) {
            stmt.columns = []
            stmt.constraints = []

            stmt.columns.push(this.columnDef())
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
                stmt.columns.push(this.columnDef())
              } else {
                stmt.constraints.push(this.tableConstraint())
                while (this.consumeIf(TokenType.Comma)) {
                  stmt.constraints.push(this.tableConstraint())
                }
                break
              }
            }

            this.consume(TokenType.RightParen)
            if (this.consumeIf(Keyword.WITHOUT)) {
              if (this.consume(Keyword.ROWID)) {
                stmt.withoutRowid = true
              }
            }
          } else if (this.consumeIf(Keyword.AS)) {
            stmt.asSelect = true
            stmt.markers.set("selectStart", this.pos - start)
            this.selectClause()
            stmt.markers.set("selectEnd", this.pos - start)
          } else {
            throw this.createParseError()
          }
        }
      } else if (stmt instanceof CreateViewStatement) {
        this.consume(Keyword.AS)
        if (this.consumeIf(TokenType.LeftParen)) {
          stmt.columns = []
          for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
            stmt.columns.push(this.identifier())
          }
          this.consume(TokenType.RightParen)
        }
        this.selectClause()
      } else if (stmt instanceof CreateTriggerStatement) {
        while (this.peek() && !this.peekIf(TokenType.SemiColon)) {
          if (this.consumeIf(Keyword.BEGIN)) {
            while (this.peek() && !this.peekIf(Keyword.END)) {
              this.consume()
            }
          } else {
            this.consume()
          }
        }
      } else if (stmt instanceof CreateIndexStatement) {
        this.consume(Keyword.ON)
        stmt.tableName = this.identifier()
        this.consume(TokenType.LeftParen)
        for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
          stmt.columns.push(this.indexedColumn(stmt.unique))
        }
        this.consume(TokenType.RightParen)
        if (this.consumeIf(Keyword.WHERE)) {
          while (this.peek() && !this.peekIf(TokenType.SemiColon)) {
            this.consume()
          }
        }
      }
    } else if (this.consumeIf(Keyword.ALTER)) {
      this.consume(Keyword.TABLE)
      stmt = new AlterTableStatement()

      stmt.name = this.identifier()
      if (this.consumeIf(TokenType.Dot)) {
        stmt.schemaName = stmt.name
        stmt.name = this.identifier()
      }

      if (this.consumeIf(Keyword.RENAME)) {
        if (this.consumeIf(Keyword.TO)) {
          stmt.alterTableAction = AlterTableAction.RENAME_TABLE
          stmt.newTableName = this.identifier()
        } else {
          this.consumeIf(Keyword.COLUMN)
          stmt.alterTableAction = AlterTableAction.RENAME_COLUMN
          stmt.columnName = this.identifier()
          this.consume(Keyword.TO)
          stmt.newColumnName = this.identifier()
        }
      } else if (this.consumeIf(Keyword.ADD)) {
        this.consumeIf(Keyword.COLUMN)
        stmt.alterTableAction = AlterTableAction.ADD_COLUMN
        stmt.newColumn = this.columnDef()
      } else if (this.consumeIf(Keyword.DROP)) {
        this.consumeIf(Keyword.COLUMN)
        stmt.alterTableAction = AlterTableAction.DROP_COLUMN
        stmt.columnName = this.identifier()
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.DROP)) {
      if (this.consumeIf(Keyword.TABLE)) {
        stmt = new DropTableStatement()
      } else if (this.consumeIf(Keyword.INDEX)) {
        stmt = new DropIndexStatement()
      } else if (this.consumeIf(Keyword.VIEW)) {
        stmt = new DropViewStatement()
      } else if (this.consumeIf(Keyword.TRIGGER)) {
        stmt = new DropTriggerStatement()
      } else {
        throw this.createParseError()
      }

      if (this.consumeIf(Keyword.IF)) {
        this.consume(Keyword.EXISTS)
        stmt.ifExists = true
      }

      stmt.name = this.identifier()
      if (this.consumeIf(TokenType.Dot)) {
        stmt.schemaName = stmt.name
        stmt.name = this.identifier()
      }
    } else if (this.consumeIf(Keyword.ATTACH)) {
      this.consumeIf(Keyword.DATABASE)
      stmt = new AttachDatabaseStatement()
      stmt.expression = this.expression()
      this.consume(Keyword.AS)
      stmt.name = this.identifier()
    } else if (this.consumeIf(Keyword.DETACH)) {
      this.consumeIf(Keyword.DATABASE)
      stmt = new DetachDatabaseStatement()
      stmt.name = this.identifier()
    } else if (this.consumeIf(Keyword.BEGIN)) {
      stmt = new BeginTransactionStatement()
      if (this.consumeIf(Keyword.DEFERRED)) {
        stmt.transactionBehavior = TransactionBehavior.DEFERRED
      } else if (this.consumeIf(Keyword.IMMEDIATE)) {
        stmt.transactionBehavior = TransactionBehavior.IMMEDIATE
      } else if (this.consumeIf(Keyword.EXCLUSIVE)) {
        stmt.transactionBehavior = TransactionBehavior.EXCLUSIVE
      }
      this.consume(Keyword.TRANSACTION)
    } else if (this.consumeIf(Keyword.SAVEPOINT)) {
      stmt = new SavepointStatement()
      stmt.name = this.identifier()
    } else if (this.consumeIf(Keyword.RELEASE)) {
      stmt = new ReleaseSavepointStatement()
      this.consumeIf(Keyword.SAVEPOINT)
      stmt.savePointName = this.identifier()
    } else if (this.consumeIf(Keyword.COMMIT) || this.consumeIf(Keyword.END)) {
      this.consumeIf(Keyword.TRANSACTION)
      stmt = new CommitTransactionStatement()
    } else if (this.consumeIf(Keyword.ROLLBACK)) {
      this.consumeIf(Keyword.TRANSACTION)
      stmt = new RollbackTransactionStatement()
      if (this.consumeIf(Keyword.TO)) {
        this.consumeIf(Keyword.SAVEPOINT)
        stmt.savePointName = this.identifier()
      }
    } else if (this.consumeIf(Keyword.ANALYZE)) {
      stmt = new AnalyzeStatement()
      stmt.name = this.identifier()
      if (this.consumeIf(TokenType.Dot)) {
        stmt.schemaName = stmt.name
        stmt.name = this.identifier()
      }
    } else if (this.consumeIf(Keyword.REINDEX)) {
      stmt = new ReindexStatement()
      stmt.name = this.identifier()
      if (this.consumeIf(TokenType.Dot)) {
        stmt.schemaName = stmt.name
        stmt.name = this.identifier()
      }
    } else if (this.consumeIf(Keyword.VACUUM)) {
      stmt = new VacuumStatement()
      if (
        this.peekIf(TokenType.QuotedIdentifier) ||
        this.peekIf(TokenType.Identifier) ||
        this.peekIf(TokenType.QuotedValue)
      ) {
        stmt.schemaName = this.identifier()
      }
      if (this.consumeIf(Keyword.TO)) {
        stmt.fileName = this.stringValue()
      }
    } else if (this.consumeIf(Keyword.PRAGMA)) {
      stmt = new PragmaStatement()
      stmt.name = this.identifier()
      if (this.consumeIf(TokenType.Dot)) {
        stmt.schemaName = stmt.name
        stmt.name = this.identifier()
      }
      if (this.consumeIf(Operator.EQ)) {
        stmt.value = this.pragmaValue()
      } else if (this.consumeIf(TokenType.LeftParen)) {
        stmt.value = this.pragmaValue()
        this.consume(TokenType.RightParen)
      }
  } else {
      if (this.peekIf(Keyword.WITH)) {
        this.withClause()
      }
      if (this.peekIf(Keyword.INSERT) || this.peekIf(Keyword.REPLACE)) {
        stmt = new InsertStatement()
        if (this.consumeIf(Keyword.REPLACE)) {
          stmt.conflictAction = ConflictAction.REPLACE
        } else {
          this.consume(Keyword.INSERT)
          if (this.consumeIf(Keyword.OR)) {
            stmt.conflictAction = this.conflictAction()
          }
        }
        this.consume(Keyword.INTO)
        stmt.name = this.identifier()
        if (this.consumeIf(TokenType.Dot)) {
          stmt.schemaName = stmt.name
          stmt.name = this.identifier()
        }
        while (this.peek() && !this.peekIf(TokenType.SemiColon)) {
          this.consume()
        }
      } else if (this.consumeIf(Keyword.UPDATE)) {
        stmt = new UpdateStatement()
        if (this.consumeIf(Keyword.OR)) {
          stmt.conflictAction = this.conflictAction()
        }
        stmt.name = this.identifier()
        if (this.consumeIf(TokenType.Dot)) {
          stmt.schemaName = stmt.name
          stmt.name = this.identifier()
        }
        while (this.peek() && !this.peekIf(TokenType.SemiColon)) {
          this.consume()
        }
      } else if (this.consumeIf(Keyword.DELETE)) {
        this.consume(Keyword.FROM)
        stmt = new DeleteStatement()
        stmt.name = this.identifier()
        if (this.consumeIf(TokenType.Dot)) {
          stmt.schemaName = stmt.name
          stmt.name = this.identifier()
        }
        while (this.peek() && !this.peekIf(TokenType.SemiColon)) {
          this.consume()
        }
      } else if (this.peekIf(Keyword.SELECT)) {
        stmt = new SelectStatement()
        this.selectClause()
      } else {
        throw this.createParseError()
      }
    }

    if (explain) {
      stmt = new ExplainStatement(stmt)
    }

    if (typeof this.options.filename === "string") {
      stmt.filename = this.options.filename
    }
    stmt.tokens = this.tokens.slice(start, this.pos)

    return stmt
  }

  selectClause() {
    if (this.peekIf(Keyword.WITH)) {
      this.withClause()
    }
    this.consume(Keyword.SELECT)
    let depth = 0
    while (this.peek() &&
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

  withClause() {
    const start = this.pos
    this.consume(Keyword.WITH)
    this.consumeIf(Keyword.RECURSIVE)
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      this.identifier()
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

  columnDef() {
    const columnDef = new ColumnDef()
    columnDef.name = this.identifier()

    if (
      this.peekIf(TokenType.QuotedIdentifier) ||
      this.peekIf(TokenType.Identifier) ||
      this.peekIf(TokenType.QuotedValue)
    ) {
      columnDef.typeName = this.typeName()
    }

    if (this.consumeIf(TokenType.LeftParen)) {
      columnDef.length = this.numberValue()
      if (this.consumeIf(TokenType.Comma)) {
        columnDef.scale = this.numberValue()
      }
      this.consume(TokenType.RightParen)
    }

    while (
      this.peek() &&
      !this.peekIf(TokenType.SemiColon) &&
      !this.peekIf(TokenType.RightParen) &&
      !this.peekIf(TokenType.Comma)
    ) {
      columnDef.constraints.push(this.columnConstraint())
    }

    return columnDef
  }

  columnConstraint() {
    let constraint, name;
    if (this.consumeIf(Keyword.CONSTRAINT)) {
      name = this.identifier()
    }
    if (this.consumeIf(Keyword.PRIMARY)) {
      this.consume(Keyword.KEY)
      constraint = new PrimaryKeyColumnConstraint()
      constraint.name = name
      if (this.consumeIf(Keyword.ASC)) {
        constraint.sortOrder = SortOrder.ASC
      } else if (this.consumeIf(Keyword.DESC)) {
        constraint.sortOrder = SortOrder.DESC
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
        constraint = new NotNullColumnConstraint()
      } else {
        constraint = new NullColumnConstraint()
      }
      this.consume(Keyword.NULL)
      constraint.name = name
      if (this.consumeIf(Keyword.ON)) {
        this.consume(Keyword.CONFLICT)
        constraint.conflictAction = this.conflictAction()
      }
    } else if (this.consumeIf(Keyword.UNIQUE)) {
      constraint = new UniqueColumnConstraint()
      constraint.name = name
      if (this.consumeIf(Keyword.ON)) {
        this.consume(Keyword.CONFLICT)
        constraint.conflictAction = this.conflictAction()
      }
    } else if (this.consumeIf(Keyword.CHECK)) {
      constraint = new CheckColumnConstraint()
      constraint.name = name
      this.consume(TokenType.LeftParen)
      while (this.peek() && !this.peekIf(TokenType.RightParen)) {
        constraint.conditions.push(this.consume())
      }
      this.consume(TokenType.RightParen)
    } else if (this.consumeIf(Keyword.DEFAULT)) {
      constraint = new DefaultColumnConstraint()
      constraint.name = name
      let token
      if (this.consumeIf(TokenType.LeftParen)) {
        constraint.expression = this.expression()
        this.consume(TokenType.RightParen)
      } else if (
        this.peekIf(Keyword.NULL) ||
        this.peekIf(Keyword.TRUE) ||
        this.peekIf(Keyword.FALSE) ||
        this.peekIf(Keyword.CURRENT_DATE) ||
        this.peekIf(Keyword.CURRENT_TIME) ||
        this.peekIf(Keyword.CURRENT_TIMESTAMP) ||
        this.peekIf(TokenType.String)
      ) {
        constraint.expression = [this.consume()]
      } else if (
          this.peekIf(Operator.PLUS) ||
          this.peekIf(Operator.MINUS) ||
          this.peekIf(TokenType.Number)
      ) {
        const start = this.pos
        this.numberValue()
        constraint.expression = this.tokens.slice(start, this.pos)
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.COLLATE)) {
      constraint = new CollateColumnConstraint()
      constraint.name = name
      constraint.collationName = this.identifier()
    } else if (this.consumeIf(Keyword.REFERENCES)) {
      constraint = new ReferencesKeyColumnConstraint()
      constraint.name = name
      constraint.tableName = this.identifier()
      this.consume(TokenType.LeftParen)
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        constraint.columnNames.push(this.identifier())
      }
      this.consume(TokenType.RightParen)
    } else if (this.peekIf(Keyword.GENERATED) || this.peekIf(Keyword.AS)) {
      if (this.consumeIf(Keyword.GENERATED)) {
        this.consume(Keyword.ALWAYS)
      }
      this.consume(Keyword.AS)
      constraint = new GeneratedColumnConstraint()
      constraint.name = name
      this.consume(TokenType.LeftParen)
      constraint.expression = this.expression()
      this.consume(TokenType.RightParen)
      if (this.consumeIf(TokenType.Identifier)) {
        constraint.storeType = StoreType.STORED
      } else if (this.consumeIf(Keyword.VIRTUAL)) {
        constraint.storeType = StoreType.VIRTUAL
      }
    } else {
      throw this.createParseError()
    }
    return constraint
  }

  tableConstraint() {
    let constraint, name;
    if (this.consumeIf(Keyword.CONSTRAINT)) {
      name = this.identifier()
    }
    if (this.consumeIf(Keyword.PRIMARY)) {
      this.consume(Keyword.KEY)
      constraint = new PrimaryKeyTableConstraint()
      constraint.name = name
      this.consume(TokenType.LeftParen)
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        constraint.columns.push(this.indexedColumn(true))
      }
      this.consume(TokenType.RightParen)
      if (this.consumeIf(Keyword.ON)) {
        this.consume(Keyword.CONFLICT)
        constraint.conflictAction = this.conflictAction()
      }
    } else if (this.consumeIf(Keyword.UNIQUE)) {
      constraint = new UniqueTableConstraint()
      constraint.name = name
      this.consume(TokenType.LeftParen)
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        constraint.columns.push(this.indexedColumn(true))
      }
      this.consume(TokenType.RightParen)
      if (this.consumeIf(Keyword.ON)) {
        this.consume(Keyword.CONFLICT)
        constraint.conflictAction = this.conflictAction()
      }
    } else if (this.consumeIf(Keyword.CHECK)) {
      constraint = new CheckTableConstraint()
      constraint.name = name
      this.consume(TokenType.LeftParen)
      while (this.peek() && !this.peekIf(TokenType.RightParen)) {
        constraint.conditions.push(this.consume())
      }
      this.consume(TokenType.RightParen)
    } else if (this.consumeIf(Keyword.FOREIGN)) {
      this.consume(Keyword.KEY)
      constraint = new ForeignKeyTableConstraint()
      constraint.name = name
      this.consume(TokenType.LeftParen)
      constraint.columnNames.push(this.identifier())
      while (this.consumeIf(TokenType.Comma)) {
        constraint.columnNames.push(this.identifier())
      }
      this.consume(TokenType.RightParen)
    } else {
      throw this.createParseError()
    }
    return constraint
  }

  typeName() {
    const typeNames = []
    typeNames.push(this.identifier())
    while (
      this.peekIf(TokenType.QuotedIdentifier) ||
      this.peekIf(TokenType.QuotedValue) ||
      (
        this.peekIf(TokenType.Identifier) &&
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
      )
    ) {
      typeNames.push(this.identifier())
    }
    return typeNames.join(" ")
  }

  conflictAction() {
    if (this.consumeIf(Keyword.ROLLBACK)) {
      return ConflictAction.ROLLBACK
    } else if (this.consumeIf(Keyword.ABORT)) {
      return ConflictAction.ABORT
    } else if (this.consumeIf(Keyword.FAIL)) {
      return ConflictAction.FAIL
    } else if (this.consumeIf(Keyword.IGNORE)) {
      return ConflictAction.IGNORE
    } else if (this.consumeIf(Keyword.REPLACE)) {
      return ConflictAction.REPLACE
    } else {
      throw this.createParseError()
    }
  }

  moduleArgument() {
    let tokens: Token[] = []
    while (this.peek() && !this.peekIf(TokenType.Comma) && !this.peekIf(TokenType.LeftParen)) {
      if (tokens[tokens.length-1] && tokens[tokens.length-1].after) {
        for (let token of tokens[tokens.length-1].after) {
          tokens.push(token)
        }
      }
      tokens.push(this.consume())
    }
    return tokens.map(token => token.text).join();
  }

  indexedColumn(unique: boolean) {
    const column = new IndexedColumn()
    if (unique) {
      column.name = this.identifier()
    } else {
      column.expression = this.expression()
    }
    if (this.consumeIf(Keyword.ASC)) {
      column.sortOrder = SortOrder.ASC
    } else if (this.consumeIf(Keyword.DESC)) {
      column.sortOrder = SortOrder.DESC
    }
    return column
  }

  pragmaValue() {
    const start = this.pos
    if (this.consumeIf(Operator.PLUS) || this.consumeIf(Operator.MINUS)) {
      this.consume(TokenType.Number)
    } else if (this.consumeIf(TokenType.Number)) {
    } else if (this.consumeIf(TokenType.String) || this.consumeIf(TokenType.QuotedValue)) {
    } else if (this.consumeIf(TokenType.Identifier)) {
    } else {
      throw this.createParseError()
    }
    return this.tokens.slice(start, this.pos)
  }

  identifier() {
    let token, text
    if (token = this.consumeIf(TokenType.QuotedIdentifier)) {
      text = toStringValue(token)
    } else if (token = this.consumeIf(TokenType.QuotedValue)) {
      text = toStringValue(token)
    } else if (token = this.consumeIf(TokenType.Identifier)) {
      text = token.text
    } else {
      throw this.createParseError()
    }
    return text
  }

  stringValue() {
    let token, text
    if (token = this.consumeIf(TokenType.String)) {
      text = toStringValue(token)
    } else if (token = this.consumeIf(TokenType.QuotedValue)) {
      text = toStringValue(token)
    } else {
      throw this.createParseError()
    }
    return text
  }

  numberValue() {
    let token, text
    if (token = (this.consumeIf(Operator.PLUS) || this.consumeIf(Operator.MINUS))) {
      text = token.text
      text += this.consume(TokenType.Number).text
    } else {
      text = this.consume(TokenType.Number).text
    }
    return new Decimal(text).toString()
  }

  expression() {
    const start = this.pos
    let depth = 0
    while (this.peek() &&
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

function toStringValue(token: Token) {
  let text = token.text
  if (text.length >= 2) {
    const c = text.charAt(0)
    const re = ReplaceReMap[c]
    let value = text.substring(1, text.length - 1)
    if (re != null) {
      value = value.replace(re, c)
    }
    return value
  }
  return text
}
