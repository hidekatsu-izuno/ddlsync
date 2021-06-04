import { Statement } from "../models"
import { Token } from "../parser"

export abstract class Constraint {
  name?: string
}

export class CommandStatement extends Statement {
  name = ""
  args = new Array<string>()
}

export class AttachDatabaseStatement extends Statement {
  name = ""
  expr = new Array<Token>()
}

export class DetachDatabaseStatement extends Statement {
  name = ""
}

export class SchemaObject {
  schemaName?: string
  name = ""
}

export class CreateTableStatement extends Statement {
  schemaName?: string
  name = ""
  temporary = false
  virtual = false
  ifNotExists = false
  asSelect = false
  withoutRowid = false
  columns?: TableColumn[]
  constraints?: Constraint[]
  moduleName?: string
  moduleArgs?: string[]

  validate() {
    if (this.temporary && this.schemaName) {
      throw new Error("temporary table name must be unqualified")
    }

    let pkeyCount = 0
    this.columns?.forEach(column => column.constraints?.forEach(constraint => {
      if (constraint instanceof PrimaryKeyColumnConstraint) {
        pkeyCount++
      }
    }))
    this.constraints?.forEach(constraint => {
      if (constraint instanceof PrimaryKeyTableConstraint) {
        pkeyCount++
      }
    })
    if (pkeyCount > 1) {
      throw new Error(`Table ${this.name} has has more than one primary key`)
    }
    if (this.withoutRowid && pkeyCount === 0) {
      throw new Error(`PRIMARY KEY missing on table ${this.name}`)
    }
  }
}

export abstract class AlterTableAction {

}

export class RenameTableAction extends AlterTableAction {
  newName = ""
}

export class AddColumnAction extends AlterTableAction {
  newColumn = new TableColumn()
}

export class RenameColumnAction extends AlterTableAction {
  name = ""
  newName = ""
}
export class DropColumnAction extends AlterTableAction {
  name = ""
}

export class AlterTableStatement extends Statement {
  table = new SchemaObject()
  action: AlterTableAction = new RenameTableAction()
}

export class DropTableStatement extends Statement {
  table = new SchemaObject()
  ifExists = false
}

export class CreateViewStatement extends Statement {
  schemaName?: string
  name = ""
  temporary = false
  ifNotExists = false
  columns?: string[]

  validate() {
    if (this.temporary && this.schemaName) {
      throw new Error("temporary table name must be unqualified")
    }
  }
}

export class DropViewStatement extends Statement {
  view = new SchemaObject()
  ifExists = false
}

export class CreateTriggerStatement extends Statement {
  schemaName?: string
  name = ""
  temporary = false
  ifNotExists = false

  validate() {
    if (this.temporary && this.schemaName) {
      throw new Error("temporary table name must be unqualified")
    }
  }
}

export class DropTriggerStatement extends Statement {
  trigger = new SchemaObject()
  ifExists = false
}

export class CreateIndexStatement extends Statement {
  schemaName?: string
  name = ""
  table = new SchemaObject()
  type?: IndexType
  ifNotExists = false
  columns = new Array<IndexColumn>()
}

export class DropIndexStatement extends Statement {
  index = new SchemaObject()
  ifExists = false
}

export class ReindexStatement extends Statement {
  schemaName?: string
  name = ""
}

export class VacuumStatement extends Statement {
  schemaName?: string
  fileName?: string
}

export class AnalyzeStatement extends Statement {
  schemaName?: string
  name = ""
}

export class ExplainStatement extends Statement {
  queryPlan = false

  constructor(
    public statement: Statement
  ) {
    super()
  }
}

export class BeginTransactionStatement extends Statement {
  transactionBehavior = TransactionBehavior.DEFERRED
}

export class SavepointStatement extends Statement {
  name = ""
}

export class ReleaseSavepointStatement extends Statement {
  savepointName = ""
}

export class CommitTransactionStatement extends Statement {
}

export class RollbackTransactionStatement extends Statement {
  savepointName?: string
}

export class PragmaStatement extends Statement {
  schemaName?: string
  name = ""
  value?: Token[]
}

export class InsertStatement extends Statement {
  table = new SchemaObject()
  conflictAction = ConflictAction.ABORT
}

export class UpdateStatement extends Statement {
  table = new SchemaObject()
  conflictAction = ConflictAction.ABORT
}

export class DeleteStatement extends Statement {
  table = new SchemaObject()
}

export class SelectStatement extends Statement {
}

export class TableColumn {
  name = ""
  dataType = new DataType()
  constraints = new Array<Constraint>()
}

export class DataType {
  name = ""
  length?: string
  scale?: string
}

export class IndexColumn {
  name?: string
  expr?: Token[]
  sortOrder = SortOrder.ASC
}

export class PrimaryKeyTableConstraint extends Constraint {
  columns = new Array<IndexColumn>()
  conflictAction = ConflictAction.ABORT
}

export class UniqueTableConstraint extends Constraint {
  columns = new Array<IndexColumn>()
  conflictAction = ConflictAction.ABORT
}

export class CheckTableConstraint extends Constraint {
  conditions = new Array<Token>()
}

export class ForeignKeyTableConstraint extends Constraint {
  columnNames = new Array<string>()
}

export class PrimaryKeyColumnConstraint extends Constraint {
  sortOrder = SortOrder.ASC
  conflictAction = ConflictAction.ABORT
  autoIncrement = false
}

export class NotNullColumnConstraint extends Constraint {
  conflictAction = ConflictAction.ABORT
}

export class NullColumnConstraint extends Constraint {
  conflictAction = ConflictAction.ABORT
}

export class UniqueColumnConstraint extends Constraint {
  conflictAction = ConflictAction.ABORT
}

export class CheckColumnConstraint extends Constraint {
  conditions = new Array<Token>()
}

export class DefaultColumnConstraint extends Constraint {
  expr = new Array<Token>()
}

export class CollateColumnConstraint extends Constraint {
  collationName = ""
}

export class ReferencesKeyColumnConstraint extends Constraint {
  tableName = ""
  columnNames = new Array<string>()
}

export class GeneratedColumnConstraint extends Constraint {
  expr = new Array<Token>()
  storeType = StoreType.VIRTUAL
}

export enum IndexType {
  UNIQUE = "UNIQUE"
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
