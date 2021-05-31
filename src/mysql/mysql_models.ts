import Decimal from "decimal.js"
import { Statement } from "../models"
import { Token } from "../parser"

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
  ifNotExists = false
  characterSet?: string
  collate?: string
  encryption?: string
}

export class AlterDatabaseStatement extends Statement {
  name = ""
  characterSet?: string
  collate?: string
  encryption?: string
  readOnly?: string
}

export class DropDatabaseStatement extends Statement {
  name = ""
  ifExists = false
}

export class CreateServerStatement extends Statement {
  name = ""
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
  name = ""
  host?: string
  database?: string
  user?: string
  password?: string
  socket?: string
  owner?: string
  port?: string
}

export class DropServerStatement extends Statement {
  name = ""
  ifExists = false
}

export class CreateResourceGroupStatement extends Statement {
  name = ""
  type: ResourceGroupType = ResourceGroupType.SYSTEM
  vcpu = new Array<{ min: string, max: string}>()
  threadPriority = "0"
  disable = false
}

export class AlterResourceGroupStatement extends Statement {
  name = ""
  vcpu = new Array<{ min: string, max: string}>()
  threadPriority = "0"
  disable = false
  force = false
}

export class SetResourceGroupStatement extends Statement {
}

export class DropResourceGroupStatement extends Statement {
  name = ""
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
  undofile = ""
  initialSize?: string
  wait = false
  engine?: string
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
  addDataFile?: string
  dropDataFile?: string
  initialSize?: string
  wait = false
  newTableSpace?: string
  autoextendSize?: string
  active = true
  encryption?: string
  engine?: string
  engineAttribute?: string
}

export class DropTablespaceStatement extends Statement {
  name = ""
  undo = false
  engine?: string
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

export class CreateRoleStatement extends Statement {
  roles = new Array<UserRoleDef>()
  ifNotExists = false
}

export class SetDefaultRoleStatement extends Statement {
}

export class SetRoleStatement extends Statement {
}

export class DropRoleStatement extends Statement {
  roles = new Array<UserRoleDef>()
  ifExists = false
}

export class UserRoleDef {
  name = ""
  host?: string
  authPlugin?: string
  randowmPassword = false
  asPassword = false
  password?: string
}

export class TlsOption {
  ssl = false
  x509 = false
  issuer?: string
  subject?: string
  chiper?: string
}

export class CreateUserStatement extends Statement {
  users = new Array<UserRoleDef>()
  defaultRoles = new Array<UserRoleDef>()
  tlsOptions = new Array<TlsOption>()
  ifNotExists = false
}

export class AlterUserStatement extends Statement {
  name = ""
  ifExists = false
}

export class RenameUserPair {
  user = new UserRoleDef()
  newUser = new UserRoleDef()
}

export class RenameUserStatement extends Statement {
  pairs = new Array<RenameUserPair>()
}

export class SetPasswordStatement extends Statement {
}

export class DropUserStatement extends Statement {
  users = new Array<UserRoleDef>()
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
  algorithm?: IndexAlgorithm
  keyParts = new Array<KeyPart>()
}

export class CheckConstraint extends Constraint {
  expression = new Array<Token>()
  enforced = true
}

export class ForeignKeyConstraint extends Constraint {
  name?: string
  columns = new Array<string>()
  references = new References()
}

export class CreateTableStatement extends Statement {
  obj = new SchemaObject()
  temporary = false
  ifNotExists = false
  asSelect = false
  like?: SchemaObject
  columns?: Array<TableColumn>
  constraints?: Array<Constraint>
  autoextendSize?: string
  autoIncrement?: string
  avgRowLength?: string
  characterSet?: string
  checksum?: string
  collate?: string
  comment?: string
  compression?: string
  connection?: string
  dataDirectory?: string
  indexDirectory?: string
  delayKeyWrite?: string
  encryption?: string
  engine?: string
  engineAttribute?: string
  insetMethod?: InsertMethod
  keyBlockSize?: string
  maxRows?: string
  minRows?: string
  packKeys?: string
  password?: string
  rowFormat?: RowFormat
  secondaryEngineAttribute?: string
  statsAutoRecalc?: string
  statsPersistent?: string
  statSamplePages?: string
  tablespace?: string
  storageType?: StorageType
  union?: string[]
  partition?: Partition
  conflictAction?: ConflictAction
}

export class AlterTableStatement extends Statement {
  obj = new SchemaObject()
}

export class RenameObjPair {
  obj = new SchemaObject()
  newObj = new SchemaObject()
}

export class RenameTableStatement extends Statement {
  pairs = new Array<RenameObjPair>()
}

export class DropTableStatement extends Statement {
  objs = new Array<SchemaObject>()
  temporary = false
  ifExists = false
  dropOption = DropOption.CASCADE
}

export class IndexColumn {
  expression?: Token[]
  sortOrder = SortOrder.ASC
}

export class CreateIndexStatement extends Statement {
  obj = new SchemaObject()
  type?: IndexType
  algorithm?: IndexAlgorithm
  table = new SchemaObject()
  columns = new Array<IndexColumn>()
  visible = true
  keyBlockSize?: string
  withParser?: string
  comment?: string
  engineAttribute?: string
  secondaryEngineAttribute?: string
  algorithmOption = IndexAlgorithmOption.DEFAULT
  lockOption = IndexLockOption.DEFAULT
}

export class DropIndexStatement extends Statement {
  obj = new SchemaObject()
  table = new SchemaObject()
  algorithmOption = IndexAlgorithmOption.DEFAULT
  lockOption = IndexLockOption.DEFAULT
}

export class CreateViewStatement extends Statement {
  obj = new SchemaObject()
  orReplace = false
  algorithm?: Algortihm
  definer?: UserRoleDef
  sqlSecurity?: SqlSecurity
  columns?: Array<string>
  checkOption?: CheckOption
}

export class AlterViewStatement extends Statement {
  obj = new SchemaObject()
  algorithm?: Algortihm
  definer?: UserRoleDef
  sqlSecurity?: SqlSecurity
}

export class DropViewStatement extends Statement {
  objs = new Array<SchemaObject>()
  ifExists = false
  dropOption = DropOption.CASCADE
}

export class ProcedureParam {
  direction: Direction = Direction.IN
  name = ""
  dataType = new DataType()
}

export class CreateProcedureStatement extends Statement {
  obj = new SchemaObject()
  definer?: UserRoleDef
  params = new Array<ProcedureParam>()
  comment?: string
  language = ProcedureLanguage.SQL
  deterministic = false
  characteristic = ProcedureCharacteristic.CONTAINS_SQL
  sqlSecurity = SqlSecurity.DEFINER
}

export class AlterProcedureStatement extends Statement {
  obj = new SchemaObject()
  definer?: UserRoleDef
}

export class DropProcedureStatement extends Statement {
  obj = new SchemaObject()
  ifExists = false
}

export class FunctionParam {
  name = ""
  dataType = new DataType()
}

export class CreateFunctionStatement extends Statement {
  obj = new SchemaObject()
  definer?: UserRoleDef
  aggregate = false
  params = new Array<FunctionParam>()
  returnDataType = new DataType()
  comment?: string
  language = ProcedureLanguage.SQL
  deterministic = false
  characteristic = ProcedureCharacteristic.CONTAINS_SQL
  sqlSecurity = SqlSecurity.DEFINER
}

export class AlterFunctionStatement extends Statement {
  obj = new SchemaObject()
  definer?: UserRoleDef
}

export class DropFunctionStatement extends Statement {
  obj = new SchemaObject()
  ifExists = false
}

export class TriggerOrder {
  position = TriggerOrderPosition.FOLLOWS
  tableName = ""
}

export class CreateTriggerStatement extends Statement {
  obj = new SchemaObject()
  definer?: UserRoleDef
  triggerTime = TriggerTime.BEFORE
  triggerEvent = TriggerEvent.INSERT
  tableName: string = ""
  triggerOrder?: TriggerOrder
}

export class DropTriggerStatement extends Statement {
  obj = new SchemaObject()
  ifExists = false
}

export class CreateEventStatement extends Statement {
  obj = new SchemaObject()
  definer?: UserRoleDef
  ifNotExists = false
  at?: Array<Token>
  every?: Interval
  starts?: Array<Token>
  ends?: Array<Token>
}

export class AlterEventStatement extends Statement {
  obj = new SchemaObject()
  definer?: UserRoleDef
}

export class DropEventStatement extends Statement {
  obj = new SchemaObject()
  ifExists = false
}

export class AlterInstanceStatement extends Statement {

}

export class TruncateTableStatement extends Statement {
  obj = new SchemaObject()
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
  work = false
  chain?: boolean
  release?: boolean
}

export class RollbackStatement extends Statement {
  work = false
  chain?: boolean
  release?: boolean
}

export class LockTableStatement extends Statement {
}

export class UnlockTableStatement extends Statement {
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

export class ResetSlaveStatement extends Statement {
}

export class StartSlaveStatement extends Statement {
}

export class StopSlaveStatement extends Statement {
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
}
export class ExecuteStatement extends Statement {
}

export class DeallocatePrepareStatement extends Statement {
  name = ""
}

export class AnalyzeTableStatement extends Statement {
  noWriteToBinlog = false
}

export class CheckTableStatement extends Statement {
}

export class ChecksumTableStatement extends Statement {
}

export class OptimizeTableStatement extends Statement {
  noWriteToBinlog = false
}

export class RepairTableStatement extends Statement {
  noWriteToBinlog = false
}


export class InstallPluginStatement extends Statement {
}

export class UninstallPluginStatement extends Statement {
}

export class UseStatement extends Statement {
}

export class InsertStatement extends Statement {
  obj = new SchemaObject()
  concurrency?: Concurrency
  conflictAction?: ConflictAction
}

export class UpdateStatement extends Statement {
  obj = new SchemaObject()
  concurrency?: Concurrency
  conflictAction?: ConflictAction
}

export class ReplaceStatement extends Statement {
  obj = new SchemaObject()
  concurrency?: Concurrency
  conflictAction?: ConflictAction
}

export class DeleteStatement extends Statement {
  obj = new SchemaObject()
  concurrency?: Concurrency
  quick = false
  conflictAction?: ConflictAction
}

export class LoadDataInfileStatement extends Statement {
  concurrency?: Concurrency
  local = false
}

export class LoadXmlInfileStatement extends Statement {
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

export class ResetStatement extends Statement {
}

export class OtherStatement extends Statement {
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
  HASH = "HASH"
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
