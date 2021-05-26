import { Statement } from "../models"
import { Token } from "../parser"

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

export class CreateDatabaseStatement extends Statement {
  name = ""
  ifNotExists = false
  characterSet?: string
  collate?: string
  encryption?: boolean
}

export class AlterDatabaseStatement extends Statement {
  name = ""
}

export class DropDatabaseStatement extends Statement {
  name = ""
}

export class CreateServerStatement extends Statement {
  name = ""
}

export class AlterServerStatement extends Statement {
  name = ""
}

export class DropServerStatement extends Statement {
  name = ""
}

export class CreateResourceGroupStatement extends Statement {
  name = ""
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
}

export class DropSpatialReferenceSystemStatement extends Statement {
  srid = ""
}

export class CreateRoleStatement extends Statement {
  name = ""
  ifNotExists = false
}

export class SetDefaultRoleStatement extends Statement {
}

export class SetRoleStatement extends Statement {
}

export class DropRoleStatement extends Statement {
  name = ""
}

export class CreateUserStatement extends Statement {
  name = ""
  ifNotExists = false
}

export class AlterUserStatement extends Statement {
  name = ""
}

export class RenameUserStatement extends Statement {
  name = ""
}

export class SetPasswordStatement extends Statement {
}

export class DropUserStatement extends Statement {
  name = ""
}

export class CreateTableStatement extends Statement {
  schemaName?: string
  name = ""
  temporary = false
  ifNotExists = false
  asSelect = false
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
}

export class CreateIndexStatement extends Statement {
  schemaName?: string
  name = ""
  spatial = false
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
  ignore = false
}

export class UpdateStatement extends Statement {
  schemaName?: string
  name = ""
  concurrency?: Concurrency
  ignore = false
}

export class ReplaceStatement extends Statement {
  schemaName?: string
  name = ""
  concurrency?: Concurrency
  ignore = false
}

export class DeleteStatement extends Statement {
  schemaName?: string
  name = ""
  concurrency?: Concurrency
  quick = false
  ignore = false
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
