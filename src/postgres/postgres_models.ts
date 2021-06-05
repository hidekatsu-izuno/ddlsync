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
}

export class CreateExtensionStatement extends Statement {
  name = ""
}

export class AlterExtensionStatement extends Statement {
  extensionName = ""
}

export class DropExtensionStatement extends Statement {
}

export class CreateForeignDataWrapperStatement extends Statement {
  name = ""
}

export class AlterForeignDataWrapperStatement extends Statement {
  foreignDataWrapperName = ""
}

export class DropForeignDataWrapperStatement extends Statement {
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
  procedural = false
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
}

export class CreateSubscriptionStatement extends Statement {
  name = ""
}

export class AlterSubscriptionStatement extends Statement {
}

export class DropSubscriptionStatement extends Statement {
}

export class CreateServerStatement extends Statement {
  name = ""
}

export class AlterServerStatement extends Statement {
  serverName = ""
}

export class DropServerStatement extends Statement {
  serverName = ""
}

export class CreateUserMappingStatement extends Statement {

}

export class AlterUserMappingStatement extends Statement {

}

export class DropUserMappingStatement extends Statement {

}

export class CreateTablespaceStatement extends Statement {
  name = ""
}

export class AlterTablespaceStatement extends Statement {
  tablespaceName = ""
}

export class DropTablespaceStatement extends Statement {
  tablespaceName = ""
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
  name = ""
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
  schemaName = ""
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
  schemaName?: string
  name = ""
}

export class AlterDefaultPrivilegesStatement extends Statement {
  schemaName?: string
  name = ""
  default = false
}

export class CreateConversionStatement extends Statement {
  default = false
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
  schemaName?: string
  name = ""
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
  schemaName?: string
  name = ""
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
  schemaName?: string
  name = ""
}

export class CreateOperatorClassStatement extends Statement {
  schemaName?: string
  name = ""
}

export class AlterOperatorClassStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropOperatorClassStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateStatisticsClassStatement extends Statement {
  schemaName?: string
  name = ""
}

export class AlterStatisticsClassStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropStatisticsClassStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateTableStatement extends Statement {
  schemaName?: string
  name = ""
  temporary = false
  unlogged = false
}

export class AlterTableStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropTableStatement extends Statement {
  schemaName?: string
  name = ""
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
  schemaName?: string
  name = ""
}

export class CreateSequenceStatement extends Statement {
  schemaName?: string
  name = ""
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
  schemaName?: string
  name = ""
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
  schemaName?: string
  name = ""
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
  schemaName?: string
  name = ""
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
  schemaName?: string
  name = ""
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
  schemaName?: string
  name = ""
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
}

export class CreateIndexStatement extends Statement {
  schemaName?: string
  name = ""
  type?: IndexType
}

export class AlterIndexStatement extends Statement {
  schemaName?: string
  name = ""
}

export class DropIndexStatement extends Statement {
  schemaName?: string
  name = ""
}

export enum IndexType {
  UNIQUE = "UNIQUE"
}
