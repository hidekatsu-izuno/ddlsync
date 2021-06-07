import { Statement, VDatabase, VObject } from "../models"
import { Token } from "../parser"
import { ucamel } from "../util/functions"

export class Interval {
  constructor(
    public quantity: string,
    public unit: IntervalUnit,
  ) {
  }
}

export abstract class Constraint {
  name?: string
}

export abstract class Partition {
  num?: string
  subpartition?: Partition
  defs = new Array<PartitionDef>()
}

export class PartitionDef {
  name = ""
  storageEngine?: string
  comment?: string
  dataDirectory?: string
  indexDirectory?: string
  maxRows?: string
  minRows?: string
  tablespace?: string
  lessThanValues?: Array<Array<Token> | "MAXVALUE">
  inValues?: Array<Array<Token>>
  subdefs = new Array<PartitionDef>()
}

export class CommandStatement extends Statement {
  name = ""
  args: string[] = []
}

export class CreateDatabaseStatement extends Statement {
  name = ""
  orReplace = false
  ifNotExists = false
  characterSet?: string
  collate?: string
  encryption?: string

  process(vdb: VDatabase) {
    const schema = vdb.getSchema(this.name)
    if (schema && !schema.dropped) {
      throw new Error(`database ${this.name} is already in use`)
    }
    return vdb.addSchema(this.name)
  }
}

export class AlterDatabaseStatement extends Statement {
  schemaName = ""

  process(vdb: VDatabase) {
    const schema = vdb.getSchema(this.schemaName)
    if (!schema || schema.dropped) {
      throw new Error(`no such database: ${this.schemaName}`)
    }
    return schema
  }
}

export class DropDatabaseStatement extends Statement {
  schemaName = ""
  ifExists = false

  process(vdb: VDatabase) {
    const schema = vdb.getSchema(this.schemaName)
    if (!schema || schema.dropped) {
      throw new Error(`no such database: ${this.schemaName}`)
    }
    if (schema.system) {
      throw new Error(`cannot drop system database ${this.schemaName}`)
    }
    schema.dropped = true
    return schema
  }
}

export class CreateServerStatement extends Statement {
  name = ""
  orReplace = false
  wrapperName = ""
  host?: string
  database?: string
  user?: string
  password?: string
  socket?: string
  owner?: string
  port?: string

  validate() {
    if (this.wrapperName !== "mysql") {
      throw new Error(`Unsupported wrapper name: ${this.wrapperName}`)
    }
  }
}

export class AlterServerStatement extends Statement {
  serverName = ""
}

export class DropServerStatement extends Statement {
  serverName = ""
  ifExists = false
}

export class CreateResourceGroupStatement extends Statement {
  name = ""
  orReplace = false
  type: ResourceGroupType = ResourceGroupType.SYSTEM
  vcpu = new Array<{ min: string, max: string}>()
  threadPriority = "0"
  disable = false
}

export class AlterResourceGroupStatement extends Statement {
  resourceGroupName = ""
}

export class SetResourceGroupStatement extends Statement {
  resourceGroupName = ""
}

export class DropResourceGroupStatement extends Statement {
  resourceGroupName = ""
  force = false
}

export class CreateLogfileGroupStatement extends Statement {
  name = ""
  undofile = ""
  initialSize?: string
  undoBufferSize?: string
  redoBufferSize?: string
  nodeGroup?: string
  wait = false
  comment?: string
  engine?: string
}

export class AlterLogfileGroupStatement extends Statement {
  name = ""
}

export class DropLogfileGroupStatement extends Statement {
  name = ""
  engine = ""
}

export class CreateTablespaceStatement extends Statement {
  name = ""
  undo = false
  addDataFile?: string
  autoextendSize?: string
  fileBlockSize?: string
  encryption?: string
  useLogfileGroup?: string
  extentSize?: string
  initialSize?: string
  maxSize?: string
  nodeGroup?: string
  wait = false
  comment?: string
  engine?: string
  engineAttribute?: string
}

export class AlterTablespaceStatement extends Statement {
  name = ""
  undo = false
}

export class DropTablespaceStatement extends Statement {
  name = ""
  undo = false
}

export class CreateSpatialReferenceSystemStatement extends Statement {
  srid = ""
  orReplace = false
  ifNotExists = false

  validate() {
    if (this.srid.includes(".")) {
      throw new Error(`Only integers allowed as number here near '${this.srid}'`)
    }
  }
}

export class DropSpatialReferenceSystemStatement extends Statement {
  srid = ""
  ifExists = false
}

export class UserRole {
  name?: string
  expr?: Array<Token>
  host?: string
  authPlugin?: string
  randowmPassword = false
  asPassword = false
  password?: string
  discardOldPassword = false
}

export class CreateRoleStatement extends Statement {
  roles = new Array<UserRole>()
  orReplace = false
  ifNotExists = false
}

export class SetDefaultRoleStatement extends Statement {
}

export class SetRoleStatement extends Statement {
}

export class DropRoleStatement extends Statement {
  roles = new Array<UserRole>()
  ifExists = false
}


export class CreateUserStatement extends Statement {
  users = new Array<UserRole>()
  orReplace = false
  ifNotExists = false
  defaultRoles = new Array<UserRole>()
  tlsOptions = new Array<{ key: string, value: any }>()
  resourceOptions = new Array<{ key: string, value: any }>()
  passwordOptions = new Array<{ key: string, value: any }>()
  lockOptions = new Array<{ key: string, value: any }>()
  comment?: string
  attribute?: string
}

export class AlterUserStatement extends Statement {
  users?: Array<UserRole>
  ifExists = false
}

export class RenameUserPair {
  user = new UserRole()
  newUser = new UserRole()
}

export class RenameUserStatement extends Statement {
  pairs = new Array<RenameUserPair>()
}

export class SetPasswordStatement extends Statement {
}

export class DropUserStatement extends Statement {
  users = new Array<UserRole>()
  ifExists = false
}

export class SchemaObject {
  schemaName?: string
  name = ""
}

export class LinearHashPartition extends Partition {
  num?: string
  expression = new Array<Token>()
}

export class LinearKeyPartition extends Partition {
  num?: string
  algorithm?: string
  columns = new Array<string>()
}

export class RangePartition extends Partition {
  num?: string
  expression?: Array<Token>
  columns?: Array<string>
}

export class ListPartition extends Partition {
  num?: string
  expression?: Array<Token>
  columns?: Array<string>
}

export class KeyPart {
  expression?: Array<Token>
  column?: string
  sortOrder = SortOrder.ASC
}

export class GeneratedColumn {
  type = GeneratedColumnType.VIRTUAL
  expression = new Array<Token>()
}

export class References {
  tableName = ""
  columns = new Array<string>()
  match?: MatchType
  onDelete = ReferenceOption.NO_ACTION
  onUpdate = ReferenceOption.NO_ACTION
}

export class TableColumn {
  name = ""
  dataType: DataType = new DataType()
  notNull = false
  defaultValue?: Array<Token>
  visible = true
  collate?: string
  autoIncrement = false
  indexType?: IndexType
  comment?: string
  columnFormat?: ColumnFormat
  engineAttribute?: string
  secondaryEngineAttribute?: string
  storageType?: StorageType
  generatedColumn?: GeneratedColumn
  references?: References
  checkConstraint?: CheckConstraint
}

export class DataType {
  name = ""
  length?: string
  scale?: string
  unsigned = false
  zerofill = false
  characterSet?: string
  binary = false
  collate?: string
  values?: Array<string>
}

export class IndexConstraint extends Constraint {
  type?: IndexType
  indexName?: string
  algorithm?: IndexAlgorithm
  keyParts = new Array<KeyPart>()
}

export class CheckConstraint extends Constraint {
  expression = new Array<Token>()
  enforced = true
}

export class ForeignKeyConstraint extends Constraint {
  name?: string
  indexName?: string
  columns = new Array<string>()
  references = new References()
}

export class CreateTableStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
  temporary = false
  ifNotExists = false
  asSelect = false
  like?: SchemaObject
  columns?: Array<TableColumn>
  constraints?: Array<Constraint>
  tableOptions = new Array<{ key: string, value: any }>()
  partition?: Partition
  conflictAction?: ConflictAction

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "table",
      schemaName: this.schemaName,
      name: this.name,
      ifNotExists: this.ifNotExists
    })
  }
}

export class AlterTableStatement extends Statement {
  table = new SchemaObject()
  newTable?: SchemaObject

  process(vdb: VDatabase) {
    return processAlterStatement(vdb, {
      type: "table",
      schemaName: this.table.schemaName,
      name: this.table.name,
      newObject: this.newTable
    })
  }
}

export class RenameTablePair {
  table = new SchemaObject()
  newTable = new SchemaObject()
}

export class RenameTableStatement extends Statement {
  pairs = new Array<RenameTablePair>()

  process(vdb: VDatabase) {
    const results = []
    for (const pair of this.pairs) {
      let schemaName = pair.table.schemaName || vdb.defaultSchemaName
      if (!schemaName) {
        throw new Error(`No database selected`)
      }

      const schema = vdb.getSchema(schemaName)
      if (!schema) {
        throw new Error(`unknown database ${schemaName}`)
      }

      let obj = schema.getObject(pair.table.name)
      if (!obj || obj.dropped) {
        throw new Error(`no such table: ${schemaName}.${pair.table.name}`)
      } else if (obj.type !== "table" && obj.type !== "view") {
        throw new Error(`no such table: ${schemaName}.${pair.table.name}`)
      }

      obj.dropped = true
      const newSchema = pair.newTable.schemaName ? vdb.getSchema(pair.newTable.schemaName) : schema
      if (!newSchema) {
        throw new Error(`unknown database ${newSchema}`)
      }

      let newObject = newSchema.addObject(obj.type, pair.newTable.name)
      for (const aObj of schema) {
        if (aObj.type === "index" && aObj.target === newObject) {
          aObj.dropped = true
          schema.addObject("index", aObj.name, newObject)
        }
      }
      results.push(obj)
    }
    return results
  }
}

export class TruncateTableStatement extends Statement {
  table = new SchemaObject()

  process(vdb: VDatabase) {
    return processObject(vdb, {
      type: "table",
      schemaName: this.table.schemaName,
      name: this.table.name
    })
  }
}

export class DropTableStatement extends Statement {
  tables = new Array<SchemaObject>()
  temporary = false
  ifExists = false
  dropOption = DropOption.CASCADE

  process(vdb: VDatabase) {
    const result = []
    for (const table of this.tables) {
      result.push(processDropStatement(vdb, {
        type: "table",
        schemaName: table.schemaName,
        name: table.name,
        ifExists: this.ifExists
      }))
    }
    return result
  }
}

export class CreateSequenceStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
  temporary = false
  ifNotExists = false
  increment?: string
  minvalue?: string
  maxvalue?: string
  start?: string
  cache?: string
  cacheCycle = CacheCycle.NOCYCLE
  tableOptions = new Array<{ key: string, value: any }>()

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "sequence",
      schemaName: this.schemaName,
      name: this.name,
      ifNotExists: this.ifNotExists
    })
  }
}

export class DropSequenceStatement extends Statement {
  sequences = Array<SchemaObject>()
  ifExists = false

  process(vdb: VDatabase) {
    const result = []
    for (const sequence of this.sequences) {
      result.push(processDropStatement(vdb, {
        type: "sequence",
        schemaName: sequence.schemaName,
        name: sequence.name,
        ifExists: this.ifExists,
      }))
    }
    return result
  }
}

export class IndexColumn {
  name?: string
  expression?: Token[]
  sortOrder = SortOrder.ASC
}

export class CreateIndexStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
  ifNotExists = false
  type?: IndexType
  algorithm?: IndexAlgorithm
  table = new SchemaObject()
  columns = new Array<IndexColumn>()
  indexOptions = new Array<{ key: string, value: any }>()
  algorithmOption = IndexAlgorithmOption.DEFAULT
  lockOption = IndexLockOption.DEFAULT

  process(vdb: VDatabase) {
    const schemaName = this.schemaName || vdb.defaultSchemaName
    if (!schemaName) {
      throw new Error(`No database selected`)
    }
    const schema = vdb.getSchema(schemaName)
    if (!schema) {
      throw new Error(`unknown database ${schemaName}`)
    }

    let object = schema.getObject(this.name)
    if (object && !object.dropped) {
      throw new Error(`${object.type} ${this.name} already exists`)
    }

    const tableSchemaName = this.table.schemaName || vdb.defaultSchemaName
    if (!tableSchemaName) {
      throw new Error(`No database selected`)
    }
    const tableSchema = vdb.getSchema(tableSchemaName)
    if (!tableSchema) {
      throw new Error(`unknown database ${tableSchemaName}`)
    }
    const table = tableSchema.getObject(this.table.name)
    if (!table || table.dropped || table.type !== "table") {
      throw new Error(`no such table: ${tableSchemaName}.${this.table.name}`)
    }

    return schema.addObject("index", this.name, table)
  }
}

export class DropIndexStatement extends Statement {
  index = new SchemaObject()
  table = new SchemaObject()
  ifExists = false

  process(vdb: VDatabase) {
    return processDropStatement(vdb, {
      type: "index",
      schemaName: this.index.schemaName,
      name: this.index.name,
      ifExists: this.ifExists
    })
  }
}

export class CreateViewStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
  ifNotExists = false
  algorithm?: Algortihm
  definer?: UserRole
  sqlSecurity?: SqlSecurity
  columns?: Array<string>
  checkOption?: CheckOption

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "view",
      schemaName: this.schemaName,
      name: this.name,
      ifNotExists: this.ifNotExists
    })
  }
}

export class AlterViewStatement extends Statement {
  view = new SchemaObject()
  algorithm?: Algortihm
  definer?: UserRole
  sqlSecurity?: SqlSecurity

  process(vdb: VDatabase) {
    return processAlterStatement(vdb, {
      type: "view",
      schemaName: this.view.schemaName,
      name: this.view.name
    })
  }
}

export class DropViewStatement extends Statement {
  views = new Array<SchemaObject>()
  ifExists = false
  dropOption = DropOption.CASCADE

  process(vdb: VDatabase) {
    const result = []
    for (const view of this.views) {
      result.push(processDropStatement(vdb, {
        type: "view",
        schemaName: view.schemaName,
        name: view.name,
        ifExists: this.ifExists,
      }))
    }
    return result
  }
}

export class ProcedureParam {
  direction: Direction = Direction.IN
  name = ""
  dataType = new DataType()
}

export class CreatePackageStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
  ifNotExists = false
  definer?: UserRole
  comment?: string
  sqlSecurity = SqlSecurity.DEFINER

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "package",
      schemaName: this.schemaName,
      name: this.name,
      ifNotExists: this.ifNotExists
    })
  }
}

export class DropPackageStatement extends Statement {
  package = new SchemaObject()
  ifExists = false

  process(vdb: VDatabase) {
    return processDropStatement(vdb, {
      type: "package",
      schemaName: this.package.schemaName,
      name: this.package.name,
      ifExists: this.ifExists,
    })
  }
}

export class CreatePackageBodyStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
  ifNotExists = false
  definer?: UserRole
  comment?: string
  sqlSecurity = SqlSecurity.DEFINER

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "package body",
      schemaName: this.schemaName,
      name: this.name,
      ifNotExists: this.ifNotExists
    })
  }
}

export class DropPackageBodyStatement extends Statement {
  packageBody = new SchemaObject()
  ifExists = false

  process(vdb: VDatabase) {
    return processDropStatement(vdb, {
      type: "package body",
      schemaName: this.packageBody.schemaName,
      name: this.packageBody.name,
      ifExists: this.ifExists,
    })
  }
}

export class CreateProcedureStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
  definer?: UserRole
  params = new Array<ProcedureParam>()
  comment?: string
  language = ProcedureLanguage.SQL
  deterministic = false
  characteristic = ProcedureCharacteristic.CONTAINS_SQL
  sqlSecurity = SqlSecurity.DEFINER

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "procedure",
      schemaName: this.schemaName,
      name: this.name,
      ifNotExists: false
    })
  }
}

export class AlterProcedureStatement extends Statement {
  procedure = new SchemaObject()
  definer?: UserRole

  process(vdb: VDatabase) {
    return processAlterStatement(vdb, {
      type: "procedure",
      schemaName: this.procedure.schemaName,
      name: this.procedure.name
    })
  }
}

export class DropProcedureStatement extends Statement {
  procedure = new SchemaObject()
  ifExists = false

  process(vdb: VDatabase) {
    return processDropStatement(vdb, {
      type: "procedure",
      schemaName: this.procedure.schemaName,
      name: this.procedure.name,
      ifExists: this.ifExists,
    })
  }
}

export class FunctionParam {
  name = ""
  dataType = new DataType()
}

export class CreateFunctionStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
  definer?: UserRole
  aggregate = false
  ifNotExists = false
  params = new Array<FunctionParam>()
  returnDataType = new DataType()
  comment?: string
  language = ProcedureLanguage.SQL
  deterministic = false
  characteristic = ProcedureCharacteristic.CONTAINS_SQL
  sqlSecurity = SqlSecurity.DEFINER

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "function",
      schemaName: this.schemaName,
      name: this.name,
      ifNotExists: this.ifNotExists
    })
  }
}

export class AlterFunctionStatement extends Statement {
  function = new SchemaObject()
  definer?: UserRole

  process(vdb: VDatabase) {
    return processAlterStatement(vdb, {
      type: "function",
      schemaName: this.function.schemaName,
      name: this.function.name
    })
  }
}

export class DropFunctionStatement extends Statement {
  function = new SchemaObject()
  ifExists = false

  process(vdb: VDatabase) {
    return processDropStatement(vdb, {
      type: "function",
      schemaName: this.function.schemaName,
      name: this.function.name,
      ifExists: this.ifExists,
    })
  }
}

export class TriggerOrder {
  position = TriggerOrderPosition.FOLLOWS
  tableName = ""
}

export class CreateTriggerStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
  definer?: UserRole
  ifNotExists = false
  triggerTime = TriggerTime.BEFORE
  triggerEvent = TriggerEvent.INSERT
  table = new SchemaObject()
  triggerOrder?: TriggerOrder

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "function",
      schemaName: this.schemaName,
      name: this.name,
      ifNotExists: this.ifNotExists
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

export class CreateEventStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
  definer?: UserRole
  ifNotExists = false
  at?: Array<Token>
  every?: Interval
  starts?: Array<Token>
  ends?: Array<Token>
  onCompletionPreserve = false
  disable: boolean | "ON SLAVE" = false
  comment?: string

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "event",
      schemaName: this.schemaName,
      name: this.name,
      ifNotExists: this.ifNotExists
    })
  }
}

export class AlterEventStatement extends Statement {
  event = new SchemaObject()
  definer?: UserRole

  process(vdb: VDatabase) {
    return processAlterStatement(vdb, {
      type: "event",
      schemaName: this.event.schemaName,
      name: this.event.name,
    })
  }
}

export class DropEventStatement extends Statement {
  event = new SchemaObject()
  ifExists = false

  process(vdb: VDatabase) {
    return processDropStatement(vdb, {
      type: "event",
      schemaName: this.event.schemaName,
      name: this.event.name,
      ifExists: this.ifExists,
    })
  }
}

export class AlterInstanceStatement extends Statement {

}

export class StartTransactionStatement extends Statement {
}

export class BeginStatement extends Statement {
  work = false
}

export class SetTransactionStatement extends Statement {
  type?: VariableType
  characteristic = TransactionCharacteristic.ISOLATION_LEVEL_READ_COMMITTED
}

export class SavepointStatement extends Statement {
}

export class ReleaseSavepointStatement extends Statement {
}

export class CommitStatement extends Statement {
}

export class RollbackStatement extends Statement {
}

export class LockTablesStatement extends Statement {
}

export class UnlockTablesStatement extends Statement {
}

export class XaStartStatement extends Statement {
}

export class XaBeginStatement extends Statement {
}

export class XaEndStatement extends Statement {
}

export class XaPrepareStatement extends Statement {
}

export class XaCommitStatement extends Statement {
}

export class XaRollbackStatement extends Statement {
}

export class XaRecoverStatement extends Statement {
}

export class PurgeBinaryLogsStatement extends Statement {
}

export class ResetMasterStatement extends Statement {
}

export class ChangeMasterStatement extends Statement {
}

export class ResetReplicaStatement extends Statement {
}

export class StartReplicaStatement extends Statement {
}

export class StopReplicaStatement extends Statement {
}

export class GrantStatement extends Statement {
}

export class RevokeStatement extends Statement {
}

export class ExplainStatement extends Statement {
}

export class CallStatement extends Statement {
}

export class PrepareStatement extends Statement {
  name = ""
}

export class ExecuteStatement extends Statement {
  prepareName = ""
}

export class DeallocatePrepareStatement extends Statement {
  prepareName = ""
}

export class AnalyzeTableStatement extends Statement {
  tables = new Array<SchemaObject>()
  noWriteToBinlog = false

  process(vdb: VDatabase) {
    const result = []
    for (const table of this.tables) {
      result.push(processObject(vdb, {
        type: "table",
        schemaName: table.schemaName,
        name: table.name
      }))
    }
    return result
  }
}

export class CheckTableStatement extends Statement {
  tables = new Array<SchemaObject>()

  process(vdb: VDatabase) {
    const result = []
    for (const table of this.tables) {
      result.push(processObject(vdb, {
        type: "table",
        schemaName: table.schemaName,
        name: table.name
      }))
    }
    return result
  }
}

export class CheckIndexStatement extends Statement {
  indexes = new Array<SchemaObject>()

  process(vdb: VDatabase) {
    const result = []
    for (const index of this.indexes) {
      result.push(processObject(vdb, {
        type: "index",
        schemaName: index.schemaName,
        name: index.name
      }))
    }
    return result
  }
}

export class ChecksumTableStatement extends Statement {
  tables = new Array<SchemaObject>()

  process(vdb: VDatabase) {
    const result = []
    for (const table of this.tables) {
      result.push(processObject(vdb, {
        type: "table",
        schemaName: table.schemaName,
        name: table.name
      }))
    }
    return result
  }
}

export class OptimizeTableStatement extends Statement {
  tables = new Array<SchemaObject>()
  noWriteToBinlog = false

  process(vdb: VDatabase) {
    const result = []
    for (const table of this.tables) {
      result.push(processObject(vdb, {
        type: "table",
        schemaName: table.schemaName,
        name: table.name
      }))
    }
    return result
  }
}

export class RepairTableStatement extends Statement {
  tables = new Array<SchemaObject>()
  noWriteToBinlog = false

  process(vdb: VDatabase) {
    const result = []
    for (const table of this.tables) {
      result.push(processObject(vdb, {
        type: "table",
        schemaName: table.schemaName,
        name: table.name
      }))
    }
    return result
  }
}

export class InstallPluginStatement extends Statement {
}

export class InstallComponentStatement extends Statement {

}

export class UninstallPluginStatement extends Statement {
}

export class UninstallComponentStatement extends Statement {

}

export class UseStatement extends Statement {
  schemaName = ""
}

export class InsertStatement extends Statement {
  table = new SchemaObject()
  concurrency?: Concurrency
  conflictAction?: ConflictAction

  process(vdb: VDatabase) {
    return processObject(vdb, {
      type: "table",
      schemaName: this.table.schemaName,
      name: this.table.name
    })
  }
}

export class UpdateStatement extends Statement {
  table = new SchemaObject()
  concurrency?: Concurrency
  conflictAction?: ConflictAction

  process(vdb: VDatabase) {
    return processObject(vdb, {
      type: "table",
      schemaName: this.table.schemaName,
      name: this.table.name
    })
  }
}

export class ReplaceStatement extends Statement {
  table = new SchemaObject()
  concurrency?: Concurrency
  conflictAction?: ConflictAction

  process(vdb: VDatabase) {
    return processObject(vdb, {
      type: "table",
      schemaName: this.table.schemaName,
      name: this.table.name
    })
  }
}

export class DeleteStatement extends Statement {
  table = new SchemaObject()
  concurrency?: Concurrency
  quick = false
  conflictAction?: ConflictAction

  process(vdb: VDatabase) {
    return processObject(vdb, {
      type: "table",
      schemaName: this.table.schemaName,
      name: this.table.name
    })
  }
}

export class LoadDataStatement extends Statement {
  concurrency?: Concurrency
  local = false
}

export class LoadXmlStatement extends Statement {
  concurrency?: Concurrency
  local = false
}

export class SetCharacterSetStatement extends Statement {
}

export class SetNamesStatement extends Statement {
}

export class SetStatement extends Statement {
  variableAssignments = new Array<VariableAssignment>()
}

export class VariableAssignment {
  type?: VariableType
  name = ""
  value?: Token[]
}

export class SelectStatement extends Statement {
}

export class TableStatement extends Statement {
}

export class DoStatement extends Statement {
}

export class HandlerStatement extends Statement {
}

export class ShowStatement extends Statement {
}

export class HelpStatement extends Statement {
}

export class BinlogStatement extends Statement {
}

export class CacheIndexStatement extends Statement {
}

export class FlushStatement extends Statement {
}

export class KillStatement extends Statement {
}

export class LoadIndexIntoCacheStatement extends Statement {
}

export class RestartStatement extends Statement {

}

export class ShutdownStatement extends Statement {

}

export class CloneStatement extends Statement {

}

export enum Algortihm {
  UNDEFINED = "UNDEFINED",
  MERGE = "MERGE",
  TEMPTABLE = "TEMPTABLE",
}

export enum TransactionCharacteristic {
  ISOLATION_LEVEL_REPEATABLE_READ = "ISOLATION_LEVEL_REPEATABLE_READ",
  ISOLATION_LEVEL_READ_COMMITTED = "ISOLATION_LEVEL_READ_COMMITTED",
  ISOLATION_LEVEL_READ_UNCOMMITTED = "ISOLATION_LEVEL_READ_UNCOMMITTED",
  ISOLATION_LEVEL_SERIALIZABLE = "ISOLATION_LEVEL_SERIALIZABLE",
  READ_WRITE = "READ_WRITE",
  READ_ONLY = "READ_ONLY",
}

export enum VariableType {
  GLOBAL = "GLOBAL",
  SESSION = "SESSION",
  USER_DEFINED = "USER_DEFINED"
}

export enum Concurrency {
  LOW_PRIORITY = "LOW_PRIORITY",
  DELAYED = "DELAYED",
  HIGH_PRIORITY = "HIGH_PRIORITY",
  CONCURRENT = "CONCURRENT",
}

export enum SortOrder {
  ASC = "ASC",
  DESC = "DESC",
}

export enum IndexType {
  PRIMARY_KEY = "PRIMARY KEY",
  UNIQUE = "UNIQUE",
  FULLTEXT = "FULLTEXT",
  SPATIAL = "SPATIAL",
}

export enum IndexAlgorithm {
  BTREE = "BTREE",
  HASH = "HASH",
  RTREE = "RTREE",
}

export enum ResourceGroupType {
  SYSTEM = "SYSTEM",
  USER = "USER",
}

export enum ConflictAction {
  IGNORE = "IGNORE",
  REPLACE = "REPLACE",
}

export enum InsertMethod {
  NO = "NO",
  FIRST = "FIRST",
  LAST = "LAST",
}

export enum RowFormat {
  DEFAULT = "DEFAULT",
  DYNAMIC = "DYNAMIC",
  FIXED = "FIXED",
  COMPRESSED = "COMPRESSED",
  REDUNDANT = "REDUNDANT",
  COMPACT = "COMPACT",
}

export enum StorageType {
  DISK = "DISK",
  MEMORY = "MEMORY",
}

export enum SqlSecurity {
  DEFINER = "DEFINER",
  INVOKER = "INVOKER",
}

export enum Direction {
  IN = "IN",
  OUT = "OUT",
  INOUT = "INOUT",
}

export enum CheckOption {
  CASCADED = "CASCADED",
  LOCAL = "LOCAL",
}

export enum ProcedureLanguage {
  SQL = "SQL"
}

export enum ProcedureCharacteristic {
  CONTAINS_SQL = "CONTAINS SQL",
  NO_SQL = "NO SQL",
  READS_SQL_DATA = "READS SQL DATA",
  MODIFIES_SQL_DATA = "MODIFIES SQL DATA",
}

export enum TriggerOrderPosition {
  FOLLOWS = "FOLLOWS",
  PRECEDES = "PRECEDES",
}

export enum TriggerTime {
  BEFORE = "BEFORE",
  AFTER = "AFTER",
}

export enum TriggerEvent {
  INSERT = "INSERT",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
}

export enum IntervalUnit {
  YEAR = "YEAR",
  QUARTER = "QUARTER",
  MONTH = "MONTH",
  DAY = "DAY",
  HOUR = "HOUR",
  MINUTE = "MINUTE",
  WEEK = "WEEK",
  SECOND = "SECOND",
  YEAR_MONTH = "YEAR_MONTH",
  DAY_HOUR = "DAY_HOUR",
  DAY_MINUTE = "DAY_MINUTE",
  DAY_SECOND = "DAY_SECOND",
  HOUR_MINUTE = "DAY_SECOND",
  HOUR_SECOND = "DAY_SECOND",
  MINUTE_SECOND = "MINUTE_SECOND",
}

export enum IndexAlgorithmOption {
  DEFAULT = "DEFAULT",
  INPLACE = "INPLACE",
  COPY = "COPY",
}

export enum IndexLockOption {
  DEFAULT = "DEFAULT",
  NONE = "NONE",
  SHARED = "SHARED",
  EXCLUSIVE = "EXCLUSIVE",
}

export enum CollationType {
  BINARY = "BINARY"
}

export enum ColumnFormat {
  FIXED = "FIXED",
  DYNAMIC = "DYNAMIC",
  DEFAULT = "DEFAULT",
}

export enum GeneratedColumnType {
  VIRTUAL = "VIRTUAL",
  STORED = "STORED",
}

export enum MatchType {
  FULL = "FULL",
  PARTIAL = "PARTIAL",
  SIMPLE = "SIMPLE",
}

export enum ReferenceOption {
  RESTRICT = "RESTRICT",
  CASCADE = "CASCADE",
  SET_NULL = "SET NULL",
  NO_ACTION = "NO ACTION",
  SET_DEFAULT = "SET DEFAULT",
}

export enum DropOption {
  RESTRICT = "RESTRICT",
  CASCADE = "CASCADE",
}

export enum CacheCycle {
  CYCLE = "CYCLE",
  NOCYCLE = "NOCYCLE",
}

export enum OnCompletionAction {
  PRESERVE = "PRESERVE",
  NOT_PRESERVE = "NOT PRESERVE",
}

function processCreateStatement(vdb: VDatabase, target: {
  type: string,
  schemaName?: string,
  name: string,
  ifNotExists: boolean
}) {
  const schemaName = target.schemaName || vdb.defaultSchemaName
  if (!schemaName) {
    throw new Error(`No database selected`)
  }
  const schema = vdb.getSchema(schemaName)
  if (!schema) {
    throw new Error(`unknown database ${schemaName}`)
  }
  let object = schema.getObject(target.name)
  if (object && !object.dropped) {
    if (target.ifNotExists) {
      return null
    }
    throw new Error(`${object.type} ${target.name} already exists`)
  }
  return schema.addObject(target.type, target.name)
}

function processAlterStatement(vdb: VDatabase, target: {
  type: string,
  schemaName?: string,
  name: string,
  newObject?: SchemaObject
}) {
  let schemaName = target.schemaName || vdb.defaultSchemaName
  if (!schemaName) {
    throw new Error(`No database selected`)
  }

  const schema = vdb.getSchema(schemaName)
  if (!schema) {
    throw new Error(`unknown database ${schemaName}`)
  }

  let obj = schema.getObject(target.name)
  if (!obj || obj.dropped) {
    throw new Error(`no such table: ${schemaName}.${target.name}`)
  } else if (obj.type !== "table") {
    throw new Error(`no such table: ${schemaName}.${target.name}`)
  }

  if (target.newObject) {
    obj.dropped = true
    const newSchema = target.newObject.schemaName ? vdb.getSchema(target.newObject.schemaName) : schema
    if (!newSchema) {
      throw new Error(`unknown database ${newSchema}`)
    }
    let newObject = newSchema.addObject(target.type, target.newObject.name)
    for (const item of schema) {
      if (item.type === "index" && item.target === obj) {
        item.dropped = true
        schema.addObject("index", item.name, newObject)
      }
    }
  }
  return obj
}

function processDropStatement(vdb: VDatabase, target: {
  type: string,
  schemaName?: string,
  name: string,
  ifExists: boolean
}) {
    const schemaName = target.schemaName || vdb.defaultSchemaName
    if (!schemaName) {
      throw new Error(`No database selected`)
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

    obj.dropped = true
    return obj
}

function processObject(vdb: VDatabase, target: {
  type: string,
  schemaName?: string,
  name: string,
}) {
  const schemaName = target.schemaName || vdb.defaultSchemaName
  if (!schemaName) {
    throw new Error(`No database selected`)
  }

  const schema = vdb.getSchema(schemaName)
  if (!schema) {
    throw new Error(`unknown database ${schemaName}`)
  }

  const obj = schema.getObject(target.name)
  if (!obj || obj.dropped) {
    throw new Error(`no such ${target.type}: ${schemaName}.${target.name}`)
  } else if (obj.type !== target.type) {
    throw new Error(`no such ${target.type}: ${schemaName}.${target.name}`)
  }
  return obj
}
