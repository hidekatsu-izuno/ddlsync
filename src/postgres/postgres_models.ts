import { Schema } from "inspector"
import { Statement } from "../models"
import { Token } from "../parser"

export class SchemaObject {
  schemaName?: string
  name = ""
}

export class CommandStatement extends Statement {
  name = ""
  args = new Array<string>()
}

export class AlterSystemStatement extends Statement {
}

export class DropOwnedStatement extends Statement {
}

export class CreateDatabaseStatement extends Statement {
  name = ""
}

export class AlterDatabaseStatement extends Statement {
  schemaName = ""
}

export class DropDatabaseStatement extends Statement {
  schemaName = ""
  ifExists = false
}

export class CreateAccessMethodStatement extends Statement {
  name = ""
}

export class DropAccessMethodStatement extends Statement {
  accessMethod = new SchemaObject()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateCastStatement extends Statement {
}

export class DropCastStatement extends Statement {
}

export class CreateEventTriggerStatement extends Statement {
  name = ""
}

export class AlterEventTriggerStatement extends Statement {
  eventTriggerName = ""
}

export class DropEventTriggerStatement extends Statement {
  eventTrigger = ""
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateExtensionStatement extends Statement {
  name = ""
}

export class AlterExtensionStatement extends Statement {
  extensionName = ""
}

export class DropExtensionStatement extends Statement {
  extension = ""
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateForeignDataWrapperStatement extends Statement {
  name = ""
}

export class AlterForeignDataWrapperStatement extends Statement {
  foreignDataWrapperName = ""
}

export class DropForeignDataWrapperStatement extends Statement {
  foreignDataWrappers = new Array<string>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateLanguageStatement extends Statement {
  name = ""
  orReplace = false
  trusted = false
  procedural = false
}

export class AlterLanguageStatement extends Statement {
  languageName = ""
  procedural = false
}

export class DropLanguageStatement extends Statement {
  languageName = ""
  procedural = false
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateTransformStatement extends Statement {
  name = ""
  orReplace = false
}

export class AlterTransformStatement extends Statement {
  transformName = ""
}

export class DropTransformStatement extends Statement {
  transformName = ""
}

export class CreatePublicationStatement extends Statement {
  name = ""
}

export class AlterPublicationStatement extends Statement {
}

export class DropPublicationStatement extends Statement {
  publications = new Array<string>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateSubscriptionStatement extends Statement {
  name = ""
}

export class AlterSubscriptionStatement extends Statement {
}

export class DropSubscriptionStatement extends Statement {
  subscription = ""
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateServerStatement extends Statement {
  name = ""
}

export class AlterServerStatement extends Statement {
  serverName = ""
}

export class DropServerStatement extends Statement {
  servers = new Array<string>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateUserMappingStatement extends Statement {

}

export class AlterUserMappingStatement extends Statement {

}

export class DropUserMappingStatement extends Statement {
  ifExists = false
  user = ""
  server = ""
}

export class CreateTablespaceStatement extends Statement {
  name = ""
}

export class AlterTablespaceStatement extends Statement {
  tablespaceName = ""
}

export class DropTablespaceStatement extends Statement {
  tablespaceName = ""
  ifExists = false
}

export class CreateTypeStatement extends Statement {
  name = ""
}

export class AlterTypeStatement extends Statement {
  typeName = ""
}

export class DropTypeStatement extends Statement {
  typeName = ""
}

export class CreateRoleStatement extends Statement {
  name = ""
  login = false
}

export class AlterRoleStatement extends Statement {
  name = ""
  login = false
}

export class DropRoleStatement extends Statement {
  roles = new Array<string>()
  ifExists = false
  login = false
}

export class AlterLargeObjectStatement extends Statement {
}

export class CreateSchemaStatement extends Statement {
  name = ""
}

export class AlterSchemaStatement extends Statement {
  schemaName = ""
}

export class DropSchemaStatement extends Statement {
  schemas = new Array<string>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateCollationStatement extends Statement {
  schemaName?: string
  name = ""
}

export class AlterCollationStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropCollationStatement extends Statement {
  collation = ""
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class AlterDefaultPrivilegesStatement extends Statement {
  schemaName?: string
  name = ""
  default = false
}

export class CreateConversionStatement extends Statement {
  conversion = ""
  default = false
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class AlterConversionStatement extends Statement {

}

export class DropConversionStatement extends Statement {

}

export class CreateDomainStatement extends Statement {
  schemaName?: string
  name = ""
}

export class AlterDomainStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropDomainStatement extends Statement {
  domains = new Array<SchemaObject>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateOperatorStatement extends Statement {
  schemaName?: string
  name = ""
}

export class AlterOperatorStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropOperatorStatement extends Statement {

}

export class CreateOperatorFamilyStatement extends Statement {
  schemaName?: string
  name = ""
}

export class AlterOperatorFamilyStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropOperatorFamilyStatement extends Statement {
  operatorFamily = new SchemaObject()
  indexMethod = ""
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateOperatorClassStatement extends Statement {

}

export class AlterOperatorClassStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropOperatorClassStatement extends Statement {
  operatorClass = new SchemaObject()
  indexMethod = ""
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateStatisticsStatement extends Statement {
  schemaName?: string
  name = ""
}

export class AlterStatisticsStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropStatisticsStatement extends Statement {
  statistics = new Array<string>()
  ifExists = false
}

export class CreateTableStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
  temporary = false
  unlogged = false
}

export class AlterTableStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropTableStatement extends Statement {
  tables = new Array<SchemaObject>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateForeignTableStatement extends Statement {
  schemaName?: string
  name = ""
}

export class AlterForeignTableStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropForeignTableStatement extends Statement {
  foreignTables = new Array<SchemaObject>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateSequenceStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
  temporary = false
}

export class AlterSequenceStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropSequenceStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateViewStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
  temporary = false
  recursive = false
}

export class AlterViewStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropViewStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateMaterializedViewStatement extends Statement {
  schemaName?: string
  name = ""
}

export class AlterMaterializedViewStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropMaterializedViewStatement extends Statement {
  schemaName?: string
  name = ""
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateProcedureStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
}

export class AlterProcedureStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropProcedureStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateFunctionStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
}

export class AlterFunctionStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropFunctionStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateAggregateStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
}

export class AlterAggregateStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropAggregateStatement extends Statement {
  schemaName?: string
  name = ""
}

export class AlterRoutineStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateTriggerStatement extends Statement {
  schemaName?: string
  name = ""
  constraint = false
}

export class AlterTriggerStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropTriggerStatement extends Statement {
  name = ""
  table = new SchemaObject()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateTextSearchConfigurationStatement extends Statement {
  schemaName?: string
  name = ""
}

export class AlterTextSearchConfigurationStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropTextSearchConfigurationStatement extends Statement {
  textSearchConfiguration = new SchemaObject()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateTextSearchDictionaryStatement extends Statement {
  schemaName?: string
  name = ""
}

export class AlterTextSearchDictionaryStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropTextSearchDictionaryStatement extends Statement {
  textSearchDictionary = new SchemaObject()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateTextSearchParserStatement extends Statement {
  schemaName?: string
  name = ""
}

export class AlterTextSearchParserStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropTextSearchParserStatement extends Statement {
  textSearchParser = new SchemaObject()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateTextSearchTemplateStatement extends Statement {
  schemaName?: string
  name = ""
}

export class AlterTextSearchTemplateStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropTextSearchTemplateStatement extends Statement {
  textSearchTemplate = new SchemaObject()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreatePolicyStatement extends Statement {
  name = ""
  table = new SchemaObject()
}

export class AlterPolicyStatement extends Statement {
  name = ""
  table = new SchemaObject()
}

export class DropPolicyStatement extends Statement {
  name = ""
  table = new SchemaObject()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateRuleStatement extends Statement {
  name = ""
  orReplace = false
}

export class AlterRuleStatement extends Statement {
  name = ""
}

export class DropRuleStatement extends Statement {
  name = ""
  table = new SchemaObject()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class CreateIndexStatement extends Statement {
  schemaName?: string
  name = ""
  type?: "UNIQUE"
}

export class AlterIndexStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropIndexStatement extends Statement {
  indexes = new Array<SchemaObject>()
  concurrently = false
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = "RESTRICT"
}

export class ReassignOwnedStatement extends Statement {

}

export class SecurityLabelStatement extends Statement {

}

export class TruncateStatement extends Statement {
  table = new SchemaObject()
  only = false
}

export class CommentStatement extends Statement {

}

export class GrantStatement extends Statement {

}

export class RevokeStatement extends Statement {

}

export class LockStatement extends Statement {

}

export class StartTransactionStatement extends Statement {

}

export class BeginStatement extends Statement {

}

export class SavepointStatement extends Statement {

}

export class ReleaseSavepointStatement extends Statement {

}

export class CommitPreparedStatement extends Statement {

}

export class CommitStatement extends Statement {

}

export class EndStatement extends Statement {

}

export class RollbackPreparedStatement extends Statement {

}

export class RollbackStatement extends Statement {

}

export class AbortStatement extends Statement {

}

export class DiscardStatement extends Statement {

}

export class AnalyzeStatement extends Statement {

}

export class ExplainStatement extends Statement {

}

export class ClusterStatement extends Statement {
  table?: SchemaObject
  verbose = false
}

export class ReindexSystemStatement extends Statement {
  schema = ""
  concurrently = false
}

export class ReindexDatabaseStatement extends Statement {
  schema = ""
  concurrently = false
}

export class ReindexSchemaStatement extends Statement {
  schema = ""
  concurrently = false
}

export class ReindexTableStatement extends Statement {
  table = new SchemaObject()
  concurrently = false
}

export class ReindexIndexStatement extends Statement {
  index = new SchemaObject()
  concurrently = false
}

export class VacuumStatement extends Statement {

}

export class LoadStatement extends Statement {

}

export class ImportForeignSchemaStatement extends Statement {

}

export class CopyStatement extends Statement {

}

export class CheckpointStatement extends Statement {

}

export class RefreshMaterializedViewStatement extends Statement {
  materializedView = new SchemaObject()
  concurrently = false
}

export class PrepareTransactionStatement extends Statement {

}

export class PrepareStatement extends Statement {

}

export class ExecuteStatement extends Statement {

}

export class DeallocateStatement extends Statement {

}

export class DeclareStatement extends Statement {

}

export class FetchStatement extends Statement {

}

export class MoveStatement extends Statement {

}

export class CloseStatement extends Statement {

}

export class ListenStatement extends Statement {

}

export class NotifyStatement extends Statement {

}

export class UnlistenStatement extends Statement {

}

export class SetConstraintStatement extends Statement {

}

export class SetRoleStatement extends Statement {

}

export class SetSessionAuthorizationStatement extends Statement {

}

export class SetTransactionStatement extends Statement {

}

export class SetStatement extends Statement {

}

export class ResetStatement extends Statement {

}

export class ShowStatement extends Statement {

}

export class CallStatement extends Statement {
  procedure = new SchemaObject()
}

export class DoStatement extends Statement {

}

export class ValuesStatement extends Statement {

}

export class InsertStatement extends Statement {
  table = new SchemaObject()
}

export class UpdateStatement extends Statement {
  table = new SchemaObject()
  only = false
}

export class DeleteStatement extends Statement {
  table = new SchemaObject()
  only = false
}

export class SelectStatement extends Statement {

}
