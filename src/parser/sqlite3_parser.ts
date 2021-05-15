import {
  TokenType,
  Token,
  Lexer,
  Parser,
  Expression,
  Idnetifier,
  StringValue,
  NumberValue,
  IExpression,
} from "./common"
import {
  Reserved,
  SortOrder,
  ConflictAction,
  IndexedColumn,
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
} from "./sqlite3_models"

export class Sqlite3Lexer extends Lexer {
  private reservedMap

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

    this.reservedMap = Reserved.toMap(options.version)
  }

  process(token: Token) {
    if (token.type === TokenType.Identifier) {
      const reserved = this.reservedMap.get(token.text.toUpperCase())
      if (reserved) {
        token.type = reserved
      }
    }
    return token
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
    if (this.consumeIf(Reserved.EXPLAIN)) {
      if (this.consumeIf(Reserved.QUERY)) {
        this.consume(Reserved.PLAN)
      }
      explain = true
    }

    let stmt
    if (this.consumeIf(Reserved.CREATE)) {
      if (this.consumeIf(Reserved.TEMP) || this.consumeIf(Reserved.TEMPORARY)) {
        if (this.consumeIf(Reserved.TABLE)) {
          stmt = new CreateTableStatement()
          stmt.temporary = true
        } else if (this.consumeIf(Reserved.VIEW)) {
          stmt = new CreateViewStatement()
          stmt.temporary = true
        } else if (this.consumeIf(Reserved.TRIGGER)) {
          stmt = new CreateTriggerStatement()
          stmt.temporary = true
        } else {
          throw this.createParseError()
        }
      } else if (this.consumeIf(Reserved.VIRTUAL)) {
        this.consume(Reserved.TABLE)
        stmt = new CreateVirtualTableStatement()
      } else if (this.consumeIf(Reserved.TABLE)) {
        stmt = new CreateTableStatement()
      } else if (this.consumeIf(Reserved.VIEW)) {
        stmt = new CreateViewStatement()
      } else if (this.consumeIf(Reserved.TRIGGER)) {
        stmt = new CreateTriggerStatement()
      } else if (this.consumeIf(Reserved.INDEX)) {
        stmt = new CreateIndexStatement()
      } else if (this.consumeIf(Reserved.UNIQUE)) {
        this.consume(Reserved.INDEX)
        stmt = new CreateIndexStatement()
        stmt.unique = true
      } else {
        throw this.createParseError()
      }

      if (this.consumeIf(Reserved.IF)) {
        this.consume(Reserved.NOT)
        this.consume(Reserved.EXISTS)
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
            const token = this.peek()
            if (token.type instanceof Reserved) {
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
          if (this.consumeIf(Reserved.WITHOUT)) {
            if (this.consume(Reserved.Identifier, /^ROWID$/i)) {
              stmt.withoutRowid = true
            }
          }
        } else {
          this.consume(Reserved.AS)
          stmt.select = this.selectClause()
        }
      } else if (stmt instanceof CreateVirtualTableStatement) {
        this.consume(Reserved.USING)
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
          if (this.consumeIf(Reserved.BEGIN)) {
            while (this.peek() && !this.peekIf(Reserved.END)) {
              this.consume()
            }
          } else {
            this.consume()
          }
        }
      } else if (stmt instanceof CreateIndexStatement) {
        this.consume(Reserved.ON)
        stmt.tableName = this.identifier()
        this.consume(TokenType.LeftParen)
        stmt.columns.push(this.indexedColumn())
        while (this.consumeIf(TokenType.Comma)) {
          stmt.columns.push(this.indexedColumn())
        }
        this.consume(TokenType.RightParen)
        if (this.consumeIf(Reserved.WHERE)) {
          stmt.where = []
          while (this.peek() && !this.peekIf(TokenType.SemiColon)) {
            stmt.where.push(this.consume())
          }
        }
      }
    } else if (this.consumeIf(Reserved.ALTER)) {
      this.consume(Reserved.TABLE)
      stmt = new AlterTableStatement()
      stmt.name = this.identifier()
      if (this.consumeIf(TokenType.Dot)) {
        stmt.schemaName = stmt.name
        stmt.name = this.identifier()
      }
      if (this.consumeIf(Reserved.RENAME)) {
        if (this.consumeIf(Reserved.TO)) {
          stmt.alterTableAction = AlterTableAction.RENAME_TABLE
          stmt.newTableName = this.identifier()
        } else {
          this.consumeIf(Reserved.COLUMN)
          stmt.alterTableAction = AlterTableAction.RENAME_COLUMN
          stmt.columnName = this.identifier()
          this.consume(Reserved.TO)
          stmt.newColumnName = this.identifier()
        }
      } else if (this.consumeIf(Reserved.ADD)) {
        this.consumeIf(Reserved.COLUMN)
        stmt.alterTableAction = AlterTableAction.ADD_COLUMN
        stmt.newColumn = this.columnDef()
      } else if (this.consumeIf(Reserved.DROP)) {
        this.consumeIf(Reserved.COLUMN)
        stmt.alterTableAction = AlterTableAction.DROP_COLUMN
        stmt.columnName = this.identifier()
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Reserved.DROP)) {
      if (this.consumeIf(Reserved.TABLE)) {
        stmt = new DropTableStatement()
      } else if (this.consumeIf(Reserved.INDEX)) {
        stmt = new DropIndexStatement()
      } else if (this.consumeIf(Reserved.VIEW)) {
        stmt = new DropViewStatement()
      } else if (this.consumeIf(Reserved.TRIGGER)) {
        stmt = new DropTriggerStatement()
      } else {
        throw this.createParseError()
      }

      if (this.consumeIf(Reserved.IF)) {
        this.consume(Reserved.EXISTS)
        stmt.ifExists = true
      }

      stmt.name = this.identifier()
      if (this.consumeIf(TokenType.Dot)) {
        stmt.schemaName = stmt.name
        stmt.name = this.identifier()
      }
    } else if (this.consumeIf(Reserved.ATTACH)) {
      this.consumeIf(Reserved.DATABASE)
      stmt = new AttachDatabaseStatement()
      stmt.expression = this.expression()
      this.consume(Reserved.AS)
      stmt.name = this.identifier()
    } else if (this.consumeIf(Reserved.DETACH)) {
      this.consumeIf(Reserved.DATABASE)
      stmt = new DetachDatabaseStatement()
      stmt.name = this.identifier()
    } else if (this.consumeIf(Reserved.BEGIN)) {
      stmt = new BeginTransactionStatement()
      if (this.consumeIf(Reserved.DEFERRED)) {
        stmt.transactionBehavior = TransactionBehavior.DEFERRED
      } else if (this.consumeIf(Reserved.IMMEDIATE)) {
        stmt.transactionBehavior = TransactionBehavior.IMMEDIATE
      } else if (this.consumeIf(Reserved.EXCLUSIVE)) {
        stmt.transactionBehavior = TransactionBehavior.EXCLUSIVE
      }
      this.consume(Reserved.TRANSACTION)
    } else if (this.consumeIf(Reserved.SAVEPOINT)) {
      stmt = new SavepointStatement()
      stmt.name = this.identifier()
    } else if (this.consumeIf(Reserved.RELEASE)) {
      stmt = new ReleaseSavepointStatement()
      this.consumeIf(Reserved.SAVEPOINT)
      stmt.savePointName = this.identifier()
    } else if (this.consumeIf(Reserved.COMMIT) || this.consumeIf(Reserved.END)) {
      stmt = new CommitTransactionStatement()
      this.consumeIf(Reserved.TRANSACTION)
    } else if (this.consumeIf(Reserved.ROLLBACK)) {
      stmt = new RollbackTransactionStatement()
      this.consumeIf(Reserved.TRANSACTION)
      if (this.consumeIf(Reserved.TO)) {
        this.consumeIf(Reserved.SAVEPOINT)
        stmt.savePointName = this.identifier()
      }
    } else if (this.consumeIf(Reserved.ANALYZE)) {
      stmt = new AnalyzeStatement()
      stmt.name = this.identifier()
      if (this.consumeIf(TokenType.Dot)) {
        stmt.schemaName = stmt.name
        stmt.name = this.identifier()
      }
    } else if (this.consumeIf(Reserved.REINDEX)) {
      stmt = new ReindexStatement()
      stmt.name = this.identifier()
      if (this.consumeIf(TokenType.Dot)) {
        stmt.schemaName = stmt.name
        stmt.name = this.identifier()
      }
    } else if (this.consumeIf(Reserved.VACUUM)) {
      stmt = new VacuumStatement()
      if (
        this.peekIf(TokenType.QuotedIdentifier) ||
        this.peekIf(TokenType.Identifier) ||
        this.peekIf(TokenType.QuotedValue)
      ) {
        stmt.schemaName = this.identifier()
      }
      if (this.consumeIf(Reserved.TO)) {
        stmt.fileName = this.stringValue()
      }
    } else if (this.consumeIf(Reserved.PRAGMA)) {
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
      if (this.peekIf(Reserved.WITH)) {
        withClause = this.withClause()
      }
      if (this.peekIf(Reserved.INSERT) || this.peekIf(Reserved.REPLACE)) {
        stmt = new InsertStatement()
        stmt.withClause = withClause
        if (this.consumeIf(Reserved.REPLACE)) {
          stmt.conflictAction = ConflictAction.REPLACE
        } else {
          this.consume(Reserved.INSERT)
          if (this.consumeIf(Reserved.OR)) {
            stmt.conflictAction = this.conflictAction()
          }
        }
        this.consume(Reserved.INTO)
        stmt.name = this.identifier()
        if (this.consumeIf(TokenType.Dot)) {
          stmt.schemaName = stmt.name
          stmt.name = this.identifier()
        }
        while (this.peek() && !this.peekIf(TokenType.SemiColon)) {
          stmt.body.push(this.consume())
        }
      } else if (this.consumeIf(Reserved.UPDATE)) {
        stmt = new UpdateStatement()
        stmt.withClause = withClause
        if (this.consumeIf(Reserved.OR)) {
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
      } else if (this.consumeIf(Reserved.DELETE)) {
        this.consume(Reserved.FROM)
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
      } else if (this.peekIf(Reserved.SELECT)) {
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
    if (this.peekIf(Reserved.WITH)) {
      this.withClause()
    }
    this.consume(Reserved.SELECT)
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
    this.consume(Reserved.WITH)
    this.consumeIf(Reserved.RECURSIVE)
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      this.identifier()
      this.consume(Reserved.AS)
      if (this.consumeIf(Reserved.NOT)) {
        this.consume(Reserved.MATERIALIZED)
      } else {
        this.consumeIf(Reserved.MATERIALIZED)
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
    if (this.consumeIf(Reserved.CONSTRAINT)) {
      name = this.identifier()
    }
    if (this.consumeIf(Reserved.PRIMARY)) {
      this.consume(Reserved.KEY)
      constraint = new PrimaryKeyColumnConstraint()
      constraint.name = name
      if (this.consumeIf(Reserved.ASC)) {
        constraint.sortOrder = SortOrder.ASC
      } else if (this.consumeIf(Reserved.DESC)) {
        constraint.sortOrder = SortOrder.DESC
      }
      if (this.consumeIf(Reserved.ON)) {
        this.consume(Reserved.CONFLICT)
        constraint.conflictAction = this.conflictAction()
      }
      if (this.consumeIf(Reserved.AUTOINCREMENT)) {
        constraint.autoIncrement = false
      }
    } else if (this.peekIf(Reserved.NOT) || this.peekIf(Reserved.NULL)) {
      if (this.consumeIf(Reserved.NOT)) {
        constraint = new NotNullColumnConstraint()
      } else {
        constraint = new NullColumnConstraint()
      }
      this.consume(Reserved.NULL)
      constraint.name = name
      if (this.consumeIf(Reserved.ON)) {
        this.consume(Reserved.CONFLICT)
        constraint.conflictAction = this.conflictAction()
      }
    } else if (this.consumeIf(Reserved.UNIQUE)) {
      constraint = new UniqueColumnConstraint()
      constraint.name = name
      if (this.consumeIf(Reserved.ON)) {
        this.consume(Reserved.CONFLICT)
        constraint.conflictAction = this.conflictAction()
      }
    } else if (this.consumeIf(Reserved.CHECK)) {
      constraint = new CheckColumnConstraint()
      constraint.name = name
      this.consume(TokenType.LeftParen)
      while (this.peek() && !this.peekIf(TokenType.RightParen)) {
        constraint.conditions.push(this.consume())
      }
      this.consume(TokenType.RightParen)
    } else if (this.consumeIf(Reserved.DEFAULT)) {
      constraint = new DefaultColumnConstraint()
      constraint.name = name
      let token
      if (this.consumeIf(TokenType.LeftParen)) {
        constraint.expression = this.expression()
        this.consume(TokenType.RightParen)
      } else if (token = this.consumeIf(Reserved.NULL)) {
        constraint.expression = Idnetifier.NULL
      } else if (token = this.consumeIf(TokenType.Identifier, /^(TRUE|FALSE|CURRENT_(DATE|TIME|TIMESTAMP))$/i)) {
        constraint.expression = new Idnetifier(token.text)
      } else if (token = this.consumeIf(TokenType.String)) {
        constraint.expression = new StringValue(dequote(token.text))
      } else if (token = this.peekIf(Reserved.Operator, /^[+-]$/) || this.peekIf(TokenType.Number)) {
        constraint.expression = this.numberValue()
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Reserved.COLLATE)) {
      constraint = new CollateColumnConstraint()
      constraint.name = name
      constraint.collationName = this.identifier()
    } else if (this.consumeIf(Reserved.REFERENCES)) {
      constraint = new ReferencesKeyColumnConstraint()
      constraint.name = name
      constraint.tableName = this.identifier()
      this.consume(TokenType.LeftParen)
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        constraint.columnNames.push(this.identifier())
      }
      this.consume(TokenType.RightParen)
    } else if (this.consumeIf(Reserved.GENERATED) || this.consumeIf(Reserved.AS)) {
      if (this.peek().type === Reserved.GENERATED) {
        this.consume(Reserved.ALWAYS)
        this.consume(Reserved.AS)
      }
      constraint = new GeneratedColumnConstraint()
      constraint.name = name
      this.consume(TokenType.LeftParen)
      constraint.expression = this.expression()
      this.consume(TokenType.RightParen)
      if (this.consumeIf(TokenType.Identifier)) {
        constraint.storeType = StoreType.STORED
      } else if (this.consumeIf(Reserved.VIRTUAL)) {
        constraint.storeType = StoreType.VIRTUAL
      }
    } else {
      throw this.createParseError()
    }
    return constraint
  }

  tableConstraint() {
    let constraint, name;
    if (this.consumeIf(Reserved.CONSTRAINT)) {
      name = this.identifier()
    }
    if (this.consumeIf(Reserved.PRIMARY)) {
      this.consume(Reserved.KEY)
      constraint = new PrimaryKeyTableConstraint()
      constraint.name = name
      this.consume(TokenType.LeftParen)
      constraint.columns.push(this.indexedColumn())
      while (this.consumeIf(TokenType.Comma)) {
        constraint.columns.push(this.indexedColumn())
      }
      this.consume(TokenType.RightParen)
      if (this.consumeIf(Reserved.ON)) {
        this.consume(Reserved.CONFLICT)
        constraint.conflictAction = this.conflictAction()
      }
    } else if (this.consumeIf(Reserved.UNIQUE)) {
      constraint = new UniqueTableConstraint()
      constraint.name = name
      this.consume(TokenType.LeftParen)
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        constraint.columns.push(this.indexedColumn())
      }
      this.consume(TokenType.RightParen)
      if (this.consumeIf(Reserved.ON)) {
        this.consume(Reserved.CONFLICT)
        constraint.conflictAction = this.conflictAction()
      }
    } else if (this.consumeIf(Reserved.CHECK)) {
      constraint = new CheckTableConstraint()
      constraint.name = name
      this.consume(TokenType.LeftParen)
      while (this.peek() && !this.peekIf(TokenType.RightParen)) {
        constraint.conditions.push(this.consume())
      }
      this.consume(TokenType.RightParen)
    } else if (this.consumeIf(Reserved.FOREIGN)) {
      this.consume(Reserved.KEY)
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
    if (this.consumeIf(Reserved.ROLLBACK)) {
      return ConflictAction.ROLLBACK
    } else if (this.consumeIf(Reserved.ABORT)) {
      return ConflictAction.ABORT
    } else if (this.consumeIf(Reserved.FAIL)) {
      return ConflictAction.FAIL
    } else if (this.consumeIf(Reserved.IGNORE)) {
      return ConflictAction.IGNORE
    } else if (this.consumeIf(Reserved.REPLACE)) {
      return ConflictAction.REPLACE
    } else {
      throw this.createParseError()
    }
  }

  moduleArgument() {
    let tokens: Token[] = []
    while (this.peek() && !this.peekIf(TokenType.Comma) && !this.peekIf(TokenType.LeftParen)) {
      if (tokens[tokens.length-1] && tokens[tokens.length-1].skips) {
        for (let token of tokens[tokens.length-1].skips) {
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
    if (this.consumeIf(Reserved.ASC)) {
      column.sortOrder = SortOrder.ASC
    } else if (this.consumeIf(Reserved.DESC)) {
      column.sortOrder = SortOrder.DESC
    }
    return column
  }

  pragmaValue() {
    let value: IExpression, token
    if (this.peekIf(TokenType.Operator, /^[+-]$/) || this.peekIf(TokenType.Number)) {
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
    let token, value = ""
    if (token = this.consumeIf(Reserved.Operator, /^[+-]$/)) {
      if (token.text === "-") {
        value += token.text
      }
    }
    token = this.consume(TokenType.Number)
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
      (depth == 0 && !this.peekIf(Reserved.AS)) &&
      (depth == 0 && !this.peekIf(Reserved.ASC)) &&
      (depth == 0 && !this.peekIf(Reserved.DESC)) &&
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
