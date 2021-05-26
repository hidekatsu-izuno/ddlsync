import { Statement } from "../models"
import { Token } from "../parser"

export abstract class TableConstraint {
  name?: string
}

export abstract class ColumnConstraint {
  name?: string
}

export class CommandStatement extends Statement {
  name = ""
  args: string[] = []

  summary() {
    return this.name + (this.args.length ? " " + this.args.join(" ") : "")
  }
}

export class AttachDatabaseStatement extends Statement {
  name = ""
  expression = new Array<Token>()

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

export class CreateTableStatement extends Statement {
  schemaName?: string
  name = ""
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
  name = ""
  ifExists = false

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

  summary() {
    return "DROP INDEX " +
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

export class VacuumStatement extends Statement {
  schemaName?: string
  fileName?: string

  summary() {
    return "VACUUM" +
      (this.schemaName ? " " + this.schemaName : "")
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

export class ExplainStatement extends Statement {
  constructor() {
    super()
  }

  summary() {
    return "EXPLAIN"
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

export class PragmaStatement extends Statement {
  schemaName?: string
  name = ""
  value?: Token[]

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

  summary() {
    return "UPDATE " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class DeleteStatement extends Statement {
  schemaName?: string
  name = ""

  summary() {
    return "DELETE FROM " +
      (this.schemaName ? this.schemaName + "." : "") +
      this.name
  }
}

export class SelectStatement extends Statement {
  summary() {
    return "SELECT"
  }
}

export class OtherStatement extends Statement {
  constructor() {
    super()
  }

  summary() {
    return "UNKNOWN"
  }
}

export class ColumnDef {
  name = ""
  typeName?: string
  length?: string
  scale?: string
  constraints = new Array<ColumnConstraint>()
}

export class IndexedColumn {
  name?: string
  expression?: Token[]
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

export enum AffinityType {
  INTEGER = "INTEGER",
  TEXT = "TEXT",
  BLOB = "BLOB",
  REAL = "REAL",
  NUMERIC = "NUMERIC",
}

export function getAffinityType(type?: string) {
  if (!type) {
    return AffinityType.BLOB
  } else if (/INT/i.test(type)) {
    return AffinityType.INTEGER
  } else if (/CHAR|CLOB|TEXT/i.test(type)) {
    return AffinityType.TEXT
  } else if (/BLOB/i.test(type)) {
    return AffinityType.BLOB
  } else if (/REAL|FLOA|DOUB/i.test(type)) {
    return AffinityType.REAL
  } else {
    return AffinityType.NUMERIC
  }
}
