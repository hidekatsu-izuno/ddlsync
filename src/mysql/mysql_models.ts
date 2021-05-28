import Decimal from "decimal.js"
import { Statement } from "../models"
import { Token } from "../parser"

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
}

export class SetResourceGroupStatement extends Statement {
}

export class DropResourceGroupStatement extends Statement {
  name = ""
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

export class RoleDef {
  name = ""
  host?: string
}

export class CreateRoleStatement extends Statement {
  roles = new Array<RoleDef>()
  ifNotExists = false
}

export class SetDefaultRoleStatement extends Statement {
}

export class SetRoleStatement extends Statement {
}

export class DropRoleStatement extends Statement {
  name = ""
  ifExists = false
}

export class UserDef {
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
  users = new Array<UserDef>()
  defaultRoles = new Array<string>()
  tlsOptions = new Array<TlsOption>()
  ifNotExists = false
}

export class AlterUserStatement extends Statement {
  name = ""
  ifExists = false
}

export class RenameUserStatement extends Statement {
  name = ""
}

export class SetPasswordStatement extends Statement {
}

export class DropUserStatement extends Statement {
  name = ""
  ifExists = false
}

export class CreateTableStatement extends Statement {
  schemaName?: string
  name = ""
  temporary = false
  ifNotExists = false
  asSelect = false
  like = false
  likeSchemaName?: string
  likeName?: string

  autoextendSize?: string
  autoIncrement?: string
  avgRowLength?: string
  characterSet?: string
  checksum?: string
  collate?: string
  comment?: string
  compression?: string
  connection?: string
  dataDictionary?: string
  indexDictionary?: string
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
  partitions?: string
  conflictAction?: ConflictAction

  linearHashExpression?: Token[]
  linearKeyAlgorithm?: string
  linearTokens?: string[]
}

export class AlterTableStatement extends Statement {
  schemaName?: string
  name = ""
}

export class RenameTableStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropTableStatement extends Statement {
  schemaName?: string
  name = ""
  temporary = false
  ifExists = false
}

export class CreateIndexStatement extends Statement {
  schemaName?: string
  name = ""
  type?: IndexType
}

export class DropIndexStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateViewStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
  algorithm?: Algortihm
  definer?: string
  sqlSecurityDefiner?: string
  sqlSecurityInvoker?: string
}

export class AlterViewStatement extends Statement {
  schemaName?: string
  name = ""
  algorithm?: Algortihm
  definer?: string
  sqlSecurityDefiner?: string
  sqlSecurityInvoker?: string
}

export class DropViewStatement extends Statement {
  schemaName?: string
  name = ""
  ifExists = false
}

export class CreateProcedureStatement extends Statement {
  schemaName?: string
  name = ""
  definer?: string
}

export class AlterProcedureStatement extends Statement {
  schemaName?: string
  name = ""
  definer?: string
}

export class DropProcedureStatement extends Statement {
  schemaName?: string
  name = ""
  ifExists = false
}

export class CreateFunctionStatement extends Statement {
  schemaName?: string
  name = ""
  definer?: string
  aggregate = false
}

export class AlterFunctionStatement extends Statement {
  schemaName?: string
  name = ""
  definer?: string
}

export class DropFunctionStatement extends Statement {
  schemaName?: string
  name = ""
  ifExists = false
}

export class CreateTriggerStatement extends Statement {
  schemaName?: string
  name = ""
  definer?: string
}

export class DropTriggerStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateEventStatement extends Statement {
  schemaName?: string
  name = ""
  definer?: string
  ifNotExists = false
}

export class AlterEventStatement extends Statement {
  schemaName?: string
  name = ""
  definer?: string
}

export class DropEventStatement extends Statement {
  schemaName?: string
  name = ""
  ifExists = false
}

export class TruncateTableStatement extends Statement {
  schemaName?: string
  name = ""
}

export class StartTransactionStatement extends Statement {
}

export class BeginStatement extends Statement {
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
  schemaName?: string
  name = ""
  concurrency?: Concurrency
  conflictAction?: ConflictAction
}

export class UpdateStatement extends Statement {
  schemaName?: string
  name = ""
  concurrency?: Concurrency
  conflictAction?: ConflictAction
}

export class ReplaceStatement extends Statement {
  schemaName?: string
  name = ""
  concurrency?: Concurrency
  conflictAction?: ConflictAction
}

export class DeleteStatement extends Statement {
  schemaName?: string
  name = ""
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

export enum IndexType {
  UNIQUE = "UNIQUE",
  FULLTEXT = "FULLTEXT",
  SPATIAL = "SPATIAL",
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
