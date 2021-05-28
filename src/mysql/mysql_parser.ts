import Decimal from "decimal.js"
import semver from "semver"
import {
  TokenType,
  Token,
  Lexer,
  Parser,
  ParseError,
  AggregateParseError,
} from "../parser"
import { escapeRegExp, lcase, ucase } from "../util/functions"
import {
  CreateDatabaseStatement,
  AlterDatabaseStatement,
  DropDatabaseStatement,
  CreateServerStatement,
  AlterServerStatement,
  DropServerStatement,
  CreateResourceGroupStatement,
  AlterResourceGroupStatement,
  SetResourceGroupStatement,
  DropResourceGroupStatement,
  CreateLogfileGroupStatement,
  AlterLogfileGroupStatement,
  DropLogfileGroupStatement,
  CreateTablespaceStatement,
  AlterTablespaceStatement,
  DropTablespaceStatement,
  CreateSpatialReferenceSystemStatement,
  DropSpatialReferenceSystemStatement,
  CreateRoleStatement,
  SetDefaultRoleStatement,
  DropRoleStatement,
  CreateUserStatement,
  AlterUserStatement,
  RenameUserStatement,
  DropUserStatement,
  CreateTableStatement,
  AlterTableStatement,
  RenameTableStatement,
  DropTableStatement,
  CreateIndexStatement,
  DropIndexStatement,
  CreateViewStatement,
  AlterViewStatement,
  DropViewStatement,
  CreateProcedureStatement,
  AlterProcedureStatement,
  DropProcedureStatement,
  CreateFunctionStatement,
  AlterFunctionStatement,
  DropFunctionStatement,
  CreateTriggerStatement,
  DropTriggerStatement,
  CreateEventStatement,
  AlterEventStatement,
  DropEventStatement,
  TruncateTableStatement,
  StartTransactionStatement,
  BeginStatement,
  SetTransactionStatement,
  SavepointStatement,
  ReleaseSavepointStatement,
  CommitStatement,
  RollbackStatement,
  LockTableStatement,
  UnlockTableStatement,
  XaStartStatement,
  XaBeginStatement,
  XaEndStatement,
  XaPrepareStatement,
  XaCommitStatement,
  XaRollbackStatement,
  XaRecoverStatement,
  PurgeBinaryLogsStatement,
  ResetMasterStatement,
  ChangeMasterStatement,
  ResetSlaveStatement,
  StartSlaveStatement,
  StopSlaveStatement,
  AnalyzeTableStatement,
  CheckTableStatement,
  ChecksumTableStatement,
  OptimizeTableStatement,
  RepairTableStatement,
  InstallPluginStatement,
  UninstallPluginStatement,
  GrantStatement,
  RevokeStatement,
  ExplainStatement,
  UseStatement,
  LoadDataInfileStatement,
  LoadXmlInfileStatement,
  InsertStatement,
  UpdateStatement,
  ReplaceStatement,
  DeleteStatement,
  SetRoleStatement,
  SetPasswordStatement,
  SetCharacterSetStatement,
  SetNamesStatement,
  SetStatement,
  CallStatement,
  PrepareStatement,
  ExecuteStatement,
  DeallocatePrepareStatement,
  SelectStatement,
  DoStatement,
  HandlerStatement,
  ShowStatement,
  HelpStatement,
  BinlogStatement,
  CacheIndexStatement,
  FlushStatement,
  KillStatement,
  LoadIndexIntoCacheStatement,
  ResetStatement,
  OtherStatement,
  Algortihm,
  TableStatement,
  VariableAssignment,
  VariableType,
  Concurrency,
  TransactionCharacteristic,
  IndexType,
  CommandStatement,
  ResourceGroupType,
  RoleDef,
  UserDef,
  TlsOption,
  ConflictAction,
  InsertMethod,
  RowFormat,
  StorageType,
} from "./mysql_models"


const KeywordMap = new Map<string, Keyword>()
export class Keyword extends TokenType {
  static ACCESSIBLE = new Keyword("ACCESSIBLE", { reserved: true })
  static ADD = new Keyword("ADD", { reserved: true })
  static AGGREGATE = new Keyword("AGGREGATE")
  static ALGORITHM = new Keyword("ALGORITHM")
  static ALL = new Keyword("ALL", { reserved: true })
  static ALTER = new Keyword("ALTER", { reserved: true })
  static ANALYSE = new Keyword("ANALYSE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies("<8.0.0", options.version || "0")
  } })
  static ANALYZE = new Keyword("ANALYZE", { reserved: true })
  static AND = new Keyword("AND", { reserved: true })
  static AS = new Keyword("AS", { reserved: true })
  static ASC = new Keyword("ASC", { reserved: true })
  static ASENSITIVE = new Keyword("ASENSITIVE", { reserved: true })
  static AUTO_INCREMENT = new Keyword("AUTO_INCREMENT")
  static AUTOEXTEND_SIZE = new Keyword("AUTOEXTEND_SIZE")
  static AVG_ROW_LENGTH = new Keyword("AVG_ROW_LENGTH")
  static BEFORE = new Keyword("BEFORE", { reserved: true })
  static BEGIN = new Keyword("BEGIN")
  static BETWEEN = new Keyword("BETWEEN", { reserved: true })
  static BIGINT = new Keyword("BIGINT", { reserved: true })
  static BINARY = new Keyword("BINARY", { reserved: true })
  static BINLOG = new Keyword("BINLOG")
  static BLOB = new Keyword("BLOB", { reserved: true })
  static BOTH = new Keyword("BOTH", { reserved: true })
  static BY = new Keyword("BY", { reserved: true })
  static CALL = new Keyword("CALL", { reserved: true })
  static CACHE = new Keyword("CACHE")
  static CASCADE = new Keyword("CASCADE", { reserved: true })
  static CASE = new Keyword("CASE", { reserved: true })
  static CHANGE = new Keyword("CHANGE", { reserved: true })
  static CHAR = new Keyword("CHAR", { reserved: true })
  static CHARACTER = new Keyword("CHARACTER", { reserved: true })
  static CHARSET = new Keyword("CHARSET")
  static CHECK = new Keyword("CHECK", { reserved: true })
  static CHECKSUM = new Keyword("CHECKSUM")
  static CIPHER = new Keyword("CIPHER")
  static COLLATE = new Keyword("COLLATE", { reserved: true })
  static COLUMN = new Keyword("COLUMN", { reserved: true })
  static COMMENT = new Keyword("COMMENT")
  static COMMIT = new Keyword("COMMIT")
  static COMMITTED = new Keyword("COMMITTED")
  static COMPACT = new Keyword("COMPACT")
  static COMPRESSED = new Keyword("COMPRESSED")
  static COMPRESSION = new Keyword("COMPRESSION")
  static CONCURRENT = new Keyword("CONCURRENT")
  static CONDITION = new Keyword("CONDITION", { reserved: true })
  static CONNECTION = new Keyword("CONNECTION")
  static CONSTRAINT = new Keyword("CONSTRAINT", { reserved: true })
  static CONTINUE = new Keyword("CONTINUE", { reserved: true })
  static CONVERT = new Keyword("CONVERT", { reserved: true })
  static CREATE = new Keyword("CREATE", { reserved: true })
  static CROSS = new Keyword("CROSS", { reserved: true })
  static CUBE = new Keyword("CUBE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.1", options.version || "0")
  } })
  static CUME_DIST = new Keyword("CUME_DIST", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static CURRENT_DATE = new Keyword("CURRENT_DATE", { reserved: true })
  static CURRENT_TIME = new Keyword("CURRENT_TIME", { reserved: true })
  static CURRENT_TIMESTAMP = new Keyword("CURRENT_TIMESTAMP", { reserved: true })
  static CURRENT_USER = new Keyword("CURRENT_USER", { reserved: true })
  static CURSOR = new Keyword("CURSOR", { reserved: true })
  static DATA = new Keyword("DATA")
  static DATABASE = new Keyword("DATABASE", { reserved: true })
  static DATABASES = new Keyword("DATABASES", { reserved: true })
  static DATAFILE = new Keyword("DATAFILE")
  static DAY_HOUR = new Keyword("DAY_HOUR", { reserved: true })
  static DAY_MICROSECOND = new Keyword("DAY_MICROSECOND", { reserved: true })
  static DAY_MINUTE = new Keyword("DAY_MINUTE", { reserved: true })
  static DAY_SECOND = new Keyword("DAY_SECOND", { reserved: true })
  static DEALLOCATE = new Keyword("DEALLOCATE")
  static DEC = new Keyword("DEC", { reserved: true })
  static DECIMAL = new Keyword("DECIMAL", { reserved: true })
  static DECLARE = new Keyword("DECLARE", { reserved: true })
  static DEFAULT = new Keyword("DEFAULT", { reserved: true })
  static DEFINER = new Keyword("DEFINER")
  static DELAYED = new Keyword("DELAYED", { reserved: true })
  static DELAY_KEY_WRITE = new Keyword("DELAY_KEY_WRITE")
  static DELETE = new Keyword("DELETE", { reserved: true })
  static DENSE_RANK = new Keyword("DENSE_RANK", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static DESC = new Keyword("DESC", { reserved: true })
  static DESCRIBE = new Keyword("DESCRIBE", { reserved: true })
  static DES_KEY_FILE = new Keyword("DES_KEY_FILE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies("<8.0.0", options.version || "0")
  } })
  static DETERMINISTIC = new Keyword("DETERMINISTIC", { reserved: true })
  static DICTIONARY = new Keyword("DICTIONARY")
  static DISABLE = new Keyword("DISABLE")
  static DISK = new Keyword("DISK")
  static DISTINCT = new Keyword("DISTINCT", { reserved: true })
  static DISTINCTROW = new Keyword("DISTINCTROW", { reserved: true })
  static DIV = new Keyword("DIV", { reserved: true })
  static DO = new Keyword("DO")
  static DOUBLE = new Keyword("DOUBLE", { reserved: true })
  static DROP = new Keyword("DROP", { reserved: true })
  static DUAL = new Keyword("DUAL", { reserved: true })
  static DYNAMIC = new Keyword("DYNAMIC")
  static EACH = new Keyword("EACH", { reserved: true })
  static ELSE = new Keyword("ELSE", { reserved: true })
  static ELSEIF = new Keyword("ELSEIF", { reserved: true })
  static EMPTY = new Keyword("EMPTY", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.4", options.version || "0")
  } })
  static ENABLE = new Keyword("ENABLE")
  static ENCLOSED = new Keyword("ENCLOSED", { reserved: true })
  static ENCRYPTION = new Keyword("ENCRYPTION")
  static END = new Keyword("END")
  static ENGINE = new Keyword("ENGINE")
  static ENGINE_ATTRIBUTE = new Keyword("ENGINE_ATTRIBUTE")
  static ESCAPED = new Keyword("ESCAPED", { reserved: true })
  static EVENT = new Keyword("EVENT")
  static EXCEPT = new Keyword("EXCEPT", { reserved: true })
  static EXECUTE = new Keyword("EXECUTE")
  static EXISTS = new Keyword("EXISTS", { reserved: true })
  static EXIT = new Keyword("EXIT", { reserved: true })
  static EXPLAIN = new Keyword("EXPLAIN", { reserved: true })
  static EXTENT_SIZE = new Keyword("EXTENT_SIZE")
  static FALSE = new Keyword("FALSE", { reserved: true })
  static FETCH = new Keyword("FETCH", { reserved: true })
  static FILE_BLOCK_SIZE = new Keyword("FILE_BLOCK_SIZE")
  static FIRST = new Keyword("FIRST")
  static FIRST_VALUE = new Keyword("FIRST_VALUE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static FIXED = new Keyword("FIXED")
  static FLOAT = new Keyword("FLOAT", { reserved: true })
  static FLUSH = new Keyword("FLUSH")
  static FOR = new Keyword("FOR", { reserved: true })
  static FORCE = new Keyword("FORCE", { reserved: true })
  static FOREIGN = new Keyword("FOREIGN", { reserved: true })
  static FROM = new Keyword("FROM", { reserved: true })
  static FULLTEXT = new Keyword("FULLTEXT", { reserved: true })
  static FUNCTION = new Keyword("FUNCTION", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.1", options.version || "0")
  } })
  static GENERATED = new Keyword("GENERATED", { reserved: true })
  static GET = new Keyword("GET", { reserved: true })
  static GLOBAL = new Keyword("GLOBAL")
  static GRANT = new Keyword("GRANT", { reserved: true })
  static GROUP = new Keyword("GROUP", { reserved: true })
  static GROUPING = new Keyword("GROUPING", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.1", options.version || "0")
  } })
  static GROUPS = new Keyword("GROUPS", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static HANDLER = new Keyword("HANDLER")
  static HASH = new Keyword("HASH")
  static HAVING = new Keyword("HAVING", { reserved: true })
  static HELP = new Keyword("HELP")
  static HIGH_PRIORITY = new Keyword("HIGH_PRIORITY", { reserved: true })
  static HOUR_MICROSECOND = new Keyword("HOUR_MICROSECOND", { reserved: true })
  static HOUR_MINUTE = new Keyword("HOUR_MINUTE", { reserved: true })
  static HOUR_SECOND = new Keyword("HOUR_SECOND", { reserved: true })
  static HOST = new Keyword("HOST")
  static IDENTIFIED = new Keyword("IDENTIFIED")
  static IF = new Keyword("IF", { reserved: true })
  static IGNORE = new Keyword("IGNORE", { reserved: true })
  static IMPORT = new Keyword("IMPORT")
  static IN = new Keyword("IN", { reserved: true })
  static INDEX = new Keyword("INDEX", { reserved: true })
  static INFILE = new Keyword("INFILE", { reserved: true })
  static INITIAL_SIZE = new Keyword("INITIAL_SIZE")
  static INNER = new Keyword("INNER", { reserved: true })
  static INOUT = new Keyword("INOUT", { reserved: true })
  static INSENSITIVE = new Keyword("INSENSITIVE", { reserved: true })
  static INSERT = new Keyword("INSERT", { reserved: true })
  static INSERT_METHOD = new Keyword("INSERT_METHOD")
  static INSTANCE = new Keyword("INSTANCE")
  static INSTALL = new Keyword("INSTALL")
  static INT = new Keyword("INT", { reserved: true })
  static INTEGER = new Keyword("INTEGER", { reserved: true })
  static INTERVAL = new Keyword("INTERVAL", { reserved: true })
  static INTO = new Keyword("INTO", { reserved: true })
  static INVOKER = new Keyword("INVOKER")
  static IO_AFTER_GTIDS = new Keyword("IO_AFTER_GTIDS", { reserved: true })
  static IO_BEFORE_GTIDS = new Keyword("IO_BEFORE_GTIDS", { reserved: true })
  static IS = new Keyword("IS", { reserved: true })
  static ISOLATION = new Keyword("ISOLATION")
  static ISSUER = new Keyword("ISSUER")
  static ITERATE = new Keyword("ITERATE", { reserved: true })
  static JOIN = new Keyword("JOIN", { reserved: true })
  static JSON_TABLE = new Keyword("JSON_TABLE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.4", options.version || "0")
  } })
  static KEY = new Keyword("KEY", { reserved: true })
  static KEY_BLOCK_SIZE = new Keyword("KEY_BLOCK_SIZE")
  static KEYS = new Keyword("KEYS", { reserved: true })
  static KILL = new Keyword("KILL", { reserved: true })
  static LAG = new Keyword("LAG", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static LAST = new Keyword("LAST")
  static LAST_VALUE = new Keyword("LAST_VALUE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static LATERAL = new Keyword("LATERAL", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.14", options.version || "0")
  } })
  static LEAD = new Keyword("LEAD", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static LEADING = new Keyword("LEADING", { reserved: true })
  static LEAVE = new Keyword("LEAVE", { reserved: true })
  static LEFT = new Keyword("LEFT", { reserved: true })
  static LEVEL = new Keyword("LEVEL")
  static LIKE = new Keyword("LIKE", { reserved: true })
  static LIMIT = new Keyword("LIMIT", { reserved: true })
  static LINEAR = new Keyword("LINEAR", { reserved: true })
  static LINES = new Keyword("LINES", { reserved: true })
  static LIST = new Keyword("LIST")
  static LOAD = new Keyword("LOAD", { reserved: true })
  static LOCAL = new Keyword("LOCAL")
  static LOCALTIME = new Keyword("LOCALTIME", { reserved: true })
  static LOCALTIMESTAMP = new Keyword("LOCALTIMESTAMP", { reserved: true })
  static LOCK = new Keyword("LOCK", { reserved: true })
  static LOGFILE = new Keyword("LOGFILE")
  static LOGS = new Keyword("LOGS")
  static LONG = new Keyword("LONG", { reserved: true })
  static LONGBLOB = new Keyword("LONGBLOB", { reserved: true })
  static LONGTEXT = new Keyword("LONGTEXT", { reserved: true })
  static LOOP = new Keyword("LOOP", { reserved: true })
  static LOW_PRIORITY = new Keyword("LOW_PRIORITY", { reserved: true })
  static MASTER = new Keyword("MASTER")
  static MASTER_BIND = new Keyword("MASTER_BIND", { reserved: true })
  static MASTER_SERVER_ID = new Keyword("MASTER_SERVER_ID", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies("<8.0.0", options.version || "0")
  } })
  static MASTER_SSL_VERIFY_SERVER_CERT = new Keyword("MASTER_SSL_VERIFY_SERVER_CERT", { reserved: true })
  static MATCH = new Keyword("MATCH", { reserved: true })
  static MAX_ROWS = new Keyword("MAX_ROWS")
  static MAX_SIZE = new Keyword("MAX_SIZE")
  static MAXVALUE = new Keyword("MAXVALUE", { reserved: true })
  static MEDIUMBLOB = new Keyword("MEDIUMBLOB", { reserved: true })
  static MEDIUMINT = new Keyword("MEDIUMINT", { reserved: true })
  static MEDIUMTEXT = new Keyword("MEDIUMTEXT", { reserved: true })
  static MEMORY = new Keyword("MEMORY")
  static MERGE = new Keyword("MERGE")
  static MIDDLEINT = new Keyword("MIDDLEINT", { reserved: true })
  static MIN_ROWS = new Keyword("MIN_ROWS")
  static MINUTE_MICROSECOND = new Keyword("MINUTE_MICROSECOND", { reserved: true })
  static MINUTE_SECOND = new Keyword("MINUTE_SECOND", { reserved: true })
  static MOD = new Keyword("MOD", { reserved: true })
  static MODIFIES = new Keyword("MODIFIES", { reserved: true })
  static NAMES = new Keyword("NAMES")
  static NONE = new Keyword("NONE")
  static NATURAL = new Keyword("NATURAL", { reserved: true })
  static NO = new Keyword("NO")
  static NOT = new Keyword("NOT", { reserved: true })
  static NO_WRITE_TO_BINLOG = new Keyword("NO_WRITE_TO_BINLOG", { reserved: true })
  static NODEGROUP = new Keyword("NODEGROUP")
  static NTH_VALUE = new Keyword("NTH_VALUE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static NTILE = new Keyword("NTILE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static NULL = new Keyword("NULL", { reserved: true })
  static NUMERIC = new Keyword("NUMERIC", { reserved: true })
  static OF = new Keyword("OF", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.1", options.version || "0")
  } })
  static ON = new Keyword("ON", { reserved: true })
  static ONLY = new Keyword("ONLY")
  static OPTIMIZE = new Keyword("OPTIMIZE", { reserved: true })
  static OPTIMIZER_COSTS = new Keyword("OPTIMIZER_COSTS", { reserved: true })
  static OPTION = new Keyword("OPTION", { reserved: true })
  static OPTIONS = new Keyword("OPTIONS")
  static OPTIONALLY = new Keyword("OPTIONALLY", { reserved: true })
  static OR = new Keyword("OR", { reserved: true })
  static ORDER = new Keyword("ORDER", { reserved: true })
  static OUT = new Keyword("OUT", { reserved: true })
  static OUTER = new Keyword("OUTER", { reserved: true })
  static OUTFILE = new Keyword("OUTFILE", { reserved: true })
  static OVER = new Keyword("OVER", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static OWNER = new Keyword("OWNER")
  static PACK_KEYS = new Keyword("PACK_KEYS")
  static PARSE_GCOL_EXPR = new Keyword("PARSE_GCOL_EXPR", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies("<8.0.0", options.version || "0")
  } })
  static PARTITION = new Keyword("PARTITION", { reserved: true })
  static PARTITIONS = new Keyword("PARTITIONS")
  static PASSWORD = new Keyword("PASSWORD")
  static PERCENT_RANK = new Keyword("PERCENT_RANK", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static PLUGIN = new Keyword("PLUGIN")
  static PORT = new Keyword("PORT")
  static PRECISION = new Keyword("PRECISION", { reserved: true })
  static PREPARE = new Keyword("PREPARE")
  static PRIMARY = new Keyword("PRIMARY", { reserved: true })
  static PROCEDURE = new Keyword("PROCEDURE", { reserved: true })
  static PURGE = new Keyword("PURGE", { reserved: true })
  static QUICK = new Keyword("QUICK")
  static RANDOM = new Keyword("RANDOM")
  static RANGE = new Keyword("RANGE", { reserved: true })
  static RANK = new Keyword("RANK", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static READ = new Keyword("READ", { reserved: true })
  static READS = new Keyword("READS", { reserved: true })
  static READ_WRITE = new Keyword("READ_WRITE", { reserved: true })
  static REAL = new Keyword("REAL", { reserved: true })
  static RECOVER = new Keyword("RECOVER")
  static RECURSIVE = new Keyword("RECURSIVE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.1", options.version || "0")
  } })
  static REDO_BUFFER_SIZE = new Keyword("REDO_BUFFER_SIZE")
  static REDOFILE = new Keyword("REDOFILE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies("<8.0.0", options.version || "0")
  } })
  static REDUNDANT = new Keyword("REDUNDANT")
  static REFERENCE = new Keyword("REFERENCE")
  static REFERENCES = new Keyword("REFERENCES", { reserved: true })
  static REGEXP = new Keyword("REGEXP", { reserved: true })
  static RELEASE = new Keyword("RELEASE", { reserved: true })
  static RENAME = new Keyword("RENAME", { reserved: true })
  static REPEAT = new Keyword("REPEAT", { reserved: true })
  static REPEATABLE = new Keyword("REPEATABLE")
  static REPAIR = new Keyword("REPAIR")
  static REPLACE = new Keyword("REPLACE", { reserved: true })
  static REQUIRE = new Keyword("REQUIRE", { reserved: true })
  static RESET = new Keyword("RESET")
  static RESIGNAL = new Keyword("RESIGNAL", { reserved: true })
  static RESOURCE = new Keyword("RESOURCE")
  static RESTRICT = new Keyword("RESTRICT", { reserved: true })
  static RETURN = new Keyword("RETURN", { reserved: true })
  static REVOKE = new Keyword("REVOKE", { reserved: true })
  static RIGHT = new Keyword("RIGHT", { reserved: true })
  static RLIKE = new Keyword("RLIKE", { reserved: true })
  static ROLE = new Keyword("ROLE")
  static ROLLBACK = new Keyword("ROLLBACK")
  static ROW = new Keyword("ROW", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static ROW_FORMAT = new Keyword("ROW_FORMAT")
  static ROWS = new Keyword("ROWS", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static ROW_NUMBER = new Keyword("ROW_NUMBER", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static SAVEPOINT = new Keyword("SAVEPOINT")
  static SECURITY = new Keyword("SECURITY")
  static SCHEMA = new Keyword("SCHEMA", { reserved: true })
  static SCHEMAS = new Keyword("SCHEMAS", { reserved: true })
  static SECOND_MICROSECOND = new Keyword("SECOND_MICROSECOND", { reserved: true })
  static SECONDARY_ENGINE_ATTRIBUTE = new Keyword("SECONDARY_ENGINE_ATTRIBUTE")
  static SELECT = new Keyword("SELECT", { reserved: true })
  static SENSITIVE = new Keyword("SENSITIVE", { reserved: true })
  static SEPARATOR = new Keyword("SEPARATOR", { reserved: true })
  static SERIALIZABLE = new Keyword("SERIALIZABLE")
  static SERVER = new Keyword("SERVER")
  static SESSION = new Keyword("SESSION")
  static SET = new Keyword("SET", { reserved: true })
  static SHOW = new Keyword("SHOW", { reserved: true })
  static SIGNAL = new Keyword("SIGNAL", { reserved: true })
  static SLAVE = new Keyword("SLAVE")
  static SMALLINT = new Keyword("SMALLINT", { reserved: true })
  static SOCKET = new Keyword("SOCKET")
  static SPATIAL = new Keyword("SPATIAL", { reserved: true })
  static SPECIFIC = new Keyword("SPECIFIC", { reserved: true })
  static SQL = new Keyword("SQL", { reserved: true })
  static SQLEXCEPTION = new Keyword("SQLEXCEPTION", { reserved: true })
  static SQLSTATE = new Keyword("SQLSTATE", { reserved: true })
  static SQLWARNING = new Keyword("SQLWARNING", { reserved: true })
  static SQL_BIG_RESULT = new Keyword("SQL_BIG_RESULT", { reserved: true })
  static SQL_CACHE = new Keyword("SQL_CACHE", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies("<8.0.0", options.version || "0")
  } })
  static SQL_CALC_FOUND_ROWS = new Keyword("SQL_CALC_FOUND_ROWS", { reserved: true })
  static SQL_SMALL_RESULT = new Keyword("SQL_SMALL_RESULT", { reserved: true })
  static SSL = new Keyword("SSL", { reserved: true })
  static START = new Keyword("START")
  static STARTING = new Keyword("STARTING", { reserved: true })
  static STATS_AUTO_RECALC = new Keyword("STATS_AUTO_RECALC")
  static STATS_PERSISTENT = new Keyword("STATS_PERSISTENT")
  static STATS_SAMPLE_PAGES = new Keyword("STATS_SAMPLE_PAGES")
  static STOP = new Keyword("STOP")
  static STORAGE = new Keyword("STORAGE")
  static STORED = new Keyword("STORED", { reserved: true })
  static STRAIGHT_JOIN = new Keyword("STRAIGHT_JOIN", { reserved: true })
  static SUBJECT = new Keyword("SUBJECT")
  static SUBPARTITION = new Keyword("SUBPARTITION")
  static SYSTEM = new Keyword("SYSTEM", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.3", options.version || "0")
  } })
  static TABLE = new Keyword("TABLE", { reserved: true })
  static TABLESPACE = new Keyword("TABLESPACE")
  static TEMPORARY = new Keyword("TEMPORARY")
  static TEMPTABLE = new Keyword("TEMPTABLE")
  static TERMINATED = new Keyword("TERMINATED", { reserved: true })
  static THEN = new Keyword("THEN", { reserved: true })
  static THREAD_PRIORITY = new Keyword("THREAD_PRIORITY")
  static TINYBLOB = new Keyword("TINYBLOB", { reserved: true })
  static TINYINT = new Keyword("TINYINT", { reserved: true })
  static TINYTEXT = new Keyword("TINYTEXT", { reserved: true })
  static TO = new Keyword("TO", { reserved: true })
  static TRAILING = new Keyword("TRAILING", { reserved: true })
  static TRANSACTION = new Keyword("TRANSACTION")
  static TRIGGER = new Keyword("TRIGGER", { reserved: true })
  static TRUE = new Keyword("TRUE", { reserved: true })
  static TRUNCATE = new Keyword("TRUNCATE")
  static TYPE = new Keyword("TYPE")
  static UNCOMMITTED = new Keyword("UNCOMMITTED")
  static UNDEFINED = new Keyword("UNDEFINED")
  static UNDO = new Keyword("UNDO", { reserved: true })
  static UNDO_BUFFER_SIZE = new Keyword("UNDO_BUFFER_SIZE")
  static UNDOFILE = new Keyword("UNDOFILE")
  static UNINSTALL = new Keyword("UNINSTALL")
  static UNION = new Keyword("UNION", { reserved: true })
  static UNIQUE = new Keyword("UNIQUE", { reserved: true })
  static UNLOCK = new Keyword("UNLOCK", { reserved: true })
  static UNSIGNED = new Keyword("UNSIGNED", { reserved: true })
  static UPDATE = new Keyword("UPDATE", { reserved: true })
  static USAGE = new Keyword("USAGE", { reserved: true })
  static USE = new Keyword("USE", { reserved: true })
  static USER = new Keyword("USER")
  static USING = new Keyword("USING", { reserved: true })
  static UTC_DATE = new Keyword("UTC_DATE", { reserved: true })
  static UTC_TIME = new Keyword("UTC_TIME", { reserved: true })
  static UTC_TIMESTAMP = new Keyword("UTC_TIMESTAMP", { reserved: true })
  static VALUES = new Keyword("VALUES", { reserved: true })
  static VARBINARY = new Keyword("VARBINARY", { reserved: true })
  static VARCHAR = new Keyword("VARCHAR", { reserved: true })
  static VARCHARACTER = new Keyword("VARCHARACTER", { reserved: true })
  static VARYING = new Keyword("VARYING", { reserved: true })
  static VCPU = new Keyword("VCPU")
  static VIEW = new Keyword("VIEW")
  static VIRTUAL = new Keyword("VIRTUAL", { reserved: true })
  static WAIT = new Keyword("WAIT")
  static WHEN = new Keyword("WHEN", { reserved: true })
  static WHERE = new Keyword("WHERE", { reserved: true })
  static WHILE = new Keyword("WHILE", { reserved: true })
  static WINDOW = new Keyword("WINDOW", { reserved: function(options: { [ key:string]:any}) {
    return semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static WITH = new Keyword("WITH", { reserved: true })
  static WRAPPER = new Keyword("WRAPPER")
  static WRITE = new Keyword("WRITE", { reserved: true })
  static X509 = new Keyword("X509")
  static XA = new Keyword("XA")
  static XML = new Keyword("XML")
  static XOR = new Keyword("XOR", { reserved: true })
  static YEAR_MONTH = new Keyword("YEAR_MONTH", { reserved: true })
  static ZEROFILL = new Keyword("ZEROFILL", { reserved: true })

  static OPE_EQ = new Keyword("=")
  static OPE_COLON_EQ = new Keyword(":=")
  static OPE_PLUS = new Keyword("+")
  static OPE_MINUS = new Keyword("-")

  static VAR_GLOBAL = new Keyword("@@GLOBAL")
  static VAR_SESSION = new Keyword("@@SESSION")
  static VAR_LOCAL = new Keyword("@@LOCAL")

  constructor(
    name: string,
    options: { [key: string]: any } = {}
  ) {
    super(name, options)
    KeywordMap.set(name, this)
  }
}

const COMMAND_PATTERN = "^(\\?|\\\\[!-~]|clear|connect|delimiter|edit|ego|exit|go|help|nopager|notee|pager|print|prompt|quit|rehash|source|status|system|tee|use|charset|warnings|nowarning)(?:[ \\t]*.*?)"

export class MysqlLexer extends Lexer {
  private reserved = new Set<Keyword>()
  private reCommand = new RegExp(COMMAND_PATTERN + "(;|$)", "iy")
  private reDelimiter = new RegExp(";", "y")
  private sqlModes

  constructor(
    private options: { [key: string]: any } = {}
  ) {
    super("mysql", [
      { type: TokenType.HintComment, re: /\/\*\+.*?\*\//sy },
      { type: TokenType.BlockComment, re: /\/\*.*?\*\//sy },
      { type: TokenType.LineComment, re: /(#.*|--([ \t].*)$)/my },
      { type: TokenType.Command, re: () => this.reCommand },
      { type: TokenType.WhiteSpace, re: /[ \t]+/y },
      { type: TokenType.LineBreak, re: /(?:\r\n?|\n)/y },
      { type: TokenType.Delimiter, re: () => this.reDelimiter },
      { type: TokenType.LeftParen, re: /\(/y },
      { type: TokenType.RightParen, re: /\)/y },
      { type: TokenType.Comma, re: /,/y },
      { type: TokenType.Number, re: /0[xX][0-9a-fA-F]+|((0|[1-9][0-9]*)(\.[0-9]+)?|(\.[0-9]+))([eE][+-]?[0-9]+)?/y },
      { type: TokenType.Size, re: /(0|[1-9][0-9]*)[KMG]/iy },
      { type: TokenType.Dot, re: /\./y },
      { type: TokenType.String, re: () => this.sqlModes.has("ANSI_QUOTES") ? /([bBnN]|_[a-zA-Z]+)?'([^']|'')*'/y :  /([bBnN]|_[a-zA-Z]+)?('([^']|'')*'|"([^"]|"")*")/y },
      { type: TokenType.QuotedIdentifier, re: () => this.sqlModes.has("ANSI_QUOTES") ? /"([^"]|"")*"|`([^`]|``)*`/y : /`([^`]|``)*`/y },
      { type: TokenType.BindVariable, re: /\?/y },
      { type: TokenType.SessionVariable, re: /@@[a-zA-Z0-9._$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*|`([^`]|``)*`|'([^']|'')*'|"([^"]|"")*")/y },
      { type: TokenType.UserDefinedVariable, re: /@[a-zA-Z0-9._$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*|`([^`]|``)*`|'([^']|'')*'|"([^"]|"")*")/y },
      { type: TokenType.Identifier, re: /[a-zA-Z_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y },
      { type: TokenType.Operator, re: /\|\|&&|<=>|<<|>>|<>|->>?|[=<>!:]=?|[~&|^*/%+-]/y },
      { type: TokenType.At, re: /@/y },
      { type: TokenType.Error, re: /./y },
    ])

    this.sqlModes = new Set<string>()
    for (const sqlMode of (options.sqlModes || [])) {
      this.sqlModes.add(sqlMode)
    }

    for (const keyword of KeywordMap.values()) {
      if (typeof keyword.options.reserved === "function") {
        if (keyword.options.reserved(options)) {
          this.reserved.add(keyword)
        }
      } else if (keyword.options.reserved === true) {
        this.reserved.add(keyword)
      }
    }
  }

  setDelimiter(delimiter: string) {
    const sep = escapeRegExp(delimiter)
    this.reCommand = new RegExp(`${COMMAND_PATTERN}(?:[ \\t]+.*?)?(${sep}|$)`, "iy")
    this.reDelimiter = new RegExp(sep, "y")
  }

  setSqlModes(modes: string[]) {
    const sqlModes = new Set<string>()
    for (const mode of modes) {
      sqlModes.add(mode)
    }
    this.sqlModes = sqlModes
  }

  protected filter(input: string) {
    return input.replace(/\/\*!(0|[0-9][1-9]*)?(.*?)\*\//sg, (m, p1, p2) => {
      if (this.options.version && p1) {
        if (semver.lt(this.options.version, toSemverString(p1))) {
          return m
        }
      }
      return " ".repeat((p1 ? p1.length : 0) + 2) + p2 + "  "
    })
  }

  protected process(token: Token) {
    if (
      token.type === TokenType.Identifier ||
      token.type === TokenType.Operator ||
      token.type === TokenType.SessionVariable
    ) {
      const keyword = KeywordMap.get(token.text.toUpperCase())
      if (keyword) {
        if (this.reserved.has(keyword)) {
          token.type = keyword
        } else {
          token.subtype = keyword
        }
      }
    }
    return token
  }
}

export class MySqlParser extends Parser {
  constructor(
    input: string,
    options: { [key: string]: any } = {},
  ) {
    super(input, new MysqlLexer(options), options)
  }

  async root() {
    const root = []
    const errors = []
    for (
      let i = 0;
      i === 0 || this.consumeIf(TokenType.Delimiter) ||
      root[root.length - 1] instanceof CommandStatement;
      i++
    ) {
      if (this.consumeIf(TokenType.Command)) {
        const stmt = this.command()
        root.push(stmt)
      } else if (this.peek() && !this.peekIf(TokenType.Delimiter)) {
        try {
          const stmt = this.statement()
          stmt.validate()
          root.push(stmt)
        } catch (e) {
          if (e instanceof ParseError) {
            errors.push(e)

            // skip tokens
            while (this.peek() && !this.peekIf(TokenType.Delimiter)) {
              this.consume()
            }
          } else {
            throw e
          }
        }
      }
    }

    if (this.peek() != null) {
      try {
        throw this.createParseError()
      } catch (e) {
        if (e instanceof ParseError) {
          errors.push(e)
        } else {
          throw e
        }
      }
    }

    if (errors.length) {
      throw new AggregateParseError(errors, `${errors.length} error found`)
    }

    return root
  }

  command() {
    const start = this.pos
    const stmt = new CommandStatement()
    const text = (this.peek()?.text || "").split(/[ \t]/)
    if (/^(?|\\?|[hH][eE][lL][pP])$/.test(text[0])) {
      stmt.name = "help"
    } else if (/^(\\c|[cC][lL][eE][aA][rR])$/.test(text[0])) {
      stmt.name = "clear"
    } else if (/^(\\d|[dD][eE][lL][iI][mM][iI][tT][eE][rR])$/.test(text[0])) {
      stmt.name = "delimiter"
    } else if (/^(\\e|[eE][dD][iI][tT])$/.test(text[0])) {
      stmt.name = "edit"
    } else if (/^(\\G|[eE][gG][oO])$/.test(text[0])) {
      stmt.name = "ego"
    } else if (/^(\\q|[eE][xX][iI][tT])$/.test(text[0])) {
      stmt.name = "exit"
    } else if (/^(\\q|[gG][oO])$/.test(text[0])) {
      stmt.name = "go"
    } else if (/^(\\q|[nN][oO][pP][aA][gG][eE][rR])$/.test(text[0])) {
      stmt.name = "nopager"
    } else if (/^(\\q|[nN][oO][tT][eE][eE])$/.test(text[0])) {
      stmt.name = "notee"
    } else if (/^(\\q|[pP][aA][gG][eE][rR])$/.test(text[0])) {
      stmt.name = "pager"
    } else if (/^(\\q|[pP][rR][iI][nN][tT])$/.test(text[0])) {
      stmt.name = "print"
    } else if (/^(\\q|[pP][rR][oO][mM][pP][tT])$/.test(text[0])) {
      stmt.name = "prompt"
    } else if (/^(\\q|[qQ][uU][iI][tT])$/.test(text[0])) {
      stmt.name = "quit"
    } else if (/^(\\q|[rR][eE][hH][aA][sS][sH])$/.test(text[0])) {
      stmt.name = "rehash"
    } else if (/^(\\q|[sS][oO][uU][rR][cC][eE])$/.test(text[0])) {
      stmt.name = "source"
    } else if (/^(\\q|[sS][tT][aA][tT][uU][sS])$/.test(text[0])) {
      stmt.name = "status"
    } else if (/^(\\q|[sS][yY][sS][tT][eE][mM])$/.test(text[0])) {
      stmt.name = "system"
    } else if (/^(\\q|[tT][eE][eE])$/.test(text[0])) {
      stmt.name = "tee"
    } else if (/^(\\q|[uU][sS][eE])$/.test(text[0])) {
      stmt.name = "use"
    } else if (/^(\\q|[cC][hH][aA][rR][sS][eE][tT])$/.test(text[0])) {
      stmt.name = "charset"
    } else if (/^(\\q|[wW][aA][rR][nN][iI][nN][gG][sS])$/.test(text[0])) {
      stmt.name = "warnings"
    } else if (/^(\\q|[nN][oO][wW][aA][rR][nN][iI][nN][gG])$/.test(text[0])) {
      stmt.name = "nowarning"
    } else {
      throw this.createParseError()
    }

    if (stmt.name === "prompt") {
      stmt.args.push(text[1])
    } else if (
      stmt.name === "help" ||
      stmt.name === "pager" ||
      stmt.name === "prompt" ||
      stmt.name === "source" ||
      stmt.name === "system" ||
      stmt.name === "tee"
    ) {
      const re = /[ \t]+|'(''|[^']+)*'|([^ \t']+)/y
      let pos = 0
      while (pos < text[1].length) {
        re.lastIndex = pos
        const m = re.exec(text[1])
        if (m) {
          if (m[1] || m[2]) {
            stmt.args.push(m[1].replace(/''/g, "'").replace(/\\(.)/g, "$1") || m[2])
          }
          pos = re.lastIndex
        }
      }
    } else if (
      stmt.name === "connect" ||
      stmt.name === "delimiter" ||
      stmt.name === "use" ||
      stmt.name === "charset"
    ) {
      const re = /[ \t]+|'(''|[^']+)*'|`(``|[^`]+)*`|([^ \t']+)/y
      let pos = 0
      while (pos < text[1].length) {
        re.lastIndex = pos
        const m = re.exec(text[1])
        if (m) {
          if (m[1] || m[2] || m[3]) {
            stmt.args.push(m[1].replace(/''/g, "'").replace(/\\(.)/g, "$1") ||
              m[2].replace(/``/g, "`") ||
              m[3])
          }
          pos = re.lastIndex
        }
      }
    } else {
      throw this.createParseError()
    }

    if (stmt.name === "delimiter") {
      const lexer = this.lexer as MysqlLexer
      lexer.setDelimiter(stmt.args[0])
    }

    this.consume()
    stmt.tokens = this.tokens.slice(start, this.pos)
    return stmt
  }

  statement() {
    const start = this.pos

    let stmt
    if (this.consumeIf(Keyword.CREATE)) {
      if (this.consumeIf(Keyword.DATABASE) || this.consumeIf(Keyword.SCHEMA)) {
        stmt = new CreateDatabaseStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.NOT)
          this.consume(Keyword.EXISTS)
          stmt.ifNotExists = true
        }
      } else if (this.consumeIf(Keyword.SERVER)) {
        stmt = new CreateServerStatement()
      } else if (this.consumeIf(Keyword.RESOURCE)) {
        stmt = new CreateResourceGroupStatement()
        this.consume(Keyword.GROUP)
      } else if (this.consumeIf(Keyword.LOGFILE)) {
        this.consume(Keyword.GROUP)
        stmt = new CreateLogfileGroupStatement()
      } else if (this.peekIf(Keyword.UNDO) || this.peekIf(Keyword.TABLESPACE)) {
        stmt = new CreateTablespaceStatement()
        if (this.consumeIf(Keyword.UNDO)) {
          stmt.undo = true
        }
        this.consume(Keyword.TABLESPACE)
      } else if (this.consumeIf(Keyword.ROLE)) {
        stmt = new CreateRoleStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.NOT)
          this.consume(Keyword.EXISTS)
          stmt.ifNotExists = true
        }
      } else if (this.consumeIf(Keyword.USER)) {
        stmt = new CreateUserStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.NOT)
          this.consume(Keyword.EXISTS)
          stmt.ifNotExists = true
        }
      } else if (this.peekIf(Keyword.TEMPORARY) || this.peekIf(Keyword.TABLE)) {
        stmt = new CreateTableStatement()
        if (this.consumeIf(Keyword.TEMPORARY)) {
          stmt.temporary = true
        }
        this.consume(Keyword.TABLE)
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.NOT)
          this.consume(Keyword.EXISTS)
          stmt.ifNotExists = true
        }
      } else if (this.peekIf(Keyword.UNIQUE) || this.peekIf(Keyword.FULLTEXT) || this.peekIf(Keyword.INDEX)) {
        stmt = new CreateIndexStatement()
        if (this.consumeIf(Keyword.UNIQUE)) {
          stmt.type = IndexType.UNIQUE
        } else if (this.consumeIf(Keyword.FULLTEXT)) {
          stmt.type = IndexType.FULLTEXT
        }
      } else {
        let orReplace = false
        if (this.consumeIf(Keyword.OR)) {
          this.consume(Keyword.REPLACE)
          orReplace = true
        }

        let algorithm
        if (this.consumeIf(Keyword.ALGORITHM)) {
          this.consume(Keyword.OPE_EQ)
          if (this.consumeIf(Keyword.UNDEFINED)) {
            algorithm = Algortihm.UNDEFINED
          } else if (this.consumeIf(Keyword.MERGE)) {
            algorithm = Algortihm.MERGE
          } else if (this.consumeIf(Keyword.TEMPTABLE)) {
            algorithm = Algortihm.TEMPTABLE
          } else {
            throw this.createParseError()
          }
        }

        let definer
        let aggregate = false
        if (this.consumeIf(Keyword.DEFINER)) {
          this.consume(Keyword.OPE_EQ)
          definer = this.consume(TokenType.String).text
        } else if (this.consumeIf(Keyword.AGGREGATE)) {
          aggregate = true
        }

        let sqlSecurityDefiner
        let sqlSecurityInvoker
        if (this.consumeIf(Keyword.SQL)) {
          this.consume(Keyword.SECURITY)
          if (this.peekIf(Keyword.DEFINER)) {
            sqlSecurityDefiner = this.consume().text
          } else if (this.peekIf(Keyword.INVOKER)) {
            sqlSecurityInvoker = this.consume().text
          } else {
            throw this.createParseError()
          }
        }

        if (
          !aggregate &&
          this.consumeIf(Keyword.VIEW)
        ) {
          stmt = new CreateViewStatement()
          stmt.orReplace = orReplace
          stmt.algorithm = algorithm
          stmt.definer = definer
          stmt.sqlSecurityDefiner = sqlSecurityDefiner
          stmt.sqlSecurityInvoker = sqlSecurityInvoker
        } else if (
          !orReplace && !algorithm && !aggregate &&!sqlSecurityDefiner && !sqlSecurityInvoker &&
          this.consumeIf(Keyword.PROCEDURE)
        ) {
          stmt = new CreateProcedureStatement()
          stmt.definer = definer
        } else if (
          !orReplace && !algorithm && !sqlSecurityDefiner && !sqlSecurityInvoker &&
          this.consumeIf(Keyword.FUNCTION)
        ) {
          stmt = new CreateFunctionStatement()
          stmt.definer = definer
          stmt.aggregate = aggregate
        } else if (
          !orReplace && !algorithm && !aggregate &&!sqlSecurityDefiner && !sqlSecurityInvoker &&
          this.consumeIf(Keyword.TRIGGER)
        ) {
          stmt = new CreateTriggerStatement()
          stmt.definer = definer
        } else if (
          !orReplace && !algorithm && !aggregate &&!sqlSecurityDefiner && !sqlSecurityInvoker &&
          this.consumeIf(Keyword.EVENT)
        ) {
          stmt = new CreateEventStatement()
          stmt.definer = definer
          if (this.consumeIf(Keyword.IF)) {
            this.consume(Keyword.NOT)
            this.consume(Keyword.EXISTS)
            stmt.ifNotExists = true
          }
        } else if (
          !algorithm && !definer && !aggregate &&!sqlSecurityDefiner && !sqlSecurityInvoker &&
          this.consumeIf(Keyword.SPATIAL)
        ) {
          if (this.consumeIf(Keyword.REFERENCE)) {
            stmt = new CreateSpatialReferenceSystemStatement()
            stmt.orReplace = orReplace
            this.consume(Keyword.SYSTEM)
            if (!stmt.orReplace && this.consumeIf(Keyword.IF)) {
              this.consume(Keyword.NOT)
              this.consume(Keyword.EXISTS)
              stmt.ifNotExists = true
            }
          } else if (
            !orReplace &&
            this.consumeIf(Keyword.INDEX)
          ) {
            stmt = new CreateIndexStatement()
            stmt.type = IndexType.SPATIAL
          } else {
            throw this.createParseError()
          }
        } else {
          throw this.createParseError()
        }
      }

      if (stmt instanceof CreateDatabaseStatement) {
        stmt.name = this.identifier()
        while (
          this.peekIf(Keyword.DEFAULT) ||
          this.peekIf(Keyword.CHARACTER) ||
          this.peekIf(Keyword.COLLATE) ||
          this.peekIf(Keyword.ENCRYPTION)
        ) {
          this.consumeIf(Keyword.DEFAULT)
          if (this.consumeIf(Keyword.CHARACTER)) {
            this.consume(Keyword.SET)
            this.consumeIf(Keyword.OPE_EQ)
            stmt.characterSet = this.stringValue()
          } else if (this.consumeIf(Keyword.COLLATE)) {
            this.consumeIf(Keyword.OPE_EQ)
            stmt.collate = this.stringValue()
          } else if (this.consumeIf(Keyword.ENCRYPTION)) {
            this.consumeIf(Keyword.OPE_EQ)
            stmt.encryption = this.stringValue()
          } else {
            throw new Error()
          }
        }
      } else if (stmt instanceof CreateServerStatement) {
        stmt.name = this.identifier()
        this.consume(Keyword.FOREIGN)
        this.consume(Keyword.DATA)
        this.consume(Keyword.WRAPPER)
        stmt.wrapperName = this.identifier()
        this.consume(Keyword.OPTIONS)
        this.consume(TokenType.LeftParen)
        for (let i = 0; i === 0 || this.consume(TokenType.Comma); i++) {
          if (this.consumeIf(Keyword.HOST)) {
            stmt.host = this.stringValue()
          } else if (this.consumeIf(Keyword.DATABASE)) {
            stmt.database = this.stringValue()
          } else if (this.consumeIf(Keyword.USER)) {
            stmt.user = this.stringValue()
          } else if (this.consumeIf(Keyword.PASSWORD)) {
            stmt.password = this.stringValue()
          } else if (this.consumeIf(Keyword.SOCKET)) {
            stmt.socket = this.stringValue()
          } else if (this.consumeIf(Keyword.OWNER)) {
            stmt.owner = this.stringValue()
          } else if (this.consumeIf(Keyword.PORT)) {
            stmt.port = this.numberValue()
          } else {
            throw this.createParseError()
          }
        }
        this.consume(TokenType.RightParen)
      } else if (stmt instanceof CreateResourceGroupStatement) {
        stmt.name = this.identifier()
        this.consume(Keyword.TYPE)
        this.consume(Keyword.OPE_EQ)
        if (this.consumeIf(Keyword.SYSTEM)) {
          stmt.type = ResourceGroupType.SYSTEM
        } else if (this.consumeIf(Keyword.USER)) {
          stmt.type = ResourceGroupType.USER
        } else {
          throw this.createParseError()
        }
        if (this.consumeIf(Keyword.VCPU)) {
          this.consumeIf(Keyword.OPE_EQ)
          for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
            const range = { min: "", max: "" }
            range.min = this.numberValue()
            if (this.consumeIf(Keyword.OPE_MINUS)) {
              range.max = this.numberValue()
            } else {
              range.max = range.min
            }
            stmt.vcpu.push(range)
          }
        }
        if (this.consumeIf(Keyword.THREAD_PRIORITY)) {
          this.consumeIf(Keyword.OPE_EQ)
          stmt.threadPriority = this.numberValue()
        }
        if (this.consumeIf(Keyword.ENABLE)) {
          stmt.disable = false
        } else if (this.consumeIf(Keyword.DISABLE)) {
          stmt.disable = true
        }
      } else if (stmt instanceof CreateLogfileGroupStatement) {
        stmt.name = this.identifier()
        this.consume(Keyword.ADD)
        this.consume(Keyword.UNDOFILE)
        stmt.undofile = this.stringValue()
        if (this.consumeIf(Keyword.INITIAL_SIZE)) {
          this.consumeIf(Keyword.OPE_EQ)
          stmt.initialSize = this.sizeValue()
        }
        if (this.consumeIf(Keyword.UNDO_BUFFER_SIZE)) {
          this.consumeIf(Keyword.OPE_EQ)
          stmt.undoBufferSize = this.sizeValue()
        }
        if (this.consumeIf(Keyword.REDO_BUFFER_SIZE)) {
          this.consumeIf(Keyword.OPE_EQ)
          stmt.redoBufferSize = this.sizeValue()
        }
        if (this.consumeIf(Keyword.NODEGROUP)) {
          this.consumeIf(Keyword.OPE_EQ)
          stmt.nodeGroup = this.numberValue()
        }
        if (this.consumeIf(Keyword.WAIT)) {
          stmt.wait = true
        }
        if (this.consumeIf(Keyword.COMMENT)) {
          this.consumeIf(Keyword.OPE_EQ)
          stmt.comment = this.stringValue()
        }
        if (this.consumeIf(Keyword.ENGINE)) {
          this.consumeIf(Keyword.OPE_EQ)
          stmt.engine = this.identifier()
        }
      } else if (stmt instanceof CreateTablespaceStatement) {
        stmt.name = this.identifier()
        if (this.consumeIf(Keyword.ADD)) {
          this.consume(Keyword.DATAFILE)
          stmt.addDataFile = this.stringValue()
        }
        if (this.consumeIf(Keyword.AUTOEXTEND_SIZE)) {
          this.consumeIf(Keyword.OPE_EQ)
          stmt.autoextendSize = this.sizeValue()
        }
        if (this.consumeIf(Keyword.FILE_BLOCK_SIZE)) {
          this.consumeIf(Keyword.OPE_EQ)
          stmt.fileBlockSize = this.sizeValue()
        }
        if (this.consumeIf(Keyword.ENCRYPTION)) {
          this.consumeIf(Keyword.OPE_EQ)
          stmt.encryption = this.stringValue()
        }
        if (this.consumeIf(Keyword.USE)) {
          this.consume(Keyword.LOGFILE)
          this.consume(Keyword.GROUP)
          stmt.useLogfileGroup = this.identifier()
        }
        if (this.consumeIf(Keyword.EXTENT_SIZE)) {
          this.consumeIf(Keyword.OPE_EQ)
          stmt.extentSize = this.sizeValue()
        }
        if (this.consumeIf(Keyword.INITIAL_SIZE)) {
          this.consumeIf(Keyword.OPE_EQ)
          stmt.initialSize = this.sizeValue()
        }
        if (this.consumeIf(Keyword.MAX_SIZE)) {
          this.consumeIf(Keyword.OPE_EQ)
          stmt.maxSize = this.sizeValue()
        }
        if (this.consumeIf(Keyword.NODEGROUP)) {
          this.consumeIf(Keyword.OPE_EQ)
          stmt.nodeGroup = this.numberValue()
        }
        if (this.consumeIf(Keyword.WAIT)) {
          stmt.wait = true
        }
        if (this.consumeIf(Keyword.COMMENT)) {
          this.consumeIf(Keyword.OPE_EQ)
          stmt.comment = this.stringValue()
        }
        if (this.consumeIf(Keyword.ENGINE)) {
          this.consumeIf(Keyword.OPE_EQ)
          stmt.engine = this.identifier()
        }
        if (this.consumeIf(Keyword.ENGINE_ATTRIBUTE)) {
          this.consumeIf(Keyword.OPE_EQ)
          stmt.engineAttribute = this.stringValue()
        }
      } else if (stmt instanceof CreateSpatialReferenceSystemStatement) {
        stmt.srid = this.consume(TokenType.Number).text
      } else if (stmt instanceof CreateRoleStatement) {
        for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
          const role = new RoleDef()
          role.name = this.username()
          let token
          if (token = this.consumeIf(TokenType.UserDefinedVariable)) {
            role.host = dequote(token.text.substring(1))
          }
          stmt.roles.push(role)
        }
      } else if (stmt instanceof CreateUserStatement) {
        for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
          const user = new UserDef()
          user.name = this.username()
          let token
          if (token = this.consumeIf(TokenType.UserDefinedVariable)) {
            user.host = dequote(token.text.substring(1))
          }
          if (this.consumeIf(Keyword.IDENTIFIED)) {
            if (this.consumeIf(Keyword.BY)) {
              if (this.consumeIf(Keyword.RANDOM)) {
                this.consumeIf(Keyword.PASSWORD)
                user.randowmPassword = true
              } else {
                user.password = this.stringValue()
              }
            } else if (this.consumeIf(Keyword.WITH)) {
              user.authPlugin = this.identifier()
              if (this.consumeIf(Keyword.BY)) {
                if (this.consumeIf(Keyword.RANDOM)) {
                  this.consume(Keyword.PASSWORD)
                  user.randowmPassword = true
                } else {
                  user.password = this.stringValue()
                }
              } else if (this.consumeIf(Keyword.AS)) {
                user.asPassword = true
                user.password = this.stringValue()
              }
            }
          }
          stmt.users.push(user)
        }
        if (this.consumeIf(Keyword.DEFAULT)) {
          this.consume(Keyword.ROLE)
          for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
            stmt.defaultRoles.push(this.username())
          }
        }
        if (this.consumeIf(Keyword.REQUIRE)) {
          if (this.consumeIf(Keyword.NONE)) {
            // no handle
          } else {
            for (let i = 0; i === 0 || this.consumeIf(Keyword.AND); i++) {
              const tlsOption = new TlsOption()
              if (this.consumeIf(Keyword.SSL)) {
                tlsOption.ssl = true
              } else if (this.consumeIf(Keyword.X509)) {
                tlsOption.x509 = true
              } else if (this.consumeIf(Keyword.ISSUER)) {
                tlsOption.issuer = this.stringValue()
              } else if (this.consumeIf(Keyword.SUBJECT)) {
                tlsOption.subject = this.stringValue()
              } else if (this.consumeIf(Keyword.CIPHER)) {
                tlsOption.chiper = this.stringValue()
              } else {
                throw this.createParseError()
              }
              stmt.tlsOptions.push(tlsOption)
            }
          }
        }
      } else if (stmt instanceof CreateTableStatement) {
        stmt.name = this.identifier()
        if (this.consumeIf(TokenType.Dot)) {
          stmt.schemaName = stmt.name
          stmt.name = this.identifier()
        }

        if (this.consumeIf(Keyword.LIKE)) {
          stmt.like = true
          stmt.likeName = this.identifier()
          if (this.consumeIf(TokenType.Dot)) {
            stmt.likeSchemaName = stmt.likeName
            stmt.likeName = this.identifier()
          }
        } else if (this.consumeIf(TokenType.LeftParen)) {
          if (this.consumeIf(Keyword.LIKE)) {
            stmt.like = true
            stmt.likeName = this.identifier()
            if (this.consumeIf(TokenType.Dot)) {
              stmt.likeSchemaName = stmt.likeName
              stmt.likeName = this.identifier()
            }
          } else {
            //// create_definition
          }
          this.consumeIf(TokenType.RightParen)
        } else {
          stmt.asSelect = true
        }

        if (!stmt.likeName) {
          for (let i = 0; i === 0 || this.consumeIf(Keyword.Comma); i++) {
            if (this.consumeIf(Keyword.AUTOEXTEND_SIZE)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.autoextendSize = this.sizeValue()
            } else if (this.consumeIf(Keyword.AUTO_INCREMENT)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.autoIncrement = this.numberValue()
            } else if (this.consumeIf(Keyword.AVG_ROW_LENGTH)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.avgRowLength = this.numberValue()
            } else if (this.consumeIf(Keyword.CHARACTER)) {
              this.consume(Keyword.SET)
              this.consumeIf(Keyword.OPE_EQ)
              stmt.characterSet = this.identifier()
            } else if (this.consumeIf(Keyword.CHARSET)) {
              this.consume(Keyword.SET)
              this.consumeIf(Keyword.OPE_EQ)
              stmt.characterSet = this.identifier()
            } else if (this.consumeIf(Keyword.CHECKSUM)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.checksum = this.numberValue()
            } else if (this.consumeIf(Keyword.COLLATE)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.collate = this.identifier()
            } else if (this.consumeIf(Keyword.COMMENT)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.comment = this.stringValue()
            } else if (this.consumeIf(Keyword.COMPRESSION)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.compression = this.stringValue()
            } else if (this.consumeIf(Keyword.CONNECTION)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.connection = this.stringValue()
            } else if (this.consumeIf(Keyword.DATA)) {
              this.consumeIf(Keyword.DICTIONARY)
              this.consumeIf(Keyword.OPE_EQ)
              stmt.dataDictionary = this.stringValue()
            } else if (this.consumeIf(Keyword.INDEX)) {
              this.consumeIf(Keyword.DICTIONARY)
              this.consumeIf(Keyword.OPE_EQ)
              stmt.indexDictionary = this.stringValue()
            } else if (this.consumeIf(Keyword.DELAY_KEY_WRITE)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.delayKeyWrite = this.numberValue()
            } else if (this.consumeIf(Keyword.ENCRYPTION)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.encryption = this.stringValue()
            } else if (this.consumeIf(Keyword.ENGINE)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.engine = this.identifier()
            } else if (this.consumeIf(Keyword.ENGINE_ATTRIBUTE)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.engineAttribute = this.stringValue()
            } else if (this.consumeIf(Keyword.INSERT_METHOD)) {
              this.consumeIf(Keyword.OPE_EQ)
              if (this.consumeIf(Keyword.NO)) {
                stmt.insetMethod = InsertMethod.NO
              } else if (this.consumeIf(Keyword.FIRST)) {
                stmt.insetMethod = InsertMethod.FIRST
              } else if (this.consumeIf(Keyword.LAST)) {
                stmt.insetMethod = InsertMethod.LAST
              } else {
                throw this.createParseError()
              }
            } else if (this.consumeIf(Keyword.KEY_BLOCK_SIZE)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.keyBlockSize = this.sizeValue()
            } else if (this.consumeIf(Keyword.MAX_ROWS)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.maxRows = this.numberValue()
            } else if (this.consumeIf(Keyword.MIN_ROWS)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.minRows = this.numberValue()
            } else if (this.consumeIf(Keyword.PACK_KEYS)) {
              this.consumeIf(Keyword.OPE_EQ)
              if (this.consumeIf(Keyword.DEFAULT)) {
                stmt.packKeys = "DEFAULT"
              } else {
                stmt.packKeys = this.numberValue()
              }
            } else if (this.consumeIf(Keyword.PASSWORD)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.password = this.stringValue()
            } else if (this.consumeIf(Keyword.ROW_FORMAT)) {
              this.consumeIf(Keyword.OPE_EQ)
              if (this.consumeIf(Keyword.DEFAULT)) {
                stmt.rowFormat = RowFormat.DEFAULT
              } else if (this.consumeIf(Keyword.DYNAMIC)) {
                stmt.rowFormat = RowFormat.DYNAMIC
              } else if (this.consumeIf(Keyword.FIXED)) {
                stmt.rowFormat = RowFormat.FIXED
              } else if (this.consumeIf(Keyword.COMPRESSED)) {
                stmt.rowFormat = RowFormat.COMPRESSED
              } else if (this.consumeIf(Keyword.REDUNDANT)) {
                stmt.rowFormat = RowFormat.REDUNDANT
              } else if (this.consumeIf(Keyword.COMPACT)) {
                stmt.rowFormat = RowFormat.COMPACT
              } else {
                throw this.createParseError()
              }
            } else if (this.consumeIf(Keyword.SECONDARY_ENGINE_ATTRIBUTE)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.secondaryEngineAttribute = this.stringValue()
            } else if (this.consumeIf(Keyword.STATS_AUTO_RECALC)) {
              this.consumeIf(Keyword.OPE_EQ)
              if (this.consumeIf(Keyword.DEFAULT)) {
                stmt.statsAutoRecalc = "DEFAULT"
              } else {
                stmt.statsAutoRecalc = this.numberValue()
              }
            } else if (this.consumeIf(Keyword.STATS_PERSISTENT)) {
              this.consumeIf(Keyword.OPE_EQ)
              if (this.consumeIf(Keyword.DEFAULT)) {
                stmt.statsPersistent = "DEFAULT"
              } else {
                stmt.statsPersistent = this.numberValue()
              }
            } else if (this.consumeIf(Keyword.STATS_SAMPLE_PAGES)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.statSamplePages = this.numberValue()
            } else if (this.consumeIf(Keyword.TABLESPACE)) {
              stmt.tablespace = this.identifier()
              if (this.consumeIf(Keyword.STORAGE)) {
                if (this.consumeIf(Keyword.DISK)) {
                  stmt.storageType = StorageType.DISK
                } else if (this.consumeIf(Keyword.MEMORY)) {
                  stmt.storageType = StorageType.MEMORY
                } else {
                  throw this.createParseError()
                }
              }
            } else if (this.consumeIf(Keyword.UNION)) {
              this.consumeIf(Keyword.OPE_EQ)
              this.consume(TokenType.LeftParen)
              stmt.union = []
              for (let j = 0; j === 0 || this.consumeIf(Keyword.Comma); j++) {
                stmt.union.push(this.identifier())
              }
              this.consume(TokenType.RightParen)
            } else if (this.consumeIf(Keyword.DEFAULT)) {
              if (this.consumeIf(Keyword.CHARACTER)) {
                this.consume(Keyword.SET)
                this.consumeIf(Keyword.OPE_EQ)
                stmt.characterSet = this.identifier()
              } else if (this.consumeIf(Keyword.CHARSET)) {
                this.consumeIf(Keyword.OPE_EQ)
                stmt.characterSet = this.identifier()
              } else if (this.consumeIf(Keyword.COLLATE)) {
                this.consumeIf(Keyword.OPE_EQ)
                stmt.collate = this.identifier()
              } else {
                throw this.createParseError()
              }
            } else {
              throw this.createParseError()
            }
          }
          if (this.consumeIf(Keyword.PARTITION)) {
            this.consume(Keyword.BY)
            if (this.peekIf(Keyword.LINEAR) || this.peekIf(Keyword.HASH) || this.peekIf(Keyword.KEY)) {
              this.consumeIf(Keyword.LINEAR)
              if (this.consumeIf(Keyword.HASH)) {
                this.consume(TokenType.LeftParen)
                stmt.linearHashExpression = this.expression()
                this.consume(TokenType.RightParen)
              } else if (this.consumeIf(Keyword.KEY)) {
                if (this.consumeIf(Keyword.ALGORITHM)) {
                  stmt.linearKeyAlgorithm = this.numberValue()
                }
                this.consume(TokenType.LeftParen)
                stmt.linearTokens = []
                for (let i = 0; i === 0 || this.consumeIf(Keyword.Comma); i++) {
                  stmt.linearTokens.push(this.identifier())
                }
                this.consume(TokenType.RightParen)
              }
            } else if (this.consumeIf(Keyword.RANGE)) {

            } else if (this.consumeIf(Keyword.LIST)) {

            } else {
              throw this.createParseError()
            }
            if (this.consumeIf(Keyword.PARTITIONS)) {
              stmt.partitions = this.numberValue()
            }
            if (this.consumeIf(Keyword.SUBPARTITION)) {
              this.consume(Keyword.BY)
            }
            if (this.consumeIf(TokenType.LeftParen)) {
              this.consume(Keyword.PARTITION)
              //TODO
              if (this.consumeIf(TokenType.LeftParen)) {
                this.consume(Keyword.SUBPARTITION)
              }
              this.consume(TokenType.RightParen)
            }
          }

          if (this.consumeIf(Keyword.IGNORE)) {
            stmt.conflictAction = ConflictAction.IGNORE
            stmt.asSelect = true
          } else if (this.consumeIf(Keyword.REPLACE)) {
            stmt.conflictAction = ConflictAction.REPLACE
            stmt.asSelect = true
          }
          if (this.consumeIf(Keyword.AS)) {
            stmt.asSelect = true
          }
          if (stmt.asSelect || this.peekIf(Keyword.WITH) || this.peekIf(Keyword.SELECT)) {
            this.selectClause()
          }
        }
      } else {
        // TODO
        stmt.name = this.identifier()
        if (this.consumeIf(TokenType.Dot)) {
          stmt.schemaName = stmt.name
          stmt.name = this.identifier()
        }
      }
    } else if (this.consumeIf(Keyword.ALTER)) {
      if (this.consumeIf(Keyword.DATABASE) || this.consumeIf(Keyword.SCHEMA)) {
        stmt = new AlterDatabaseStatement()
      } else if (this.consumeIf(Keyword.SERVER)) {
        stmt = new AlterServerStatement()
      } else if (this.consumeIf(Keyword.RESOURCE)) {
        stmt = new AlterResourceGroupStatement()
        this.consume(Keyword.GROUP)
      } else if (this.consumeIf(Keyword.INSTANCE)) {
        stmt = new OtherStatement()
      } else if (this.consumeIf(Keyword.LOGFILE)) {
        this.consume(Keyword.GROUP)
        stmt = new AlterLogfileGroupStatement()
      } else if (this.peekIf(Keyword.UNDO) || this.peekIf(Keyword.TABLESPACE)) {
        stmt = new AlterTablespaceStatement()
        if (this.consumeIf(Keyword.UNDO)) {
          stmt.undo = true
        }
        this.consume(Keyword.TABLESPACE)
      } else if (this.consumeIf(Keyword.USER)) {
        stmt = new AlterUserStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
      } else if (this.consumeIf(Keyword.TABLE)) {
        stmt = new AlterTableStatement()
      } else {
        let algorithm
        if (this.consumeIf(Keyword.ALGORITHM)) {
          this.consume(Keyword.OPE_EQ)
          if (this.consumeIf(Keyword.UNDEFINED)) {
            algorithm = Algortihm.UNDEFINED
          } else if (this.consumeIf(Keyword.MERGE)) {
            algorithm = Algortihm.MERGE
          } else if (this.consumeIf(Keyword.TEMPTABLE)) {
            algorithm = Algortihm.TEMPTABLE
          } else {
            throw this.createParseError()
          }
        }

        let definer
        if (this.consumeIf(Keyword.DEFINER)) {
          this.consume(Keyword.OPE_EQ)
          definer = this.identifier()
        }

        let sqlSecurityDefiner
        let sqlSecurityInvoker
        if (this.consumeIf(Keyword.SQL)) {
          this.consume(Keyword.SECURITY)
          if (this.peekIf(Keyword.DEFINER)) {
            sqlSecurityDefiner = this.identifier()
          } else if (this.peekIf(Keyword.INVOKER)) {
            sqlSecurityInvoker = this.identifier()
          } else {
            throw this.createParseError()
          }
        }

        if (this.consumeIf(Keyword.VIEW)
        ) {
          stmt = new AlterViewStatement()
          stmt.algorithm = algorithm
          stmt.definer = definer
          stmt.sqlSecurityDefiner = sqlSecurityDefiner
          stmt.sqlSecurityInvoker = sqlSecurityInvoker
        } else if (
          !algorithm && !sqlSecurityDefiner && !sqlSecurityInvoker &&
          this.consumeIf(Keyword.PROCEDURE)
        ) {
          stmt = new AlterProcedureStatement()
          stmt.definer = definer
        } else if (
          !algorithm && !sqlSecurityDefiner && !sqlSecurityInvoker &&
          this.consumeIf(Keyword.FUNCTION)
        ) {
          stmt = new AlterFunctionStatement()
          stmt.definer = definer
        } else if (
          !algorithm && !sqlSecurityDefiner && !sqlSecurityInvoker &&
          this.consumeIf(Keyword.EVENT)
        ) {
          stmt = new AlterEventStatement()
          stmt.definer = definer
        } else {
          throw this.createParseError()
        }
      }
    } else if (this.consumeIf(Keyword.RENAME)) {
      if (this.consumeIf(Keyword.TABLE)) {
        stmt = new RenameTableStatement()
      } else if (this.consumeIf(Keyword.USER)) {
        stmt = new RenameUserStatement()
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.DROP)) {
      if (this.consumeIf(Keyword.DATABASE) || this.consumeIf(Keyword.SCHEMA)) {
        stmt = new DropDatabaseStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
      } else if (this.consumeIf(Keyword.SERVER)) {
        stmt = new DropServerStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
      } else if (this.consumeIf(Keyword.RESOURCE)) {
        stmt = new DropResourceGroupStatement()
        this.consume(Keyword.GROUP)
      } else if (this.consumeIf(Keyword.LOGFILE)) {
        this.consume(Keyword.GROUP)
        stmt = new DropLogfileGroupStatement()
      } else if (this.peekIf(Keyword.UNDO) || this.peekIf(Keyword.TABLESPACE)) {
        stmt = new DropTablespaceStatement()
        if (this.consumeIf(Keyword.UNDO)) {
          stmt.undo = true
        }
        this.consume(Keyword.TABLESPACE)
      } else if (this.consumeIf(Keyword.ROLE)) {
        stmt = new DropRoleStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
      } else if (this.consumeIf(Keyword.USER)) {
        stmt = new DropUserStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
      } else if (this.peekIf(Keyword.TEMPORARY) || this.peekIf(Keyword.TABLE)) {
        stmt = new DropTableStatement()
        if (this.consumeIf(Keyword.TEMPORARY)) {
          stmt.temporary = true
        }
        this.consume(Keyword.TABLE)
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
      } else if (this.consumeIf(Keyword.VIEW)) {
        stmt = new DropViewStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
      } else if (this.consumeIf(Keyword.PROCEDURE)) {
        stmt = new DropProcedureStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
      } else if (this.consumeIf(Keyword.FUNCTION)) {
        stmt = new DropFunctionStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
      } else if (this.consumeIf(Keyword.TRIGGER)) {
        stmt = new DropTriggerStatement()
      } else if (this.consumeIf(Keyword.EVENT)) {
        stmt = new DropEventStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
      } else if (this.consumeIf(Keyword.SPATIAL)) {
        stmt = new DropSpatialReferenceSystemStatement()
        this.consume(Keyword.REFERENCE)
        this.consume(Keyword.SYSTEM)
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
      } else if (this.consumeIf(Keyword.INDEX)) {
        stmt = new DropIndexStatement()
      } else if (this.consumeIf(Keyword.PREPARE)) {
        stmt = new DeallocatePrepareStatement()
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.TRUNCATE)) {
      stmt = new TruncateTableStatement()
      this.consumeIf(Keyword.TABLE)
    } else if (this.consumeIf(Keyword.DEALLOCATE)) {
      stmt = new DeallocatePrepareStatement()
      this.consume(Keyword.PREPARE)
    } else if (this.consumeIf(Keyword.START)) {
      if (this.consumeIf(Keyword.TRANSACTION)) {
        stmt = new StartTransactionStatement()
      } else if (this.consumeIf(Keyword.SLAVE)) {
        stmt = new StartSlaveStatement()
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.CHANGE)) {
      stmt = new ChangeMasterStatement()
      this.consume(Keyword.MASTER)
    } else if (this.consumeIf(Keyword.STOP)) {
      stmt = new StopSlaveStatement()
      this.consume(Keyword.SLAVE)
    } else if (this.consumeIf(Keyword.BEGIN)) {
      stmt = new BeginStatement()
    } else if (this.consumeIf(Keyword.SAVEPOINT)) {
      stmt = new SavepointStatement()
    } else if (this.consumeIf(Keyword.RELEASE)) {
      stmt = new ReleaseSavepointStatement()
      this.consume(Keyword.SAVEPOINT)
    } else if (this.consumeIf(Keyword.COMMIT)) {
      stmt = new CommitStatement()
    } else if (this.consumeIf(Keyword.ROLLBACK)) {
      stmt = new RollbackStatement()
    } else if (this.consumeIf(Keyword.LOCK)) {
      stmt = new LockTableStatement()
      this.consume(Keyword.TABLE)
    } else if (this.consumeIf(Keyword.UNLOCK)) {
      stmt = new UnlockTableStatement()
      this.consume(Keyword.TABLE)
    } else if (this.consumeIf(Keyword.XA)) {
      if (this.consumeIf(Keyword.START)) {
        stmt = new XaStartStatement()
      } else if (this.consumeIf(Keyword.BEGIN)) {
        stmt = new XaBeginStatement()
      } else if (this.consumeIf(Keyword.END)) {
        stmt = new XaEndStatement()
      } else if (this.consumeIf(Keyword.PREPARE)) {
        stmt = new XaPrepareStatement()
      } else if (this.consumeIf(Keyword.COMMIT)) {
        stmt = new XaCommitStatement()
      } else if (this.consumeIf(Keyword.ROLLBACK)) {
        stmt = new XaRollbackStatement()
      } else if (this.consumeIf(Keyword.RECOVER)) {
        stmt = new XaRecoverStatement()
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.PURGE)) {
      stmt = new PurgeBinaryLogsStatement()
      if (this.consumeIf(Keyword.BINARY) || this.consumeIf(Keyword.MASTER)) {
      } else {
        throw this.createParseError()
      }
      this.consume(Keyword.LOGS)
    } else if (this.consumeIf(Keyword.RESET)) {
      if (this.consumeIf(Keyword.MASTER)) {
        stmt = new ResetMasterStatement()
      } else if (this.consumeIf(Keyword.SLAVE)) {
        stmt = new ResetSlaveStatement()
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.GRANT)) {
      stmt = new GrantStatement()
    } else if (this.consumeIf(Keyword.REVOKE)) {
      stmt = new RevokeStatement()
    } else if (this.consumeIf(Keyword.ANALYZE)) {
      stmt = new AnalyzeTableStatement()
      if (this.consumeIf(Keyword.NO_WRITE_TO_BINLOG) || this.consumeIf(Keyword.LOCAL)) {
        stmt.noWriteToBinlog = true
      }
      this.consume(Keyword.TABLE)
    } else if (this.consumeIf(Keyword.CHECK)) {
      stmt = new CheckTableStatement()
      this.consume(Keyword.TABLE)
    } else if (this.consumeIf(Keyword.CHECKSUM)) {
      stmt = new ChecksumTableStatement()
      this.consume(Keyword.TABLE)
    } else if (this.consumeIf(Keyword.OPTIMIZE)) {
      stmt = new OptimizeTableStatement()
      if (this.consumeIf(Keyword.NO_WRITE_TO_BINLOG) || this.consumeIf(Keyword.LOCAL)) {
        stmt.noWriteToBinlog = true
      }
      this.consume(Keyword.TABLE)
    } else if (this.consumeIf(Keyword.REPAIR)) {
      stmt = new RepairTableStatement()
      if (this.consumeIf(Keyword.NO_WRITE_TO_BINLOG) || this.consumeIf(Keyword.LOCAL)) {
        stmt.noWriteToBinlog = true
      }
      this.consume(Keyword.TABLE)
    } else if (this.consumeIf(Keyword.INSTALL)) {
      stmt = new InstallPluginStatement()
      this.consume(Keyword.PLUGIN)
    } else if (this.consumeIf(Keyword.UNINSTALL)) {
      stmt = new UninstallPluginStatement()
      this.consume(Keyword.PLUGIN)
    } else if (this.consumeIf(Keyword.EXPLAIN) || this.consumeIf(Keyword.DESCRIBE)) {
      stmt = new ExplainStatement()
    } else if (this.consumeIf(Keyword.CALL)) {
      stmt = new CallStatement()
    } else if (this.consumeIf(Keyword.PREPARE)) {
      stmt = new PrepareStatement()
    } else if (this.consumeIf(Keyword.EXECUTE)) {
      stmt = new ExecuteStatement()
    } else if (this.consumeIf(Keyword.USE)) {
      stmt = new UseStatement()
    } else if (this.consumeIf(Keyword.INSERT)) {
      stmt = new InsertStatement()
      if (this.consumeIf(Keyword.LOW_PRIORITY)) {
        stmt.concurrency = Concurrency.LOW_PRIORITY
      } else if (this.consumeIf(Keyword.DELAYED)) {
        stmt.concurrency = Concurrency.DELAYED
      } else if (this.consumeIf(Keyword.HIGH_PRIORITY)) {
        stmt.concurrency = Concurrency.HIGH_PRIORITY
      }
      if (this.consumeIf(Keyword.IGNORE)) {
        stmt.conflictAction = ConflictAction.IGNORE
      }
      this.consumeIf(Keyword.INTO)
      stmt.markers.set("nameStart", this.pos - start)
      stmt.name = this.identifier()
      if (this.consumeIf(TokenType.Dot)) {
        stmt.schemaName = stmt.name
        stmt.markers.set("nameStart", this.pos - start)
        stmt.name = this.identifier()
      }
      stmt.markers.set("nameEnd", this.pos - start)
    } else if (this.consumeIf(Keyword.UPDATE)) {
      stmt = new UpdateStatement()
      if (this.consumeIf(Keyword.LOW_PRIORITY)) {
        stmt.concurrency = Concurrency.LOW_PRIORITY
      }
      if (this.consumeIf(Keyword.IGNORE)) {
        stmt.conflictAction = ConflictAction.IGNORE
      }
      stmt.markers.set("nameStart", this.pos - start)
      stmt.name = this.identifier()
      if (this.consumeIf(TokenType.Dot)) {
        stmt.schemaName = stmt.name
        stmt.markers.set("nameStart", this.pos - start)
        stmt.name = this.identifier()
      }
      stmt.markers.set("nameEnd", this.pos - start)
    } else if (this.consumeIf(Keyword.REPLACE)) {
      stmt = new ReplaceStatement()
      if (this.consumeIf(Keyword.LOW_PRIORITY)) {
        stmt.concurrency = Concurrency.LOW_PRIORITY
      } else if (this.consumeIf(Keyword.DELAYED)) {
        stmt.concurrency = Concurrency.DELAYED
      }
      if (this.consumeIf(Keyword.IGNORE)) {
        stmt.conflictAction = ConflictAction.IGNORE
      }
      this.consumeIf(Keyword.INTO)
      stmt.markers.set("nameStart", this.pos - start)
      stmt.name = this.identifier()
      if (this.consumeIf(TokenType.Dot)) {
        stmt.schemaName = stmt.name
        stmt.markers.set("nameStart", this.pos - start)
        stmt.name = this.identifier()
      }
      stmt.markers.set("nameEnd", this.pos - start)
    } else if (this.consumeIf(Keyword.DELETE)) {
      stmt = new DeleteStatement()
      if (this.consumeIf(Keyword.LOW_PRIORITY)) {
        stmt.concurrency = Concurrency.LOW_PRIORITY
      } else if (this.consumeIf(Keyword.DELAYED)) {
        stmt.concurrency = Concurrency.DELAYED
      } else if (this.consumeIf(Keyword.HIGH_PRIORITY)) {
        stmt.concurrency = Concurrency.HIGH_PRIORITY
      }
      if (this.consumeIf(Keyword.QUICK)) {
        stmt.quick = true
      }
      if (this.consumeIf(Keyword.IGNORE)) {
        stmt.conflictAction = ConflictAction.IGNORE
      }
      this.consumeIf(Keyword.FROM)
      stmt.markers.set("nameStart", this.pos - start)
      stmt.name = this.identifier()
      if (this.consumeIf(TokenType.Dot)) {
        stmt.schemaName = stmt.name
        stmt.markers.set("nameStart", this.pos - start)
        stmt.name = this.identifier()
      }
      stmt.markers.set("nameEnd", this.pos - start)
    } else if (this.consumeIf(Keyword.LOAD)) {
      if (this.peekIf(Keyword.DATA) || this.peekIf(Keyword.XML)) {
        if (this.consumeIf(Keyword.DATA)) {
          stmt = new LoadDataInfileStatement()
        } else {
          stmt = new LoadXmlInfileStatement()
        }
        if (this.consumeIf(Keyword.LOW_PRIORITY)) {
          stmt.concurrency = Concurrency.LOW_PRIORITY
        } else if (this.consumeIf(Keyword.CONCURRENT)) {
          stmt.concurrency = Concurrency.CONCURRENT
        }
        if (this.consumeIf(Keyword.LOCAL)) {
          stmt.local = true
        }
        this.consume(Keyword.INFILE)
      } else if (this.consumeIf(Keyword.INDEX)) {
        stmt = new LoadIndexIntoCacheStatement()
        this.consume(Keyword.INTO)
        this.consume(Keyword.CACHE)
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.SET)) {
      if (this.consumeIf(Keyword.RESOURCE)) {
        this.consume(Keyword.GROUP)
        stmt = new SetResourceGroupStatement()
      } else if (this.consumeIf(Keyword.ROLE)) {
        stmt = new SetRoleStatement()
      } else if (this.consumeIf(Keyword.DEFAULT)) {
        stmt = new SetDefaultRoleStatement()
        this.consume(Keyword.ROLE)
      } else if (this.consumeIf(Keyword.PASSWORD)) {
        stmt = new SetPasswordStatement()
      } else if (this.consumeIf(Keyword.CHARACTER)) {
        stmt = new SetCharacterSetStatement()
        this.consume(Keyword.SET)
      } else if (this.consumeIf(Keyword.NAMES)) {
        stmt = new SetNamesStatement()
      } else {
        if (this.consumeIf(Keyword.TRANSACTION)) {
          stmt = new SetTransactionStatement()
        } else if (this.consumeIf(Keyword.GLOBAL)) {
          if (this.consumeIf(Keyword.TRANSACTION)) {
            stmt = new SetTransactionStatement()
            stmt.type = VariableType.GLOBAL
          } else {
            stmt = new SetStatement()
            const va = new VariableAssignment()
            va.type = VariableType.GLOBAL
            va.name = this.identifier()
            stmt.variableAssignments.push(va)
          }
        } else if (this.consumeIf(Keyword.SESSION) || this.consumeIf(Keyword.LOCAL)) {
          if (this.consumeIf(Keyword.TRANSACTION)) {
            stmt = new SetTransactionStatement()
            stmt.type = VariableType.SESSION
          } else {
            stmt = new SetStatement()
            const va = new VariableAssignment()
            va.type = VariableType.SESSION
            va.name = this.identifier()
            stmt.variableAssignments.push(va)
          }
        } else if (this.consumeIf(Keyword.VAR_GLOBAL)) {
          stmt = new SetStatement()
          const va = new VariableAssignment()
          va.type = VariableType.GLOBAL
          this.consume(Keyword.Dot)
          va.name = this.identifier()
        } else if (this.consumeIf(Keyword.VAR_SESSION) || this.consumeIf(Keyword.VAR_LOCAL)) {
          stmt = new SetStatement()
          const va = new VariableAssignment()
          va.type = VariableType.SESSION
          this.consume(Keyword.Dot)
          va.name = this.identifier()
        } else if (this.peekIf(TokenType.SessionVariable)) {
          stmt = new SetStatement()
          const va = new VariableAssignment()
          const name = this.consume().text
          va.type = VariableType.SESSION
          va.name = name.substring(2)
        } else if (this.peekIf(TokenType.UserDefinedVariable)) {
          stmt = new SetStatement()
          const va = new VariableAssignment()
          const name = this.consume().text
          va.type = VariableType.USER_DEFINED
          va.name = name.substring(1)
        } else {
          throw this.createParseError()
        }

        if (stmt instanceof SetTransactionStatement) {
          for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
            if (this.consumeIf(Keyword.ISOLATION)) {
              this.consume(Keyword.LEVEL)
              if (this.consumeIf(Keyword.REPEATABLE)) {
                this.consume(Keyword.READ)
                stmt.characteristic = TransactionCharacteristic.ISOLATION_LEVEL_REPEATABLE_READ
              } else if (this.consumeIf(Keyword.READ)) {
                if (this.consumeIf(Keyword.COMMITTED)) {
                  stmt.characteristic = TransactionCharacteristic.ISOLATION_LEVEL_READ_COMMITTED
                } else if (this.consumeIf(Keyword.UNCOMMITTED)) {
                  stmt.characteristic = TransactionCharacteristic.ISOLATION_LEVEL_READ_UNCOMMITTED
                } else {
                  throw this.createParseError()
                }
              } else if (this.consumeIf(Keyword.SERIALIZABLE)) {
                stmt.characteristic = TransactionCharacteristic.ISOLATION_LEVEL_SERIALIZABLE
              } else {
                throw this.createParseError()
              }
            } else if (this.consumeIf(Keyword.READ)) {
              if (this.consumeIf(Keyword.WRITE)) {
                stmt.characteristic = TransactionCharacteristic.READ_WRITE
              } else if (this.consumeIf(Keyword.ONLY)) {
                stmt.characteristic = TransactionCharacteristic.READ_ONLY
              } else {
                throw this.createParseError()
              }
            } else {
              throw this.createParseError()
            }
          }
        } else {
          while (this.consumeIf(TokenType.Comma)) {
            const va = new VariableAssignment()
            if (this.consumeIf(Keyword.GLOBAL)) {
              va.type = VariableType.GLOBAL
              va.name = this.identifier()
            } else if (this.consumeIf(Keyword.SESSION) || this.consumeIf(Keyword.LOCAL)) {
              va.type = VariableType.SESSION
              va.name = this.identifier()
            } else if (this.consumeIf(Keyword.VAR_GLOBAL)) {
              va.type = VariableType.GLOBAL
              this.consume(Keyword.Dot)
              va.name = this.identifier()
            } else if (this.consumeIf(Keyword.VAR_SESSION) || this.consumeIf(Keyword.VAR_LOCAL)) {
              va.type = VariableType.SESSION
              this.consume(Keyword.Dot)
              va.name = this.identifier()
            } else if (this.peekIf(TokenType.SessionVariable)) {
              const name = this.consume().text
              va.type = VariableType.SESSION
              va.name = name.substring(2)
            } else if (this.peekIf(TokenType.UserDefinedVariable)) {
              const name = this.consume().text
              va.type = VariableType.USER_DEFINED
              va.name = name.substring(1)
            } else {
              throw this.createParseError()
            }
            if (this.consumeIf(Keyword.OPE_EQ) || this.consumeIf(Keyword.OPE_COLON_EQ)) {
            } else {
              throw this.createParseError()
            }
            va.value = this.expression()
            stmt.variableAssignments.push(va)
          }
        }
      }
    } else if (this.consumeIf(Keyword.WITH) || this.consumeIf(Keyword.SELECT)) {
      stmt = new SelectStatement()
    } else if (this.consumeIf(Keyword.TABLE)) {
      stmt = new TableStatement()
    } else if (this.consumeIf(Keyword.DO)) {
      stmt = new DoStatement()
    } else if (this.consumeIf(Keyword.HANDLER)) {
      stmt = new HandlerStatement()
    } else if (this.consumeIf(Keyword.SHOW)) {
      stmt = new ShowStatement()
    } else if (this.consumeIf(Keyword.HELP)) {
      stmt = new HelpStatement()
    } else if (this.consumeIf(Keyword.BINLOG)) {
      stmt = new BinlogStatement()
    } else if (this.consumeIf(Keyword.CACHE)) {
      stmt = new CacheIndexStatement()
      this.consume(Keyword.INDEX)
    } else if (this.consumeIf(Keyword.FLUSH)) {
      stmt = new FlushStatement()
    } else if (this.consumeIf(Keyword.KILL)) {
      stmt = new KillStatement()
    } else if (this.consumeIf(Keyword.RESET)) {
      stmt = new ResetStatement()
    }

    if (!stmt) {
      stmt = new OtherStatement()
    }
    if (typeof this.options.filename === "string") {
      stmt.filename = this.options.filename
    }
    while (this.peek() && !this.peekIf(TokenType.SemiColon)) {
      this.consume()
    }
    stmt.tokens = this.tokens.slice(start, this.pos)

    return stmt
  }

  selectClause() {
    if (this.peekIf(Keyword.WITH)) {
      this.withClause()
    }
    this.consume(Keyword.SELECT)
    let depth = 0
    while (this.peek() &&
      !this.peekIf(TokenType.SemiColon) &&
      (depth == 0 && !this.peekIf(TokenType.RightParen))
    ) {
      if (this.consumeIf(TokenType.LeftParen)) {
        depth++
      } else if (this.consumeIf(TokenType.RightParen)) {
        depth--
      } else {
        this.consume()
      }
    }
  }

  withClause() {
    const start = this.pos
    this.consume(Keyword.WITH)
    this.consumeIf(Keyword.RECURSIVE)
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      this.identifier()
      if (this.consumeIf(TokenType.LeftParen)) {
        for (let j = 0; j === 0 || this.consumeIf(TokenType.Comma); j++) {
          this.identifier()
        }
        this.consume(TokenType.RightParen)
      }
      this.consume(Keyword.AS)
      this.consume(TokenType.LeftParen)
      this.selectClause()
      this.consume(TokenType.RightParen)
    }
    return this.tokens.slice(start, this.pos)
  }

  username() {
    let token, text
    if (token = this.consumeIf(TokenType.QuotedIdentifier)) {
      text = unescape(dequote(token.text))
    } else if (token = this.consumeIf(TokenType.String)) {
      text = unescape(dequote(token.text))
    } else if (token = this.consumeIf(TokenType.Identifier)) {
      text = lcase(token.text)
    } else {
      throw this.createParseError()
    }
    return text
  }

  identifier() {
    let token, text
    if (token = this.consumeIf(TokenType.QuotedIdentifier)) {
      text = unescape(dequote(token.text))
    } else if (token = this.consumeIf(TokenType.Identifier)) {
      text = lcase(token.text)
    } else {
      throw this.createParseError()
    }
    return text
  }

  expression() {
    const start = this.pos
    let depth = 0
    while (this.peek() &&
      (depth == 0 && !this.peekIf(TokenType.Comma)) &&
      (depth == 0 && !this.peekIf(TokenType.RightParen)) &&
      (depth == 0 && !this.peekIf(Keyword.AS)) &&
      (depth == 0 && !this.peekIf(Keyword.ASC)) &&
      (depth == 0 && !this.peekIf(Keyword.DESC)) &&
      !this.peekIf(TokenType.SemiColon)
    ) {
      if (this.consumeIf(TokenType.LeftParen)) {
        depth++
      } else if (this.consumeIf(TokenType.RightParen)) {
        depth--
      } else {
        this.consume()
      }
    }
    return this.tokens.slice(start, this.pos)
  }

  stringValue() {
    let token, text
    if (token = this.consumeIf(TokenType.String)) {
      text = unescape(dequote(token.text))
    } else if (token = this.consumeIf(Keyword.VAR_GLOBAL)) {
      this.consume(Keyword.Dot)
      text = "@@GLOBAL." + lcase(this.consume(TokenType.Identifier).text)
    } else if (this.peekIf(Keyword.VAR_LOCAL) || this.peekIf(Keyword.VAR_SESSION)) {
      this.consume()
      this.consume(Keyword.Dot)
      text = "@@SESSION." + lcase(this.consume(TokenType.Identifier).text)
    } else if (token = this.consumeIf(TokenType.SessionVariable)) {
      text = lcase(token.text)
    } else if (token = this.consumeIf(TokenType.UserDefinedVariable)) {
      text = lcase(token.text)
    } else {
      throw this.createParseError()
    }
    return text
  }

  sizeValue() {
    if (this.peekIf(TokenType.Number) || this.peekIf(TokenType.Size)) {
      return this.consume().text
    } else {
      throw this.createParseError()
    }
  }

  numberValue() {
    let token, text
    if (token = (this.consumeIf(Keyword.OPE_PLUS) || this.consumeIf(Keyword.OPE_MINUS))) {
      text = token.text
      text += this.consume(TokenType.Number).text
    } else {
      text = this.consume(TokenType.Number).text
    }
    return new Decimal(text).toString()
  }
}

function toSemverString(version: string) {
  const value = Number.parseInt(version, 10)
  const major = Math.trunc(value / 10000)
  const minor = Math.trunc(value / 100 % 100)
  const patch = Math.trunc(value % 100)
  return `${major}.${minor}.${patch}`
}

const ReplaceReMap: {[key: string]: RegExp} = {
  '"': /""|\\(.)/g,
  "'": /''|\\(.)/g,
  "`": /``/g,
}

function dequote(text: string) {
  if (text.length >= 2) {
    const sc = text.charAt(0)
    const ec = text.charAt(text.length-1)
    if (sc === "[" && ec === "]" || sc === ec) {
      const re = ReplaceReMap[sc]
      let value = text.substring(1, text.length - 1)
      if (re != null) {
        value = value.replace(re, (m, g1) => {
          switch (m) {
            case '""': return '"'
            case "''": return "'"
            case '``': return "`"
            case '\\"': return '"'
            case "\\'": return "'"
            case "\\0": return "\0"
            case "\\b": return "\b"
            case "\\n": return "\n"
            case "\\r": return "\r"
            case "\\t": return "\t"
            case "\\Z": return "\x1A"
            case "\\\\": return "\\"
            default: return g1
          }
        })
      }
      return value
    }
  }
  return text
}
