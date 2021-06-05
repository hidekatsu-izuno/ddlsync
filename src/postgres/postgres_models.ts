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

export class CreateCastStatement extends Statement {
}

export class CreateEventTriggerStatement extends Statement {
  name = ""
}

export class CreateExtensionStatement extends Statement {
  name = ""
}

export class CreateForeignDataWrapperStatement extends Statement {
  name = ""
}

export class CreateLanguageStatement extends Statement {
  name = ""
  orReplace = false
}

export class CreateTransformStatement extends Statement {
  name = ""
  orReplace = false
}

export class CreatePublicationStatement extends Statement {
  name = ""
}

export class CreateSubscriptionStatement extends Statement {
  name = ""
}

export class CreateServerStatement extends Statement {
  name = ""
}

export class CreateUserMappingStatement extends Statement {

}

export class CreateTablespaceStatement extends Statement {
  name = ""
}

export class CreateTypeStatement extends Statement {
  name = ""
}

export class CreateRoleStatement extends Statement {
  name = ""
  login = false
}

export class CreateSchemaStatement extends Statement {
  name = ""
}

export class CreateCollationStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateConversionStatement extends Statement {
  schemaName?: string
  name = ""
  default = false
}

export class CreateDomainStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateOperatorStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateOperatorFamilyStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateOperatorClassStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateStatisticsClassStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateTableStatement extends Statement {
  schemaName?: string
  name = ""
  temporary = false
  unlogged = false
}

export class CreateForeignTableStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateSequenceStatement extends Statement {
  schemaName?: string
  name = ""
  temporary = false
}

export class CreateViewStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
  temporary = false
  recursive = false
}

export class CreateMaterializedViewStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateProcedureStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
}

export class CreateFunctionStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
}

export class CreateAggregateStatement extends Statement {
  schemaName?: string
  name = ""
  orReplace = false
}

export class CreateTriggerStatement extends Statement {
  schemaName?: string
  name = ""
  constraint = false
}


export class CreateTextSearchConfigurationStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateTextSearchDictionaryStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateTextSearchParserStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateTextSearchTemplateStatement extends Statement {
  schemaName?: string
  name = ""
}

export class CreateRuleStatement extends Statement {
  name = ""
  orReplace = false
}

export class CreatePolicyStatement extends Statement {
  name = ""
  table = new SchemaObject()
}

export class CreateIndexStatement extends Statement {
  schemaName?: string
  name = ""
  type?: IndexType
}

export enum IndexType {
  UNIQUE = "UNIQUE"
}
