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
  filename?: string
  text: string = ""

  abstract summary(): string
}

export abstract class TableConstraint {
  name?: string
}

export abstract class ColumnConstraint {
  name?: string
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

  summary() {
    return "EXPLAIN"
  }
}

export class CreateTableStatement extends Statement {
  schemaName?: string
  name: string = ""
  temporary = false
  ifNotExists = false
  withoutRowid = false
  columns?: ColumnDef[]
  constraints?: TableConstraint[]
  select?: Token[]

  summary() {
    return "CREATE " +
      (this.temporary ? "TEMPORARY " : "") +
      "TABLE " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class CreateVirtualTableStatement extends Statement {
  schemaName?: string
  name: string = ""
  ifNotExists = false
  moduleName: string = ""
  moduleArgs?: string[]

  summary() {
    return "CREATE VIRTUAL TABLE" +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class CreateIndexStatement extends Statement {
  schemaName?: string
  name = ""
  tableName = ""
  unique = false
  ifNotExists = false
  columns = new Array<IndexedColumn>()
  where?: Token[]

  summary() {
    return "CREATE " +
      (this.unique ? "UNIQUE " : "") +
      "INDEX " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name + " " +
      "ON " + this.tableName
  }
}

export class CreateViewStatement extends Statement {
  schemaName?: string
  name = ""
  temporary = false
  ifNotExists = false
  select = new Array<Token>()

  summary() {
    return "CREATE " +
      (this.temporary ? "TEMPORARY " : "") +
      "VIEW " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name + " "
  }
}

export class CreateTriggerStatement extends Statement {
  schemaName?: string
  name = ""
  temporary = false
  ifNotExists = false
  body = new Array<Token>()

  summary() {
    return "CREATE " +
      (this.temporary ? "TEMPORARY " : "") +
      "TRIGGER " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name + " "
  }
}

export class AlterTableStatement extends Statement {
  schemaName?: string
  name = ""
  alterTableAction = AlterTableAction.RENAME_TABLE
  newTableName?: string
  columnName?: string
  newColumnName?: string
  newColumn?: ColumnDef

  summary() {
    return "ALTER TABLE " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name + " " +
      (
        this.alterTableAction === AlterTableAction.ADD_COLUMN ? "ADD COLUMN" :
        this.alterTableAction === AlterTableAction.RENAME_COLUMN ? "RENAME COLUMN" :
        this.alterTableAction === AlterTableAction.DROP_COLUMN ? "DROP COLUMN" :
        "RENAME TO " + this.newTableName
      )
  }
}

export class DropTableStatement extends Statement {
  schemaName?: string
  name: string = ""
  ifExists = false

  summary() {
    return "DROP TABLE " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class DropIndexStatement extends Statement {
  schemaName?: string
  name = ""
  ifExists = false

  summary() {
    return "DROP INDEX " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class DropViewStatement extends Statement {
  schemaName?: string
  name = ""
  ifExists = false

  summary() {
    return "DROP VIEW " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class DropTriggerStatement extends Statement {
  schemaName?: string
  name = ""
  ifExists = false

  summary() {
    return "DROP TRIGGER " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class ReindexStatement extends Statement {
  schemaName?: string
  name = ""

  summary() {
    return "REINDEX " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class AnalyzeStatement extends Statement {
  schemaName?: string
  name = ""

  summary() {
    return "ANALYZE " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class AttachDatabaseStatement extends Statement {
  name = ""
  expression: IExpression = Reserved.NULL

  summary() {
    return "ATTACHE DATABASE " +
      this.name
  }
}

export class DetachDatabaseStatement extends Statement {
  name = ""

  summary() {
    return "DETACHE DATABASE " +
      this.name
  }
}

export class BeginTransactionStatement extends Statement {
  transactionBehavior = TransactionBehavior.DEFERRED

  summary() {
    return "BEGIN TRANSACTION"
  }
}

export class SavepointStatement extends Statement {
  name: string = ""

  summary() {
    return "SAVEPOINT " +
      this.name
  }
}

export class ReleaseSavepointStatement extends Statement {
  savePointName = ""

  summary() {
    return "RELEASE SAVEPOINT " +
      this.savePointName
  }
}

export class CommitTransactionStatement extends Statement {
  summary() {
    return "COMMIT TRANSACTION"
  }
}

export class RollbackTransactionStatement extends Statement {
  savePointName?: string

  summary() {
    return "ROLLBACK TRANSACTION" +
      (this.savePointName ? " TO SAVEPOINT " + this.savePointName : "")
  }
}

export class VacuumStatement extends Statement {
  schemaName?: string
  fileName?: string

  summary() {
    return "VACUUM" +
      (this.schemaName ? " " + this.schemaName : "")
  }
}

export class PragmaStatement extends Statement {
  schemaName?: string
  name = ""
  value?: IExpression

  summary() {
    return (this.value ? " SET" : " GET") +
      " PRAGMA " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class InsertStatement extends Statement {
  schemaName?: string
  name = ""
  conflictAction = ConflictAction.ABORT
  withClause?: Token[]
  body = new Array<Token>()

  summary() {
    return "INSERT INTO " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class UpdateStatement extends Statement {
  schemaName?: string
  name = ""
  conflictAction = ConflictAction.ABORT
  withClause?: Token[]
  body = new Array<Token>()

  summary() {
    return "UPDATE " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class DeleteStatement extends Statement {
  schemaName?: string
  name = ""
  withClause?: Token[]
  body = new Array<Token>()

  summary() {
    return "DELETE FROM " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class SelectStatement extends Statement {
  body = new Array<Token>()

  summary() {
    return "SELECT"
  }
}

export class ColumnDef {
  name = ""
  typeName = "TEXT"
  length?: NumberValue
  scale?: NumberValue
  constraints = new Array<ColumnConstraint>()
}

export class IndexedColumn {
  expression: IExpression = Reserved.NULL
  sortOrder = SortOrder.ASC
}

export class PrimaryKeyTableConstraint extends TableConstraint {
  columns = new Array<IndexedColumn>()
  conflictAction = ConflictAction.ABORT
}

export class UniqueTableConstraint extends TableConstraint {
  columns = new Array<IndexedColumn>()
  conflictAction = ConflictAction.ABORT
}

export class CheckTableConstraint extends TableConstraint {
  conditions = new Array<Token>()
}

export class ForeignKeyTableConstraint extends TableConstraint {
  columnNames = new Array<string>()
}

export class PrimaryKeyColumnConstraint extends ColumnConstraint {
  sortOrder = SortOrder.ASC
  conflictAction = ConflictAction.ABORT
  autoIncrement = false
}

export class NotNullColumnConstraint extends ColumnConstraint {
  conflictAction = ConflictAction.ABORT
}

export class NullColumnConstraint extends ColumnConstraint {
  conflictAction = ConflictAction.ABORT
}

export class UniqueColumnConstraint extends ColumnConstraint {
  conflictAction = ConflictAction.ABORT
}

export class CheckColumnConstraint extends ColumnConstraint {
  conditions = new Array<Token>()
}

export class DefaultColumnConstraint extends ColumnConstraint {
  expression: IExpression = Reserved.NULL
}

export class CollateColumnConstraint extends ColumnConstraint {
  collationName = ""
}

export class ReferencesKeyColumnConstraint extends ColumnConstraint {
  tableName = ""
  columnNames = new Array<string>()
}

export class GeneratedColumnConstraint extends ColumnConstraint {
  expression: IExpression = Reserved.NULL
  storeType = StoreType.VIRTUAL
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
