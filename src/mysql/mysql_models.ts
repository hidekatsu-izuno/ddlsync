import Decimal from "decimal.js"
import { Statement, VDatabase } from "../models"
import { bquote, dequote, lcase, squote } from "../util/functions"
import { backslashed, unbackslashed } from "./mysql_utils"

// Common
export const DEFAULT = "DEFAULT"

// User alias
export const CURRENT_USER = "CURRENT_USER"
export const CURRENT_ROLE = "CURRENT_ROLE"

// View Algortihm
export const UNDEFINED = "UNDEFINED"
export const MERGE = "MERGE"
export const TEMPTABLE = "TEMPTABLE"

// Password expire
// export const DEFAULT = "DEFAULT"
export const NEVER = "NEVER"

// Password require current
// export const DEFAULT = "DEFAULT"
export const OPTIONAL = "OPTIONAL"

// Password lock time
export const UNBOUNDED = "UNBOUNDED"

// Transaction characteristic
export const ISOLATION_LEVEL_REPEATABLE_READ = "ISOLATION_LEVEL_REPEATABLE_READ"
export const ISOLATION_LEVEL_READ_COMMITTED = "ISOLATION_LEVEL_READ_COMMITTED"
export const ISOLATION_LEVEL_READ_UNCOMMITTED = "ISOLATION_LEVEL_READ_UNCOMMITTED"
export const ISOLATION_LEVEL_SERIALIZABLE = "ISOLATION_LEVEL_SERIALIZABLE"
export const READ_WRITE = "READ_WRITE"
export const READ_ONLY = "READ_ONLY"

// VariableType
export const GLOBAL = "GLOBAL"
export const SESSION = "SESSION"
export const USER_DEFINED = "USER_DEFINED"

// Concurrency
export const LOW_PRIORITY = "LOW_PRIORITY"
export const DELAYED = "DELAYED"
export const HIGH_PRIORITY = "HIGH_PRIORITY"
export const CONCURRENT = "CONCURRENT"

// Sort Order
export const ASC = "ASC"
export const DESC = "DESC"

// Index type
export const PRIMARY_KEY = "PRIMARY KEY"
export const UNIQUE = "UNIQUE"
export const FULLTEXT = "FULLTEXT"
export const SPATIAL = "SPATIAL"

// Index algorithm
export const BTREE = "BTREE"
export const HASH = "HASH"
export const RTREE = "RTREE"

// Resource group type
export const SYSTEM = "SYSTEM"
export const USER = "USER"

// Conflict action
export const IGNORE = "IGNORE"
export const REPLACE = "REPLACE"

// Insert method
export const NO = "NO"
export const FIRST = "FIRST"
export const LAST = "LAST"

// Row format
export const DYNAMIC = "DYNAMIC"
export const FIXED = "FIXED"
export const COMPRESSED = "COMPRESSED"
export const REDUNDANT = "REDUNDANT"
export const COMPACT = "COMPACT"

// Storage type
export const DISK = "DISK"
export const MEMORY = "MEMORY"

// Sql security
export const DEFINER = "DEFINER"
export const INVOKER = "INVOKER"

// Direction
export const IN = "IN"
export const OUT = "OUT"
export const INOUT = "INOUT"

// Check option
export const CASCADED = "CASCADED"
export const LOCAL = "LOCAL"

// Procedure language
export const SQL = "SQL"

// Procedure characteristic
export const CONTAINS_SQL = "CONTAINS SQL"
export const NO_SQL = "NO SQL"
export const READS_SQL_DATA = "READS SQL DATA"
export const MODIFIES_SQL_DATA = "MODIFIES SQL DATA"

// Trigger order position
export const FOLLOWS = "FOLLOWS"
export const PRECEDES = "PRECEDES"

// Trigger time
export const BEFORE = "BEFORE"
export const AFTER = "AFTER"

// Trigger event
export const INSERT = "INSERT"
export const UPDATE = "UPDATE"
export const DELETE = "DELETE"

// Event disable
export const ON_SLAVE = "ON SLAVE"

// Interval unit
export const YEAR = "YEAR"
export const QUARTER = "QUARTER"
export const MONTH = "MONTH"
export const DAY = "DAY"
export const HOUR = "HOUR"
export const MINUTE = "MINUTE"
export const WEEK = "WEEK"
export const SECOND = "SECOND"
export const YEAR_MONTH = "YEAR_MONTH"
export const DAY_HOUR = "DAY_HOUR"
export const DAY_MINUTE = "DAY_MINUTE"
export const DAY_SECOND = "DAY_SECOND"
export const HOUR_MINUTE = "DAY_SECOND"
export const HOUR_SECOND = "DAY_SECOND"
export const MINUTE_SECOND = "MINUTE_SECOND"

// Index algorithm option
// export const DEFAULT = "DEFAULT"
export const INPLACE = "INPLACE"
export const COPY = "COPY"

// Index lock option
// export const DEFAULT = "DEFAULT"
export const NONE = "NONE"
export const SHARED = "SHARED"
export const EXCLUSIVE = "EXCLUSIVE"

// Collation type
export const BINARY = "BINARY"

// Column format
// export const FIXED = "FIXED"
// export const DYNAMIC = "DYNAMIC"
// export const DEFAULT = "DEFAULT"

// Generated column store type
export const VIRTUAL = "VIRTUAL"
export const STORED = "STORED"

// Match type
export const FULL = "FULL"
export const PARTIAL = "PARTIAL"
export const SIMPLE = "SIMPLE"

// Reference option
export const RESTRICT = "RESTRICT"
export const CASCADE = "CASCADE"
export const SET_NULL = "SET NULL"
export const NO_ACTION = "NO ACTION"
export const SET_DEFAULT = "SET DEFAULT"

// Sequence default value
export const NOMINVALUE = "NOMINVALUE"
export const NOMAXVALUE = "NOMAXVALUE"
export const NOCACHE = "NOCACHE"

export interface IValue {
  value: string
}

export class Text implements IValue {
  text: string
  value: string

  constructor(text: string, isValue = false) {
    if (isValue) {
      this.value = text
    } else {
      this.value = unbackslashed(dequote(text))
    }
    this.text = squote(backslashed(this.value))
  }

  toString() {
    return squote(this.value)
  }
}

export class Numeric implements IValue {
  value: string
  isInteger = false

  constructor(public text: string) {
    if (/^(0|[1-9][0-9]*)$/.test(text)) {
      this.value = text
      this.isInteger = true
    } else {
      this.value = new Decimal(text).toString()
    }
  }

  toString() {
    return this.value
  }
}

export class SessionVariable implements IValue {
  text: string
  value: string

  constructor(text: string, isValue = false) {
    if (isValue) {
      this.value = text
    } else {
      const m = /^@@(.+)$/.exec(text)
      if (m) {
        this.value = unbackslashed(dequote(m[1]))
      } else {
        throw new Error(`Failed to parse session variable: ${text}`)
      }
    }

    if (/^[a-zA-Z0-9$_\u0080-\uFFFF]+$/.test(this.value)) {
      this.text = `@@${this.value}`
    } else {
      this.text = `@@${bquote(this.value)}`
    }
  }

  toString() {
    return this.text
  }
}

export class UserVariable implements IValue {
  text: string
  value: string

  constructor(text: string, isValue = false) {
    if (isValue) {
      this.value = text
    } else {
      const m = /^@(.+)$/.exec(text)
      if (m) {
        this.value = /^['"`]/.test(m[1]) ? unbackslashed(dequote(m[1])) : m[1]
      } else {
        throw new Error(`Failed to parse session variable: ${text}`)
      }
    }

    if (/^[a-zA-Z0-9$_\u0080-\uFFFF]+$/.test(this.value)) {
      this.text = `@${this.value}`
    } else {
      this.text = `@${squote(this.value)}`
    }
  }

  toString() {
    return this.text
  }
}

export class Identity implements IValue {
  text: string
  value: string

  constructor(text: string, isValue = false) {
    if (isValue) {
      this.value = text
    } else if (/^[`"]/.test(text)) {
      this.value = dequote(text)
    } else {
      this.value = lcase(text)
    }
    if (/^[a-zA-Z0-9$_\u0080-\uFFFF]+$/.test(this.value)) {
      this.text = this.value
    } else {
      this.text = bquote(this.value)
    }
  }
}

export class Expression extends Array<IValue> {
  constructor(...elem: Array<IValue>) {
    super(...elem)
  }

  toString() {
    return this.map(elem => elem.toString()).join(" ")
  }
}

export abstract class Constraint {
  name?: string
}

export abstract class Partition {
  num?: Numeric
  subpartition?: Partition
  defs = new Array<PartitionDef>()
}

export class PartitionDef {
  name = ""
  storageEngine?: string
  comment?: Text
  dataDirectory?: Text
  indexDirectory?: Text
  maxRows?: Numeric
  minRows?: Numeric
  tablespace?: Text
  lessThanValues?: Array<Expression | "MAXVALUE">
  inValues?: Array<Expression>
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
  comment?: Text
  encryption?: Text

  process(vdb: VDatabase) {
    const schema = vdb.getSchema(this.name)
    if (schema && !schema.dropped) {
      throw new Error(`database ${this.name} is already in use`)
    }
    return vdb.addSchema(this.name)
  }
}

export class AlterDatabaseStatement extends Statement {
  schema = ""

  process(vdb: VDatabase) {
    const schema = vdb.getSchema(this.schema)
    if (!schema || schema.dropped) {
      throw new Error(`no such database: ${this.schema}`)
    }
    return schema
  }
}

export class DropDatabaseStatement extends Statement {
  schema = ""
  ifExists = false

  process(vdb: VDatabase) {
    const schema = vdb.getSchema(this.schema)
    if (!schema || schema.dropped) {
      throw new Error(`no such database: ${this.schema}`)
    }
    if (schema.system) {
      throw new Error(`cannot drop system database ${this.schema}`)
    }
    schema.dropped = true
    return schema
  }
}

export class UserRole {
  name: string | Text = ""
  host?: UserVariable
  authPlugin?: string
  randowmPassword = false
  asPassword = false
  password?: Text
  discardOldPassword = false
}

export class CreateRoleStatement extends Statement {
  roles = new Array<UserRole>()
  admin?: UserRole
  orReplace = false
  ifNotExists = false

  process(vdb: VDatabase) {
    const roles = []
    for (const role of this.roles) {
      if (role.name instanceof Text) {
        const key = role.host ? `${role.name.value}\0${role.host.value}` : role.name.value
        const vrole = vdb.getUser(key)
        if (vrole) {
          throw new Error(`role ${key} is already in use`)
        }
        roles.push(vdb.addUser(key))
      }
    }
    return roles
  }
}

export class SetDefaultRoleStatement extends Statement {
}

export class SetRoleStatement extends Statement {
}

export class DropRoleStatement extends Statement {
  roles = new Array<UserRole>()
  ifExists = false
}

export class TlsOptions {
  ssl = false
  x509 = false
  issuer?: Expression
  subject?: Expression
  cipher?: Expression
}

export class ResourceOptions {
  maxQueriesPerHour = new Numeric("0")
  maxUpdatesPerHour = new Numeric("0")
  maxConnectionsPerHour = new Numeric("0")
  maxUserConnections = new Numeric("0")
}

export class CreateUserStatement extends Statement {
  users = new Array<UserRole>()
  orReplace = false
  ifNotExists = false
  defaultRoles = new Array<UserRole>()
  tlsOptions?: TlsOptions
  resourceOptions = new ResourceOptions()
  passwordExpire: "DEFAULT" | "NEVER" | Expression | boolean = DEFAULT
  passwordHistory: "DEFAULT" | Numeric = DEFAULT
  passwordReuseInterval: "DEFAULT" | Numeric = DEFAULT
  passwordRequireCurrent: "DEFAULT"  | "OPTIONAL" | boolean = DEFAULT
  failedLoginAttempts = new Numeric("0")
  passwordLockTime: "UNBOUNDED" | Numeric = new Numeric("0")
  accountLock = false
  comment?: Text
  attribute?: Text

  process(vdb: VDatabase) {
    const users = []
    for (const user of this.users) {
      if (user.name instanceof Text) {
        const key = `${user.name.value}@${user.host?.value || "%"}`
        const vrole = vdb.getRole(key)
        if (vrole) {
          throw new Error(`user ${key} is already in use`)
        }
        users.push(vdb.addRole(key))
      }
    }
    return users
  }
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

export class CreateTablespaceStatement extends Statement {
  name = ""
  undo = false
  addDataFile?: Text
  autoextendSize = new Numeric("0")
  fileBlockSize?: Numeric
  encryption?: Text
  useLogfileGroup?: string
  extentSize = new Numeric("1232896")
  initialSize = new Numeric("134217728")
  maxSize?: Numeric
  nodeGroup?: Numeric
  wait = false
  comment?: Text
  engine?: string
  engineAttribute?: Text
}

export class AlterTablespaceStatement extends Statement {
  tablespace = ""
  undo = false
}

export class DropTablespaceStatement extends Statement {
  tablespace = ""
  undo = false
}

export class CreateServerStatement extends Statement {
  name = ""
  orReplace = false
  wrapper = ""
  host?: Text
  database?: Text
  user?: Text
  password?: Text
  socket?: Text
  owner?: Text
  port?: Numeric

  validate() {
    if (this.wrapper === "mysql") {
      if (!this.host && !this.socket) {
        throw new Error(`Can't create federated table. Foreign data src error: either HOST or SOCKET must be set`)
      }
      if (!this.port) {
        this.port = new Numeric("3306")
      }
    } else {
      if (!this.port) {
        this.port = new Numeric("0")
      }
    }
  }
}

export class AlterServerStatement extends Statement {
  server = ""
}

export class DropServerStatement extends Statement {
  server = ""
  ifExists = false
}

export class CreateResourceGroupStatement extends Statement {
  name = ""
  orReplace = false
  type: "SYSTEM" | "USER" = SYSTEM
  vcpu?: Expression
  threadPriority = new Numeric("0")
  disable = false
}

export class AlterResourceGroupStatement extends Statement {
  resourceGroup = ""
}

export class SetResourceGroupStatement extends Statement {
  resourceGroup = ""
}

export class DropResourceGroupStatement extends Statement {
  resourceGroup = ""
  force = false
}

export class CreateLogfileGroupStatement extends Statement {
  name = ""
  undofile = new Text("")
  initialSize?: Numeric
  undoBufferSize?: Numeric
  redoBufferSize?: Numeric
  nodeGroup?: Numeric
  wait = false
  comment?: Text
  engine?: string
}

export class AlterLogfileGroupStatement extends Statement {
  logfileGroup = ""
}

export class DropLogfileGroupStatement extends Statement {
  logfileGroup = ""
  engine = ""
}

export class CreateSpatialReferenceSystemStatement extends Statement {
  srid = new Numeric("0")
  orReplace = false
  ifNotExists = false

  validate() {
    if (!this.srid.isInteger) {
      throw new Error(`Only integers allowed as number here near '${this.srid}'`)
    }
  }
}

export class DropSpatialReferenceSystemStatement extends Statement {
  srid = new Numeric("0")
  ifExists = false
}

export class SchemaObject {
  schema?: string
  name = ""
}

export class LinearHashPartition extends Partition {
  num?: Numeric
  expression = new Expression()
}

export class LinearKeyPartition extends Partition {
  num?: Numeric
  algorithm?: Numeric
  columns = new Array<string>()
}

export class RangePartition extends Partition {
  num?: Numeric
  expression?: Expression
  columns?: Array<string>
}

export class ListPartition extends Partition {
  num?: Numeric
  expression?: Expression
  columns?: Array<string>
}

export class KeyPart {
  expression?: Expression
  column?: string
  sortOrder: "ASC" | "DESC" = ASC
}

export class GeneratedColumn {
  storeType: "VIRTUAL" | "STORED" = VIRTUAL
  expression = new Expression()
}

export class References {
  table = ""
  columns = new Array<string>()
  match?: "FULL" | "PARTIAL" | "SIMPLE"
  onDelete: "RESTRICT" | "CASCADE" | "SET NULL" | "NO ACTION" | "SET DEFAULT" = NO_ACTION
  onUpdate: "RESTRICT" | "CASCADE" | "SET NULL" | "NO ACTION" | "SET DEFAULT" = NO_ACTION
}

export class TableColumn {
  name = ""
  dataType: DataType = new DataType()
  notNull = false
  defaultValue?: Expression
  visible = true
  collate?: string
  autoIncrement = false
  indexType?: "PRIMARY KEY" | "UNIQUE" | "FULLTEXT" | "SPATIAL"
  comment?: Text
  columnFormat?: "FIXED" | "DYNAMIC" | "DEFAULT"
  engineAttribute?: Text
  secondaryEngineAttribute?: Text
  storageType?: "DISK" | "MEMORY"
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
  type?: "PRIMARY KEY" | "UNIQUE" | "FULLTEXT" | "SPATIAL"
  index?: string
  algorithm?: "BTREE" |  "HASH" | "RTREE"
  keyParts = new Array<KeyPart>()
}

export class CheckConstraint extends Constraint {
  expression = new Expression()
  enforced = true
}

export class ForeignKeyConstraint extends Constraint {
  name?: string
  index?: string
  columns = new Array<string>()
  references = new References()
}

export class CreateTableStatement extends Statement {
  schema?: string
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
  conflictAction?: "IGNORE" | "REPLACE"

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "table",
      schema: this.schema,
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
      schema: this.table.schema,
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
      let schemaName = pair.table.schema || vdb.defaultSchema
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
      const newSchema = pair.newTable.schema ? vdb.getSchema(pair.newTable.schema) : schema
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
      schema: this.table.schema,
      name: this.table.name
    })
  }
}

export class DropTableStatement extends Statement {
  tables = new Array<SchemaObject>()
  temporary = false
  ifExists = false
  dropOption: "RESTRICT" | "CASCADE" = CASCADE

  process(vdb: VDatabase) {
    const result = []
    for (const table of this.tables) {
      result.push(processDropStatement(vdb, {
        type: "table",
        schema: table.schema,
        name: table.name,
        ifExists: this.ifExists
      }))
    }
    return result
  }
}

export class CreateSequenceStatement extends Statement {
  schema?: string
  name = ""
  orReplace = false
  temporary = false
  ifNotExists = false
  increment = new Numeric("1")
  minvalue?: "NOMINVALUE" | Numeric
  maxvalue?: "NOMAXVALUE" | Numeric
  start?: Numeric
  cache: "NOCACHE" | Numeric = NOCACHE
  noCycle = false
  tableOptions = new Array<{ key: string, value: any }>()

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "sequence",
      schema: this.schema,
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
        schema: sequence.schema,
        name: sequence.name,
        ifExists: this.ifExists,
      }))
    }
    return result
  }
}

export class IndexColumn {
  expr?: string | Expression
  sortOrder: "ASC" | "DESC" = ASC
}

export class CreateIndexStatement extends Statement {
  schema?: string
  name = ""
  orReplace = false
  ifNotExists = false
  type?: "UNIQUE" | "FULLTEXT" | "SPATIAL"
  algorithm?: "BTREE" |  "HASH" | "RTREE"
  table = new SchemaObject()
  columns = new Array<IndexColumn>()
  indexOptions = new Array<{ key: string, value: any }>()
  algorithmOption: "DEFAULT" | "INPLACE" | "COPY" = DEFAULT
  lockOption: "DEFAULT" | "NONE" | "SHARED" | "EXCLUSIVE" = DEFAULT

  process(vdb: VDatabase) {
    const schemaName = this.schema || vdb.defaultSchema
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

    const tableSchemaName = this.table.schema || vdb.defaultSchema
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
      schema: this.index.schema,
      name: this.index.name,
      ifExists: this.ifExists
    })
  }
}

export class CreateViewStatement extends Statement {
  schema?: string
  name = ""
  orReplace = false
  ifNotExists = false
  algorithm?: "UNDEFINED" | "MERGE" | "TEMPTABLE"
  definer?: UserRole
  sqlSecurity: "DEFINER" | "INVOKER" = DEFINER
  columns?: Array<string>
  checkOption: "CASCADED" | "LOCAL" = CASCADED

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "view",
      schema: this.schema,
      name: this.name,
      ifNotExists: this.ifNotExists
    })
  }
}

export class AlterViewStatement extends Statement {
  view = new SchemaObject()
  algorithm?: "UNDEFINED" | "MERGE" | "TEMPTABLE"
  definer?: UserRole
  sqlSecurity?: "DEFINER" | "INVOKER"

  process(vdb: VDatabase) {
    return processAlterStatement(vdb, {
      type: "view",
      schema: this.view.schema,
      name: this.view.name
    })
  }
}

export class DropViewStatement extends Statement {
  views = new Array<SchemaObject>()
  ifExists = false
  dropOption: "RESTRICT" | "CASCADE" = CASCADE

  process(vdb: VDatabase) {
    const result = []
    for (const view of this.views) {
      result.push(processDropStatement(vdb, {
        type: "view",
        schema: view.schema,
        name: view.name,
        ifExists: this.ifExists,
      }))
    }
    return result
  }
}

export class ProcedureParam {
  direction: "IN" | "OUT" | "INOUT" = IN
  name = ""
  dataType = new DataType()
}

export class CreatePackageStatement extends Statement {
  schema?: string
  name = ""
  orReplace = false
  ifNotExists = false
  definer?: UserRole
  comment?: Text
  sqlSecurity: "DEFINER" | "INVOKER" = DEFINER

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "package",
      schema: this.schema,
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
      schema: this.package.schema,
      name: this.package.name,
      ifExists: this.ifExists,
    })
  }
}

export class CreatePackageBodyStatement extends Statement {
  schema?: string
  name = ""
  orReplace = false
  ifNotExists = false
  definer?: UserRole
  comment?: Text
  sqlSecurity: "DEFINER" | "INVOKER" = DEFINER

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "package body",
      schema: this.schema,
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
      schema: this.packageBody.schema,
      name: this.packageBody.name,
      ifExists: this.ifExists,
    })
  }
}

export class CreateProcedureStatement extends Statement {
  schema?: string
  name = ""
  orReplace = false
  definer?: UserRole
  params = new Array<ProcedureParam>()
  comment?: Text
  language: "SQL" = "SQL"
  deterministic = false
  characteristic: "CONTAINS SQL" | "NO SQL" | "READS SQL DATA" | "MODIFIES SQL DATA" = CONTAINS_SQL
  sqlSecurity: "DEFINER" | "INVOKER" = DEFINER

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "procedure",
      schema: this.schema,
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
      schema: this.procedure.schema,
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
      schema: this.procedure.schema,
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
  schema?: string
  name = ""
  orReplace = false
  definer?: UserRole
  aggregate = false
  ifNotExists = false
  params = new Array<FunctionParam>()
  returnDataType = new DataType()
  comment?: Text
  language: "SQL" = "SQL"
  deterministic = false
  characteristic: "CONTAINS SQL" | "NO SQL" | "READS SQL DATA" | "MODIFIES SQL DATA" = CONTAINS_SQL
  sqlSecurity: "DEFINER" | "INVOKER" = DEFINER

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "function",
      schema: this.schema,
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
      schema: this.function.schema,
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
      schema: this.function.schema,
      name: this.function.name,
      ifExists: this.ifExists,
    })
  }
}

export class TriggerOrder {
  position: "FOLLOWS" | "PRECEDES" = FOLLOWS
  table = ""
}

export class CreateTriggerStatement extends Statement {
  schema?: string
  name = ""
  orReplace = false
  definer?: UserRole
  ifNotExists = false
  triggerTime: "BEFORE" | "AFTER" = BEFORE
  triggerEvent: "INSERT" | "UPDATE" | "DELETE" = INSERT
  table = new SchemaObject()
  triggerOrder?: TriggerOrder

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "function",
      schema: this.schema,
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
      schema: this.trigger.schema,
      name: this.trigger.name,
      ifExists: this.ifExists,
    })
  }
}

export class CreateEventStatement extends Statement {
  schema?: string
  name = ""
  orReplace = false
  definer?: UserRole
  ifNotExists = false
  at?: Expression
  every?: Expression
  starts?: Expression
  ends?: Expression
  onCompletionPreserve = false
  disable: boolean | "ON SLAVE" = false
  comment?: Text

  process(vdb: VDatabase) {
    return processCreateStatement(vdb, {
      type: "event",
      schema: this.schema,
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
      schema: this.event.schema,
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
      schema: this.event.schema,
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
  type?: "GLOBAL" | "SESSION" | "USER_DEFINED"
  characteristic: "ISOLATION_LEVEL_REPEATABLE_READ" | "ISOLATION_LEVEL_READ_COMMITTED" |
    "ISOLATION_LEVEL_READ_UNCOMMITTED" | "ISOLATION_LEVEL_SERIALIZABLE" |
    "READ_WRITE" | "READ_ONLY" = ISOLATION_LEVEL_READ_COMMITTED
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
  prepare = ""
}

export class DeallocatePrepareStatement extends Statement {
  prepare = ""
}

export class AnalyzeTableStatement extends Statement {
  tables = new Array<SchemaObject>()
  noWriteToBinlog = false

  process(vdb: VDatabase) {
    const result = []
    for (const table of this.tables) {
      result.push(processObject(vdb, {
        type: "table",
        schema: table.schema,
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
        schema: table.schema,
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
        schema: index.schema,
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
        schema: table.schema,
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
        schema: table.schema,
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
        schema: table.schema,
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
  schema = ""
}

export class InsertStatement extends Statement {
  table = new SchemaObject()
  concurrency?: "LOW_PRIORITY" | "DELAYED" | "HIGH_PRIORITY"
  conflictAction?: "IGNORE" | "REPLACE"

  process(vdb: VDatabase) {
    return processObject(vdb, {
      type: "table",
      schema: this.table.schema,
      name: this.table.name
    })
  }
}

export class UpdateStatement extends Statement {
  table = new SchemaObject()
  concurrency?: "LOW_PRIORITY"
  conflictAction?: "IGNORE" | "REPLACE"

  process(vdb: VDatabase) {
    return processObject(vdb, {
      type: "table",
      schema: this.table.schema,
      name: this.table.name
    })
  }
}

export class ReplaceStatement extends Statement {
  table = new SchemaObject()
  concurrency?: "LOW_PRIORITY" | "DELAYED"
  conflictAction?: "IGNORE" | "REPLACE"

  process(vdb: VDatabase) {
    return processObject(vdb, {
      type: "table",
      schema: this.table.schema,
      name: this.table.name
    })
  }
}

export class DeleteStatement extends Statement {
  table = new SchemaObject()
  concurrency?: "LOW_PRIORITY"
  quick = false
  conflictAction?: "IGNORE" | "REPLACE"

  process(vdb: VDatabase) {
    return processObject(vdb, {
      type: "table",
      schema: this.table.schema,
      name: this.table.name
    })
  }
}

export class LoadDataStatement extends Statement {
  concurrency?: "LOW_PRIORITY" | "CONCURRENT"
  local = false
}

export class LoadXmlStatement extends Statement {
  concurrency?: "LOW_PRIORITY" | "CONCURRENT"
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
  type?: "GLOBAL" | "SESSION" | "USER_DEFINED"
  name = ""
  value?: Expression
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

function processCreateStatement(vdb: VDatabase, target: {
  type: string,
  schema?: string,
  name: string,
  ifNotExists: boolean
}) {
  const schemaName = target.schema || vdb.defaultSchema
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
  schema?: string,
  name: string,
  newObject?: SchemaObject
}) {
  let schemaName = target.schema || vdb.defaultSchema
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
    const newSchema = target.newObject.schema ? vdb.getSchema(target.newObject.schema) : schema
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
  schema?: string,
  name: string,
  ifExists: boolean
}) {
    const schemaName = target.schema || vdb.defaultSchema
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
  schema?: string,
  name: string,
}) {
  const schemaName = target.schema || vdb.defaultSchema
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
