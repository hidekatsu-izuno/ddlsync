import { Schema } from "inspector"
import { Statement } from "../models"
import { Token } from "../parser"

// Drop dependency
export const CASCADE = "CASCADE"
export const RESTRICT = "RESTRICT"

// Callable arg mode
export const IN = "IN"
export const OUT = "OUT"
export const INOUT = "INOUT"
export const VARIADIC = "VARIADIC"

// Role constants
export const CURRENT_USER = "CURRENT_USER"
export const SESSION_USER = "SESSION_USER"
export const PUBLIC = "PUBLIC"
export const ALL = "ALL"

export class SchemaObject {
  schema?: string
  name = ""
}

export class CommandStatement extends Statement {
  name = ""
  args = new Array<string>()
}

export class AlterSystemStatement extends Statement {
}

export class DropOwnedStatement extends Statement {
  roles = new Array<Role>()
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateDatabaseStatement extends Statement {
  name = ""
}

export class AlterDatabaseStatement extends Statement {
  database = ""
}

export class DropDatabaseStatement extends Statement {
  database = ""
  ifExists = false
}

export class CreateAccessMethodStatement extends Statement {
  name = ""
}

export class DropAccessMethodStatement extends Statement {
  accessMethod = ""
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateCastStatement extends Statement {
}

export class DropCastStatement extends Statement {
  ifExists = false
  sourceType = new SchemaObject()
  targetType = new SchemaObject()
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateEventTriggerStatement extends Statement {
  name = ""
}

export class AlterEventTriggerStatement extends Statement {
  eventTrigger = ""
}

export class DropEventTriggerStatement extends Statement {
  eventTrigger = ""
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateExtensionStatement extends Statement {
  name = ""
}

export class AlterExtensionStatement extends Statement {
  extension = ""
}

export class DropExtensionStatement extends Statement {
  extension = ""
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateForeignDataWrapperStatement extends Statement {
  name = ""
}

export class AlterForeignDataWrapperStatement extends Statement {
  foreignDataWrapper = ""
}

export class DropForeignDataWrapperStatement extends Statement {
  foreignDataWrappers = new Array<string>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateLanguageStatement extends Statement {
  name = ""
  orReplace = false
  trusted = false
  procedural = false
}

export class AlterLanguageStatement extends Statement {
  language = ""
  procedural = false
}

export class DropLanguageStatement extends Statement {
  language = ""
  procedural = false
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateTransformStatement extends Statement {
  name = ""
  orReplace = false
}

export class AlterTransformStatement extends Statement {
  transform = ""
}

export class DropTransformStatement extends Statement {
  type = new SchemaObject()
  language = ""
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreatePublicationStatement extends Statement {
  name = ""
}

export class AlterPublicationStatement extends Statement {
  publication = ""
}

export class DropPublicationStatement extends Statement {
  publications = new Array<string>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateSubscriptionStatement extends Statement {
  name = ""
}

export class AlterSubscriptionStatement extends Statement {
  subscription = ""
}

export class DropSubscriptionStatement extends Statement {
  subscription = ""
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateServerStatement extends Statement {
  name = ""
}

export class AlterServerStatement extends Statement {
  server = ""
}

export class DropServerStatement extends Statement {
  servers = new Array<string>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateUserMappingStatement extends Statement {

}

export class AlterUserMappingStatement extends Statement {
  user = new Role()
  server = ""
}

export class DropUserMappingStatement extends Statement {
  ifExists = false
  user = new Role()
  server = ""
}

export class CreateTablespaceStatement extends Statement {
  name = ""
}

export class AlterTablespaceStatement extends Statement {
  tablespace = ""
}

export class DropTablespaceStatement extends Statement {
  tablespace = ""
  ifExists = false
}

export class Role {
  name?: string
  alias?: string
}

export class CreateRoleStatement extends Statement {
  name = ""
  login = false
}

export class AlterRoleStatement extends Statement {
  role = new Role()
  database?: string
}

export class DropRoleStatement extends Statement {
  roles = new Array<Role>()
  ifExists = false
}

export class AlterLargeObjectStatement extends Statement {
  largeObject = ""
}

export class CreateSchemaStatement extends Statement {
  name = ""
}

export class AlterSchemaStatement extends Statement {
  schema = ""
}

export class DropSchemaStatement extends Statement {
  schemas = new Array<string>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateTypeStatement extends Statement {
  name = ""
}

export class AlterTypeStatement extends Statement {
  type = ""
}

export class DropTypeStatement extends Statement {
  types = new Array<SchemaObject>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateCollationStatement extends Statement {
  schema?: string
  name = ""
}

export class AlterCollationStatement extends Statement {
  collation = new SchemaObject()
}

export class DropCollationStatement extends Statement {
  collation = new SchemaObject()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class AlterDefaultPrivilegesStatement extends Statement {
  roles = new Array<Role>()
  schemas = new Array<string>()
  default = false
}

export class CreateConversionStatement extends Statement {
  conversion = ""
  default = false
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class AlterConversionStatement extends Statement {
  conversion = new SchemaObject()
}

export class DropConversionStatement extends Statement {
  conversion = new SchemaObject()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateDomainStatement extends Statement {
  schema?: string
  name = ""
}

export class AlterDomainStatement extends Statement {
  domain = new SchemaObject()
}

export class DropDomainStatement extends Statement {
  domains = new Array<SchemaObject>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CustomOpeartor {
  schema?: string
  name = ""
  leftType?: SchemaObject
  rightType?: SchemaObject
}

export class CreateOperatorStatement extends Statement {
  schema?: string
  name = ""
}

export class AlterOperatorStatement extends Statement {
  operator = new CustomOpeartor()
}

export class DropOperatorStatement extends Statement {
  operators = new Array<CustomOpeartor>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateOperatorFamilyStatement extends Statement {
  schema?: string
  name = ""
}

export class AlterOperatorFamilyStatement extends Statement {
  operatorFamily = new SchemaObject()
  indexAccessMethod = ""
}

export class DropOperatorFamilyStatement extends Statement {
  operatorFamily = new SchemaObject()
  indexAccessMethod = ""
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateOperatorClassStatement extends Statement {

}

export class AlterOperatorClassStatement extends Statement {
  operatorClass = new SchemaObject()
  indexAccessMethod = ""
}

export class DropOperatorClassStatement extends Statement {
  operatorClass = new SchemaObject()
  indexAccessMethod = ""
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateStatisticsStatement extends Statement {
  schema?: string
  name = ""
}

export class AlterStatisticsStatement extends Statement {
  statistic = new SchemaObject()
}

export class DropStatisticsStatement extends Statement {
  statistics = new Array<SchemaObject>()
  ifExists = false
}

export class CreateTableStatement extends Statement {
  schema?: string
  name = ""
  orReplace = false
  temporary = false
  unlogged = false
}

export class AlterTableStatement extends Statement {
  table?: SchemaObject
  tablespace?: string
  ifExists = false
  only = false
}

export class DropTableStatement extends Statement {
  tables = new Array<SchemaObject>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateForeignTableStatement extends Statement {
  schema?: string
  name = ""
}

export class AlterForeignTableStatement extends Statement {
  foreignTable = new SchemaObject()
  ifExists = false
  only = false
}

export class DropForeignTableStatement extends Statement {
  foreignTables = new Array<SchemaObject>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateSequenceStatement extends Statement {
  schema?: string
  name = ""
  orReplace = false
  temporary = false
}

export class AlterSequenceStatement extends Statement {
  sequence = new SchemaObject()
  ifExists = false
}

export class DropSequenceStatement extends Statement {
  sequences = new Array<SchemaObject>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateViewStatement extends Statement {
  schema?: string
  name = ""
  orReplace = false
  temporary = false
  recursive = false
}

export class AlterViewStatement extends Statement {
  view = new SchemaObject()
  ifExists = false
}

export class DropViewStatement extends Statement {
  views = new Array<SchemaObject>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateMaterializedViewStatement extends Statement {
  schema?: string
  name = ""
}

export class AlterMaterializedViewStatement extends Statement {
  materializedView?: SchemaObject
  tablespace?: string
  ifExists = false
}

export class DropMaterializedViewStatement extends Statement {
  materializedViews = new Array<SchemaObject>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CallableArgument {
  mode: "IN" | "OUT" | "INOUT" | "VARIADIC" = IN
  name?: string
  type = new SchemaObject()
}

export class Callable {
  name = ""
  args = new Array<CallableArgument>()
  orderBy?: Array<CallableArgument>
}

export class CreateProcedureStatement extends Statement {
  schema?: string
  name = ""
  orReplace = false
}

export class AlterProcedureStatement extends Statement {
  procedure = new Callable()
}

export class DropProcedureStatement extends Statement {
  procedures = new Array<Callable>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateFunctionStatement extends Statement {
  schema?: string
  name = ""
  orReplace = false
}

export class AlterFunctionStatement extends Statement {
  function = new Callable()
}

export class DropFunctionStatement extends Statement {
  functions = new Array<Callable>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateAggregateStatement extends Statement {
  schema?: string
  name = ""
  orReplace = false
}

export class AlterAggregateStatement extends Statement {
  aggregate = new Callable()
}

export class DropAggregateStatement extends Statement {
  aggregates = new Array<Callable>()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class AlterRoutineStatement extends Statement {
  routine = new Callable()
}

export class CreateTextSearchConfigurationStatement extends Statement {
  schema?: string
  name = ""
}

export class AlterTextSearchConfigurationStatement extends Statement {
  textSearchConfiguration = new SchemaObject()
}

export class DropTextSearchConfigurationStatement extends Statement {
  textSearchConfiguration = new SchemaObject()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateTextSearchDictionaryStatement extends Statement {
  schema?: string
  name = ""
}

export class AlterTextSearchDictionaryStatement extends Statement {
  textSearchDictionary = new SchemaObject()
}

export class DropTextSearchDictionaryStatement extends Statement {
  textSearchDictionary = new SchemaObject()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateTextSearchParserStatement extends Statement {
  schema?: string
  name = ""
}

export class AlterTextSearchParserStatement extends Statement {
  textSearchParser = new SchemaObject()
}

export class DropTextSearchParserStatement extends Statement {
  textSearchParser = new SchemaObject()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateTextSearchTemplateStatement extends Statement {
  schema?: string
  name = ""
}

export class AlterTextSearchTemplateStatement extends Statement {
  textSearchTemplate = new SchemaObject()
}

export class DropTextSearchTemplateStatement extends Statement {
  textSearchTemplate = new SchemaObject()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
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
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateRuleStatement extends Statement {
  name = ""
  orReplace = false
}

export class AlterRuleStatement extends Statement {
  rule = ""
  table = new SchemaObject()
}

export class DropRuleStatement extends Statement {
  rule = ""
  table = new SchemaObject()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateTriggerStatement extends Statement {
  schema?: string
  name = ""
  constraint = false
}

export class AlterTriggerStatement extends Statement {
  trigger = ""
  table = new SchemaObject()
}

export class DropTriggerStatement extends Statement {
  trigger = ""
  table = new SchemaObject()
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
}

export class CreateIndexStatement extends Statement {
  schema?: string
  name = ""
  type?: "UNIQUE"
}

export class AlterIndexStatement extends Statement {
  tablespace?: string
  index?: SchemaObject
  ifExists = false
}

export class DropIndexStatement extends Statement {
  indexes = new Array<SchemaObject>()
  concurrently = false
  ifExists = false
  dependent: "CASCADE" | "RESTRICT" = RESTRICT
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
  verbose = false
  skipLocked = false
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
