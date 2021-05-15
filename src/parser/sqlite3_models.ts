import { TokenType, Token, Statement, TableConstraint, ColumnConstraint, IExpression, Idnetifier, NumberValue } from "./common"
import semver from "semver"

const ReservedMap = new Map<string, Reserved>()
export class Reserved extends TokenType {
  static ABORT = new Reserved("ABORT")
  static ACTION = new Reserved("ACTION")
  static ADD = new Reserved("ADD")
  static AFTER = new Reserved("AFTER")
  static ALL = new Reserved("ALL")
  static ALTER = new Reserved("ALTER")
  static ALWAYS = new Reserved("ALWAYS")
  static ANALYZE = new Reserved("ANALYZE")
  static AND = new Reserved("AND")
  static AS = new Reserved("AS")
  static ASC = new Reserved("ASC")
  static ATTACH = new Reserved("ATTACH")
  static AUTOINCREMENT = new Reserved("AUTOINCREMENT")
  static BEFORE = new Reserved("BEFORE")
  static BEGIN = new Reserved("BEGIN")
  static BETWEEN = new Reserved("BETWEEN")
  static BY = new Reserved("BY")
  static CASCADE = new Reserved("CASCADE")
  static CASE = new Reserved("CASE")
  static CAST = new Reserved("CAST")
  static CHECK = new Reserved("CHECK")
  static COLLATE = new Reserved("COLLATE")
  static COLUMN = new Reserved("COLUMN")
  static COMMIT = new Reserved("COMMIT")
  static CONFLICT = new Reserved("CONFLICT")
  static CONSTRAINT = new Reserved("CONSTRAINT")
  static CREATE = new Reserved("CREATE")
  static CROSS = new Reserved("CROSS")
  static CURRENT = new Reserved("CURRENT")
  static CURRENT_DATE = new Reserved("CURRENT_DATE")
  static CURRENT_TIME = new Reserved("CURRENT_TIME")
  static CURRENT_TIMESTAMP = new Reserved("CURRENT_TIMESTAMP")
  static DATABASE = new Reserved("DATABASE")
  static DEFAULT = new Reserved("DEFAULT")
  static DEFERRABLE = new Reserved("DEFERRABLE")
  static DEFERRED = new Reserved("DEFERRED")
  static DELETE = new Reserved("DELETE")
  static DESC = new Reserved("DESC")
  static DETACH = new Reserved("DETACH")
  static DISTINCT = new Reserved("DISTINCT")
  static DO = new Reserved("DO")
  static DROP = new Reserved("DROP")
  static EACH = new Reserved("EACH")
  static ELSE = new Reserved("ELSE")
  static END = new Reserved("END")
  static ESCAPE = new Reserved("ESCAPE")
  static EXCEPT = new Reserved("EXCEPT")
  static EXCLUDE = new Reserved("EXCLUDE")
  static EXCLUSIVE = new Reserved("EXCLUSIVE")
  static EXISTS = new Reserved("EXISTS")
  static EXPLAIN = new Reserved("EXPLAIN")
  static FAIL = new Reserved("FAIL")
  static FILTER = new Reserved("FILTER")
  static FIRST = new Reserved("FIRST")
  static FOLLOWING = new Reserved("FOLLOWING")
  static FOR = new Reserved("FOR")
  static FOREIGN = new Reserved("FOREIGN")
  static FROM = new Reserved("FROM")
  static FULL = new Reserved("FULL")
  static GENERATED = new Reserved("GENERATED")
  static GLOB = new Reserved("GLOB")
  static GROUP = new Reserved("GROUP")
  static GROUPS = new Reserved("GROUPS")
  static HAVING = new Reserved("HAVING")
  static IF = new Reserved("IF")
  static IGNORE = new Reserved("IGNORE")
  static IMMEDIATE = new Reserved("IMMEDIATE")
  static IN = new Reserved("IN")
  static INDEX = new Reserved("INDEX")
  static INDEXED = new Reserved("INDEXED")
  static INITIALLY = new Reserved("INITIALLY")
  static INNER = new Reserved("INNER")
  static INSERT = new Reserved("INSERT")
  static INSTEAD = new Reserved("INSTEAD")
  static INTERSECT = new Reserved("INTERSECT")
  static INTO = new Reserved("INTO")
  static IS = new Reserved("IS")
  static ISNULL = new Reserved("ISNULL")
  static JOIN = new Reserved("JOIN")
  static KEY = new Reserved("KEY")
  static LAST = new Reserved("LAST")
  static LEFT = new Reserved("LEFT")
  static LIKE = new Reserved("LIKE")
  static LIMIT = new Reserved("LIMIT")
  static MATCH = new Reserved("MATCH")
  static MATERIALIZED = new Reserved("MATERIALIZED")
  static NATURAL = new Reserved("NATURAL")
  static NO = new Reserved("NO")
  static NOT = new Reserved("NOT")
  static NOTHING = new Reserved("NOTHING")
  static NOTNULL = new Reserved("NOTNULL")
  static NULL = new Reserved("NULL")
  static NULLS = new Reserved("NULLS")
  static OF = new Reserved("OF")
  static OFFSET = new Reserved("OFFSET")
  static ON = new Reserved("ON")
  static OR = new Reserved("OR")
  static ORDER = new Reserved("ORDER")
  static OTHERS = new Reserved("OTHERS")
  static OUTER = new Reserved("OUTER")
  static OVER = new Reserved("OVER")
  static PARTITION = new Reserved("PARTITION")
  static PLAN = new Reserved("PLAN")
  static PRAGMA = new Reserved("PRAGMA")
  static PRECEDING = new Reserved("PRECEDING")
  static PRIMARY = new Reserved("PRIMARY")
  static QUERY = new Reserved("QUERY")
  static RAISE = new Reserved("RAISE")
  static RANGE = new Reserved("RANGE")
  static RECURSIVE = new Reserved("RECURSIVE")
  static REFERENCES = new Reserved("REFERENCES")
  static REGEXP = new Reserved("REGEXP")
  static REINDEX = new Reserved("REINDEX")
  static RELEASE = new Reserved("RELEASE")
  static RENAME = new Reserved("RENAME")
  static REPLACE = new Reserved("REPLACE")
  static RESTRICT = new Reserved("RESTRICT")
  static RETURNING = new Reserved("RETURNING")
  static RIGHT = new Reserved("RIGHT")
  static ROLLBACK = new Reserved("ROLLBACK")
  static ROW = new Reserved("ROW")
  static ROWS = new Reserved("ROWS")
  static SAVEPOINT = new Reserved("SAVEPOINT")
  static SELECT = new Reserved("SELECT")
  static SET = new Reserved("SET")
  static TABLE = new Reserved("TABLE")
  static TEMP = new Reserved("TEMP")
  static TEMPORARY = new Reserved("TEMPORARY")
  static THEN = new Reserved("THEN")
  static TIES = new Reserved("TIES")
  static TO = new Reserved("TO")
  static TRANSACTION = new Reserved("TRANSACTION")
  static TRIGGER = new Reserved("TRIGGER")
  static UNBOUNDED = new Reserved("UNBOUNDED")
  static UNION = new Reserved("UNION")
  static UNIQUE = new Reserved("UNIQUE")
  static UPDATE = new Reserved("UPDATE")
  static USING = new Reserved("USING")
  static VACUUM = new Reserved("VACUUM")
  static VALUES = new Reserved("VALUES")
  static VIEW = new Reserved("VIEW")
  static VIRTUAL = new Reserved("VIRTUAL")
  static WHEN = new Reserved("WHEN")
  static WHERE = new Reserved("WHERE")
  static WINDOW = new Reserved("WINDOW")
  static WITH = new Reserved("WITH")
  static WITHOUT = new Reserved("WITHOUT")

  constructor(
    name: string,
    options: { [key: string]: any } = {}
  ) {
    super(name, options)
    ReservedMap.set(name, this)
  }

  static toMap(version: string) {
    if (!version) {
      return ReservedMap
    }

    const newMap = new Map<string, Reserved>()
    ReservedMap.forEach((value, key) => {
      if (!value.options.version || semver.satisfies(version, value.options.version)) {
        newMap.set(key, value)
      }
    })
    return newMap
  }
}

export enum AlterTableAction {
  RENAME_TABLE = "RENAME_TABLE",
  RENAME_COLUMN = "RENAME_COLUMN",
  ADD_COLUMN = "ADD_COLUMN",
  DROP_COLUMN = "DROP_COLUMN",
}

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
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
  public expression: IExpression = Idnetifier.NULL
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
  public value: IExpression = Idnetifier.NULL
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
  public expression: IExpression = Idnetifier.NULL
}

export class CollateColumnConstraint extends ColumnConstraint {
  public collationName = ""
}

export class ReferencesKeyColumnConstraint extends ColumnConstraint {
  public tableName = ""
  public columnNames = new Array<string>()
}

export class GeneratedColumnConstraint extends ColumnConstraint {
  public expression: IExpression = Idnetifier.NULL
  public storeType = StoreType.VIRTUAL
}

export class IndexedColumn {
  public expression: IExpression = Idnetifier.NULL
  public sortOrder = SortOrder.ASC
}
