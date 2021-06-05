import Decimal from "decimal.js"
import semver from "semver"
import {
  ITokenType,
  Token,
  Lexer,
  Parser,
  ParseError,
  AggregateParseError,
} from "../parser"
import { escapeRegExp, lcase, ucase } from "../util/functions"
import * as model from "./mysql_models"

export class TokenType implements ITokenType {
  static Delimiter = new TokenType("Delimiter")
  static Command = new TokenType("Command")
  static WhiteSpace = new TokenType("WhiteSpace", { skip: true })
  static LineBreak = new TokenType("LineBreak", { skip: true })
  static HintComment = new TokenType("HintComment", { skip: true })
  static BlockComment = new TokenType("BlockComment", { skip: true })
  static LineComment = new TokenType("LineComment", { skip: true })
  static SemiColon = new TokenType("SemiColon")
  static LeftParen = new TokenType("LeftParen")
  static RightParen = new TokenType("RightParen")
  static LeftBrace = new TokenType("LeftBrace")
  static RightBrace = new TokenType("RightBrace")
  static Comma = new TokenType("Comma")
  static Dot = new TokenType("Dot")
  static At = new TokenType("At")
  static Operator = new TokenType("Operator")
  static Number = new TokenType("Number")
  static Size = new TokenType("Size")
  static String = new TokenType("String")
  static BindVariable = new TokenType("BindVariable")
  static SessionVariable = new TokenType("SessionVariable")
  static UserDefinedVariable = new TokenType("UserVariable")
  static QuotedValue = new TokenType("QuotedValue")
  static QuotedIdentifier = new TokenType("QuotedIdentifier")
  static Identifier = new TokenType("Identifier")
  static Error = new TokenType("Error")

  constructor(
    public name: string,
    public options: { [key: string]: any } = {}
  ) {}

  toString() {
    return this.name
  }
}

const KeywordMap = new Map<string, Keyword>()
export class Keyword implements ITokenType {
  static ACCESSIBLE = new Keyword("ACCESSIBLE", { reserved: true })
  static ACCOUNT = new Keyword("ACCOUNT")
  static ACTION = new Keyword("ACTION")
  static ACTIVE = new Keyword("ACTIVE")
  static ADD = new Keyword("ADD", { reserved: true })
  static AFTER = new Keyword("AFTER")
  static AGGREGATE = new Keyword("AGGREGATE")
  static ALGORITHM = new Keyword("ALGORITHM")
  static ALL = new Keyword("ALL", { reserved: true })
  static ALTER = new Keyword("ALTER", { reserved: true })
  static ALWAYS = new Keyword("ALWAYS")
  static ANALYSE = new Keyword("ANALYSE", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies("<8.0.0", options.version || "0")
  } })
  static ANALYZE = new Keyword("ANALYZE", { reserved: true })
  static AND = new Keyword("AND", { reserved: true })
  static AS = new Keyword("AS", { reserved: true })
  static ASC = new Keyword("ASC", { reserved: true })
  static ASCII = new Keyword("ASCII")
  static ASENSITIVE = new Keyword("ASENSITIVE", { reserved: true })
  static AT = new Keyword("AT")
  static ATTRIBUTE = new Keyword("ATTRIBUTE")
  static AUTO_INCREMENT = new Keyword("AUTO_INCREMENT")
  static AUTOEXTEND_SIZE = new Keyword("AUTOEXTEND_SIZE")
  static AVG_ROW_LENGTH = new Keyword("AVG_ROW_LENGTH")
  static BEFORE = new Keyword("BEFORE", { reserved: true })
  static BEGIN = new Keyword("BEGIN")
  static BETWEEN = new Keyword("BETWEEN", { reserved: true })
  static BIGINT = new Keyword("BIGINT", { reserved: true })
  static BINARY = new Keyword("BINARY", { reserved: true })
  static BINLOG = new Keyword("BINLOG")
  static BIT = new Keyword("BIT")
  static BLOB = new Keyword("BLOB", { reserved: true })
  static BOOL = new Keyword("BOOL")
  static BOOLEAN = new Keyword("BOOLEAN")
  static BOTH = new Keyword("BOTH", { reserved: true })
  static BTREE = new Keyword("BTREE")
  static BY = new Keyword("BY", { reserved: true })
  static CALL = new Keyword("CALL", { reserved: true })
  static CACHE = new Keyword("CACHE")
  static CASCADE = new Keyword("CASCADE", { reserved: true })
  static CASCADED = new Keyword("CASCADED")
  static CASE = new Keyword("CASE", { reserved: true })
  static CHAIN = new Keyword("CHAIN")
  static CHANGE = new Keyword("CHANGE", { reserved: true })
  static CHAR = new Keyword("CHAR", { reserved: true })
  static CHARACTER = new Keyword("CHARACTER", { reserved: true })
  static CHARSET = new Keyword("CHARSET")
  static CHECK = new Keyword("CHECK", { reserved: true })
  static CHECKSUM = new Keyword("CHECKSUM")
  static CIPHER = new Keyword("CIPHER")
  static COLLATE = new Keyword("COLLATE", { reserved: true })
  static CLONE = new Keyword("CLONE")
  static COLUMN = new Keyword("COLUMN", { reserved: true })
  static COLUMN_FORMAT = new Keyword("COLUMN_FORMAT")
  static COLUMNS = new Keyword("COLUMNS")
  static COMMENT = new Keyword("COMMENT")
  static COMMIT = new Keyword("COMMIT")
  static COMMITTED = new Keyword("COMMITTED")
  static COMPACT = new Keyword("COMPACT")
  static COMPRESSED = new Keyword("COMPRESSED")
  static COMPRESSION = new Keyword("COMPRESSION")
  static COMPONENT = new Keyword("COMPONENT")
  static CONCURRENT = new Keyword("CONCURRENT")
  static CONDITION = new Keyword("CONDITION", { reserved: true })
  static CONNECTION = new Keyword("CONNECTION")
  static CONSISTENT = new Keyword("CONSISTENT")
  static CONSTRAINT = new Keyword("CONSTRAINT", { reserved: true })
  static CONTAINS = new Keyword("CONTAINS")
  static CONTINUE = new Keyword("CONTINUE", { reserved: true })
  static CONVERT = new Keyword("CONVERT", { reserved: true })
  static COPY = new Keyword("COPY")
  static CREATE = new Keyword("CREATE", { reserved: true })
  static CROSS = new Keyword("CROSS", { reserved: true })
  static CUBE = new Keyword("CUBE", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.1", options.version || "0")
  } })
  static CUME_DIST = new Keyword("CUME_DIST", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static CURRENT = new Keyword("CURRENT")
  static CURRENT_DATE = new Keyword("CURRENT_DATE", { reserved: true })
  static CURRENT_TIME = new Keyword("CURRENT_TIME", { reserved: true })
  static CURRENT_TIMESTAMP = new Keyword("CURRENT_TIMESTAMP", { reserved: true })
  static CURRENT_USER = new Keyword("CURRENT_USER", { reserved: true })
  static CURSOR = new Keyword("CURSOR", { reserved: true })
  static D = new Keyword("D")
  static DATA = new Keyword("DATA")
  static DATABASE = new Keyword("DATABASE", { reserved: true })
  static DATABASES = new Keyword("DATABASES", { reserved: true })
  static DATAFILE = new Keyword("DATAFILE")
  static DATE = new Keyword("DATE")
  static DATETIME = new Keyword("DATETIME")
  static DAY = new Keyword("DAY")
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
    return options.package === "mysql" && semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static DESC = new Keyword("DESC", { reserved: true })
  static DESCRIBE = new Keyword("DESCRIBE", { reserved: true })
  static DES_KEY_FILE = new Keyword("DES_KEY_FILE", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies("<8.0.0", options.version || "0")
  } })
  static DETERMINISTIC = new Keyword("DETERMINISTIC", { reserved: true })
  static DIRECTORY = new Keyword("DIRECTORY")
  static DISABLE = new Keyword("DISABLE")
  static DISCARD = new Keyword("DISCARD")
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
    return options.package === "mysql" && semver.satisfies(">=8.0.4", options.version || "0")
  } })
  static ENABLE = new Keyword("ENABLE")
  static ENUM = new Keyword("ENUM")
  static ENCLOSED = new Keyword("ENCLOSED", { reserved: true })
  static ENCRYPTION = new Keyword("ENCRYPTION")
  static END = new Keyword("END")
  static ENDS = new Keyword("ENDS")
  static ENFORCED = new Keyword("ENFORCED")
  static ENGINE = new Keyword("ENGINE")
  static ENGINE_ATTRIBUTE = new Keyword("ENGINE_ATTRIBUTE")
  static ESCAPED = new Keyword("ESCAPED", { reserved: true })
  static EVENT = new Keyword("EVENT")
  static EVERY = new Keyword("EVERY")
  static EXCEPT = new Keyword("EXCEPT", { reserved: true })
  static EXCLUSIVE = new Keyword("EXCLUSIVE")
  static EXECUTE = new Keyword("EXECUTE")
  static EXISTS = new Keyword("EXISTS", { reserved: true })
  static EXIT = new Keyword("EXIT", { reserved: true })
  static EXPIRE = new Keyword("EXPIRE")
  static EXPLAIN = new Keyword("EXPLAIN", { reserved: true })
  static EXTENT_SIZE = new Keyword("EXTENT_SIZE")
  static FAILED_LOGIN_ATTEMPTS = new Keyword("FAILED_LOGIN_ATTEMPTS")
  static FALSE = new Keyword("FALSE", { reserved: true })
  static FETCH = new Keyword("FETCH", { reserved: true })
  static FILE_BLOCK_SIZE = new Keyword("FILE_BLOCK_SIZE")
  static FIRST = new Keyword("FIRST")
  static FIRST_VALUE = new Keyword("FIRST_VALUE", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static FIXED = new Keyword("FIXED")
  static FLOAT = new Keyword("FLOAT", { reserved: true })
  static FLUSH = new Keyword("FLUSH")
  static FOLLOWS = new Keyword("FOLLOWS")
  static FOR = new Keyword("FOR", { reserved: true })
  static FORCE = new Keyword("FORCE", { reserved: true })
  static FOREIGN = new Keyword("FOREIGN", { reserved: true })
  static FROM = new Keyword("FROM", { reserved: true })
  static FULL = new Keyword("FULL")
  static FULLTEXT = new Keyword("FULLTEXT", { reserved: true })
  static FUNCTION = new Keyword("FUNCTION", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.1", options.version || "0")
  } })
  static GENERATED = new Keyword("GENERATED", { reserved: true })
  static GET = new Keyword("GET", { reserved: true })
  static GLOBAL = new Keyword("GLOBAL")
  static GRANT = new Keyword("GRANT", { reserved: true })
  static GROUP = new Keyword("GROUP", { reserved: true })
  static GROUPING = new Keyword("GROUPING", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.1", options.version || "0")
  } })
  static GROUPS = new Keyword("GROUPS", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static HANDLER = new Keyword("HANDLER")
  static HASH = new Keyword("HASH")
  static HAVING = new Keyword("HAVING", { reserved: true })
  static HELP = new Keyword("HELP")
  static HIGH_PRIORITY = new Keyword("HIGH_PRIORITY", { reserved: true })
  static HISTORY = new Keyword("HISTORY")
  static HOUR = new Keyword("HOUR")
  static HOUR_MICROSECOND = new Keyword("HOUR_MICROSECOND", { reserved: true })
  static HOUR_MINUTE = new Keyword("HOUR_MINUTE", { reserved: true })
  static HOUR_SECOND = new Keyword("HOUR_SECOND", { reserved: true })
  static HOST = new Keyword("HOST")
  static IDENTIFIED = new Keyword("IDENTIFIED")
  static IF = new Keyword("IF", { reserved: true })
  static IGNORE = new Keyword("IGNORE", { reserved: true })
  static INPLACE = new Keyword("INPLACE")
  static IMPORT = new Keyword("IMPORT")
  static IN = new Keyword("IN", { reserved: true })
  static INACTIVE = new Keyword("INACTIVE")
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
    return options.package === "mysql" && semver.satisfies(">=8.0.4", options.version || "0")
  } })
  static KEY = new Keyword("KEY", { reserved: true })
  static KEY_BLOCK_SIZE = new Keyword("KEY_BLOCK_SIZE")
  static KEYS = new Keyword("KEYS", { reserved: true })
  static KILL = new Keyword("KILL", { reserved: true })
  static LAG = new Keyword("LAG", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static LANGUAGE = new Keyword("LANGUAGE")
  static LAST = new Keyword("LAST")
  static LAST_VALUE = new Keyword("LAST_VALUE", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static LATERAL = new Keyword("LATERAL", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.14", options.version || "0")
  } })
  static LEAD = new Keyword("LEAD", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static LEADING = new Keyword("LEADING", { reserved: true })
  static LEAVE = new Keyword("LEAVE", { reserved: true })
  static LEFT = new Keyword("LEFT", { reserved: true })
  static LESS = new Keyword("LESS")
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
    return options.package === "mysql" && semver.satisfies("<8.0.0", options.version || "0")
  } })
  static MASTER_SSL_VERIFY_SERVER_CERT = new Keyword("MASTER_SSL_VERIFY_SERVER_CERT", { reserved: true })
  static MATCH = new Keyword("MATCH", { reserved: true })
  static MAX_CONNECTIONS_PER_HOUR = new Keyword("MAX_CONNECTIONS_PER_HOUR")
  static MAX_QUERIES_PER_HOUR = new Keyword("MAX_QUERIES_PER_HOUR")
  static MAX_ROWS = new Keyword("MAX_ROWS")
  static MAX_SIZE = new Keyword("MAX_SIZE")
  static MAX_UPDATES_PER_HOUR = new Keyword("MAX_UPDATES_PER_HOUR")
  static MAX_USER_CONNECTIONS = new Keyword("MAX_USER_CONNECTIONS")
  static MAXVALUE = new Keyword("MAXVALUE", { reserved: true })
  static MEDIUMBLOB = new Keyword("MEDIUMBLOB", { reserved: true })
  static MEDIUMINT = new Keyword("MEDIUMINT", { reserved: true })
  static MEDIUMTEXT = new Keyword("MEDIUMTEXT", { reserved: true })
  static MEMORY = new Keyword("MEMORY")
  static MERGE = new Keyword("MERGE")
  static MIDDLEINT = new Keyword("MIDDLEINT", { reserved: true })
  static MIN_ROWS = new Keyword("MIN_ROWS")
  static MINUTE = new Keyword("MINUTE")
  static MINUTE_MICROSECOND = new Keyword("MINUTE_MICROSECOND", { reserved: true })
  static MINUTE_SECOND = new Keyword("MINUTE_SECOND", { reserved: true })
  static MOD = new Keyword("MOD", { reserved: true })
  static MODIFIES = new Keyword("MODIFIES", { reserved: true })
  static MODIFY = new Keyword("MODIFY")
  static MONTH = new Keyword("MONTH")
  static NAMES = new Keyword("NAMES")
  static NATIONAL = new Keyword("NATIONAL")
  static NATURAL = new Keyword("NATURAL", { reserved: true })
  static NCHAR = new Keyword("NCHAR")
  static NEVER = new Keyword("NEVER")
  static NONE = new Keyword("NONE")
  static NO = new Keyword("NO")
  static NOT = new Keyword("NOT", { reserved: true })
  static NO_WRITE_TO_BINLOG = new Keyword("NO_WRITE_TO_BINLOG", { reserved: true })
  static NODEGROUP = new Keyword("NODEGROUP")
  static NTH_VALUE = new Keyword("NTH_VALUE", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static NTILE = new Keyword("NTILE", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static NULL = new Keyword("NULL", { reserved: true })
  static NUMERIC = new Keyword("NUMERIC", { reserved: true })
  static NVARCHAR = new Keyword("NVARCHAR")
  static OF = new Keyword("OF", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.1", options.version || "0")
  } })
  static OLD = new Keyword("OLD")
  static ON = new Keyword("ON", { reserved: true })
  static ONLY = new Keyword("ONLY")
  static OPTIMIZE = new Keyword("OPTIMIZE", { reserved: true })
  static OPTIMIZER_COSTS = new Keyword("OPTIMIZER_COSTS", { reserved: true })
  static OPTION = new Keyword("OPTION", { reserved: true })
  static OPTIONAL = new Keyword("OPTIONAL")
  static OPTIONS = new Keyword("OPTIONS")
  static OPTIONALLY = new Keyword("OPTIONALLY", { reserved: true })
  static OR = new Keyword("OR", { reserved: true })
  static ORDER = new Keyword("ORDER", { reserved: true })
  static OUT = new Keyword("OUT", { reserved: true })
  static OUTER = new Keyword("OUTER", { reserved: true })
  static OUTFILE = new Keyword("OUTFILE", { reserved: true })
  static OVER = new Keyword("OVER", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static OWNER = new Keyword("OWNER")
  static PACK_KEYS = new Keyword("PACK_KEYS")
  static PARSE_GCOL_EXPR = new Keyword("PARSE_GCOL_EXPR", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies("<8.0.0", options.version || "0")
  } })
  static PARSER = new Keyword("PARSER")
  static PARTIAL = new Keyword("PARTIAL")
  static PARTITION = new Keyword("PARTITION", { reserved: true })
  static PARTITIONS = new Keyword("PARTITIONS")
  static PASSWORD = new Keyword("PASSWORD")
  static PASSWORD_LOCK_TIME = new Keyword("PASSWORD_LOCK_TIME")
  static PERCENT_RANK = new Keyword("PERCENT_RANK", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static PLUGIN = new Keyword("PLUGIN")
  static PORT = new Keyword("PORT")
  static PRECEDES = new Keyword("PRECEDES")
  static PRECISION = new Keyword("PRECISION", { reserved: true })
  static PREPARE = new Keyword("PREPARE")
  static PRIMARY = new Keyword("PRIMARY", { reserved: true })
  static PROCEDURE = new Keyword("PROCEDURE", { reserved: true })
  static PURGE = new Keyword("PURGE", { reserved: true })
  static QUARTER = new Keyword("QUARTER")
  static QUICK = new Keyword("QUICK")
  static RANDOM = new Keyword("RANDOM")
  static RANGE = new Keyword("RANGE", { reserved: true })
  static RANK = new Keyword("RANK", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static READ = new Keyword("READ", { reserved: true })
  static READS = new Keyword("READS", { reserved: true })
  static READ_WRITE = new Keyword("READ_WRITE", { reserved: true })
  static REAL = new Keyword("REAL", { reserved: true })
  static RECOVER = new Keyword("RECOVER")
  static RECURSIVE = new Keyword("RECURSIVE", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.1", options.version || "0")
  } })
  static REDO_BUFFER_SIZE = new Keyword("REDO_BUFFER_SIZE")
  static REDOFILE = new Keyword("REDOFILE", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies("<8.0.0", options.version || "0")
  } })
  static REDUNDANT = new Keyword("REDUNDANT")
  static REFERENCE = new Keyword("REFERENCE")
  static REFERENCES = new Keyword("REFERENCES", { reserved: true })
  static REGEXP = new Keyword("REGEXP", { reserved: true })
  static RELEASE = new Keyword("RELEASE", { reserved: true })
  static RENAME = new Keyword("RENAME", { reserved: true })
  static REPAIR = new Keyword("REPAIR")
  static REPEAT = new Keyword("REPEAT", { reserved: true })
  static REPEATABLE = new Keyword("REPEATABLE")
  static REPLACE = new Keyword("REPLACE", { reserved: true })
  static REPLICA = new Keyword("REPLICA")
  static REQUIRE = new Keyword("REQUIRE", { reserved: true })
  static RESET = new Keyword("RESET")
  static RESIGNAL = new Keyword("RESIGNAL", { reserved: true })
  static RESOURCE = new Keyword("RESOURCE")
  static RESTART = new Keyword("RESTART")
  static RESTRICT = new Keyword("RESTRICT", { reserved: true })
  static RETAIN = new Keyword("RETAIN")
  static RETURN = new Keyword("RETURN", { reserved: true })
  static REUSE = new Keyword("REUSE")
  static REVOKE = new Keyword("REVOKE", { reserved: true })
  static RIGHT = new Keyword("RIGHT", { reserved: true })
  static RLIKE = new Keyword("RLIKE", { reserved: true })
  static ROLE = new Keyword("ROLE")
  static ROLLBACK = new Keyword("ROLLBACK")
  static ROW = new Keyword("ROW", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static ROW_FORMAT = new Keyword("ROW_FORMAT")
  static ROWS = new Keyword("ROWS", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static ROW_NUMBER = new Keyword("ROW_NUMBER", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static SAVEPOINT = new Keyword("SAVEPOINT")
  static SECURITY = new Keyword("SECURITY")
  static SCHEDULE = new Keyword("SCHEDULE")
  static SCHEMA = new Keyword("SCHEMA", { reserved: true })
  static SCHEMAS = new Keyword("SCHEMAS", { reserved: true })
  static SECOND = new Keyword("SECOND")
  static SECOND_MICROSECOND = new Keyword("SECOND_MICROSECOND", { reserved: true })
  static SECONDARY_ENGINE_ATTRIBUTE = new Keyword("SECONDARY_ENGINE_ATTRIBUTE")
  static SELECT = new Keyword("SELECT", { reserved: true })
  static SENSITIVE = new Keyword("SENSITIVE", { reserved: true })
  static SEPARATOR = new Keyword("SEPARATOR", { reserved: true })
  static SERIALIZABLE = new Keyword("SERIALIZABLE")
  static SERVER = new Keyword("SERVER")
  static SESSION = new Keyword("SESSION")
  static SET = new Keyword("SET", { reserved: true })
  static SHARED = new Keyword("SHARED")
  static SHOW = new Keyword("SHOW", { reserved: true })
  static SHUTDOWN = new Keyword("SHUTDOWN")
  static SIGNAL = new Keyword("SIGNAL", { reserved: true })
  static SIGNED = new Keyword("SIGNED")
  static SIMPLE = new Keyword("SIMPLE")
  static SLAVE = new Keyword("SLAVE")
  static SMALLINT = new Keyword("SMALLINT", { reserved: true })
  static SNAPSHOT = new Keyword("SNAPSHOT")
  static SOCKET = new Keyword("SOCKET")
  static SPATIAL = new Keyword("SPATIAL", { reserved: true })
  static SPECIFIC = new Keyword("SPECIFIC", { reserved: true })
  static SQL = new Keyword("SQL", { reserved: true })
  static SQLEXCEPTION = new Keyword("SQLEXCEPTION", { reserved: true })
  static SQLSTATE = new Keyword("SQLSTATE", { reserved: true })
  static SQLWARNING = new Keyword("SQLWARNING", { reserved: true })
  static SQL_BIG_RESULT = new Keyword("SQL_BIG_RESULT", { reserved: true })
  static SQL_CACHE = new Keyword("SQL_CACHE", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies("<8.0.0", options.version || "0")
  } })
  static SQL_CALC_FOUND_ROWS = new Keyword("SQL_CALC_FOUND_ROWS", { reserved: true })
  static SQL_SMALL_RESULT = new Keyword("SQL_SMALL_RESULT", { reserved: true })
  static SSL = new Keyword("SSL", { reserved: true })
  static START = new Keyword("START")
  static STARTING = new Keyword("STARTING", { reserved: true })
  static STARTS = new Keyword("STARTS")
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
    return options.package === "mysql" && semver.satisfies(">=8.0.3", options.version || "0")
  } })
  static T = new Keyword("T")
  static TABLE = new Keyword("TABLE", { reserved: true })
  static TABLES = new Keyword("TABLES")
  static TABLESPACE = new Keyword("TABLESPACE")
  static TEMPORARY = new Keyword("TEMPORARY")
  static TEMPTABLE = new Keyword("TEMPTABLE")
  static TERMINATED = new Keyword("TERMINATED", { reserved: true })
  static TEXT = new Keyword("TEXT")
  static THAN = new Keyword("THAN")
  static THEN = new Keyword("THEN", { reserved: true })
  static THREAD_PRIORITY = new Keyword("THREAD_PRIORITY")
  static TIME = new Keyword("TIME")
  static TIMESTAMP = new Keyword("TIMESTAMP")
  static TINYBLOB = new Keyword("TINYBLOB", { reserved: true })
  static TINYINT = new Keyword("TINYINT", { reserved: true })
  static TINYTEXT = new Keyword("TINYTEXT", { reserved: true })
  static TO = new Keyword("TO", { reserved: true })
  static TRAILING = new Keyword("TRAILING", { reserved: true })
  static TRANSACTION = new Keyword("TRANSACTION")
  static TRIGGER = new Keyword("TRIGGER", { reserved: true })
  static TRUE = new Keyword("TRUE", { reserved: true })
  static TRUNCATE = new Keyword("TRUNCATE")
  static TS = new Keyword("TS")
  static TYPE = new Keyword("TYPE")
  static UNBOUNDED = new Keyword("UNBOUNDED")
  static UNCOMMITTED = new Keyword("UNCOMMITTED")
  static UNDEFINED = new Keyword("UNDEFINED")
  static UNDO = new Keyword("UNDO", { reserved: true })
  static UNDO_BUFFER_SIZE = new Keyword("UNDO_BUFFER_SIZE")
  static UNDOFILE = new Keyword("UNDOFILE")
  static UNICODE = new Keyword("UNICODE")
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
  static VISIBLE = new Keyword("VISIBLE")
  static WITHOUT = new Keyword("WITHOUT")
  static INVISIBLE = new Keyword("INVISIBLE")
  static WAIT = new Keyword("WAIT")
  static WEEK = new Keyword("WEEK")
  static WHEN = new Keyword("WHEN", { reserved: true })
  static WHERE = new Keyword("WHERE", { reserved: true })
  static WHILE = new Keyword("WHILE", { reserved: true })
  static WINDOW = new Keyword("WINDOW", { reserved: function(options: { [ key:string]:any}) {
    return options.package === "mysql" && semver.satisfies(">=8.0.2", options.version || "0")
  } })
  static WITH = new Keyword("WITH", { reserved: true })
  static WORK = new Keyword("WORK")
  static WRAPPER = new Keyword("WRAPPER")
  static WRITE = new Keyword("WRITE", { reserved: true })
  static X509 = new Keyword("X509")
  static XA = new Keyword("XA")
  static XML = new Keyword("XML")
  static XOR = new Keyword("XOR", { reserved: true })
  static YEAR = new Keyword("YEAR")
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
    public name: string,
    public options: { [key: string]: any } = {}
  ) {
    KeywordMap.set(name, this)
  }

  toString() {
    return this.name
  }
}

const COMMAND_PATTERN = "^(\\?|\\\\[!-~]|clear|connect|delimiter|edit|ego|exit|go|help|nopager|notee|pager|print|prompt|quit|rehash|source|status|system|tee|use|charset|warnings|nowarning)(?:[ \\t]*.*)"

export class MysqlLexer extends Lexer {
  private reserved = new Set<Keyword>()
  private reCommand = new RegExp(COMMAND_PATTERN + "(;|$)", "imy")
  private reDelimiter = new RegExp(";", "y")

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
      { type: TokenType.String, re: /([bBnN]|_[a-zA-Z]+)?'([^']|'')*'/y },
      { type: TokenType.QuotedValue, re: /([bBnN]|_[a-zA-Z]+)?"([^"]|"")*"/y },
      { type: TokenType.QuotedIdentifier, re: /`([^`]|``)*`/y },
      { type: TokenType.BindVariable, re: /\?/y },
      { type: TokenType.SessionVariable, re: /@@[a-zA-Z0-9._$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*|`([^`]|``)*`|'([^']|'')*'|"([^"]|"")*"/y },
      { type: TokenType.UserDefinedVariable, re: /@[a-zA-Z0-9._$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*|`([^`]|``)*`|'([^']|'')*'|"([^"]|"")*"/y },
      { type: TokenType.Identifier, re: /[a-zA-Z_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y },
      { type: TokenType.Operator, re: /\|\|&&|<=>|<<|>>|<>|->>?|[=<>!:]=?|[~&|^*/%+-]/y },
      { type: TokenType.At, re: /@/y },
      { type: TokenType.Error, re: /./y },
    ])

    if (Array.isArray(options.reservedWords)) {
      const reserved = new Set<string>()
      for (const keyword of options.reservedWords) {
        reserved.add(ucase(keyword))
      }
      for (const keyword of KeywordMap.values()) {
        if (reserved.has(keyword.name)) {
          this.reserved.add(keyword)
        }
      }
    } else {
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
  }

  protected filter(input: string) {
    return input.replace(/\/\*!([0-9]*)(.*?)\*\//sg, (m, p1, p2) => {
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
    } else if (token.type === TokenType.Command) {
      const result = parseCommand(token.text)
      if (result && result.name === "delimiter" && result.args.length > 0) {
        const sep = escapeRegExp(result.args[0])
        this.reCommand = new RegExp(`${COMMAND_PATTERN}(${sep}|$)`, "imy")
        this.reDelimiter = new RegExp(sep, "y")
      }
    }
    return token
  }
}

export class MysqlParser extends Parser {
  private sqlMode = new Set<string>()

  constructor(
    input: string,
    options: { [key: string]: any } = {},
  ) {
    super(input, new MysqlLexer(options), options)

    if (options.sqlMode) {
      this.setSqlMode(options.sqlMode)
    } else {
      this.sqlMode.add("ONLY_FULL_GROUP_BY")
      this.sqlMode.add("STRICT_TRANS_TABLES")
      this.sqlMode.add("NO_ZERO_IN_DATE")
      this.sqlMode.add("NO_ZERO_DATE")
      this.sqlMode.add("ERROR_FOR_DIVISION_BY_ZERO")
      this.sqlMode.add("NO_ENGINE_SUBSTITUTION")
    }
  }

  private setSqlMode(text: string) {
    this.sqlMode.clear()
    for (let mode of text.split(/,/g)) {
      mode = ucase(mode)
      if (mode === "ANSI") {
        this.sqlMode.add("REAL_AS_FLOAT")
        this.sqlMode.add("PIPES_AS_CONCAT")
        this.sqlMode.add("ANSI_QUOTES")
        this.sqlMode.add("IGNORE_SPACE")
        this.sqlMode.add("ONLY_FULL_GROUP_BY")
      } else if (mode === "TRADITIONAL") {
        this.sqlMode.add("STRICT_TRANS_TABLES")
        this.sqlMode.add("STRICT_ALL_TABLES")
        this.sqlMode.add("NO_ZERO_IN_DATE")
        this.sqlMode.add("NO_ZERO_DATE")
        this.sqlMode.add("ERROR_FOR_DIVISION_BY_ZERO")
        this.sqlMode.add("NO_ENGINE_SUBSTITUTION")
      } else {
        this.sqlMode.add(mode)
      }
    }
  }

  root() {
    const root = []
    const errors = []
    for (
      let i = 0;
      this.token() && (
        i === 0 ||
        this.consumeIf(TokenType.Delimiter) ||
        root[root.length - 1] instanceof model.CommandStatement
      );
      i++
    ) {
      try {
        if (this.peekIf(TokenType.Command)) {
          const stmt = this.command()
          stmt.validate()
          root.push(stmt)
        } else if (this.token() && !this.peekIf(TokenType.Delimiter)) {
          const stmt = this.statement()
          stmt.validate()
          root.push(stmt)
        }
      } catch (e) {
        if (e instanceof ParseError) {
          errors.push(e)

          // skip tokens
          while (this.token() && !this.peekIf(TokenType.Delimiter)) {
            this.consume()
          }
        } else {
          throw e
        }
      }
    }

    if (this.token() != null) {
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
      throw new AggregateParseError(errors, `${errors.length} error found\n${errors.map(
        e => e.message
      ).join("\n")}`)
    }

    return root
  }

  command() {
    const start = this.pos
    this.consume(TokenType.Command)
    const stmt = new model.CommandStatement()
    const command = parseCommand(this.token(-1).text || "")
    if (command) {
      stmt.name = command.name
      stmt.args = command.args
    } else {
      throw this.createParseError()
    }

    stmt.tokens = this.tokens.slice(start, this.pos)
    return stmt
  }

  statement() {
    const start = this.pos

    let stmt
    if (this.consumeIf(Keyword.CREATE)) {
      if (this.consumeIf(Keyword.DATABASE) || this.consumeIf(Keyword.SCHEMA)) {
        stmt = new model.CreateDatabaseStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.NOT)
          this.consume(Keyword.EXISTS)
          stmt.ifNotExists = true
        }
        stmt.name = this.identifier()
        while (this.token()) {
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
      } else if (this.consumeIf(Keyword.SERVER)) {
        stmt = new model.CreateServerStatement()
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
      } else if (this.consumeIf(Keyword.RESOURCE)) {
        this.consume(Keyword.GROUP)
        stmt = new model.CreateResourceGroupStatement()
        stmt.name = this.identifier()
        this.consume(Keyword.TYPE)
        this.consume(Keyword.OPE_EQ)
        if (this.consumeIf(Keyword.SYSTEM)) {
          stmt.type = model.ResourceGroupType.SYSTEM
        } else if (this.consumeIf(Keyword.USER)) {
          stmt.type = model.ResourceGroupType.USER
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
      } else if (this.consumeIf(Keyword.LOGFILE)) {
        this.consume(Keyword.GROUP)
        stmt = new model.CreateLogfileGroupStatement()
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
      } else if (this.peekIf(Keyword.UNDO) || this.peekIf(Keyword.TABLESPACE)) {
        stmt = new model.CreateTablespaceStatement()
        if (this.consumeIf(Keyword.UNDO)) {
          stmt.undo = true
        }
        this.consume(Keyword.TABLESPACE)
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
      } else if (this.consumeIf(Keyword.ROLE)) {
        stmt = new model.CreateRoleStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.NOT)
          this.consume(Keyword.EXISTS)
          stmt.ifNotExists = true
        }
        for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
          stmt.roles.push(this.userRole())
        }
      } else if (this.consumeIf(Keyword.USER)) {
        stmt = new model.CreateUserStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.NOT)
          this.consume(Keyword.EXISTS)
          stmt.ifNotExists = true
        }
        for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
          const user = this.userRole()
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
            stmt.defaultRoles.push(this.userRole())
          }
        }
        if (this.consumeIf(Keyword.REQUIRE)) {
          if (this.consumeIf(Keyword.NONE)) {
            // no handle
          } else {
            for (let i = 0; true; i++) {
              if (i > 0) {
                this.consumeIf(Keyword.AND)
              }
              if (this.consumeIf(Keyword.SSL)) {
                stmt.tlsOptions.push({ key: "SSL", value: true })
              } else if (this.consumeIf(Keyword.X509)) {
                stmt.tlsOptions.push({ key: "X509", value: true })
              } else if (this.consumeIf(Keyword.ISSUER)) {
                stmt.tlsOptions.push({ key: "ISSUER", value: this.stringValue() })
              } else if (this.consumeIf(Keyword.SUBJECT)) {
                stmt.tlsOptions.push({ key: "SUBJECT", value: this.stringValue() })
              } else if (this.consumeIf(Keyword.CIPHER)) {
                stmt.tlsOptions.push({ key: "CIPHER", value: this.stringValue() })
              } else {
                break
              }
            }
          }
        }
        if (this.consumeIf(Keyword.WITH)) {
          while (true) {
            if (this.consumeIf(Keyword.MAX_QUERIES_PER_HOUR)) {
              stmt.resourceOptions.push({ key: "MAX_QUERIES_PER_HOUR", value: this.numberValue() })
            } else if (this.consumeIf(Keyword.MAX_UPDATES_PER_HOUR)) {
              stmt.resourceOptions.push({ key: "MAX_UPDATES_PER_HOUR", value: this.numberValue() })
            } else if (this.consumeIf(Keyword.MAX_CONNECTIONS_PER_HOUR)) {
              stmt.resourceOptions.push({ key: "MAX_CONNECTIONS_PER_HOUR", value: this.numberValue() })
            } else if (this.consumeIf(Keyword.MAX_USER_CONNECTIONS)) {
              stmt.resourceOptions.push({ key: "MAX_USER_CONNECTIONS", value: this.numberValue() })
            } else {
              break
            }
          }
        }
        while (this.token()) {
          if (this.consumeIf(Keyword.PASSWORD)) {
            if (this.consumeIf(Keyword.EXPIRE)) {
              if (this.consumeIf(Keyword.DEFAULT)) {
                stmt.passwordOptions.push({ key: "PASSWORD EXPIRE", value: "DEFAULT" })
              } else if (this.consumeIf(Keyword.NEVER)) {
                stmt.passwordOptions.push({ key: "PASSWORD EXPIRE", value: "NEVER" })
              } else if (this.consumeIf(Keyword.INTERVAL)) {
                stmt.passwordOptions.push({ key: "PASSWORD EXPIRE", value: this.numberValue() })
                this.consumeIf(Keyword.DAY)
              } else {
                stmt.passwordOptions.push({ key: "PASSWORD EXPIRE", value: true })
              }
            } else if (this.consumeIf(Keyword.HISTORY)) {
              if (this.consumeIf(Keyword.DEFAULT)) {
                stmt.passwordOptions.push({ key: "PASSWORD HISTORY", value: "DEFAULT" })
              } else {
                stmt.passwordOptions.push({ key: "PASSWORD HISTORY", value: this.numberValue() })
              }
            } else if (this.consumeIf(Keyword.REUSE)) {
              this.consume(Keyword.INTERVAL)
              if (this.consumeIf(Keyword.DEFAULT)) {
                stmt.passwordOptions.push({ key: "PASSWORD REUSE INTERVAL", value: "DEFAULT" })
              } else {
                stmt.passwordOptions.push({ key: "PASSWORD REUSE INTERVAL", value: this.numberValue() })
                this.consumeIf(Keyword.DAY)
              }
            } else if (this.consumeIf(Keyword.REQUIRE)) {
              this.consumeIf(Keyword.CURRENT)
              if (this.consumeIf(Keyword.DEFAULT)) {
                stmt.passwordOptions.push({ key: "PASSWORD REQUIRE CURRENT", value: "DEFAULT" })
              } else if (this.consumeIf(Keyword.OPTIONAL)) {
                stmt.passwordOptions.push({ key: "PASSWORD REQUIRE CURRENT", value: "OPTIONAL" })
              } else {
                stmt.passwordOptions.push({ key: "PASSWORD REQUIRE CURRENT", value: true })
              }
            } else {
              throw this.createParseError()
            }
          } else if (this.consumeIf(Keyword.FAILED_LOGIN_ATTEMPTS)) {
            stmt.passwordOptions.push({ key: "FAILED_LOGIN_ATTEMPTS", value: this.numberValue() })
          } else if (this.consumeIf(Keyword.PASSWORD_LOCK_TIME)) {
            if (this.consumeIf(Keyword.UNBOUNDED)) {
              stmt.passwordOptions.push({ key: "PASSWORD_LOCK_TIME", value: "UNBOUNDED" })
            } else {
              stmt.passwordOptions.push({ key: "PASSWORD_LOCK_TIME", value: this.numberValue() })
            }
          } else if (this.consumeIf(Keyword.ACCOUNT)) {
            if (this.consumeIf(Keyword.LOCK)) {
              stmt.lockOptions.push({ key: "ACCOUNT LOCK", value: true })
            } else if (this.consumeIf(Keyword.UNLOCK)) {
              stmt.lockOptions.push({ key: "ACCOUNT UNLOCK", value: true })
            } else {
              throw this.createParseError()
            }
          } else {
            break
          }
        }
        if (this.consumeIf(Keyword.COMMENT)) {
          stmt.comment = this.stringValue()
        } else if (this.consumeIf(Keyword.ATTRIBUTE)) {
          stmt.attribute = this.stringValue()
        }
      } else if (this.peekIf(Keyword.TEMPORARY) || this.peekIf(Keyword.TABLE)) {
        stmt = new model.CreateTableStatement()
        if (this.consumeIf(Keyword.TEMPORARY)) {
          stmt.temporary = true
        }
        this.consume(Keyword.TABLE)
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.NOT)
          this.consume(Keyword.EXISTS)
          stmt.ifNotExists = true
        }
      } else if (this.consumeIf(Keyword.UNIQUE)) {
        this.consume(Keyword.INDEX)
        stmt = new model.CreateIndexStatement()
        stmt.type = model.IndexType.UNIQUE
      } else if (this.consumeIf(Keyword.FULLTEXT)) {
        this.consume(Keyword.INDEX)
        stmt = new model.CreateIndexStatement()
        stmt.type = model.IndexType.FULLTEXT
      } else if (this.consumeIf(Keyword.SPATIAL, Keyword.INDEX)) {
        this.consume(Keyword.INDEX)
        stmt = new model.CreateIndexStatement()
        stmt.type = model.IndexType.SPATIAL
      } else if (this.consumeIf(Keyword.INDEX)) {
        stmt = new model.CreateIndexStatement()
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
            algorithm = model.Algortihm.UNDEFINED
          } else if (this.consumeIf(Keyword.MERGE)) {
            algorithm = model.Algortihm.MERGE
          } else if (this.consumeIf(Keyword.TEMPTABLE)) {
            algorithm = model.Algortihm.TEMPTABLE
          } else {
            throw this.createParseError()
          }
        }

        let definer
        let aggregate = false
        if (this.consumeIf(Keyword.DEFINER)) {
          this.consume(Keyword.OPE_EQ)
          definer = this.userRole()
        } else if (this.consumeIf(Keyword.AGGREGATE)) {
          aggregate = true
        }

        let sqlSecurity
        if (this.consumeIf(Keyword.SQL)) {
          this.consume(Keyword.SECURITY)
          if (this.peekIf(Keyword.DEFINER)) {
            sqlSecurity = model.SqlSecurity.DEFINER
          } else if (this.peekIf(Keyword.INVOKER)) {
            sqlSecurity = model.SqlSecurity.INVOKER
          } else {
            throw this.createParseError()
          }
        }

        if (
          !algorithm && !aggregate && !sqlSecurity &&
          this.consumeIf(Keyword.SPATIAL)
        ) {
          this.consume(Keyword.REFERENCE)
          this.consume(Keyword.SYSTEM)
          stmt = new model.CreateSpatialReferenceSystemStatement()
          stmt.orReplace = true
          stmt.srid = this.numberValue()
        } else if (
          !aggregate &&
          this.consumeIf(Keyword.VIEW)
        ) {
          stmt = new model.CreateViewStatement()
          stmt.orReplace = orReplace
          stmt.algorithm = algorithm
          stmt.definer = definer
          stmt.sqlSecurity = sqlSecurity
        } else if (
          !orReplace && !algorithm && !aggregate && !sqlSecurity &&
          this.consumeIf(Keyword.PROCEDURE)
        ) {
          stmt = new model.CreateProcedureStatement()
          stmt.definer = definer
        } else if (
          !orReplace && !algorithm && !sqlSecurity &&
          this.consumeIf(Keyword.FUNCTION)
        ) {
          stmt = new model.CreateFunctionStatement()
          stmt.definer = definer
          stmt.aggregate = aggregate
        } else if (
          !orReplace && !algorithm && !aggregate && !sqlSecurity &&
          this.consumeIf(Keyword.TRIGGER)
        ) {
          stmt = new model.CreateTriggerStatement()
          stmt.definer = definer
        } else if (
          !orReplace && !algorithm && !aggregate && !sqlSecurity &&
          this.consumeIf(Keyword.EVENT)
        ) {
          stmt = new model.CreateEventStatement()
          stmt.definer = definer
          if (this.consumeIf(Keyword.IF)) {
            this.consume(Keyword.NOT)
            this.consume(Keyword.EXISTS)
            stmt.ifNotExists = true
          }
        } else {
          throw this.createParseError()
        }
      }

      if (stmt instanceof model.CreateTableStatement) {
        const obj = this.schemaObject()
        stmt.schemaName = obj.schemaName
        stmt.name = obj.name

        if (this.consumeIf(Keyword.LIKE)) {
          stmt.like = this.schemaObject()
        } else if (this.consumeIf(TokenType.LeftParen)) {
          if (this.consumeIf(Keyword.LIKE)) {
            stmt.like = this.schemaObject()
          } else {
            stmt.columns = []
            stmt.constraints = []
            for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
              let constraintName
              let constraint
              if (this.consumeIf(Keyword.CONSTRAINT)) {
                if (
                  !this.peekIf(Keyword.PRIMARY) &&
                  !this.peekIf(Keyword.UNIQUE) &&
                  !this.peekIf(Keyword.FOREIGN) &&
                  !this.peekIf(Keyword.CHECK)
                ) {
                  constraintName = this.identifier()
                }
                if (this.consumeIf(Keyword.PRIMARY)) {
                  this.consume(Keyword.KEY)
                  constraint = new model.IndexConstraint()
                  constraint.type = model.IndexType.PRIMARY_KEY
                } else if (this.consumeIf(Keyword.UNIQUE)) {
                  if (this.consumeIf(Keyword.INDEX) || this.consumeIf(Keyword.KEY)) {
                    constraint = new model.IndexConstraint()
                    constraint.type = model.IndexType.UNIQUE
                  } else {
                    throw this.createParseError()
                  }
                } else if (this.consumeIf(Keyword.FOREIGN)) {
                  this.consume(Keyword.KEY)
                  constraint = new model.ForeignKeyConstraint()
                } else if (this.consumeIf(Keyword.CHECK)) {
                  constraint = new model.CheckConstraint()
                } else {
                  throw this.createParseError()
                }
              } else if (this.consumeIf(Keyword.PRIMARY)) {
                this.consume(Keyword.KEY)
                constraint = new model.IndexConstraint()
                constraint.type = model.IndexType.PRIMARY_KEY
              } else if (this.consumeIf(Keyword.UNIQUE)) {
                if (this.consumeIf(Keyword.INDEX) || this.consumeIf(Keyword.KEY)) {
                  constraint = new model.IndexConstraint()
                  constraint.type = model.IndexType.UNIQUE
                } else {
                  throw this.createParseError()
                }
              } else if (this.consumeIf(Keyword.FOREIGN)) {
                this.consume(Keyword.KEY)
                constraint = new model.ForeignKeyConstraint()
              } else if (this.consumeIf(Keyword.CHECK)) {
                constraint = new model.CheckConstraint()
              } else if (this.consumeIf(Keyword.FULLTEXT)) {
                if (this.consumeIf(Keyword.INDEX) || this.consumeIf(Keyword.KEY)) {
                  constraint = new model.IndexConstraint()
                  constraint.type = model.IndexType.FULLTEXT
                } else {
                  throw this.createParseError()
                }
              } else if (this.consumeIf(Keyword.SPATIAL)) {
                if (this.consumeIf(Keyword.INDEX) || this.consumeIf(Keyword.KEY)) {
                  constraint = new model.IndexConstraint()
                  constraint.type = model.IndexType.SPATIAL
                } else {
                  throw this.createParseError()
                }
              } else if (this.consumeIf(Keyword.INDEX) || this.consumeIf(Keyword.KEY)) {
                constraint = new model.IndexConstraint()
              } else {
                stmt.columns.push(this.tableColumn())
              }

              if (constraint instanceof model.IndexConstraint) {
                constraint.name = constraintName
                if (!this.peekIf(Keyword.USING) && !this.peekIf(TokenType.LeftParen)) {
                  constraint.indexName = this.identifier()
                }

                if (this.consumeIf(Keyword.USING)) {
                  if (this.consumeIf(Keyword.BTREE)) {
                    constraint.algorithm = model.IndexAlgorithm.BTREE
                  } else if (this.consumeIf(Keyword.HASH)) {
                    constraint.algorithm = model.IndexAlgorithm.HASH
                  } else {
                    throw this.createParseError()
                  }
                }
                this.consume(TokenType.LeftParen)
                for (let j = 0; j === 0 || this.consumeIf(TokenType.Comma); j++) {
                  const keyPart = new model.KeyPart()
                  if (this.consumeIf(TokenType.LeftParen)) {
                    keyPart.expression = this.expression()
                    this.consumeIf(TokenType.RightParen)
                  } else {
                    keyPart.column = this.identifier()
                  }
                  if (this.consumeIf(Keyword.ASC)) {
                    keyPart.sortOrder = model.SortOrder.ASC
                  } else if (this.consumeIf(Keyword.DESC)) {
                    keyPart.sortOrder = model.SortOrder.DESC
                  }
                  constraint.keyParts.push(keyPart)
                }
                this.consume(TokenType.RightParen)
              } else if (constraint instanceof model.ForeignKeyConstraint) {
                constraint.name = constraintName
                if (!this.peekIf(TokenType.LeftParen)) {
                  constraint.indexName = this.identifier()
                }
                this.consume(TokenType.LeftParen)
                for (let j = 0; j === 0 || this.consumeIf(TokenType.Comma); j++) {
                  constraint.columns.push(this.identifier())
                }
                this.consume(TokenType.RightParen)
                constraint.references = this.references()
              } else if (constraint instanceof model.CheckConstraint) {
                constraint.name = constraintName
                this.consume(TokenType.LeftParen)
                constraint.expression = this.expression()
                this.consume(TokenType.RightParen)

                if (this.consumeIf(Keyword.NOT)) {
                  this.consume(Keyword.ENFORCED)
                  constraint.enforced = false
                } else if (this.consumeIf(Keyword.ENFORCED)) {
                  constraint.enforced = true
                }
              }
            }
          }
          this.consumeIf(TokenType.RightParen)
        } else {
          stmt.asSelect = true
        }

        if (!stmt.like) {
          for (let i = 0; i === 0 || !this.consumeIf(TokenType.Delimiter); i++) {
            this.consumeIf(TokenType.Comma)
            if (this.consumeIf(Keyword.AUTOEXTEND_SIZE)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.autoextendSize = this.sizeValue()
            } else if (this.consumeIf(Keyword.AUTO_INCREMENT)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.autoIncrement = this.numberValue()
            } else if (this.consumeIf(Keyword.AVG_ROW_LENGTH)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.avgRowLength = this.numberValue()
            } else if (
              this.consumeIf(Keyword.CHARACTER, Keyword.SET) ||
              this.consumeIf(Keyword.DEFAULT, Keyword.CHARACTER, Keyword.SET) ||
              this.consumeIf(Keyword.CHARSET) ||
              this.consumeIf(Keyword.DEFAULT, Keyword.CHARSET)
            ) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.characterSet = this.identifier()
            } else if (this.consumeIf(Keyword.CHECKSUM)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.checksum = this.numberValue()
            } else if (
              this.consumeIf(Keyword.COLLATE) ||
              this.consumeIf(Keyword.DEFAULT, Keyword.COLLATE)
            ) {
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
            } else if (this.consumeIf(Keyword.DATA, Keyword.DIRECTORY)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.dataDirectory = this.stringValue()
            } else if (this.consumeIf(Keyword.INDEX, Keyword.DIRECTORY)) {
              this.consumeIf(Keyword.OPE_EQ)
              stmt.indexDirectory = this.stringValue()
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
                stmt.insetMethod = model.InsertMethod.NO
              } else if (this.consumeIf(Keyword.FIRST)) {
                stmt.insetMethod = model.InsertMethod.FIRST
              } else if (this.consumeIf(Keyword.LAST)) {
                stmt.insetMethod = model.InsertMethod.LAST
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
                stmt.rowFormat = model.RowFormat.DEFAULT
              } else if (this.consumeIf(Keyword.DYNAMIC)) {
                stmt.rowFormat = model.RowFormat.DYNAMIC
              } else if (this.consumeIf(Keyword.FIXED)) {
                stmt.rowFormat = model.RowFormat.FIXED
              } else if (this.consumeIf(Keyword.COMPRESSED)) {
                stmt.rowFormat = model.RowFormat.COMPRESSED
              } else if (this.consumeIf(Keyword.REDUNDANT)) {
                stmt.rowFormat = model.RowFormat.REDUNDANT
              } else if (this.consumeIf(Keyword.COMPACT)) {
                stmt.rowFormat = model.RowFormat.COMPACT
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
                  stmt.storageType = model.StorageType.DISK
                } else if (this.consumeIf(Keyword.MEMORY)) {
                  stmt.storageType = model.StorageType.MEMORY
                } else {
                  throw this.createParseError()
                }
              }
            } else if (this.consumeIf(Keyword.UNION)) {
              this.consumeIf(Keyword.OPE_EQ)
              this.consume(TokenType.LeftParen)
              stmt.union = []
              for (let j = 0; j === 0 || this.consumeIf(TokenType.Comma); j++) {
                stmt.union.push(this.identifier())
              }
              this.consume(TokenType.RightParen)
            } else {
              break
            }
          }
          if (this.consumeIf(Keyword.PARTITION, Keyword.BY)) {
            if (
              this.consumeIf(Keyword.LINEAR, Keyword.HASH) ||
              this.consumeIf(Keyword.HASH)
            ) {
              const partition = new model.LinearHashPartition()
              this.consume(TokenType.LeftParen)
              partition.expression = this.expression()
              this.consume(TokenType.RightParen)
              stmt.partition = partition
            } else if (
              this.consumeIf(Keyword.LINEAR, Keyword.KEY) ||
              this.consumeIf(Keyword.KEY)
            ) {
              const partition = new model.LinearKeyPartition()
              if (this.consumeIf(Keyword.ALGORITHM)) {
                partition.algorithm = this.numberValue()
              }
              this.consume(TokenType.LeftParen)
              for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
                partition.columns.push(this.identifier())
              }
              this.consume(TokenType.RightParen)
              stmt.partition = partition
            } else if (this.consumeIf(Keyword.RANGE)) {
              const partition = new model.RangePartition()
              if (this.consumeIf(TokenType.LeftParen)) {
                partition.expression = this.expression()
                this.consume(TokenType.RightParen)
              } else if (this.consumeIf(Keyword.COLUMNS)) {
                this.consume(TokenType.LeftParen)
                partition.columns = []
                for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
                  partition.columns.push(this.identifier())
                }
                this.consume(TokenType.RightParen)
              }
              stmt.partition = partition
            } else if (this.consumeIf(Keyword.LIST)) {
              const partition = new model.ListPartition()
              if (this.consumeIf(TokenType.LeftParen)) {
                partition.expression = this.expression()
                this.consume(TokenType.RightParen)
              } else if (this.consumeIf(Keyword.COLUMNS)) {
                this.consume(TokenType.LeftParen)
                partition.columns = []
                for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
                  partition.columns.push(this.identifier())
                }
                this.consume(TokenType.RightParen)
              }
              stmt.partition = partition
            } else {
              throw this.createParseError()
            }
            if (this.consumeIf(Keyword.PARTITIONS)) {
              stmt.partition.num = this.numberValue()
            }
            if (this.consumeIf(Keyword.SUBPARTITION, Keyword.BY)) {
              if (
                this.consumeIf(Keyword.LINEAR, Keyword.HASH) ||
                this.consumeIf(Keyword.HASH)
              ) {
                const partition = new model.LinearHashPartition()
                this.consume(TokenType.LeftParen)
                partition.expression = this.expression()
                this.consume(TokenType.RightParen)
                stmt.partition.subpartition = partition
              } else if (
                this.consumeIf(Keyword.LINEAR, Keyword.KEY) ||
                this.consumeIf(Keyword.KEY)
              ) {
                const partition = new model.LinearKeyPartition()
                if (this.consumeIf(Keyword.ALGORITHM)) {
                  partition.algorithm = this.numberValue()
                }
                this.consume(TokenType.LeftParen)
                for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
                  partition.columns.push(this.identifier())
                }
                this.consume(TokenType.RightParen)
                stmt.partition.subpartition = partition
              } else {
                throw this.createParseError()
              }
              if (this.consumeIf(Keyword.PARTITIONS)) {
                stmt.partition.subpartition.num = this.numberValue()
              }
            }
            if (this.consumeIf(TokenType.LeftParen)) {
              for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
                this.consume(Keyword.PARTITION)
                const def = new model.PartitionDef()
                def.name = this.identifier()
                if (this.consumeIf(Keyword.VALUES)) {
                  if (this.consumeIf(Keyword.LESS)) {
                    this.consume(Keyword.THAN)
                    def.lessThanValues = []
                    if (this.consumeIf(TokenType.LeftParen)) {
                      for (let j = 0; j === 0 || this.consumeIf(TokenType.Comma); j++) {
                        if (this.consumeIf(Keyword.MAXVALUE)) {
                          def.lessThanValues.push("MAXVALUE")
                        } else {
                          def.lessThanValues.push(this.expression())
                        }
                      }
                      this.consume(TokenType.RightParen)
                    } else if (this.consumeIf(Keyword.MAXVALUE)) {
                      def.lessThanValues.push("MAXVALUE")
                    }
                  } else if (this.consumeIf(Keyword.IN)) {
                    def.inValues = []
                    this.consume(TokenType.LeftParen)
                    for (let j = 0; j === 0 || this.consumeIf(TokenType.Comma); j++) {
                      def.inValues.push(this.expression())
                    }
                    this.consume(TokenType.RightParen)
                  }
                }
                if (this.consumeIf(Keyword.STORAGE)) {
                  this.consume(Keyword.ENGINE)
                  def.storageEngine = this.identifier()
                } else if (this.consumeIf(Keyword.ENGINE)) {
                  def.storageEngine = this.identifier()
                }
                if (this.consumeIf(Keyword.COMMENT)) {
                  this.consumeIf(Keyword.OPE_EQ)
                  def.comment = this.stringValue()
                }
                if (this.consumeIf(Keyword.DATA, Keyword.DIRECTORY)) {
                  this.consumeIf(Keyword.OPE_EQ)
                  def.dataDirectory = this.stringValue()
                }
                if (this.consumeIf(Keyword.INDEX, Keyword.DIRECTORY)) {
                  this.consumeIf(Keyword.OPE_EQ)
                  def.indexDirectory = this.stringValue()
                }
                if (this.consumeIf(Keyword.MAX_ROWS)) {
                  this.consumeIf(Keyword.OPE_EQ)
                  def.maxRows = this.numberValue()
                }
                if (this.consumeIf(Keyword.MIN_ROWS)) {
                  this.consumeIf(Keyword.OPE_EQ)
                  def.minRows = this.numberValue()
                }
                if (this.consumeIf(Keyword.TABLESPACE)) {
                  this.consumeIf(Keyword.OPE_EQ)
                  def.tablespace = this.stringValue()
                }
                if (this.consumeIf(TokenType.LeftParen)) {
                  for (let j = 0; j === 0 || this.consumeIf(TokenType.Comma); j++) {
                    this.consume(Keyword.SUBPARTITION)
                    const subDef = new model.PartitionDef()
                    subDef.name = this.identifier()
                    if (this.consumeIf(Keyword.STORAGE)) {
                      this.consume(Keyword.ENGINE)
                      subDef.storageEngine = this.identifier()
                    } else if (this.consumeIf(Keyword.ENGINE)) {
                      subDef.storageEngine = this.identifier()
                    }
                    if (this.consumeIf(Keyword.COMMENT)) {
                      this.consumeIf(Keyword.OPE_EQ)
                      subDef.comment = this.stringValue()
                    }
                    if (this.consumeIf(Keyword.DATA, Keyword.DIRECTORY)) {
                      this.consumeIf(Keyword.OPE_EQ)
                      subDef.dataDirectory = this.stringValue()
                    }
                    if (this.consumeIf(Keyword.INDEX, Keyword.DIRECTORY)) {
                      this.consumeIf(Keyword.OPE_EQ)
                      subDef.indexDirectory = this.stringValue()
                    }
                    if (this.consumeIf(Keyword.MAX_ROWS)) {
                      this.consumeIf(Keyword.OPE_EQ)
                      subDef.maxRows = this.numberValue()
                    }
                    if (this.consumeIf(Keyword.MIN_ROWS)) {
                      this.consumeIf(Keyword.OPE_EQ)
                      subDef.minRows = this.numberValue()
                    }
                    if (this.consumeIf(Keyword.TABLESPACE)) {
                      this.consumeIf(Keyword.OPE_EQ)
                      subDef.tablespace = this.stringValue()
                    }
                    def.subdefs.push(subDef)
                  }
                  this.consume(TokenType.RightParen)
                }
                stmt.partition.defs.push(def)
              }
              this.consume(TokenType.RightParen)
            }
          }
          if (this.consumeIf(Keyword.IGNORE)) {
            stmt.conflictAction = model.ConflictAction.IGNORE
            stmt.asSelect = true
          } else if (this.consumeIf(Keyword.REPLACE)) {
            stmt.conflictAction = model.ConflictAction.REPLACE
            stmt.asSelect = true
          }
          if (this.consumeIf(Keyword.AS)) {
            stmt.asSelect = true
          }
          if (stmt.asSelect || this.peekIf(Keyword.WITH) || this.peekIf(Keyword.SELECT)) {
            this.selectClause()
          }
        }
      } else if (stmt instanceof model.CreateIndexStatement) {
        const obj = this.schemaObject()
        stmt.schemaName = obj.schemaName
        stmt.name = obj.name

        if (this.consumeIf(Keyword.USING)) {
          if (this.consumeIf(Keyword.BTREE)) {
            stmt.algorithm = model.IndexAlgorithm.BTREE
          } else if (this.consumeIf(Keyword.HASH)) {
            stmt.algorithm = model.IndexAlgorithm.HASH
          } else {
            throw this.createParseError()
          }
        }
        this.consume(Keyword.ON)
        stmt.table.schemaName = this.identifier()
        if (this.consumeIf(TokenType.Dot)) {
          stmt.table.schemaName = stmt.table.name
          stmt.table.name = this.identifier()
        }
        this.consume(TokenType.LeftParen)
        for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
          const column = new model.IndexColumn()
          const start = this.pos
          const tokens = this.expression()
          if (tokens.length === 1) {
            this.pos = start
            column.name = this.identifier()
          } else {
            column.expression = tokens
          }
          if (this.consumeIf(Keyword.ASC)) {
            column.sortOrder = model.SortOrder.ASC
          } else if (this.consumeIf(Keyword.DESC)) {
            column.sortOrder = model.SortOrder.DESC
          }
          stmt.columns.push(column)
        }
        this.consume(TokenType.RightParen)
        while (this.token()) {
          if (this.consumeIf(Keyword.KEY_BLOCK_SIZE)) {
            this.consumeIf(Keyword.OPE_EQ)
            stmt.keyBlockSize = this.sizeValue()
          } else if (this.consumeIf(Keyword.USING)) {
            if (this.consumeIf(Keyword.BTREE)) {
              stmt.algorithm = model.IndexAlgorithm.BTREE
            } else if (this.consumeIf(Keyword.HASH)) {
              stmt.algorithm = model.IndexAlgorithm.HASH
            } else {
              throw this.createParseError()
            }
          } else if (this.consumeIf(Keyword.WITH, Keyword.PARSER)) {
            stmt.withParser = this.identifier()
          } else if (this.consumeIf(Keyword.COMMENT)) {
            stmt.comment = this.stringValue()
          } else if (this.consumeIf(Keyword.VISIBLE)) {
            stmt.visible = true
          } else if (this.consumeIf(Keyword.INVISIBLE)) {
            stmt.visible = false
          } else if (this.consumeIf(Keyword.ENGINE_ATTRIBUTE)) {
            this.consumeIf(Keyword.OPE_EQ)
            stmt.engineAttribute = this.stringValue()
          } else if (this.consumeIf(Keyword.SECONDARY_ENGINE_ATTRIBUTE)) {
            this.consumeIf(Keyword.OPE_EQ)
            stmt.secondaryEngineAttribute = this.stringValue()
          } else {
            break
          }
        }
        while (this.token()) {
          if (this.consumeIf(Keyword.ALGORITHM)) {
            this.consumeIf(Keyword.OPE_EQ)
            if (this.consumeIf(Keyword.DEFAULT)) {
              stmt.algorithmOption = model.IndexAlgorithmOption.DEFAULT
            } else if (this.consumeIf(Keyword.INPLACE)) {
              stmt.algorithmOption = model.IndexAlgorithmOption.INPLACE
            } else if (this.consumeIf(Keyword.COPY)) {
              stmt.algorithmOption = model.IndexAlgorithmOption.COPY
            } else {
              throw this.createParseError()
            }
          } else if (this.consumeIf(Keyword.LOCK)) {
            this.consumeIf(Keyword.OPE_EQ)
            if (this.consumeIf(Keyword.DEFAULT)) {
              stmt.lockOption = model.IndexLockOption.DEFAULT
            } else if (this.consumeIf(Keyword.NONE)) {
              stmt.lockOption = model.IndexLockOption.NONE
            } else if (this.consumeIf(Keyword.SHARED)) {
              stmt.lockOption = model.IndexLockOption.SHARED
            } else if (this.consumeIf(Keyword.EXCLUSIVE)) {
              stmt.lockOption = model.IndexLockOption.EXCLUSIVE
            } else {
              throw this.createParseError()
            }
          } else {
            break
          }
        }
      } else if (stmt instanceof model.CreateViewStatement) {
        const obj = this.schemaObject()
        stmt.schemaName = obj.schemaName
        stmt.name = obj.name
        if (this.consumeIf(TokenType.LeftParen)) {
          stmt.columns = []
          for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
            stmt.columns.push(this.identifier())
          }
          this.consume(TokenType.RightParen)
        }
        this.consume(Keyword.AS)
        this.selectClause()
        if (this.consumeIf(Keyword.WITH)) {
          if (this.consumeIf(Keyword.CASCADED)) {
            stmt.checkOption = model.CheckOption.CASCADED
          } else if (this.consumeIf(Keyword.LOCAL)) {
            stmt.checkOption = model.CheckOption.LOCAL
          } else {
            stmt.checkOption = model.CheckOption.CASCADED
          }
          this.consume(Keyword.CHECK)
          this.consume(Keyword.OPTION)
        }
      } else if (
        stmt instanceof model.CreateProcedureStatement ||
        stmt instanceof model.CreateFunctionStatement
      ) {
        const obj = this.schemaObject()
        stmt.schemaName = obj.schemaName
        stmt.name = obj.name
        this.consume(TokenType.LeftParen)
        for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
          if (stmt instanceof model.CreateFunctionStatement) {
            const param = new model.FunctionParam()
            param.name = this.identifier()
            param.dataType = this.dataType()
            stmt.params.push(param)
          } else {
            const param = new model.ProcedureParam()
            if (this.consumeIf(Keyword.IN)) {
              param.direction = model.Direction.IN
            } else if (this.consumeIf(Keyword.OUT)) {
              param.direction = model.Direction.OUT
            } else if (this.consumeIf(Keyword.INOUT)) {
              param.direction = model.Direction.INOUT
            }
            param.name = this.identifier()
            param.dataType = this.dataType()
            stmt.params.push(param)
          }
        }
        this.consume(TokenType.RightParen)
        if (stmt instanceof model.CreateFunctionStatement) {
          this.consume(Keyword.RETURN)
          stmt.returnDataType = this.dataType()
        }
        while (this.token()) {
          if (this.consumeIf(Keyword.COMMENT)) {
            stmt.comment = this.stringValue()
          } else if (this.consumeIf(Keyword.LANGUAGE)) {
            this.consume(Keyword.SQL)
            stmt.language = model.ProcedureLanguage.SQL
          } else if (this.consumeIf(Keyword.DETERMINISTIC)) {
            stmt.deterministic = true
          } else if (this.consumeIf(Keyword.NOT, Keyword.DETERMINISTIC)) {
            stmt.deterministic = false
          } else if (this.consumeIf(Keyword.CONTAINS, Keyword.SQL)) {
            stmt.characteristic = model.ProcedureCharacteristic.CONTAINS_SQL
          } else if (this.consumeIf(Keyword.NO, Keyword.SQL)) {
            stmt.characteristic = model.ProcedureCharacteristic.NO_SQL
          } else if (this.consumeIf(Keyword.READS, Keyword.SQL, Keyword.DATA)) {
            stmt.characteristic = model.ProcedureCharacteristic.READS_SQL_DATA
          } else if (this.consumeIf(Keyword.MODIFIES, Keyword.SQL, Keyword.DATA)) {
            stmt.characteristic = model.ProcedureCharacteristic.MODIFIES_SQL_DATA
          } else if (this.consumeIf(Keyword.SQL, Keyword.SECURITY)) {
            if (this.consumeIf(Keyword.DEFINER)) {
              stmt.sqlSecurity = model.SqlSecurity.DEFINER
            } else if (this.consumeIf(Keyword.INVOKER)) {
              stmt.sqlSecurity = model.SqlSecurity.INVOKER
            } else {
              throw this.createParseError()
            }
          } else {
            break
          }
        }
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (stmt instanceof model.CreateTriggerStatement) {
        const obj = this.schemaObject()
        stmt.schemaName = obj.schemaName
        stmt.name = obj.name
        if (this.consumeIf(Keyword.BEFORE)) {
          stmt.triggerTime = model.TriggerTime.BEFORE
        } else if (this.consumeIf(Keyword.AFTER)) {
          stmt.triggerTime = model.TriggerTime.AFTER
        } else {
          throw this.createParseError()
        }
        if (this.consumeIf(Keyword.INSERT)) {
          stmt.triggerEvent = model.TriggerEvent.INSERT
        } else if (this.consumeIf(Keyword.UPDATE)) {
          stmt.triggerEvent = model.TriggerEvent.UPDATE
        } else if (this.consumeIf(Keyword.DELETE)) {
          stmt.triggerEvent = model.TriggerEvent.DELETE
        } else {
          throw this.createParseError()
        }
        this.consume(Keyword.ON)
        stmt.table = this.schemaObject()
        this.consume(Keyword.FOR)
        this.consume(Keyword.EACH)
        this.consume(Keyword.ROW)
        if (this.consumeIf(Keyword.FOLLOWS)) {
          const triggerOrder = new model.TriggerOrder()
          triggerOrder.position = model.TriggerOrderPosition.FOLLOWS
          triggerOrder.tableName = this.identifier()
          stmt.triggerOrder = triggerOrder
        } else if (this.consumeIf(Keyword.PRECEDES)) {
          const triggerOrder = new model.TriggerOrder()
          triggerOrder.position = model.TriggerOrderPosition.PRECEDES
          triggerOrder.tableName = this.identifier()
          stmt.triggerOrder = triggerOrder
        }
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (stmt instanceof model.CreateEventStatement) {
        const obj = this.schemaObject()
        stmt.schemaName = obj.schemaName
        stmt.name = obj.name
        this.consume(Keyword.ON)
        this.consume(Keyword.SCHEDULE)
        if (this.consumeIf(Keyword.AT)) {
          stmt.at = this.expression()
        } else if (this.consumeIf(Keyword.EVERY)) {
          stmt.every = this.intervalValue()
          if (this.consumeIf(Keyword.STARTS)) {
            stmt.starts = this.expression()
          }
          if (this.consumeIf(Keyword.ENDS)) {
            stmt.ends = this.expression()
          }
        }
      }
    } else if (this.consumeIf(Keyword.ALTER)) {
      if (this.consumeIf(Keyword.DATABASE) || this.consumeIf(Keyword.SCHEMA)) {
        stmt = new model.AlterDatabaseStatement()
        stmt.name = this.identifier()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.consumeIf(Keyword.SERVER)) {
        stmt = new model.AlterServerStatement()
        stmt.name = this.identifier()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.consumeIf(Keyword.RESOURCE)) {
        this.consume(Keyword.GROUP)
        stmt = new model.AlterResourceGroupStatement()
        stmt.name = this.identifier()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.consumeIf(Keyword.LOGFILE)) {
        this.consume(Keyword.GROUP)
        stmt = new model.AlterLogfileGroupStatement()
        stmt.name = this.identifier()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.peekIf(Keyword.UNDO) || this.peekIf(Keyword.TABLESPACE)) {
        stmt = new model.AlterTablespaceStatement()
        if (this.consumeIf(Keyword.UNDO)) {
          stmt.undo = true
        }
        this.consume(Keyword.TABLESPACE)
        stmt.name = this.identifier()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.consumeIf(Keyword.USER)) {
        stmt = new model.AlterUserStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
        if (this.consumeIf(Keyword.CURRENT_USER)) {
          if (this.consumeIf(TokenType.LeftParen)) {
            this.consumeIf(TokenType.RightParen)
          }
        } else {
          stmt.users = []
          for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
            const user = this.userRole()
            while (this.token() && !this.peekIf(TokenType.Delimiter) && !this.peekIf(TokenType.Comma)) {
              this.consume()
            }
            stmt.users.push(user)
          }
        }
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.consumeIf(Keyword.TABLE)) {
        stmt = new model.AlterTableStatement()
        stmt.table = this.schemaObject()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          if (this.consumeIf(Keyword.RENAME)) {
            if (this.consumeIf(Keyword.COLUMN)) {
              // no handle
            } else if (this.consumeIf(Keyword.INDEX) || this.consumeIf(Keyword.KEY)) {
              // no handle
            } else {
              this.consumeIf(Keyword.TO) || this.consumeIf(Keyword.AS)
              stmt.newTable = this.schemaObject()
            }
          } else {
            this.consume()
          }
        }
      } else if (this.consumeIf(Keyword.INSTANCE)) {
        stmt = new model.AlterInstanceStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else {
        let algorithm
        if (this.consumeIf(Keyword.ALGORITHM)) {
          this.consume(Keyword.OPE_EQ)
          if (this.consumeIf(Keyword.UNDEFINED)) {
            algorithm = model.Algortihm.UNDEFINED
          } else if (this.consumeIf(Keyword.MERGE)) {
            algorithm = model.Algortihm.MERGE
          } else if (this.consumeIf(Keyword.TEMPTABLE)) {
            algorithm = model.Algortihm.TEMPTABLE
          } else {
            throw this.createParseError()
          }
        }

        let definer
        if (this.consumeIf(Keyword.DEFINER)) {
          this.consume(Keyword.OPE_EQ)
          definer = this.userRole()
        }

        let sqlSecurity
        if (this.consumeIf(Keyword.SQL)) {
          this.consume(Keyword.SECURITY)
          if (this.peekIf(Keyword.DEFINER)) {
            sqlSecurity = model.SqlSecurity.DEFINER
          } else if (this.peekIf(Keyword.INVOKER)) {
            sqlSecurity = model.SqlSecurity.INVOKER
          } else {
            throw this.createParseError()
          }
        }

        if (this.consumeIf(Keyword.VIEW)) {
          stmt = new model.AlterViewStatement()
          stmt.algorithm = algorithm
          stmt.definer = definer
          stmt.sqlSecurity = sqlSecurity
          while (this.token() && !this.peekIf(TokenType.Delimiter)) {
            this.consume()
          }
        } else if (
          !algorithm && !sqlSecurity &&
          this.consumeIf(Keyword.PROCEDURE)
        ) {
          stmt = new model.AlterProcedureStatement()
          stmt.definer = definer
          while (this.token() && !this.peekIf(TokenType.Delimiter)) {
            this.consume()
          }
        } else if (
          !algorithm && !sqlSecurity &&
          this.consumeIf(Keyword.FUNCTION)
        ) {
          stmt = new model.AlterFunctionStatement()
          stmt.definer = definer
          while (this.token() && !this.peekIf(TokenType.Delimiter)) {
            this.consume()
          }
        } else if (
          !algorithm && !sqlSecurity &&
          this.consumeIf(Keyword.EVENT)
        ) {
          stmt = new model.AlterEventStatement()
          stmt.definer = definer
          while (this.token() && !this.peekIf(TokenType.Delimiter)) {
            this.consume()
          }
        } else {
          throw this.createParseError()
        }
      }
    } else if (this.consumeIf(Keyword.RENAME)) {
      if (this.consumeIf(Keyword.TABLE)) {
        stmt = new model.RenameTableStatement()
        for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
          const pair = new model.RenameTablePair()
          pair.table = this.schemaObject()
          this.consumeIf(Keyword.TO)
          pair.newTable = this.schemaObject()
          stmt.pairs.push(pair)
        }
      } else if (this.consumeIf(Keyword.USER)) {
        stmt = new model.RenameUserStatement()
        for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
          const pair = new model.RenameUserPair()
          pair.user = this.userRole()
          this.consumeIf(Keyword.TO)
          pair.newUser = this.userRole()
          stmt.pairs.push(pair)
        }
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.DROP)) {
      if (this.consumeIf(Keyword.DATABASE) || this.consumeIf(Keyword.SCHEMA)) {
        stmt = new model.DropDatabaseStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
        stmt.name = this.identifier()
      } else if (this.consumeIf(Keyword.SERVER)) {
        stmt = new model.DropServerStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
        stmt.name = this.identifier()
      } else if (this.consumeIf(Keyword.RESOURCE)) {
        this.consume(Keyword.GROUP)
        stmt = new model.DropResourceGroupStatement()
        stmt.name = this.identifier()
        if (this.consumeIf(Keyword.FORCE)) {
          stmt.force = true
        }
      } else if (this.consumeIf(Keyword.LOGFILE)) {
        this.consume(Keyword.GROUP)
        stmt = new model.DropLogfileGroupStatement()
        stmt.name = this.identifier()
        this.consume(Keyword.ENGINE)
        this.consumeIf(Keyword.OPE_EQ)
        stmt.engine = this.identifier()
      } else if (this.peekIf(Keyword.UNDO) || this.peekIf(Keyword.TABLESPACE)) {
        stmt = new model.DropTablespaceStatement()
        if (this.consumeIf(Keyword.UNDO)) {
          stmt.undo = true
        }
        this.consume(Keyword.TABLESPACE)
        stmt.name = this.identifier()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.consumeIf(Keyword.SPATIAL)) {
        this.consume(Keyword.REFERENCE)
        this.consume(Keyword.SYSTEM)
        stmt = new model.DropSpatialReferenceSystemStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
        stmt.srid = this.numberValue()
      } else if (this.consumeIf(Keyword.ROLE)) {
        stmt = new model.DropRoleStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
        for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
          stmt.roles.push(this.userRole())
        }
      } else if (this.consumeIf(Keyword.USER)) {
        stmt = new model.DropUserStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
        for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
          stmt.users.push(this.userRole())
        }
      } else if (this.peekIf(Keyword.TEMPORARY) || this.peekIf(Keyword.TABLE)) {
        stmt = new model.DropTableStatement()
        if (this.consumeIf(Keyword.TEMPORARY)) {
          stmt.temporary = true
        }
        this.consume(Keyword.TABLE)
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
        for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
          stmt.tables.push(this.schemaObject())
        }
        if (this.consumeIf(Keyword.RESTRICT)) {
          stmt.dropOption = model.DropOption.RESTRICT
        } else if (this.consumeIf(Keyword.CASCADE)) {
          stmt.dropOption = model.DropOption.CASCADE
        }
      } else if (this.consumeIf(Keyword.VIEW)) {
        stmt = new model.DropViewStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
        for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
          stmt.views.push(this.schemaObject())
        }
        if (this.consumeIf(Keyword.RESTRICT)) {
          stmt.dropOption = model.DropOption.RESTRICT
        } else if (this.consumeIf(Keyword.CASCADE)) {
          stmt.dropOption = model.DropOption.CASCADE
        }
      } else if (this.consumeIf(Keyword.PROCEDURE)) {
        stmt = new model.DropProcedureStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
        stmt.procedure = this.schemaObject()
      } else if (this.consumeIf(Keyword.FUNCTION)) {
        stmt = new model.DropFunctionStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
        stmt.function = this.schemaObject()
      } else if (this.consumeIf(Keyword.TRIGGER)) {
        stmt = new model.DropTriggerStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
        stmt.trigger = this.schemaObject()
      } else if (this.consumeIf(Keyword.EVENT)) {
        stmt = new model.DropEventStatement()
        if (this.consumeIf(Keyword.IF)) {
          this.consume(Keyword.EXISTS)
          stmt.ifExists = true
        }
        stmt.event = this.schemaObject()
      } else if (this.consumeIf(Keyword.INDEX)) {
        stmt = new model.DropIndexStatement()
        stmt.index = this.schemaObject()
        this.consumeIf(Keyword.ON)
        stmt.table = this.schemaObject()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.consumeIf(Keyword.PREPARE)) {
        stmt = new model.DeallocatePrepareStatement()
        stmt.prepareName = this.identifier()
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.TRUNCATE)) {
      this.consumeIf(Keyword.TABLE)
      stmt = new model.TruncateTableStatement()
      stmt.table = this.schemaObject()
    } else if (this.consumeIf(Keyword.PREPARE)) {
      stmt = new model.PrepareStatement()
      stmt.name = this.identifier()
      this.consume(Keyword.FROM)
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.EXECUTE)) {
      stmt = new model.ExecuteStatement()
      stmt.prepareName = this.identifier()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.DEALLOCATE)) {
      this.consume(Keyword.PREPARE)
      stmt = new model.DeallocatePrepareStatement()
      stmt.prepareName = this.identifier()
    } else if (this.consumeIf(Keyword.START)) {
      if (this.consumeIf(Keyword.TRANSACTION)) {
        stmt = new model.StartTransactionStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.consumeIf(Keyword.REPLICA) || this.consumeIf(Keyword.SLAVE)) {
        stmt = new model.StartReplicaStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.CHANGE)) {
      this.consume(Keyword.MASTER)
      stmt = new model.ChangeMasterStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.STOP)) {
      if (this.consumeIf(Keyword.REPLICA) || this.consumeIf(Keyword.SLAVE)) {
        stmt = new model.StopReplicaStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.BEGIN)) {
      stmt = new model.BeginStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.SAVEPOINT)) {
      stmt = new model.SavepointStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.RELEASE)) {
      this.consume(Keyword.SAVEPOINT)
      stmt = new model.ReleaseSavepointStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.peekIf(Keyword.COMMIT) || this.peekIf(Keyword.ROLLBACK)) {
      if (this.consumeIf(Keyword.COMMIT)) {
        stmt = new model.CommitStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
        } else if (this.consumeIf(Keyword.ROLLBACK)) {
        stmt = new model.RollbackStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.LOCK)) {
      this.consume(Keyword.TABLES)
      stmt = new model.LockTableStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.UNLOCK)) {
      this.consume(Keyword.TABLES)
      stmt = new model.UnlockTableStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.XA)) {
      if (this.consumeIf(Keyword.START)) {
        stmt = new model.XaStartStatement()
      } else if (this.consumeIf(Keyword.BEGIN)) {
        stmt = new model.XaBeginStatement()
      } else if (this.consumeIf(Keyword.END)) {
        stmt = new model.XaEndStatement()
      } else if (this.consumeIf(Keyword.PREPARE)) {
        stmt = new model.XaPrepareStatement()
      } else if (this.consumeIf(Keyword.COMMIT)) {
        stmt = new model.XaCommitStatement()
      } else if (this.consumeIf(Keyword.ROLLBACK)) {
        stmt = new model.XaRollbackStatement()
      } else if (this.consumeIf(Keyword.RECOVER)) {
        stmt = new model.XaRecoverStatement()
      } else {
        throw this.createParseError()
      }
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.PURGE)) {
      if (this.consumeIf(Keyword.BINARY) || this.consumeIf(Keyword.MASTER)) {
        this.consume(Keyword.LOGS)
        stmt = new model.PurgeBinaryLogsStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.RESET)) {
      if (this.consumeIf(Keyword.MASTER)) {
        stmt = new model.ResetMasterStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.consumeIf(Keyword.REPLICA) || this.consumeIf(Keyword.SLAVE)) {
        stmt = new model.ResetReplicaStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.GRANT)) {
      stmt = new model.GrantStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.REVOKE)) {
      stmt = new model.RevokeStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.ANALYZE)) {
      stmt = new model.AnalyzeTableStatement()
      if (this.consumeIf(Keyword.NO_WRITE_TO_BINLOG) || this.consumeIf(Keyword.LOCAL)) {
        stmt.noWriteToBinlog = true
      }
      this.consume(Keyword.TABLE)
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        stmt.tables.push(this.schemaObject())
      }
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.CHECK)) {
      if (this.consumeIf(Keyword.TABLE)) {
        stmt = new model.CheckTableStatement()
        for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
          stmt.tables.push(this.schemaObject())
        }
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.consumeIf(Keyword.INDEX)) {
        stmt = new model.CheckIndexStatement()
        for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
          stmt.indexes.push(this.schemaObject())
        }
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      }
    } else if (this.consumeIf(Keyword.CHECKSUM)) {
      stmt = new model.ChecksumTableStatement()
      this.consume(Keyword.TABLE)
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        stmt.tables.push(this.schemaObject())
      }
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.OPTIMIZE)) {
      stmt = new model.OptimizeTableStatement()
      if (this.consumeIf(Keyword.NO_WRITE_TO_BINLOG) || this.consumeIf(Keyword.LOCAL)) {
        stmt.noWriteToBinlog = true
      }
      this.consume(Keyword.TABLE)
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        stmt.tables.push(this.schemaObject())
      }
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.REPAIR)) {
      stmt = new model.RepairTableStatement()
      if (this.consumeIf(Keyword.NO_WRITE_TO_BINLOG) || this.consumeIf(Keyword.LOCAL)) {
        stmt.noWriteToBinlog = true
      }
      this.consume(Keyword.TABLE)
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        stmt.tables.push(this.schemaObject())
      }
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.INSTALL)) {
      if (this.consume(Keyword.PLUGIN)) {
        stmt = new model.InstallPluginStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.consume(Keyword.COMPONENT)) {
        stmt = new model.InstallComponentStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.UNINSTALL)) {
      if (this.consume(Keyword.PLUGIN)) {
        stmt = new model.UninstallPluginStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.consume(Keyword.COMPONENT)) {
        stmt = new model.UninstallComponentStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.EXPLAIN) || this.consumeIf(Keyword.DESCRIBE)) {
      stmt = new model.ExplainStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.CALL)) {
      stmt = new model.CallStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.USE)) {
      stmt = new model.UseStatement()
      stmt.schemaName = this.identifier()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.INSERT)) {
      stmt = new model.InsertStatement()
      if (this.consumeIf(Keyword.LOW_PRIORITY)) {
        stmt.concurrency = model.Concurrency.LOW_PRIORITY
      } else if (this.consumeIf(Keyword.DELAYED)) {
        stmt.concurrency = model.Concurrency.DELAYED
      } else if (this.consumeIf(Keyword.HIGH_PRIORITY)) {
        stmt.concurrency = model.Concurrency.HIGH_PRIORITY
      }
      if (this.consumeIf(Keyword.IGNORE)) {
        stmt.conflictAction = model.ConflictAction.IGNORE
      }
      this.consumeIf(Keyword.INTO)
      stmt.table = this.schemaObject()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.UPDATE)) {
      stmt = new model.UpdateStatement()
      if (this.consumeIf(Keyword.LOW_PRIORITY)) {
        stmt.concurrency = model.Concurrency.LOW_PRIORITY
      }
      if (this.consumeIf(Keyword.IGNORE)) {
        stmt.conflictAction = model.ConflictAction.IGNORE
      }
      stmt.table = this.schemaObject()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.REPLACE)) {
      stmt = new model.ReplaceStatement()
      if (this.consumeIf(Keyword.LOW_PRIORITY)) {
        stmt.concurrency = model.Concurrency.LOW_PRIORITY
      } else if (this.consumeIf(Keyword.DELAYED)) {
        stmt.concurrency = model.Concurrency.DELAYED
      }
      if (this.consumeIf(Keyword.IGNORE)) {
        stmt.conflictAction = model.ConflictAction.IGNORE
      }
      this.consumeIf(Keyword.INTO)
      stmt.table = this.schemaObject()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.DELETE)) {
      stmt = new model.DeleteStatement()
      if (this.consumeIf(Keyword.LOW_PRIORITY)) {
        stmt.concurrency = model.Concurrency.LOW_PRIORITY
      } else if (this.consumeIf(Keyword.DELAYED)) {
        stmt.concurrency = model.Concurrency.DELAYED
      } else if (this.consumeIf(Keyword.HIGH_PRIORITY)) {
        stmt.concurrency = model.Concurrency.HIGH_PRIORITY
      }
      if (this.consumeIf(Keyword.QUICK)) {
        stmt.quick = true
      }
      if (this.consumeIf(Keyword.IGNORE)) {
        stmt.conflictAction = model.ConflictAction.IGNORE
      }
      this.consumeIf(Keyword.FROM)
      stmt.table = this.schemaObject()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.LOAD)) {
      if (this.peekIf(Keyword.DATA) || this.peekIf(Keyword.XML)) {
        if (this.consumeIf(Keyword.DATA)) {
          stmt = new model.LoadDataInfileStatement()
        } else {
          stmt = new model.LoadXmlInfileStatement()
        }
        if (this.consumeIf(Keyword.LOW_PRIORITY)) {
          stmt.concurrency = model.Concurrency.LOW_PRIORITY
        } else if (this.consumeIf(Keyword.CONCURRENT)) {
          stmt.concurrency = model.Concurrency.CONCURRENT
        }
        if (this.consumeIf(Keyword.LOCAL)) {
          stmt.local = true
        }
        this.consume(Keyword.INFILE)
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.consumeIf(Keyword.INDEX)) {
        this.consume(Keyword.INTO)
        this.consume(Keyword.CACHE)
        stmt = new model.LoadIndexIntoCacheStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.SET)) {
      if (this.consumeIf(Keyword.RESOURCE)) {
        this.consume(Keyword.GROUP)
        stmt = new model.SetResourceGroupStatement()
        stmt.name = this.identifier()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.consumeIf(Keyword.DEFAULT)) {
        this.consume(Keyword.ROLE)
        stmt = new model.SetDefaultRoleStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.consumeIf(Keyword.ROLE)) {
        stmt = new model.SetRoleStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.consumeIf(Keyword.PASSWORD)) {
        stmt = new model.SetPasswordStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.consumeIf(Keyword.CHARACTER)) {
        this.consume(Keyword.SET)
        stmt = new model.SetCharacterSetStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (this.consumeIf(Keyword.NAMES)) {
        stmt = new model.SetNamesStatement()
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else if (
        this.peekIf(Keyword.TRANSACTION) ||
        this.peekIf(Keyword.GLOBAL, Keyword.TRANSACTION) ||
        this.peekIf(Keyword.SESSION, Keyword.TRANSACTION) ||
        this.peekIf(Keyword.LOCAL, Keyword.TRANSACTION)
      ) {
        stmt = new model.SetTransactionStatement()
        if (this.consumeIf(Keyword.GLOBAL)) {
          stmt.type = model.VariableType.GLOBAL
        } else if (this.consumeIf(Keyword.SESSION) || this.consumeIf(Keyword.LOCAL)) {
          stmt.type = model.VariableType.SESSION
        }
        while (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.consume()
        }
      } else {
        stmt = new model.SetStatement()
        for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
          const va = new model.VariableAssignment()
          if (this.consumeIf(Keyword.GLOBAL)) {
            va.type = model.VariableType.GLOBAL
            va.name = this.identifier()
          } else if (this.consumeIf(Keyword.SESSION) || this.consumeIf(Keyword.LOCAL)) {
            va.type = model.VariableType.SESSION
            va.name = this.identifier()
          } else if (this.consumeIf(Keyword.VAR_GLOBAL)) {
            va.type = model.VariableType.GLOBAL
            this.consume(TokenType.Dot)
            va.name = this.identifier()
          } else if (this.consumeIf(Keyword.VAR_SESSION) || this.consumeIf(Keyword.VAR_LOCAL)) {
            va.type = model.VariableType.SESSION
            this.consume(TokenType.Dot)
            va.name = this.identifier()
          } else if (this.consumeIf(TokenType.SessionVariable)) {
            const name = this.token(-1).text.substring(2)
            va.type = model.VariableType.SESSION
            va.name = /^['"`]/.test(name) ? dequote(name) : lcase(name)
          } else if (this.consumeIf(TokenType.UserDefinedVariable)) {
            const name = this.token(-1).text.substring(1)
            va.type = model.VariableType.USER_DEFINED
            va.name = /^['"`]/.test(name) ? dequote(name) : lcase(name)
          } else {
            throw this.createParseError()
          }
          if (this.consumeIf(Keyword.OPE_EQ) || this.consumeIf(Keyword.OPE_COLON_EQ)) {
            va.value = this.expression()
          } else {
            throw this.createParseError()
          }
          stmt.variableAssignments.push(va)

          if (va.type !== model.VariableType.USER_DEFINED && va.name === "sql_mode") {
            if (va.value.length === 1 && (
              va.value[0].type === TokenType.String ||
              (!this.sqlMode.has("ANSI_QUOTE") && va.value[0].type === TokenType.QuotedValue)
            )) {
              this.setSqlMode(dequote(va.value[0].text))
            }
          }
        }
      }
    } else if (this.consumeIf(Keyword.WITH) || this.consumeIf(Keyword.SELECT)) {
      stmt = new model.SelectStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.TABLE)) {
      stmt = new model.TableStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.DO)) {
      stmt = new model.DoStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.HANDLER)) {
      stmt = new model.HandlerStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.SHOW)) {
      stmt = new model.ShowStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.HELP)) {
      stmt = new model.HelpStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.BINLOG)) {
      stmt = new model.BinlogStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.CACHE)) {
      this.consume(Keyword.INDEX)
      stmt = new model.CacheIndexStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.FLUSH)) {
      stmt = new model.FlushStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.KILL)) {
      stmt = new model.KillStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.RESTART)) {
      stmt = new model.RestartStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.SHUTDOWN)) {
      stmt = new model.ShutdownStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else if (this.consumeIf(Keyword.CLONE)) {
      stmt = new model.CloneStatement()
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    }

    if (!stmt) {
      throw this.createParseError()
    }

    if (typeof this.options.filename === "string") {
      stmt.filename = this.options.filename
    }
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
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
    while (this.token() &&
      !this.peekIf(TokenType.SemiColon) &&
      (depth == 0 && !this.peekIf(TokenType.RightParen)) &&
      (depth == 0 && !this.peekIf(Keyword.WITH))
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

  schemaObject() {
    const sobj = new model.SchemaObject()
    sobj.name = this.identifier()
    if (this.consumeIf(TokenType.Dot)) {
      sobj.schemaName = sobj.name
      sobj.name = this.identifier()
    }
    return sobj
  }

  userRole() {
    const userRole = new model.UserRole()
    if (
      this.consumeIf(TokenType.QuotedIdentifier) ||
      this.consumeIf(TokenType.QuotedValue) ||
      this.consumeIf(TokenType.String)
    ) {
      userRole.name = unescape(dequote(this.token(-1).text))
    } else if (this.consumeIf(TokenType.Identifier)) {
      userRole.name = lcase(this.token(-1).text)
    } else {
      throw this.createParseError()
    }

    if (this.consumeIf(TokenType.UserDefinedVariable)) {
      userRole.host = dequote(this.token(-1).text.substring(1))
    }
    return userRole
  }

  identifier() {
    if (this.consumeIf(TokenType.Identifier)) {
      return lcase(this.token(-1).text)
    } else if (this.consumeIf(TokenType.QuotedIdentifier)) {
      return unescape(dequote(this.token(-1).text))
    } else if (!this.sqlMode.has("ANSI_QUOTES") && this.consumeIf(TokenType.QuotedValue)) {
      return unescape(dequote(this.token(-1).text))
    } else {
      throw this.createParseError()
    }
  }

  tableColumn() {
    const column = new model.TableColumn()
    column.name = this.identifier()
    column.dataType = this.dataType()

    let start = this.pos
    let collate
    if (this.consumeIf(Keyword.COLLATE)) {
      collate = this.identifier()
    }
    if (this.consumeIf(Keyword.GENERATED)) {
      this.consume(Keyword.ALWAYS)
    }
    if (this.consumeIf(Keyword.AS)) {
      const generatedColumn = new model.GeneratedColumn()
      if (collate) {
        column.collate = collate
      }
      this.consume(TokenType.LeftParen)
      generatedColumn.expression = this.expression()
      this.consume(TokenType.RightParen)
      if (this.consumeIf(Keyword.VIRTUAL)) {
        generatedColumn.type = model.GeneratedColumnType.VIRTUAL
      } else if (this.consumeIf(Keyword.STORED)) {
        generatedColumn.type = model.GeneratedColumnType.STORED
      }
      column.generatedColumn = generatedColumn

      if (this.consumeIf(Keyword.NOT)) {
        this.consume(Keyword.NULL)
        column.notNull = true
      } else if (this.consumeIf(Keyword.NULL)) {
        column.notNull = false
      }

      if (this.consumeIf(Keyword.VISIBLE)) {
        column.visible = true
      } else if (this.consumeIf(Keyword.INVISIBLE)) {
        column.visible = false
      }

      if (this.consumeIf(Keyword.UNIQUE)) {
        this.consumeIf(Keyword.KEY)
        column.indexType = model.IndexType.UNIQUE
      }
      if (this.consumeIf(Keyword.PRIMARY)) {
        this.consumeIf(Keyword.KEY)
        column.indexType = model.IndexType.PRIMARY_KEY
      } else if (this.consumeIf(Keyword.KEY)) {
        column.indexType = model.IndexType.PRIMARY_KEY
      }

      if (this.consumeIf(Keyword.COMMENT)) {
        column.comment = this.stringValue()
      }
    } else {
      // Rollback
      this.pos = start

      if (this.consumeIf(Keyword.NOT)) {
        this.consume(Keyword.NULL)
        column.notNull = true
      } else if (this.consumeIf(Keyword.NULL)) {
        column.notNull = false
      }

      if (this.consumeIf(Keyword.DEFAULT)) {
        if (this.consumeIf(TokenType.LeftParen)) {
          column.defaultValue = this.expression()
          this.consume(TokenType.RightParen)
        } else if (this.consumeIf(Keyword.CURRENT_TIMESTAMP)) {
          column.defaultValue = this.tokens.slice(this.pos, this.pos+1)
        } else {
          column.defaultValue = this.literal()
        }
      }

      if (this.consumeIf(Keyword.VISIBLE)) {
        column.visible = true
      } else if (this.consumeIf(Keyword.INVISIBLE)) {
        column.visible = false
      }

      if (this.consumeIf(Keyword.AUTO_INCREMENT)) {
        column.autoIncrement = true
      }

      if (this.consumeIf(Keyword.UNIQUE)) {
        this.consumeIf(Keyword.KEY)
        column.indexType = model.IndexType.UNIQUE
      }
      if (this.consumeIf(Keyword.PRIMARY)) {
        this.consumeIf(Keyword.KEY)
        column.indexType = model.IndexType.PRIMARY_KEY
      } else if (this.consumeIf(Keyword.KEY)) {
        column.indexType = model.IndexType.PRIMARY_KEY
      }

      if (this.consumeIf(Keyword.COMMENT)) {
        column.comment = this.stringValue()
      }

      if (this.consumeIf(Keyword.COLLATE)) {
        column.collate = this.identifier()
      }

      if (this.consumeIf(Keyword.COLUMN_FORMAT)) {
        if (this.consumeIf(Keyword.FIXED)) {
          column.columnFormat = model.ColumnFormat.FIXED
        } else if (this.consumeIf(Keyword.DYNAMIC)) {
          column.columnFormat = model.ColumnFormat.DYNAMIC
        } else if (this.consumeIf(Keyword.DEFAULT)) {
          column.columnFormat = model.ColumnFormat.DEFAULT
        } else {
          throw this.createParseError()
        }
      }

      if (this.consumeIf(Keyword.ENGINE_ATTRIBUTE)) {
        this.consumeIf(Keyword.OPE_EQ)
        column.engineAttribute = this.stringValue()
      }

      if (this.consumeIf(Keyword.SECONDARY_ENGINE_ATTRIBUTE)) {
        this.consumeIf(Keyword.OPE_EQ)
        column.secondaryEngineAttribute = this.stringValue()
      }

      if (this.consumeIf(Keyword.STORAGE)) {
        if (this.consumeIf(Keyword.DISK)) {
          column.storageType = model.StorageType.DISK
        } else if (this.consumeIf(Keyword.MEMORY)) {
          column.storageType = model.StorageType.MEMORY
        } else {
          throw this.createParseError()
        }
      }
    }

    if (this.consumeIf(Keyword.REFERENCES)) {
      column.references = this.references()
    }

    if (this.peekIf(Keyword.CONSTRAINT) || this.peekIf(Keyword.CHECK)) {
      const constraint = new model.CheckConstraint()
      if (this.consumeIf(Keyword.CONSTRAINT)) {
        if (!this.peekIf(Keyword.CHECK)) {
          constraint.name = this.identifier()
        }
      }
      this.consume(Keyword.CHECK)
      this.consume(TokenType.LeftParen)
      constraint.expression = this.expression()
      this.consume(TokenType.RightParen)

      if (this.consumeIf(Keyword.NOT)) {
        this.consume(Keyword.ENFORCED)
        constraint.enforced = false
      } else if (this.consumeIf(Keyword.ENFORCED)) {
        constraint.enforced = true
      }
      column.checkConstraint = constraint
    }

    return column
  }

  dataType() {
    let dataType = new model.DataType()

    let start = this.pos
    let collective = false
    let lengthRequired = false
    let withLength = false
    let withScale = false
    let withUnsigned = false
    let withCharcterSetAndCollate = false

    if (this.consumeIf(Keyword.NATIONAL)) {
      if (this.consumeIf(Keyword.CHARACTER) || this.consumeIf(Keyword.CHAR)) {
        if (this.consumeIf(Keyword.VARYING)) {
          lengthRequired = true
        }
      } else if (this.consumeIf(Keyword.VARCHAR)) {
        lengthRequired = true
      } else {
        throw this.createParseError()
      }
      withLength = true
      withCharcterSetAndCollate = true
    } else if (this.consumeIf(Keyword.CHARACTER) || this.consumeIf(Keyword.CHAR)) {
      if (this.consumeIf(Keyword.VARYING)) {
        lengthRequired = true
      }
      withLength = true
      withCharcterSetAndCollate = true
    } else if (this.consumeIf(Keyword.VARCHAR)) {
      lengthRequired = true
      withLength = true
      withCharcterSetAndCollate = true
    } else if (
      this.consumeIf(Keyword.TINYTEXT) ||
      this.consumeIf(Keyword.TEXT) ||
      this.consumeIf(Keyword.MEDIUMTEXT) ||
      this.consumeIf(Keyword.LONGTEXT)
    ) {
      withCharcterSetAndCollate = true
    } else if (this.consumeIf(Keyword.BINARY)) {
      if (this.consumeIf(Keyword.VARYING)) {
        lengthRequired = true
      }
      withLength = true
    } else if (this.consumeIf(Keyword.VARBINARY)) {
      lengthRequired = true
      withLength = true
    } else if (this.consumeIf(Keyword.ENUM) || this.consumeIf(Keyword.SET)) {
      collective = true
      withCharcterSetAndCollate = true
    } else if (
      this.consumeIf(Keyword.BIT) ||
      this.consumeIf(Keyword.DATETIME) ||
      this.consumeIf(Keyword.TIMESTAMP) ||
      this.consumeIf(Keyword.TIME) ||
      this.consumeIf(Keyword.YEAR)
    ) {
      withLength = true
    } else if (this.consumeIf(Keyword.BOOLEAN) || this.consumeIf(Keyword.BOOL)) {
      withUnsigned = true
    } else if (
      this.consumeIf(Keyword.TINYINT) ||
      this.consumeIf(Keyword.SMALLINT) ||
      this.consumeIf(Keyword.MEDIUMINT) ||
      this.consumeIf(Keyword.INT) ||
      this.consumeIf(Keyword.INTEGER) ||
      this.consumeIf(Keyword.BIGINT)
    ) {
      withLength = true
      withUnsigned = true
    } else if (
      this.consumeIf(Keyword.DECIMAL) ||
      this.consumeIf(Keyword.DEC) ||
      this.consumeIf(Keyword.NUMERIC) ||
      this.consumeIf(Keyword.FIXED) ||
      this.consumeIf(Keyword.FLOAT) ||
      this.consumeIf(Keyword.REAL)
    ) {
      withLength = true
      withScale = true
    } else if (this.consumeIf(Keyword.DOUBLE)) {
      this.consumeIf(Keyword.PRECISION)
      withLength = true
      withScale = true
    } else {
      this.consume()
    }
    dataType.name = this.tokens.slice(start, this.pos).map(token => ucase(token.text)).join(" ")

    if (withLength) {
      if (lengthRequired ? this.consume(TokenType.LeftParen) : this.consumeIf(TokenType.LeftParen)) {
        dataType.length = this.numberValue()
        if (withScale) {
          this.consume(TokenType.Comma)
          dataType.scale = this.numberValue()
        }
        this.consume(TokenType.RightParen)
      }
    } else if (collective) {
      this.consume(TokenType.LeftParen)
      const values = []
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        values.push(this.stringValue())
      }
      dataType.values = values
      this.consume(TokenType.RightParen)
    }

    if (withUnsigned) {
      if (this.consumeIf(Keyword.SIGNED)) {
        // no handle
      } else if (this.consumeIf(Keyword.UNSIGNED)) {
        dataType.unsigned = true
      }
      if (this.consumeIf(Keyword.ZEROFILL)) {
        dataType.zerofill = true
      }
    }

    if (withCharcterSetAndCollate) {
      if (this.consumeIf(Keyword.ASCII)) {
        dataType.characterSet = "latin1"
      } else if (this.consumeIf(Keyword.UNICODE)) {
        dataType.characterSet = "ucs2"
      } else if (this.consumeIf(Keyword.CHARACTER)) {
        this.consumeIf(Keyword.SET)
        dataType.characterSet = this.identifier()
      } else if (this.consumeIf(Keyword.CHARSET)) {
        dataType.characterSet = this.identifier()
      }

      if (this.consumeIf(Keyword.BINARY)) {
        dataType.binary = true
      } else if (this.consumeIf(Keyword.COLLATE)) {
        dataType.collate = this.identifier()
      }
    }

    return dataType
  }

  references() {
    const references = new model.References()
    references.tableName = this.identifier()
    this.consume(TokenType.LeftParen)
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      references.columns.push(this.identifier())
    }
    this.consume(TokenType.RightParen)
    if (this.consumeIf(Keyword.MATCH)) {
      if (this.consumeIf(Keyword.FULL)) {
        references.match = model.MatchType.FULL
      } else if (this.consumeIf(Keyword.PARTIAL)) {
        references.match = model.MatchType.PARTIAL
      } else if (this.consumeIf(Keyword.SIMPLE)) {
        references.match = model.MatchType.SIMPLE
      } else {
        throw this.createParseError()
      }
    }
    if (this.consumeIf(Keyword.ON, Keyword.DELETE)) {
      if (this.consumeIf(Keyword.CASCADE)) {
        references.onDelete = model.ReferenceOption.CASCADE
      } else if (this.consumeIf(Keyword.SET)) {
        if (this.consumeIf(Keyword.NULL)) {
          references.onDelete = model.ReferenceOption.SET_NULL
        } else if (this.consumeIf(Keyword.DEFAULT)) {
          references.onDelete = model.ReferenceOption.SET_DEFAULT
        } else {
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.RESTRICT)) {
        references.onDelete = model.ReferenceOption.RESTRICT
      } else if (this.consumeIf(Keyword.NO)) {
        this.consume(Keyword.ACTION)
        references.onDelete = model.ReferenceOption.NO_ACTION
      } else {
        throw this.createParseError()
      }
    }
    if (this.consumeIf(Keyword.ON, Keyword.UPDATE)) {
      if (this.consumeIf(Keyword.CASCADE)) {
        references.onUpdate = model.ReferenceOption.CASCADE
      } else if (this.consumeIf(Keyword.SET)) {
        if (this.consumeIf(Keyword.NULL)) {
          references.onUpdate = model.ReferenceOption.SET_NULL
        } else if (this.consumeIf(Keyword.DEFAULT)) {
          references.onUpdate = model.ReferenceOption.SET_DEFAULT
        } else {
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.RESTRICT)) {
        references.onUpdate = model.ReferenceOption.RESTRICT
      } else if (this.consumeIf(Keyword.NO)) {
        this.consume(Keyword.ACTION)
        references.onUpdate = model.ReferenceOption.NO_ACTION
      } else {
        throw this.createParseError()
      }
    }
    return references
  }

  expression() {
    const start = this.pos
    let depth = 0
    while (this.token() &&
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

  literal() {
    const start = this.pos
    if (this.consumeIf(Keyword.OPE_PLUS) || this.consumeIf(Keyword.OPE_MINUS)) {
      this.consume(TokenType.Number)
    } else if (
      this.consumeIf(Keyword.DATE) ||
      this.consumeIf(Keyword.TIME) ||
      this.consumeIf(Keyword.TIMESTAMP)
    ) {
      if (
        this.consumeIf(TokenType.String) ||
        (!this.sqlMode.has("ANSI_QUOTE") && this.consumeIf(TokenType.QuotedValue))
      ) {
        // no handle
      } else {
        throw this.createParseError()
      }
    } else if (this.consumeIf(TokenType.LeftBrace)) {
      if (
        this.consumeIf(Keyword.D) ||
        this.consumeIf(Keyword.T) ||
        this.consumeIf(Keyword.TS)
      ) {
        if (
          this.consumeIf(TokenType.String) ||
          (!this.sqlMode.has("ANSI_QUOTE") && this.consumeIf(TokenType.QuotedValue))
        ) {
          // no handle
        } else {
          throw this.createParseError()
        }
      } else {
        throw this.createParseError()
      }
      this.consume(TokenType.RightBrace)
    } else if (
      this.consumeIf(TokenType.String) ||
      (!this.sqlMode.has("ANSI_QUOTE") && this.consumeIf(TokenType.QuotedValue)) ||
      this.consumeIf(TokenType.Number) ||
      this.consumeIf(Keyword.TRUE) ||
      this.consumeIf(Keyword.FALSE) ||
      this.consumeIf(Keyword.NULL)
    ) {
    } else {
      throw this.createParseError()
    }
    return this.tokens.slice(start, this.pos)
  }

  intervalValue() {
    let quantity = this.numberValue()
    let unit
    if (this.consumeIf(Keyword.YEAR)) {
      unit = model.IntervalUnit.YEAR
    } else if (this.consumeIf(Keyword.QUARTER)) {
      unit = model.IntervalUnit.QUARTER
    } else if (this.consumeIf(Keyword.MONTH)) {
      unit = model.IntervalUnit.MONTH
    } else if (this.consumeIf(Keyword.DAY)) {
      unit = model.IntervalUnit.DAY
    } else if (this.consumeIf(Keyword.HOUR)) {
      unit = model.IntervalUnit.HOUR
    } else if (this.consumeIf(Keyword.MINUTE)) {
      unit = model.IntervalUnit.MINUTE
    } else if (this.consumeIf(Keyword.WEEK)) {
      unit = model.IntervalUnit.WEEK
    } else if (this.consumeIf(Keyword.SECOND)) {
      unit = model.IntervalUnit.SECOND
    } else if (this.consumeIf(Keyword.YEAR_MONTH)) {
      unit = model.IntervalUnit.YEAR_MONTH
    } else if (this.consumeIf(Keyword.DAY_HOUR)) {
      unit = model.IntervalUnit.DAY_HOUR
    } else if (this.consumeIf(Keyword.DAY_MINUTE)) {
      unit = model.IntervalUnit.DAY_MINUTE
    } else if (this.consumeIf(Keyword.DAY_SECOND)) {
      unit = model.IntervalUnit.DAY_SECOND
    } else if (this.consumeIf(Keyword.HOUR_MINUTE)) {
      unit = model.IntervalUnit.HOUR_MINUTE
    } else if (this.consumeIf(Keyword.HOUR_SECOND)) {
      unit = model.IntervalUnit.HOUR_SECOND
    } else if (this.consumeIf(Keyword.MINUTE_SECOND)) {
      unit = model.IntervalUnit.MINUTE_SECOND
    } else {
      throw this.createParseError()
    }
    return new model.Interval(quantity, unit)
  }

  stringValue() {
    let text
    if (this.consumeIf(TokenType.String)) {
      text = unescape(dequote(this.token(-1).text))
    } else if (!this.sqlMode.has("ANSI_QUOTE") && this.consumeIf(TokenType.QuotedValue)) {
      text = unescape(dequote(this.token(-1).text))
    } else if (this.consumeIf(Keyword.VAR_GLOBAL)) {
      this.consume(TokenType.Dot)
      this.consume(TokenType.Identifier)
      text = "@@GLOBAL." + lcase(this.token(-1).text)
    } else if (this.consumeIf(Keyword.VAR_LOCAL) || this.consumeIf(Keyword.VAR_SESSION)) {
      this.consume(TokenType.Dot)
      this.consume(TokenType.Identifier)
      text = "@@SESSION." + lcase(this.token(-1).text)
    } else if (this.consumeIf(TokenType.SessionVariable)) {
      text = lcase(this.token(-1).text)
    } else if (this.consumeIf(TokenType.UserDefinedVariable)) {
      text = lcase(this.token(-1).text)
    } else {
      throw this.createParseError()
    }
    return text
  }

  sizeValue() {
    if (this.peekIf(TokenType.Number) || this.peekIf(TokenType.Size)) {
      this.consume()
      return this.token(-1).text
    } else {
      throw this.createParseError()
    }
  }

  numberValue() {
    let text
    if (this.consumeIf(Keyword.OPE_PLUS) || this.consumeIf(Keyword.OPE_MINUS)) {
      text = this.token(-1).text
      this.consume(TokenType.Number)
      text += this.token(-1).text
    } else {
      this.consume(TokenType.Number)
      text = this.token(-1).text
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

function parseCommand(text: string) {
  const sep = Math.max(text.indexOf(" "), text.indexOf("\t"))
  const name = sep != -1 ? text.substring(0, sep) : text
  const args = sep != -1 ? text.substring(sep) : ""

  const result = { name: "", args: new Array<string>() }

  if (name === "?" || name === "\\?" || name === "\\h" || /^help$/i.test(name)) {
    result.name = "help"
  } else if (name === "\\c" || /^clear$/i.test(name)) {
    result.name = "clear"
  } else if (name === "\\r" || /^connect$/i.test(name)) {
    result.name = "connect"
  } else if (name === "\\d" || /^delimiter$/i.test(name)) {
    result.name = "delimiter"
  } else if (name === "\\e" || /^edit$/i.test(name)) {
    result.name = "edit"
  } else if (name === "\\G" || /^ego$/i.test(name)) {
    result.name = "ego"
  } else if (name === "\\q" || /^exit$/i.test(name)) {
    result.name = "exit"
  } else if (name === "\\g" || /^go$/i.test(name)) {
    result.name = "go"
  } else if (name === "\\n" || /^nopager$/i.test(name)) {
    result.name = "nopager"
  } else if (name === "\\t" || /^notee$/i.test(name)) {
    result.name = "notee"
  } else if (name === "\\P" || /^pager$/i.test(name)) {
    result.name = "pager"
  } else if (name === "\\p" || /^print$/i.test(name)) {
    result.name = "print"
  } else if (name === "\\R" || /^prompt$/i.test(name)) {
    result.name = "prompt"
  } else if (name === "\\q" || /^quit$/i.test(name)) {
    result.name = "quit"
  } else if (name === "\\#" || /^rehash$/i.test(name)) {
    result.name = "rehash"
  } else if (name === "\\." || /^source$/i.test(name)) {
    result.name = "source"
  } else if (name === "\\s" || /^status$/i.test(name)) {
    result.name = "status"
  } else if (name === "\\!" || /^system$/i.test(name)) {
    result.name = "system"
  } else if (name === "\\T" || /^tee$/i.test(name)) {
    result.name = "tee"
  } else if (name === "\\u" || /^use$/i.test(name)) {
    result.name = "use"
  } else if (name === "\\C" || /^charset$/i.test(name)) {
    result.name = "charset"
  } else if (name === "\\W" || /^warnings$/i.test(name)) {
    result.name = "warnings"
  } else if (name === "\\w" || /^nowarning$/i.test(name)) {
    result.name = "nowarning"
  } else {
    return null
  }

  if (!args) {
    return result
  }

  if (result.name === "prompt") {
    result.args.push(args)
  } else if (
    result.name === "help" ||
    result.name === "pager" ||
    result.name === "prompt" ||
    result.name === "source" ||
    result.name === "system" ||
    result.name === "tee"
  ) {
    const re = /[ \t]+|'((?:''|[^']+)*)'|([^ \t']+)/y
    let pos = 0
    while (pos < args.length) {
      re.lastIndex = pos
      const m = re.exec(args)
      if (m) {
        if (m[1]) {
          result.args.push(m[1].replace(/''/g, "'").replace(/\\(.)/g, "$1"))
        } else if (m[2]) {
          result.args.push(m[2])
        }
        pos = re.lastIndex
      }
    }
  } else if (
    result.name === "connect" ||
    result.name === "delimiter" ||
    result.name === "use" ||
    result.name === "charset"
  ) {
    const re = /[ \t]+|'((?:''|[^']+)*)'|`((?:``|[^`]+)*)`|([^ \t']+)/y
    let pos = 0
    while (pos < args.length) {
      re.lastIndex = pos
      const m = re.exec(args)
      if (m) {
        if (m[1]) {
          result.args.push(m[1].replace(/''/g, "'").replace(/\\(.)/g, "$1"))
        } else if (m[2]) {
          result.args.push(m[2].replace(/``/g, "`"))
        } else if (m[3]) {
          result.args.push(m[3])
        }
        pos = re.lastIndex
      }
    }
  } else {
    return null
  }

  return result
}
