import { Statement, VDatabase, VSchema } from "../models"
import { Token } from "../parser"
import { lcase } from "../util/functions"

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

  process(vdb: VDatabase) {
    let schema = vdb.getSchema(this.name)
    if (schema) {
      if (schema.dropped) {
        throw new Error(`multiple attach for same database name is not supported: ${this.name}`)
      }
      throw new Error(`database ${this.name} is already in use`)
    }
    return vdb.addSchema(this.name)
  }
}

export class DetachDatabaseStatement extends Statement {
  name = ""

  process(vdb: VDatabase) {
    const schema = vdb.getSchema(this.name)
    if (!schema || schema.dropped) {
      throw new Error(`no such database: ${this.name}`)
    }
    if (schema.system) {
      throw new Error(`cannot detach database ${this.name}`)
    }
    schema.dropped = true
    return schema
  }
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

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "table",
      schemaName: this.schemaName,
      name: this.name,
      temporary: this.temporary,
      ifNotExists: this.ifNotExists,
    })
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

  process(vdb: VDatabase) {
    let schemaName = this.table.schemaName
    if (!schemaName) {
      const tempObject = vdb.getSchema("temp")?.getObject(this.table.name)
      schemaName = tempObject && !tempObject.dropped ? "temp" : "main"
    }

    const schema = vdb.getSchema(schemaName)
    if (!schema) {
      throw new Error(`unknown database ${schemaName}`)
    }

    let table = schema.getObject(this.table.name)
    if (!table || table.dropped) {
      throw new Error(`no such table: ${schemaName}.${this.table.name}`)
    } else if (table.type !== "table") {
      throw new Error(`no such table: ${schemaName}.${this.table.name}`)
    }

    if (this.action instanceof RenameTableAction) {
      table.dropped = true
      const newTable = schema.addObject("table", this.action.newName)
      for (const aObj of schema) {
        if (aObj.type === "index" && aObj.target === table) {
          aObj.dropped = true
          schema.addObject("index", aObj.name, newTable)
        }
      }
    }
    return table
  }
}

export class DropTableStatement extends Statement {
  table = new SchemaObject()
  ifExists = false

  process(vdb: VDatabase) {
    return processDropStatement(vdb, {
      type: "table",
      schemaName: this.table.schemaName,
      name: this.table.name,
      ifExists: this.ifExists,
    })
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

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "view",
      schemaName: this.schemaName,
      name: this.name,
      temporary: this.temporary,
      ifNotExists: this.ifNotExists,
    })
  }
}

export class DropViewStatement extends Statement {
  view = new SchemaObject()
  ifExists = false

  process(vdb: VDatabase) {
    return processDropStatement(vdb, {
      type: "view",
      schemaName: this.view.schemaName,
      name: this.view.name,
      ifExists: this.ifExists,
    })
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

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "trigger",
      schemaName: this.schemaName,
      name: this.name,
      temporary: this.temporary,
      ifNotExists: this.ifNotExists,
    })
  }
}

export class DropTriggerStatement extends Statement {
  trigger = new SchemaObject()
  ifExists = false

  process(vdb: VDatabase) {
    return processDropStatement(vdb, {
      type: "trigger",
      schemaName: this.trigger.schemaName,
      name: this.trigger.name,
      ifExists: this.ifExists,
    })
  }
}

export class CreateIndexStatement extends Statement {
  schemaName?: string
  name = ""
  table = new SchemaObject()
  type?: IndexType
  ifNotExists = false
  columns = new Array<IndexColumn>()

  process(vdb: VDatabase) {
    let schemaName = this.schemaName
    if (!schemaName) {
      const tempObject = vdb.getSchema("temp")?.getObject(this.name)
      schemaName = tempObject && !tempObject.dropped ? "temp" : "main"
    }

    const schema = vdb.getSchema(schemaName)
    if (!schema) {
      throw new Error(`unknown database ${schemaName}`)
    }

    let object = schema.getObject(this.name)
    if (object && !object.dropped) {
      throw new Error(`${object.type} ${this.name} already exists`)
    }

    const table = schema.getObject(this.table.name)
    if (!table || table.dropped || table.type !== "table") {
      throw new Error(`no such table: ${schemaName}.${this.table.name}`)
    }

    return schema.addObject("index", this.name, table)
  }
}

export class DropIndexStatement extends Statement {
  index = new SchemaObject()
  ifExists = false

  process(vdb: VDatabase) {
    return processDropStatement(vdb, {
      type: "index",
      schemaName: this.index.schemaName,
      name: this.index.name,
      ifExists: this.ifExists,
    })
  }
}

export class ReindexStatement extends Statement {
  schemaName?: string
  name = ""

  process(vdb: VDatabase) {
    let schemaName = this.schemaName
    if (!schemaName) {
      const tempObject = vdb.getSchema("temp")?.getObject(this.name)
      schemaName = tempObject && !tempObject.dropped ? "temp" : "main"
    }

    const schema = vdb.getSchema(schemaName)
    if (!schema) {
      throw new Error(`unknown database ${schemaName}`)
    }

    const obj = schema.getObject(this.name)
    if (!obj || obj.dropped || !(obj.type === "table" || obj.type === "index")) {
      let collation = vdb.getCollation(this.name)
      if (!collation) {
        throw new Error(`no such target: ${schemaName}.${this.name}`)
      }
      return collation
    }
    return obj
  }
}

export class VacuumStatement extends Statement {
  schemaName?: string
  fileName?: string

  process(vdb: VDatabase) {
    if (this.schemaName) {
      const schema = vdb.getSchema(this.schemaName)
      if (!schema) {
        throw new Error(`unknown database ${this.schemaName}`)
      }
      return schema
    }
  }
}

export class AnalyzeStatement extends Statement {
  schemaName?: string
  name = ""

  process(vdb: VDatabase) {
    let schemaName = this.schemaName
    if (!schemaName) {
      const tempObject = vdb.getSchema("temp")?.getObject(this.name)
      schemaName = tempObject && !tempObject.dropped ? "temp" : "main"
    }

    let schema = vdb.getSchema(schemaName)
    if (!schema) {
      throw new Error(`unknown database ${schemaName}`)
    }

    const obj = schema.getObject(this.name)
    if (!obj) {
      schema = vdb.getSchema(this.name)
      if (schema != null) {
        return schema
      }
    }

    if (!obj || obj.dropped || !(obj.type !== "table" && obj.type !== "index")) {
      throw new Error(`no such schema, table or index: ${this.name}`)
    }
    return obj
  }
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

  process(vdb: VDatabase) {
    return processObject(vdb, {
      type: "table",
      schemaName: this.table.schemaName,
      name: this.table.name,
    })
  }
}

export class UpdateStatement extends Statement {
  table = new SchemaObject()
  conflictAction = ConflictAction.ABORT

  process(vdb: VDatabase) {
    return processObject(vdb, {
      type: "table",
      schemaName: this.table.schemaName,
      name: this.table.name,
    })
  }
}

export class DeleteStatement extends Statement {
  table = new SchemaObject()

  process(vdb: VDatabase) {
    return processObject(vdb, {
      type: "table",
      schemaName: this.table.schemaName,
      name: this.table.name,
    })
  }
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

function processCreateStatement(vdb: VDatabase, target: {
  type: string,
  schemaName?: string,
  name: string,
  temporary: boolean,
  ifNotExists: boolean
}) {
  const schemaName = target.schemaName || (target.temporary ? "temp" : "main")
  const schema = vdb.getSchema(schemaName)
  if (!schema) {
    throw new Error(`unknown database ${schemaName}`)
  }

  const object = schema.getObject(target.name)
  if (object && !object.dropped) {
    if (target.ifNotExists) {
      return null
    }
    throw new Error(`${object.type} ${target.name} already exists`)
  }

  return schema.addObject(target.type, target.name)
}

function processDropStatement(vdb: VDatabase, target: {
  type: string,
  schemaName?: string,
  name: string,
  ifExists: boolean,
}) {
  let schemaName = target.schemaName
  if (!schemaName) {
    const tempObject = vdb.getSchema("temp")?.getObject(target.name)
    schemaName = tempObject && !tempObject.dropped ? "temp" : "main"
  }

  const schema = vdb.getSchema(schemaName)
  if (!schema) {
    throw new Error(`unknown database ${schemaName}`)
  }

  let obj = schema.getObject(target.name)
  if (!obj || obj.dropped) {
    if (target.ifExists) {
      return null
    }
    throw new Error(`no such ${target.type}: ${schemaName}.${target.name}`)
  } else if (obj.type !== target.type) {
    throw new Error(`no such ${target.type}: ${schemaName}.${target.name}`)
  }

  if (target.type === "table") {
    for (const item of schema) {
      if (item.target === obj) {
        item.dropped = true
      }
    }
  }

  obj.dropped = true
  return obj
}

function processObject(vdb: VDatabase, target: {
  type: string,
  schemaName?: string,
  name: string
}) {
  let schemaName = target.schemaName
  if (!schemaName) {
    const tempObject = vdb.getSchema("temp")?.getObject(target.name)
    schemaName = tempObject && !tempObject.dropped ? "temp" : "main"
  }

  const schema = vdb.getSchema(schemaName)
  if (!schema) {
    throw new Error(`unknown database ${schemaName}`)
  }

  const obj = schema.getObject(target.name)
  if (!obj || obj.dropped || obj.type !== target.type) {
    throw new Error(`no such ${target.type}: ${schemaName}.${target.name}`)
  }
  return obj
}
