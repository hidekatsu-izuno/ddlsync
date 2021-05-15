export class TokenType {
  static Delimiter = new TokenType("Delimiter")
  static Command = new TokenType("Command")
  static WhiteSpace = new TokenType("WhiteSpace", { skip: true })
  static LineBreak = new TokenType("LineBreak", { skip: true })
  static HintComment = new TokenType("HintComment", { skip: true })
  static BlockComment = new TokenType("BlockComment", { skip: true })
  static LineComment = new TokenType("LineComment", { skip: true })
  static SemiColon = new TokenType("SemiColon")
  static LeftParen = new TokenType("LeftParen")
  static RightParen = new TokenType("RightParen")
  static LeftBracket = new TokenType("LeftBracket")
  static RightBracket = new TokenType("RightBracket")
  static Comma = new TokenType("Comma")
  static Dot = new TokenType("Dot")
  static Operator = new TokenType("Operator", { operator: true })
  static Number = new TokenType("Number")
  static String = new TokenType("String")
  static BindVariable = new TokenType("BindVariable")
  static Variable = new TokenType("Variable")
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
export class Keyword {
  static ABORT = new Keyword("ABORT")
  static ADD = new Keyword("ADD")
  static ALTER = new Keyword("ALTER")
  static ALWAYS = new Keyword("ALWAYS")
  static AND = new Keyword("AND")
  static ANALYZE = new Keyword("ANALYZE")
  static AS = new Keyword("AS")
  static ASC = new Keyword("ASC")
  static ATTACH = new Keyword("ATTACH")
  static AUTOINCREMENT = new Keyword("AUTOINCREMENT")
  static BEGIN = new Keyword("BEGIN")
  static CHECK = new Keyword("CHECK")
  static COLLATE = new Keyword("COLLATE")
  static COLUMN = new Keyword("COLUMN")
  static COMMIT = new Keyword("COMMIT")
  static CONFLICT = new Keyword("CONFLICT")
  static CONSTRAINT = new Keyword("CONSTRAINT")
  static CREATE = new Keyword("CREATE")
  static CURRENT_DATE = new Keyword("CURRENT_DATE")
  static CURRENT_TIME = new Keyword("CURRENT_TIME")
  static CURRENT_TIMESTAMP = new Keyword("CURRENT_TIMESTAMP")
  static DATABASE = new Keyword("DATABASE")
  static DEFAULT = new Keyword("DEFAULT")
  static DEFERRED = new Keyword("DEFERRED")
  static DELETE = new Keyword("DELETE")
  static DESC = new Keyword("DESC")
  static DETACH = new Keyword("DETACH")
  static DROP = new Keyword("DROP")
  static EXCLUSIVE = new Keyword("EXCLUSIVE")
  static EXISTS = new Keyword("EXISTS")
  static END = new Keyword("END")
  static EXPLAIN = new Keyword("EXPLAIN")
  static FAIL = new Keyword("FAIL")
  static FALSE = new Keyword("FALSE")
  static FOREIGN = new Keyword("FOREIGN")
  static FROM = new Keyword("FROM")
  static GENERATED = new Keyword("GENERATED")
  static IGNORE = new Keyword("IGNORE")
  static IMMEDIATE = new Keyword("IMMEDIATE")
  static INDEX = new Keyword("INDEX")
  static INSERT = new Keyword("INSERT")
  static INTO = new Keyword("INTO")
  static IF = new Keyword("IF")
  static KEY = new Keyword("KEY")
  static MATERIALIZED = new Keyword("MATERIALIZED")
  static NOT = new Keyword("NOT")
  static NULL = new Keyword("NULL")
  static ON = new Keyword("ON")
  static OR = new Keyword("OR")
  static PRAGMA = new Keyword("PRAGMA")
  static PRIMARY = new Keyword("PRIMARY")
  static PLAN = new Keyword("PLAN")
  static QUERY = new Keyword("QUERY")
  static RECURSIVE = new Keyword("RECURSIVE")
  static REFERENCES = new Keyword("REFERENCES")
  static RENAME = new Keyword("RENAME")
  static RELEASE = new Keyword("RELEASE")
  static REINDEX = new Keyword("REINDEX")
  static REPLACE = new Keyword("REPLACE")
  static ROLLBACK = new Keyword("ROLLBACK")
  static ROWID = new Keyword("ROWID")
  static SAVEPOINT = new Keyword("SAVEPOINT")
  static SELECT = new Keyword("SELECT")
  static TABLE = new Keyword("TABLE")
  static TEMP = new Keyword("TEMP")
  static TEMPORARY = new Keyword("TEMPORARY")
  static TO = new Keyword("TO")
  static TRANSACTION = new Keyword("TRANSACTION")
  static TRIGGER = new Keyword("TRIGGER")
  static TRUE = new Keyword("TRUE")
  static USING = new Keyword("USING")
  static UNION = new Keyword("UNION")
  static UNIQUE = new Keyword("UNIQUE")
  static UPDATE = new Keyword("UPDATE")
  static VACUUM = new Keyword("VACUUM")
  static VIEW = new Keyword("VIEW")
  static VIRTUAL = new Keyword("VIRTUAL")
  static WHERE = new Keyword("WHERE")
  static WITH = new Keyword("WITH")
  static WITHOUT = new Keyword("WITHOUT")

  constructor(
    name: string,
    public options: { [key: string]: any } = {}
  ) {
    KeywordMap.set(name, this)
  }

  static valueOf(name: string) {
    return KeywordMap.get(name)
  }
}

const OperatorMap = new Map<string, Operator>()
export class Operator {
  static EQ = new Operator("=")
  static PLUS = new Operator("+")
  static MINUS = new Operator("-")

  constructor(
    name: string,
    public options: { [key: string]: any } = {}
  ) {
    KeywordMap.set(name, this)
  }

  static valueOf(name: string) {
    return OperatorMap.get(name)
  }
}

export class Token {
  public subtype?: Keyword
  public before: Token[] = []
  public after: Token[] = []

  constructor(
    public type: TokenType,
    public text: string,
    public start: number,
    public end: number,
  ) {
  }
}

export abstract class Lexer {
  constructor(
    private patterns: {type: TokenType, re: RegExp | (() => RegExp) }[],
  ) {
  }

  toReserved(text: string): TokenType | undefined {
    return undefined
  }

  process(token: Token) {
    return token
  }

  lex(input: string) {
    const tokens = []
    let pos = 0

    if (input.startsWith("\uFEFF")) {
      pos = 1
    }

    const before = new Array<Token>()
    while (pos < input.length) {
      let token
      for (let pattern of this.patterns) {
        const re = (typeof pattern.re  === 'function') ?
          pattern.re() : pattern.re

        re.lastIndex = pos
        const m = re.exec(input)
        if (m) {
          token = new Token(pattern.type, m[0], pos, re.lastIndex)
          pos = re.lastIndex
          break
        }
      }

      if (!token) {
        throw new Error(`Failed to tokenize: ${pos}`)
      }

      if (token.type === TokenType.Identifier) {
        const keyword = Keyword.valueOf(token.text.toUpperCase())
        if (keyword) {
          token.subtype = keyword
        }
      } else if (token.type === TokenType.Operator) {
        const operator = Operator.valueOf(token.text.toUpperCase())
        if (operator) {
          token.subtype = operator
        }
      }

      this.process(token)

      const prev = tokens[tokens.length - 1]
      if (token.type.options.skip) {
        if (prev) {
          prev.after.push(token)
        } else {
          before.push(token)
        }
      } else {
        if (prev) {
          token.before = prev.after
        } else {
          token.before = before
        }
        tokens.push(token)
      }
    }

    return tokens
  }
}

export abstract class Parser {
  protected tokens: Token[]
  protected pos = 0

  constructor(
    protected input: string,
    lexer: Lexer
  ) {
    this.tokens = lexer.lex(input)
  }

  abstract root(): Statement[]

  peek(pos: number = 0) {
    return this.tokens[this.pos + pos]
  }

  peekIf(type?: TokenType | Keyword) {
    const token = this.peek()
    if (!token) {
      return null
    }

    if (type && !(type === token.type || type === token.subtype)) {
      return null
    }

    return token
  }

  consumeIf(type?: TokenType | Keyword) {
    const token = this.peekIf(type)
    if (token) {
      this.pos++
    }
    return token
  }

  consume(type?: TokenType | Keyword) {
    const token = this.consumeIf(type)
    if (token == null) {
      throw this.createParseError()
    }
    return token
  }

  createParseError() {
    const token = this.peek()
    const lines = this.input.substring(0, token.start).split(/\r\n?|\n/g)
    let last = lines[lines.length-1]
    const rows = lines.length + 1
    const cols = last.length
    if (!last && lines.length - 2 >= 0) {
      const last2 = lines[lines.length-2].replace(/^[ \t]+/, "").substr(-16)
      last = `${last2}\u21B5 ${last}`
    }
    return new Error(`[${rows},${cols}] Unexpected token: ${last}"${token.text}"`)
  }
}

export class Document {

}

export abstract class Statement {
  public text?: string
}

export abstract class TableConstraint {
  public name?: string
}

export abstract class ColumnConstraint {
  public name?: string
}

export interface IExpression {

}


export enum AlterTableAction {
  RENAME_TABLE = "RENAME_TABLE",
  RENAME_COLUMN = "RENAME_COLUMN",
  ADD_COLUMN = "ADD_COLUMN",
  DROP_COLUMN = "DROP_COLUMN",
}

export enum SortOrder {
  ASC = "ASC",
  ASC_NULLS_FIRST = "ASC_NULLS_FIRST",
  ASC_NULLS_LAST = "ASC_NULLS_LAST",
  DESC = "DESC",
  DESC_NULLS_FIRST = "DESC_NULLS_FIRST",
  DESC_NULLS_LAST = "DESC_NULLS_LAST",
}

export enum ConflictAction {
  ROLLBACK = "ROLLBACK",
  ABORT = "ABORT",
  FAIL = "FAIL",
  IGNORE = "IGNORE",
  REPLACE = "REPLACE",
}

export enum StoreType {
  STORED = "STORED",
  VIRTUAL = "VIRTUAL",
}

export enum TransactionBehavior {
  DEFERRED = "DEFERRED",
  IMMEDIATE = "IMMEDIATE",
  EXCLUSIVE = "EXCLUSIVE",
}

export class ExplainStatement extends Statement {
  constructor(public statement: Statement) {
    super()
  }
}

export class CreateTableStatement extends Statement {
  public schemaName?: string
  public name: string = ""
  public temporary = false
  public ifNotExists = false
  public withoutRowid = false
  public columns?: ColumnDef[]
  public constraints?: TableConstraint[]
  public select?: Token[]
}

export class CreateVirtualTableStatement extends Statement {
  public schemaName?: string
  public name: string = ""
  public ifNotExists = false
  public moduleName: string = ""
  public moduleArgs?: string[]
}

export class CreateIndexStatement extends Statement {
  public schemaName?: string
  public name = ""
  public tableName = ""
  public unique = false
  public ifNotExists = false
  public columns = new Array<IndexedColumn>()
  public where?: Token[]
}

export class CreateViewStatement extends Statement {
  public schemaName?: string
  public name = ""
  public temporary = false
  public ifNotExists = false
  public select = new Array<Token>()
}

export class CreateTriggerStatement extends Statement {
  public schemaName?: string
  public name = ""
  public temporary = false
  public ifNotExists = false
  public body = new Array<Token>()
}

export class AlterTableStatement extends Statement {
  public schemaName?: string
  public name = ""
  public alterTableAction = AlterTableAction.RENAME_TABLE
  public newTableName?: string
  public columnName?: string
  public newColumnName?: string
  public newColumn?: ColumnDef
}

export class DropTableStatement extends Statement {
  public schemaName?: string
  public name: string = ""
  public ifExists = false
}

export class DropIndexStatement extends Statement {
  public schemaName?: string
  public name = ""
  public ifExists = false
}

export class DropViewStatement extends Statement {
  public schemaName?: string
  public name = ""
  public ifExists = false
}

export class DropTriggerStatement extends Statement {
  public schemaName?: string
  public name = ""
  public ifExists = false
}

export class ReindexStatement extends Statement {
  public schemaName?: string
  public name = ""
}

export class AnalyzeStatement extends Statement {
  public schemaName?: string
  public name = ""
}

export class AttachDatabaseStatement extends Statement {
  public name = ""
  public expression: IExpression = Reserved.NULL
}

export class DetachDatabaseStatement extends Statement {
  public name = ""
}

export class BeginTransactionStatement extends Statement {
  public transactionBehavior = TransactionBehavior.DEFERRED
}

export class SavepointStatement extends Statement {
  public name: string = ""
}

export class ReleaseSavepointStatement extends Statement {
  public savePointName = ""
}

export class CommitTransactionStatement extends Statement {
}

export class RollbackTransactionStatement extends Statement {
  public savePointName?: string
}

export class VacuumStatement extends Statement {
  public schemaName?: string
  public fileName?: string
}

export class PragmaStatement extends Statement {
  public schemaName?: string
  public name = ""
  public value: IExpression = Reserved.NULL
}

export class InsertStatement extends Statement {
  public schemaName?: string
  public name = ""
  public conflictAction = ConflictAction.ABORT
  public withClause?: Token[]
  public body = new Array<Token>()
}

export class UpdateStatement extends Statement {
  public schemaName?: string
  public name = ""
  public conflictAction = ConflictAction.ABORT
  public withClause?: Token[]
  public body = new Array<Token>()
}

export class DeleteStatement extends Statement {
  public schemaName?: string
  public name = ""
  public withClause?: Token[]
  public body = new Array<Token>()
}

export class SelectStatement extends Statement {
  public body = new Array<Token>()
}

export class ColumnDef {
  public name = ""
  public typeName = "TEXT"
  public length?: NumberValue
  public scale?: NumberValue
  public constraints = new Array<ColumnConstraint>()
}

export class IndexedColumn {
  public expression: IExpression = Reserved.NULL
  public sortOrder = SortOrder.ASC
}

export class PrimaryKeyTableConstraint extends TableConstraint {
  public columns = new Array<IndexedColumn>()
  public conflictAction = ConflictAction.ABORT
}

export class UniqueTableConstraint extends TableConstraint {
  public columns = new Array<IndexedColumn>()
  public conflictAction = ConflictAction.ABORT
}

export class CheckTableConstraint extends TableConstraint {
  public conditions = new Array<Token>()
}

export class ForeignKeyTableConstraint extends TableConstraint {
  public columnNames = new Array<string>()
}

export class PrimaryKeyColumnConstraint extends ColumnConstraint {
  public sortOrder = SortOrder.ASC
  public conflictAction = ConflictAction.ABORT
  public autoIncrement = false
}

export class NotNullColumnConstraint extends ColumnConstraint {
  public conflictAction = ConflictAction.ABORT
}

export class NullColumnConstraint extends ColumnConstraint {
  public conflictAction = ConflictAction.ABORT
}

export class UniqueColumnConstraint extends ColumnConstraint {
  public conflictAction = ConflictAction.ABORT
}

export class CheckColumnConstraint extends ColumnConstraint {
  public conditions = new Array<Token>()
}

export class DefaultColumnConstraint extends ColumnConstraint {
  public expression: IExpression = Reserved.NULL
}

export class CollateColumnConstraint extends ColumnConstraint {
  public collationName = ""
}

export class ReferencesKeyColumnConstraint extends ColumnConstraint {
  public tableName = ""
  public columnNames = new Array<string>()
}

export class GeneratedColumnConstraint extends ColumnConstraint {
  public expression: IExpression = Reserved.NULL
  public storeType = StoreType.VIRTUAL
}

export class Expression implements IExpression {
  constructor(public value: Token[]) {
  }
}

export class Reserved implements IExpression {
  static NULL = new Reserved("NULL")
  static TRUE = new Reserved("TRUE")
  static FALSE = new Reserved("FALSE")
  static CURRENT_DATE = new Reserved("CURRENT_DATE")
  static CURRENT_TIME = new Reserved("CURRENT_TIME")
  static CURRENT_TIMESTAMP = new Reserved("CURRENT_TIMESTAMP")

  constructor(public value: string) {
  }
}

export class Idnetifier implements IExpression {
  constructor(public value: string) {
  }
}

export class StringValue implements IExpression {
  constructor(public value: string) {
  }
}

export class NumberValue implements IExpression {
  constructor(public value: string) {
  }
}
