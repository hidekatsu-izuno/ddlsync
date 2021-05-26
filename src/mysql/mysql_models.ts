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

  summary() {
    return ""
  }
}

export class AlterDatabaseStatement extends Statement {
  name = ""

  summary() {
    return ""
  }
}

export class DropDatabaseStatement extends Statement {
  name = ""

  summary() {
    return ""
  }
}

export class CreateServerStatement extends Statement {
  name = ""

  summary() {
    return ""
  }
}

export class AlterServerStatement extends Statement {
  name = ""

  summary() {
    return ""
  }
}

export class DropServerStatement extends Statement {
  name = ""

  summary() {
    return ""
  }
}

export class CreateResourceGroupStatement extends Statement {
  name = ""

  summary() {
    return ""
  }
}

export class AlterResourceGroupStatement extends Statement {
  name = ""

  summary() {
    return ""
  }
}

export class SetResourceGroupStatement extends Statement {
  summary() {
    return "SET RESOURCE GROUP"
  }
}

export class DropResourceGroupStatement extends Statement {
  name = ""

  summary() {
    return ""
  }
}

export class CreateLogfileGroupStatement extends Statement {
  name = ""

  summary() {
    return ""
  }
}

export class AlterLogfileGroupStatement extends Statement {
  name = ""

  summary() {
    return ""
  }
}

export class DropLogfileGroupStatement extends Statement {
  name = ""

  summary() {
    return ""
  }
}

export class CreateTablespaceStatement extends Statement {
  name = ""
  undo = false

  summary() {
    return ""
  }
}

export class AlterTablespaceStatement extends Statement {
  name = ""
  undo = false

  summary() {
    return ""
  }
}

export class DropTablespaceStatement extends Statement {
  name = ""
  undo = false

  summary() {
    return ""
  }
}

export class CreateSpatialReferenceSystemStatement extends Statement {
  srid = ""
  orReplace = false
  ifNotExists = false

  summary() {
    return ""
  }
}

export class DropSpatialReferenceSystemStatement extends Statement {
  srid = ""

  summary() {
    return ""
  }
}

export class CreateRoleStatement extends Statement {
  name = ""
  ifNotExists = false

  summary() {
    return ""
  }
}

export class SetDefaultRoleStatement extends Statement {
  summary() {
    return "SET DEFAULT ROLE"
  }
}

export class SetRoleStatement extends Statement {
  summary() {
    return "SET ROLL"
  }
}

export class DropRoleStatement extends Statement {
  name = ""

  summary() {
    return ""
  }
}

export class CreateUserStatement extends Statement {
  name = ""
  ifNotExists = false

  summary() {
    return ""
  }
}

export class AlterUserStatement extends Statement {
  name = ""

  summary() {
    return ""
  }
}

export class RenameUserStatement extends Statement {
  name = ""

  summary() {
    return ""
  }
}

export class SetPasswordStatement extends Statement {
  summary() {
    return ""
  }
}

export class DropUserStatement extends Statement {
  name = ""

  summary() {
    return ""
  }
}

export class CreateTableStatement extends Statement {
  schemaName?: string
  name = ""
  temporary = false
  ifNotExists = false
  asSelect = false

  summary() {
    return ""
  }
}

export class AlterTableStatement extends Statement {
  schemaName?: string
  name = ""

  summary() {
    return ""
  }
}

export class RenameTableStatement extends Statement {
  schemaName?: string
  name = ""

  summary() {
    return ""
  }
}

export class DropTableStatement extends Statement {
  schemaName?: string
  name = ""
  temporary = false

  summary() {
    return ""
  }
}

export class CreateIndexStatement extends Statement {
  schemaName?: string
  name = ""
  spatial = false

  summary() {
    return ""
  }
}

export class DropIndexStatement extends Statement {
  schemaName?: string
  name = ""

  summary() {
    return ""
  }
}

export class CreateViewStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
  algorithm?: Algortihm
  definer?: string
  sqlSecurityDefiner?: string
  sqlSecurityInvoker?: string

  summary() {
    return ""
  }
}

export class AlterViewStatement extends Statement {
  schemaName?: string
  name = ""
  algorithm?: Algortihm
  definer?: string
  sqlSecurityDefiner?: string
  sqlSecurityInvoker?: string

  summary() {
    return ""
  }
}

export class DropViewStatement extends Statement {
  schemaName?: string
  name = ""

  summary() {
    return ""
  }
}

export class CreateProcedureStatement extends Statement {
  schemaName?: string
  name = ""
  definer?: string

  summary() {
    return ""
  }
}

export class AlterProcedureStatement extends Statement {
  schemaName?: string
  name = ""
  definer?: string

  summary() {
    return ""
  }
}

export class DropProcedureStatement extends Statement {
  schemaName?: string
  name = ""

  summary() {
    return ""
  }
}

export class CreateFunctionStatement extends Statement {
  schemaName?: string
  name = ""
  definer?: string
  aggregate = false

  validate() {

  }

  summary() {
    return ""
  }
}

export class AlterFunctionStatement extends Statement {
  schemaName?: string
  name = ""
  definer?: string

  summary() {
    return ""
  }
}

export class DropFunctionStatement extends Statement {
  schemaName?: string
  name = ""

  summary() {
    return ""
  }
}

export class CreateTriggerStatement extends Statement {
  schemaName?: string
  name = ""
  definer?: string

  validate() {

  }

  summary() {
    return ""
  }
}

export class DropTriggerStatement extends Statement {
  schemaName?: string
  name = ""

  summary() {
    return ""
  }
}

export class CreateEventStatement extends Statement {
  schemaName?: string
  name = ""
  definer?: string
  ifNotExists = false

  summary() {
    return ""
  }
}

export class AlterEventStatement extends Statement {
  schemaName?: string
  name = ""
  definer?: string

  summary() {
    return ""
  }
}

export class DropEventStatement extends Statement {
  schemaName?: string
  name = ""

  summary() {
    return ""
  }
}

export class TruncateTableStatement extends Statement {
  schemaName?: string
  name = ""

  summary() {
    return ""
  }
}

export class StartTransactionStatement extends Statement {
  summary() {
    return "START TRANSACTION"
  }
}

export class BeginStatement extends Statement {
  summary() {
    return "BEGIN"
  }
}

export class SetTransactionStatement extends Statement {
  type?: VariableType
  characteristic = TransactionCharacteristic.ISOLATION_LEVEL_READ_COMMITTED
  summary() {
    return "SET TRANSCTION"
  }
}

export class SavepointStatement extends Statement {
  summary() {
    return "SAVEPOINT"
  }
}

export class ReleaseSavepointStatement extends Statement {
  summary() {
    return "RELEASE SAVEPOINT"
  }
}

export class CommitStatement extends Statement {
  summary() {
    return "COMMIT"
  }
}

export class RollbackStatement extends Statement {
  summary() {
    return "ROLLBACK"
  }
}

export class LockTableStatement extends Statement {
  summary() {
    return "LOCK TABLE"
  }
}

export class UnlockTableStatement extends Statement {
  summary() {
    return "UNLOCK TABLE"
  }
}

export class XaStartStatement extends Statement {
  summary() {
    return "XA START"
  }
}

export class XaBeginStatement extends Statement {
  summary() {
    return "XA BEGIN"
  }
}

export class XaEndStatement extends Statement {
  summary() {
    return "XA END"
  }
}

export class XaPrepareStatement extends Statement {
  summary() {
    return "XA PREPARE"
  }
}

export class XaCommitStatement extends Statement {
  summary() {
    return "XA COMMIT"
  }
}

export class XaRollbackStatement extends Statement {
  summary() {
    return "XA ROLLBACK"
  }
}

export class XaRecoverStatement extends Statement {
  summary() {
    return "XA RECOVER"
  }
}

export class PurgeBinaryLogsStatement extends Statement {
  summary() {
    return "PURGE BINARY LOGS"
  }
}

export class ResetMasterStatement extends Statement {
  summary() {
    return "RESET MASTER"
  }
}

export class ChangeMasterStatement extends Statement {
  summary() {
    return "CHANGE MASTER"
  }
}

export class ResetSlaveStatement extends Statement {
  summary() {
    return "RESET SLAVE"
  }
}

export class StartSlaveStatement extends Statement {
  summary() {
    return "START SLAVE"
  }
}

export class StopSlaveStatement extends Statement {
  summary() {
    return "STOP SLAVE"
  }
}

export class GrantStatement extends Statement {
  summary() {
    return "GRANT"
  }
}

export class RevokeStatement extends Statement {
  summary() {
    return "REVOKE"
  }
}

export class ExplainStatement extends Statement {
  summary() {
    return ""
  }
}

export class CallStatement extends Statement {
  summary() {
    return "CALL"
  }
}

export class PrepareStatement extends Statement {
  summary() {
    return "PREPARE"
  }
}
export class ExecuteStatement extends Statement {
  summary() {
    return "EXECUTE"
  }
}

export class DeallocatePrepareStatement extends Statement {
  summary() {
    return "DEALLOCATE PREPARE"
  }
}

export class AnalyzeTableStatement extends Statement {
  noWriteToBinlog = false

  summary() {
    return ""
  }
}

export class CheckTableStatement extends Statement {
  summary() {
    return ""
  }
}

export class ChecksumTableStatement extends Statement {
  summary() {
    return ""
  }
}

export class OptimizeTableStatement extends Statement {
  noWriteToBinlog = false

  summary() {
    return ""
  }
}

export class RepairTableStatement extends Statement {
  noWriteToBinlog = false

  summary() {
    return ""
  }
}


export class InstallPluginStatement extends Statement {
  summary() {
    return ""
  }
}

export class UninstallPluginStatement extends Statement {
  summary() {
    return ""
  }
}

export class UseStatement extends Statement {
  summary() {
    return ""
  }
}

export class InsertStatement extends Statement {
  schemaName?: string
  name = ""
  concurrency?: Concurrency
  ignore = false

  summary() {
    return ""
  }
}

export class UpdateStatement extends Statement {
  schemaName?: string
  name = ""
  concurrency?: Concurrency
  ignore = false

  summary() {
    return ""
  }
}

export class ReplaceStatement extends Statement {
  schemaName?: string
  name = ""
  concurrency?: Concurrency
  ignore = false

  summary() {
    return ""
  }
}

export class DeleteStatement extends Statement {
  schemaName?: string
  name = ""
  concurrency?: Concurrency
  quick = false
  ignore = false

  summary() {
    return ""
  }
}

export class LoadDataInfileStatement extends Statement {
  concurrency?: Concurrency
  local = false

  summary() {
    return ""
  }
}

export class LoadXmlInfileStatement extends Statement {
  concurrency?: Concurrency
  local = false

  summary() {
    return ""
  }
}

export class SetCharacterSetStatement extends Statement {
  summary() {
    return ""
  }
}

export class SetNamesStatement extends Statement {
  summary() {
    return ""
  }
}

export class SetStatement extends Statement {
  variableAssignments = new Array<VariableAssignment>()

  summary() {
    return ""
  }
}

export class VariableAssignment {
  type?: VariableType
  name = ""
  value?: Token[]
}

export class SelectStatement extends Statement {
  summary() {
    return "SELECT"
  }
}

export class TableStatement extends Statement {
  summary() {
    return "TABLE"
  }
}

export class DoStatement extends Statement {
  summary() {
    return "DO"
  }
}

export class HandlerStatement extends Statement {
  summary() {
    return "HANDLER"
  }
}

export class ShowStatement extends Statement {
  summary() {
    return "SHOW"
  }
}

export class HelpStatement extends Statement {
  summary() {
    return "HELP"
  }
}

export class BinlogStatement extends Statement {
  summary() {
    return "BINLOG"
  }
}

export class CacheIndexStatement extends Statement {
  summary() {
    return "CACHE INDEX"
  }
}

export class FlushStatement extends Statement {
  summary() {
    return "FLUSH"
  }
}

export class KillStatement extends Statement {
  summary() {
    return "KILL"
  }
}

export class LoadIndexIntoCacheStatement extends Statement {
  summary() {
    return "LOAD INDEX INTO CACHE"
  }
}

export class ResetStatement extends Statement {
  summary() {
    return "LOAD INDEX INTO CACHE"
  }
}

export class OtherStatement extends Statement {
  summary() {
    return "UNKNOWN"
  }
}
