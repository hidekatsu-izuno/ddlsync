import { Statement } from "../models"
import { Token } from "../parser"

export abstract class TableConstraint {
  name?: string
}

export abstract class ColumnConstraint {
  name?: string
}

export class AttachDatabaseStatement extends Statement {
  name = ""
  expression = new Array<Token>()

  validate() {
  }

  summary() {
    return "ATTACHE DATABASE " +
      this.name
  }
}

export class DetachDatabaseStatement extends Statement {
  name = ""

  validate() {
  }

  summary() {
    return "DETACHE DATABASE " +
      this.name
  }
}

export class CreateTableStatement extends Statement {
  schemaName?: string
  name: string = ""
  temporary = false
  virtual = false
  ifNotExists = false
  asSelect = false
  withoutRowid = false
  columns?: ColumnDef[]
  constraints?: TableConstraint[]
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

  summary() {
    return "CREATE " +
      (this.temporary ? "TEMPORARY " : "") +
      (this.virtual ? "VIRTUAL " : "") +
      "TABLE " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
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

  validate() {
  }

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

  validate() {
  }

  summary() {
    return "DROP TABLE " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
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

  summary() {
    return "CREATE " +
      (this.temporary ? "TEMPORARY " : "") +
      "VIEW " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name + " "
  }
}

export class DropViewStatement extends Statement {
  schemaName?: string
  name = ""
  ifExists = false

  validate() {
  }

  summary() {
    return "DROP VIEW " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
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

  summary() {
    return "CREATE " +
      (this.temporary ? "TEMPORARY " : "") +
      "TRIGGER " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name + " "
  }
}

export class DropTriggerStatement extends Statement {
  schemaName?: string
  name = ""
  ifExists = false

  validate() {
  }

  summary() {
    return "DROP TRIGGER " +
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

  validate() {
  }

  summary() {
    return "CREATE " +
      (this.unique ? "UNIQUE " : "") +
      "INDEX " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name + " " +
      "ON " + this.tableName
  }
}

export class DropIndexStatement extends Statement {
  schemaName?: string
  name = ""
  ifExists = false

  validate() {
  }

  summary() {
    return "DROP INDEX " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class ReindexStatement extends Statement {
  schemaName?: string
  name = ""

  validate() {
  }

  summary() {
    return "REINDEX " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class AnalyzeStatement extends Statement {
  schemaName?: string
  name = ""

  validate() {
  }

  summary() {
    return "ANALYZE " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class BeginTransactionStatement extends Statement {
  transactionBehavior = TransactionBehavior.DEFERRED

  validate() {
  }

  summary() {
    return "BEGIN TRANSACTION"
  }
}

export class SavepointStatement extends Statement {
  name: string = ""

  validate() {
  }

  summary() {
    return "SAVEPOINT " +
      this.name
  }
}

export class ReleaseSavepointStatement extends Statement {
  savePointName = ""

  validate() {
  }

  summary() {
    return "RELEASE SAVEPOINT " +
      this.savePointName
  }
}

export class CommitTransactionStatement extends Statement {
  validate() {
  }

  summary() {
    return "COMMIT TRANSACTION"
  }
}

export class RollbackTransactionStatement extends Statement {
  savePointName?: string

  validate() {
  }

  summary() {
    return "ROLLBACK TRANSACTION" +
      (this.savePointName ? " TO SAVEPOINT " + this.savePointName : "")
  }
}

export class VacuumStatement extends Statement {
  schemaName?: string
  fileName?: string

  validate() {
  }

  summary() {
    return "VACUUM" +
      (this.schemaName ? " " + this.schemaName : "")
  }
}

export class PragmaStatement extends Statement {
  schemaName?: string
  name = ""
  value?: Token[]

  validate() {
  }

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

  validate() {
  }

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

  validate() {
  }

  summary() {
    return "UPDATE " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class DeleteStatement extends Statement {
  schemaName?: string
  name = ""

  validate() {
  }

  summary() {
    return "DELETE FROM " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class SelectStatement extends Statement {
  validate() {
  }

  summary() {
    return "SELECT"
  }
}

export class ExplainStatement extends Statement {
  constructor(public statement: Statement) {
    super()
  }

  validate() {
  }

  summary() {
    return "EXPLAIN"
  }
}

export class ColumnDef {
  name = ""
  typeName = "TEXT"
  length?: string
  scale?: string
  constraints = new Array<ColumnConstraint>()
}

export class IndexedColumn {
  expression = new Array<Token>()
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
  expression = new Array<Token>()
}

export class CollateColumnConstraint extends ColumnConstraint {
  collationName = ""
}

export class ReferencesKeyColumnConstraint extends ColumnConstraint {
  tableName = ""
  columnNames = new Array<string>()
}

export class GeneratedColumnConstraint extends ColumnConstraint {
  expression = new Array<Token>()
  storeType = StoreType.VIRTUAL
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
