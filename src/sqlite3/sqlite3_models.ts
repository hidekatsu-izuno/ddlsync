import { Statement, Token } from "../parser"

export abstract class TableConstraint {
  name?: string
}

export abstract class ColumnConstraint {
  name?: string
}

export interface IExpression {
  elements(): string[]
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

  summary() {
    return "EXPLAIN"
  }
}

export class CreateTableStatement extends Statement {
  schemaName?: string
  name: string = ""
  temporary = false
  virtual = false
  ifNotExists = false
  withoutRowid = false
  columns?: ColumnDef[]
  constraints?: TableConstraint[]
  select?: Token[]
  moduleName?: string = ""
  moduleArgs?: string[]

  summary() {
    return "CREATE " +
      (this.temporary ? "TEMPORARY " : "") +
      (this.virtual ? "VIRTUAL " : "") +
      "TABLE " +
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

  elements() {
    return this.value.map(token => token.text)
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

  elements() {
    return [ this.value ]
  }
}

export class Idnetifier implements IExpression {
  constructor(public value: string) {
  }

  elements() {
    return [ this.value ]
  }
}

export class StringValue implements IExpression {
  constructor(public value: string) {
  }

  elements() {
    return [ `'${this.value.replace(/'/g, "''")}'` ]
  }
}

export class NumberValue implements IExpression {
  constructor(public value: string) {
  }

  elements() {
    return [ this.value ]
  }
}
