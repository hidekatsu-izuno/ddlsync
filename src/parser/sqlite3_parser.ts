import {
  TokenType,
  Keyword,
  Token,
  Lexer,
  Parser,
  Expression,
  Idnetifier,
  StringValue,
  NumberValue,
  IExpression,
  SortOrder,
  ConflictAction,
  StoreType,
  AlterTableAction,
  TransactionBehavior,
  ExplainStatement,
  AttachDatabaseStatement,
  DetachDatabaseStatement,
  CreateTableStatement,
  CreateVirtualTableStatement,
  CreateIndexStatement,
  CreateViewStatement,
  CreateTriggerStatement,
  AlterTableStatement,
  DropTableStatement,
  DropIndexStatement,
  DropViewStatement,
  DropTriggerStatement,
  BeginTransactionStatement,
  SavepointStatement,
  ReleaseSavepointStatement,
  CommitTransactionStatement,
  RollbackTransactionStatement,
  AnalyzeStatement,
  VacuumStatement,
  ReindexStatement,
  PragmaStatement,
  InsertStatement,
  UpdateStatement,
  DeleteStatement,
  SelectStatement,
  ColumnDef,
  IndexedColumn,
  PrimaryKeyTableConstraint,
  UniqueTableConstraint,
  CheckTableConstraint,
  ForeignKeyTableConstraint,
  PrimaryKeyColumnConstraint,
  NotNullColumnConstraint,
  NullColumnConstraint,
  UniqueColumnConstraint,
  CheckColumnConstraint,
  DefaultColumnConstraint,
  CollateColumnConstraint,
  ReferencesKeyColumnConstraint,
  GeneratedColumnConstraint,
  Reserved,
  Operator,
} from "./common"

export class Sqlite3Lexer extends Lexer {
  constructor(
    private options: { [key: string]: any } = {}
  ) {
    super([
      { type: TokenType.BlockComment, re: /\/\*.*?\*\//sy },
      { type: TokenType.LineComment, re: /--.*/y },
      { type: TokenType.WhiteSpace, re: /[ \t]+/y },
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
  }
}

export class Sqlite3Parser extends Parser {
  constructor(
    input: string,
    private options: { [key: string]: any} = {}
  ) {
    super(input, new Sqlite3Lexer(options))
  }

  root() {
    const root = []
    if (this.peek() && !this.peekIf(TokenType.SemiColon)) {
      root.push(this.statement())
    }
    while (this.consumeIf(TokenType.SemiColon)) {
      if (this.peek() && !this.peekIf(TokenType.SemiColon)) {
        root.push(this.statement())
      }
    }
    if (this.peek() != null) {
      throw this.createParseError()
    }
    return root
  }

  statement() {
    const token1 = this.peek()
    const start = token1.start

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
        stmt = new CreateVirtualTableStatement()
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
        this.consume(Keyword.NOT)
        this.consume(Keyword.EXISTS)
        stmt.ifNotExists = true
      }

      stmt.name = this.identifier()
      if (this.consumeIf(TokenType.Dot)) {
        stmt.schemaName = stmt.name
        stmt.name = this.identifier()
      }

      if (stmt instanceof CreateTableStatement) {
        stmt.columns = []
        stmt.constraints = []
        if (this.consumeIf(TokenType.LeftParen)) {
          stmt.columns.push(this.columnDef())
          while (this.consumeIf(TokenType.Comma)) {
            if (
              this.peekIf(Keyword.CONSTRAINT) ||
              this.peekIf(Keyword.PRIMARY) ||
              this.peekIf(Keyword.NOT) ||
              this.peekIf(Keyword.NULL) ||
              this.peekIf(Keyword.UNIQUE) ||
              this.peekIf(Keyword.CHECK) ||
              this.peekIf(Keyword.DEFAULT) ||
              this.peekIf(Keyword.COLLATE) ||
              this.peekIf(Keyword.REFERENCES) ||
              this.peekIf(Keyword.GENERATED) ||
              this.peekIf(Keyword.AS)
            ) {
              stmt.constraints.push(this.tableConstraint())
              while (this.consumeIf(TokenType.Comma)) {
                stmt.constraints.push(this.tableConstraint())
              }
              break
            } else {
              stmt.columns.push(this.columnDef())
            }
          }
          this.consume(TokenType.RightParen)
          if (this.consumeIf(Keyword.WITHOUT)) {
            if (this.consume(Keyword.ROWID)) {
              stmt.withoutRowid = true
            }
          }
        } else {
          this.consume(Keyword.AS)
          stmt.select = this.selectClause()
        }
      } else if (stmt instanceof CreateVirtualTableStatement) {
        this.consume(Keyword.USING)
        stmt.moduleName = this.identifier()
        if (this.consumeIf(TokenType.LeftParen)) {
          stmt.moduleArgs = []
          for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
            stmt.moduleArgs.push(this.moduleArgument())
          }
          this.consume(TokenType.RightParen)
        }
      } else if (stmt instanceof CreateViewStatement) {
        stmt.select = this.selectClause()
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
        stmt.columns.push(this.indexedColumn())
        while (this.consumeIf(TokenType.Comma)) {
          stmt.columns.push(this.indexedColumn())
        }
        this.consume(TokenType.RightParen)
        if (this.consumeIf(Keyword.WHERE)) {
          stmt.where = []
          while (this.peek() && !this.peekIf(TokenType.SemiColon)) {
            stmt.where.push(this.consume())
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
      stmt = new CommitTransactionStatement()
      this.consumeIf(Keyword.TRANSACTION)
    } else if (this.consumeIf(Keyword.ROLLBACK)) {
      stmt = new RollbackTransactionStatement()
      this.consumeIf(Keyword.TRANSACTION)
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
        if (this.consumeIf(TokenType.Operator, /^=$/)) {
          stmt.value = this.pragmaValue()
        } else if (this.consumeIf(TokenType.LeftParen)) {
          stmt.value = this.pragmaValue()
          this.consume(TokenType.RightParen)
        }
      }
    } else {
      let withClause
      if (this.peekIf(Keyword.WITH)) {
        withClause = this.withClause()
      }
      if (this.peekIf(Keyword.INSERT) || this.peekIf(Keyword.REPLACE)) {
        stmt = new InsertStatement()
        stmt.withClause = withClause
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
          stmt.body.push(this.consume())
        }
      } else if (this.consumeIf(Keyword.UPDATE)) {
        stmt = new UpdateStatement()
        stmt.withClause = withClause
        if (this.consumeIf(Keyword.OR)) {
          stmt.conflictAction = this.conflictAction()
        }
        stmt.name = this.identifier()
        if (this.consumeIf(TokenType.Dot)) {
          stmt.schemaName = stmt.name
          stmt.name = this.identifier()
        }
        while (this.peek() && !this.peekIf(TokenType.SemiColon)) {
          stmt.body.push(this.consume())
        }
      } else if (this.consumeIf(Keyword.DELETE)) {
        this.consume(Keyword.FROM)
        stmt = new DeleteStatement()
        stmt.withClause = withClause
        stmt.name = this.identifier()
        if (this.consumeIf(TokenType.Dot)) {
          stmt.schemaName = stmt.name
          stmt.name = this.identifier()
        }
        while (this.peek() && !this.peekIf(TokenType.SemiColon)) {
          stmt.body.push(this.consume())
        }
      } else if (this.peekIf(Keyword.SELECT)) {
        stmt = new SelectStatement()
        if (withClause) {
          for (let token of withClause) {
            stmt.body.push(token)
          }
        }
        for (let token of this.selectClause()) {
          stmt.body.push(token)
        }
      } else {
        throw this.createParseError()
      }
    }

    if (explain) {
      stmt = new ExplainStatement(stmt)
    }

    const end = this.peek(-1).end
    stmt.text = this.input.substring(start, end)

    return stmt
  }

  selectClause() {
    const start = this.pos
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
    return this.tokens.slice(start, this.pos)
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

    while (this.peek() &&
      !this.peekIf(TokenType.SemiColon) &&
      !this.peekIf(TokenType.RightParen) &&
      !this.peekIf(TokenType.Comma)) {
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
      } else if (this.consumeIf(Keyword.NULL)) {
        constraint.expression = Reserved.NULL
      } else if (this.consumeIf(Keyword.TRUE)) {
        constraint.expression = Reserved.TRUE
      } else if (this.consumeIf(Keyword.FALSE)) {
        constraint.expression = Reserved.FALSE
      } else if (this.consumeIf(Keyword.CURRENT_DATE)) {
        constraint.expression = Reserved.CURRENT_DATE
      } else if (this.consumeIf(Keyword.CURRENT_TIME)) {
        constraint.expression = Reserved.CURRENT_TIME
      } else if (this.consumeIf(Keyword.CURRENT_TIMESTAMP)) {
        constraint.expression = Reserved.CURRENT_TIMESTAMP
      } else if (token = this.consumeIf(TokenType.String)) {
        constraint.expression = new StringValue(dequote(token.text))
      } else if (
          this.peekIf(Operator.PLUS) ||
          this.peekIf(Operator.MINUS) ||
          this.peekIf(TokenType.Number)
      ) {
        constraint.expression = this.numberValue()
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
      constraint.columns.push(this.indexedColumn())
      while (this.consumeIf(TokenType.Comma)) {
        constraint.columns.push(this.indexedColumn())
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
        constraint.columns.push(this.indexedColumn())
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
      this.peekIf(TokenType.Identifier)
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

  indexedColumn() {
    const column = new IndexedColumn()
    column.expression = this.expression()
    if (this.consumeIf(Keyword.ASC)) {
      column.sortOrder = SortOrder.ASC
    } else if (this.consumeIf(Keyword.DESC)) {
      column.sortOrder = SortOrder.DESC
    }
    return column
  }

  pragmaValue() {
    let value: IExpression, token
    if (
      this.peekIf(Operator.PLUS) ||
      this.peekIf(Operator.MINUS) ||
      this.peekIf(TokenType.Number)
    ) {
      value = this.numberValue()
    } else if (token = this.consumeIf(TokenType.String) || this.consumeIf(TokenType.QuotedValue)) {
      value = new StringValue(dequote(token.text))
    } else if (token = this.consumeIf(TokenType.Identifier)) {
      value = new Idnetifier(token.text)
    } else {
      throw this.createParseError()
    }
    return value
  }

  identifier() {
    let token, text
    if (token = this.consumeIf(TokenType.QuotedIdentifier)) {
      text = dequote(token.text)
    } else if (token = this.consumeIf(TokenType.QuotedValue)) {
      text = dequote(token.text)
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
      text = dequote(token.text)
    } else if (token = this.consumeIf(TokenType.QuotedValue)) {
      text = dequote(token.text)
    } else {
      throw this.createParseError()
    }
    return text
  }

  numberValue() {
    let value = ""
    if (this.consumeIf(Operator.PLUS)) {
      // nothing special
    } else if (this.consumeIf(Operator.MINUS)) {
      value += "-"
    }
    const token = this.consume(TokenType.Number)
    if (/^0[Xx]/.test(token.text)) {
      value += BigInt(token.text).toString(10)
    } else if (token.text.startsWith(".")) {
      value += "0" + token.text
    } else {
      value += token.text
    }
    return new NumberValue(value)
  }

  expression() {
    let start = this.pos
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
    return new Expression(this.tokens.slice(start, this.pos))
  }
}

const ReplaceReMap: {[key: string]: RegExp} = {
  "\"": /\"\"/g,
  "'": /''/g,
  "`": /``/g,
  "]": /\]\]/g,
}

function dequote(text: string) {
  if (text.length >= 2) {
    let value = text.substring(1, text.length - 1)
    const c = text.charAt(text.length - 1)
    const re = ReplaceReMap[c]
    if (re != null) {
      value = value.replace(re, c)
    }
    return value
  }
  return text
}
