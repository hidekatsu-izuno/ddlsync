import semver from "semver"
import { Statement } from "../models"
import {
  ITokenType,
  Token,
  Lexer,
  Parser,
  ParseError,
  AggregateParseError,
} from "../parser"
import { dequote, escapeRegExp, lcase, ucase } from "../util/functions"
import * as model from "./mysql_models"
import { unbackslashed } from "./mysql_utils"

export class TokenType implements ITokenType {
  static Delimiter = new TokenType("Delimiter")
  static Command = new TokenType("Command")
  static WhiteSpace = new TokenType("WhiteSpace", { skip: true })
  static LineBreak = new TokenType("LineBreak", { skip: true })
  static HintComment = new TokenType("HintComment", { skip: true })
  static BlockComment = new TokenType("BlockComment", { skip: true })
  static LineComment = new TokenType("LineComment", { skip: true })
  static LeftParen = new TokenType("LeftParen")
  static RightParen = new TokenType("RightParen")
  static LeftBrace = new TokenType("LeftBrace")
  static RightBrace = new TokenType("RightBrace")
  static Comma = new TokenType("Comma")
  static Dot = new TokenType("Dot")
  static Operator = new TokenType("Operator")
  static Number = new TokenType("Number")
  static Size = new TokenType("Size")
  static String = new TokenType("String")
  static BindVariable = new TokenType("BindVariable")
  static SessionVariable = new TokenType("SessionVariable")
  static UserVariable = new TokenType("UserVariable")
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
  static ADMIN = new Keyword("ADMIN")
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
  static BODY = new Keyword("BODY")
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
  static CLUSTERING = new Keyword("CLUSTERING")
  static COLUMN = new Keyword("COLUMN", { reserved: true })
  static COLUMN_FORMAT = new Keyword("COLUMN_FORMAT")
  static COLUMNS = new Keyword("COLUMNS")
  static COMMENT = new Keyword("COMMENT")
  static COMMIT = new Keyword("COMMIT")
  static COMMITTED = new Keyword("COMMITTED")
  static COMPACT = new Keyword("COMPACT")
  static COMPLETION = new Keyword("COMPLETION")
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
  static CURRENT_ROLE = new Keyword("CURRENT_ROLE")
  static CURSOR = new Keyword("CURSOR", { reserved: true })
  static CYCLE = new Keyword("CYCLE")
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
  static ENCRYPTED  = new Keyword("ENCRYPTED")
  static ENCRYPTION = new Keyword("ENCRYPTION")
  static ENCRYPTION_KEY_ID = new Keyword("ENCRYPTION_KEY_ID")
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
  static IETF_QUOTES = new Keyword("IETF_QUOTES")
  static IF = new Keyword("IF", { reserved: true })
  static IGNORE = new Keyword("IGNORE", { reserved: true })
  static IGNORED = new Keyword("IGNORED")
  static INCREMENT = new Keyword("INCREMENT")
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
  static MINVALUE = new Keyword("MINVALUE")
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
  static NOCACHE = new Keyword("NOCACHE")
  static NOCYCLE = new Keyword("NOCYCLE")
  static NODEGROUP = new Keyword("NODEGROUP")
  static NOMINVALUE = new Keyword("NOMINVALUE")
  static NOMAXVALUE = new Keyword("NOMAXVALUE")
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
  static PACKAGE = new Keyword("PACKAGE")
  static PAGE_CHECKSUM = new Keyword("PAGE_CHECKSUM")
  static PAGE_COMPRESSED = new Keyword("PAGE_COMPRESSED")
  static PAGE_COMPRESSION_LEVEL = new Keyword("PAGE_COMPRESSION_LEVEL")
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
  static PRESERVE  = new Keyword("PRESERVE")
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
  static RTREE = new Keyword("RTREE")
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
  static SEQUENCE = new Keyword("SEQUENCE")
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
  static TRANSACTIONAL = new Keyword("TRANSACTIONAL")
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
  static UNKNOWN = new Keyword("UNKNOWN")
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
  static VERSIONING = new Keyword("VERSIONING")
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
  static YES = new Keyword("YES")
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
      { type: TokenType.SessionVariable, re: /@@([a-zA-Z0-9._$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]+|`([^`]|``)*`|'([^']|'')*'|"([^"]|"")*")/y },
      { type: TokenType.UserVariable, re: /@([a-zA-Z0-9._$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]+|`([^`]|``)*`|'([^']|'')*'|"([^"]|"")*")/y },
      { type: TokenType.Identifier, re: /[a-zA-Z_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y },
      { type: TokenType.Operator, re: /\|\|&&|<=>|<<|>>|<>|->>?|[=<>!:]=?|[~&|^*/%+-]/y },
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
  private stmtStart = 0

  constructor(
    input: string,
    options: { [key: string]: any } = {},
  ) {
    super(input, new MysqlLexer(options), options)
    this.setSqlMode(options.sqlMode)
  }

  private setSqlMode(text: string) {
    this.sqlMode.clear()
    if (text) {
      for (let mode of text.split(/,/g)) {
        mode = ucase(mode)
        if (mode === "ANSI") {
          this.sqlMode.add("REAL_AS_FLOAT")
          this.sqlMode.add("PIPES_AS_CONCAT")
          this.sqlMode.add("ANSI_QUOTES")
          this.sqlMode.add("IGNORE_SPACE")
          if (this.options.variant === "mysql") {
            if (!this.options.version || semver.gte(this.options.version, "8.0.0")) {
              this.sqlMode.add("ONLY_FULL_GROUP_BY")
            }
          }
        } else if (mode === "TRADITIONAL") {
          this.sqlMode.add("STRICT_TRANS_TABLES")
          this.sqlMode.add("STRICT_ALL_TABLES")
          this.sqlMode.add("NO_ZERO_IN_DATE")
          this.sqlMode.add("NO_ZERO_DATE")
          this.sqlMode.add("ERROR_FOR_DIVISION_BY_ZERO")
          this.sqlMode.add("NO_ENGINE_SUBSTITUTION")
        } else {
          if (this.options.variant === "mariadb" || semver.lt(this.options.version, "8.0.0")) {
            if (mode === "DB2" || mode === "MAXDB" || mode === "MSSQL" || mode === "ORACLE" || mode === "POSTGRESQL") {
              if (mode === "DB2") {
                this.sqlMode.add("DB2")
              } else if (mode === "MAXDB") {
                this.sqlMode.add("MAXDB")
                this.sqlMode.add("NO_AUTO_CREATE_USER")
              } else if (mode === "ORACLE") {
                this.sqlMode.add("NO_AUTO_CREATE_USER")
                this.sqlMode.add("SIMULTANEOUS_ASSIGNMENT")
              } else if (mode === "POSTGRESQL") {
                this.sqlMode.add("POSTGRESQL")
              }
              this.sqlMode.add("PIPES_AS_CONCAT")
              this.sqlMode.add("ANSI_QUOTES")
              this.sqlMode.add("IGNORE_SPACE")
              this.sqlMode.add("NO_KEY_OPTIONS")
              this.sqlMode.add("NO_TABLE_OPTIONS")
              this.sqlMode.add("NO_FIELD_OPTIONS")
            } else if (mode === "MYSQL323" || mode === "MYSQL40") {
              this.sqlMode.add("NO_FIELD_OPTIONS")
              this.sqlMode.add("HIGH_NOT_PRECEDENCE")
            } else {
              this.sqlMode.add(mode)
            }
          } else {
            this.sqlMode.add(mode)
          }
        }
      }
    } else if (this.options.variant === "mariadb") {
      if (!this.options.version || semver.gte(this.options.version, "10.2.4")) {
        this.sqlMode.add("STRICT_TRANS_TABLES")
        this.sqlMode.add("NO_AUTO_CREATE_USER")
        this.sqlMode.add("ERROR_FOR_DIVISION_BY_ZERO")
        this.sqlMode.add("NO_ENGINE_SUBSTITUTION")
      } else if (semver.gte(this.options.version, "10.1.7")) {
        this.sqlMode.add("NO_AUTO_CREATE_USER")
        this.sqlMode.add("NO_ENGINE_SUBSTITUTION")
      }
    } else {
      if (!this.options.version || semver.gte(this.options.version, "8.0.0")) {
        this.sqlMode.add("ONLY_FULL_GROUP_BY")
        this.sqlMode.add("STRICT_TRANS_TABLES")
        this.sqlMode.add("NO_ZERO_IN_DATE")
        this.sqlMode.add("NO_ZERO_DATE")
        this.sqlMode.add("ERROR_FOR_DIVISION_BY_ZERO")
        this.sqlMode.add("NO_ENGINE_SUBSTITUTION")
      } else if (semver.gte(this.options.version, "5.7.0")) {
        this.sqlMode.add("ONLY_FULL_GROUP_BY")
        this.sqlMode.add("STRICT_TRANS_TABLES")
        this.sqlMode.add("NO_ZERO_IN_DATE")
        this.sqlMode.add("NO_ZERO_DATE")
        this.sqlMode.add("ERROR_FOR_DIVISION_BY_ZERO")
        this.sqlMode.add("NO_AUTO_CREATE_USER")
        this.sqlMode.add("NO_ENGINE_SUBSTITUTION")
      } else if (semver.gte(this.options.version, "5.6.6")) {
        this.sqlMode.add("NO_ENGINE_SUBSTITUTION")
      }
    }
  }

  root(): Statement[] {
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
        if (this.token() && !this.peekIf(TokenType.Delimiter)) {
          this.stmtStart = this.pos

          let stmt
          if (this.peekIf(TokenType.Command)) {
            stmt = this.command()
          } else {
            stmt = this.statement()
          }
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
    this.consume(TokenType.Command)
    const stmt = new model.CommandStatement()
    const command = parseCommand(this.token(-1).text || "")
    if (command) {
      stmt.name = command.name
      stmt.args = command.args
    } else {
      throw this.createParseError()
    }

    stmt.tokens = this.tokens.slice(this.stmtStart, this.pos)
    return stmt
  }

  statement(): Statement {
    let stmt
    if (this.consumeIf(Keyword.CREATE)) {
      let orReplace = false
      if (this.consumeIf(Keyword.OR)) {
        this.consume(Keyword.REPLACE)
        orReplace = true
      }

      if (this.consumeIf(Keyword.DATABASE) || this.consumeIf(Keyword.SCHEMA)) {
        stmt = new model.CreateDatabaseStatement()
        stmt.orReplace = orReplace
        this.parseCreateDatabaseStatement(stmt)
      } else if (this.consumeIf(Keyword.ROLE)) {
        stmt = new model.CreateRoleStatement()
        stmt.orReplace = orReplace
        this.parseCreateRoleStatement(stmt)
      } else if (this.consumeIf(Keyword.USER)) {
        stmt = new model.CreateUserStatement()
        stmt.orReplace = orReplace
        this.parseCreateUserStatement(stmt)
      } else if (!orReplace && this.consumeIf(Keyword.UNDO, Keyword.TABLESPACE)) {
        stmt = new model.CreateTablespaceStatement()
        stmt.undo = true
        this.parseCreateTablespaceStatement(stmt)
      } else if (!orReplace && this.consumeIf(Keyword.TABLESPACE)) {
        stmt = new model.CreateTablespaceStatement()
        this.parseCreateTablespaceStatement(stmt)
      } else if (this.consumeIf(Keyword.SERVER)) {
        stmt = new model.CreateServerStatement()
        stmt.orReplace = orReplace
        this.parseCreateServerStatement(stmt)
      } else if (this.consumeIf(Keyword.RESOURCE)) {
        this.consume(Keyword.GROUP)
        stmt = new model.CreateResourceGroupStatement()
        stmt.orReplace = orReplace
        this.parseCreateResourceGroupStatement(stmt)
      } else if (!orReplace && this.consumeIf(Keyword.LOGFILE)) {
        this.consume(Keyword.GROUP)
        stmt = new model.CreateLogfileGroupStatement()
        this.parseCreateLogfileGroupStatement(stmt)
      } else if (this.consumeIf(Keyword.SPATIAL, Keyword.REFERENCE, Keyword.SYSTEM)) {
        stmt = new model.CreateSpatialReferenceSystemStatement()
        stmt.orReplace = true
        this.parseCreateSpatialReferenceSystemStatement(stmt)
      } else if (this.consumeIf(Keyword.TEMPORARY, Keyword.TABLE)) {
        stmt = new model.CreateTableStatement()
        stmt.orReplace = orReplace
        stmt.temporary = true
        this.parseCreateTableStatement(stmt)
      } else if (this.consumeIf(Keyword.TABLE)) {
        stmt = new model.CreateTableStatement()
        stmt.orReplace = orReplace
        this.parseCreateTableStatement(stmt)
      } else if (this.consumeIf(Keyword.TEMPORARY, Keyword.SEQUENCE)) {
        stmt = new model.CreateSequenceStatement()
        stmt.orReplace = orReplace
        stmt.temporary = true
        this.parseCreateSequenceStatement(stmt)
      } else if (this.consumeIf(Keyword.SEQUENCE)) {
        stmt = new model.CreateSequenceStatement()
        stmt.orReplace = orReplace
        this.parseCreateSequenceStatement(stmt)
      } else if (this.consumeIf(Keyword.UNIQUE, Keyword.INDEX)) {
        stmt = new model.CreateIndexStatement()
        stmt.orReplace = orReplace
        stmt.type = model.UNIQUE
        this.parseCreateIndexStatement(stmt)
      } else if (this.consumeIf(Keyword.FULLTEXT, Keyword.INDEX)) {
        stmt = new model.CreateIndexStatement()
        stmt.orReplace = orReplace
        stmt.type = model.FULLTEXT
        this.parseCreateIndexStatement(stmt)
      } else if (this.consumeIf(Keyword.SPATIAL, Keyword.INDEX)) {
        stmt = new model.CreateIndexStatement()
        stmt.orReplace = orReplace
        stmt.type = model.SPATIAL
        this.parseCreateIndexStatement(stmt)
      } else if (this.consumeIf(Keyword.INDEX)) {
        stmt = new model.CreateIndexStatement()
        stmt.orReplace = orReplace
        this.parseCreateIndexStatement(stmt)
      } else if (this.consumeIf(Keyword.ALGORITHM)) {
        stmt = new model.CreateViewStatement()
        stmt.orReplace = orReplace
        stmt.algorithm = this.viewAlgorithm()
        if (this.consumeIf(Keyword.DEFINER)) {
          this.consume(Keyword.OPE_EQ)
          stmt.definer = this.userRole()
          if (this.consumeIf(TokenType.UserVariable)) {
            stmt.definer.host = new model.UserVariable(this.token(-1).text)
          } else {
            stmt.definer.host = new model.UserVariable("%", true)
          }
        }
        if (this.peekIf(Keyword.SQL)) {
          stmt.sqlSecurity = this.sqlSecurity()
        }
        this.consume(Keyword.VIEW)
        this.parseCreateViewStatement(stmt)
      } else if (this.peekIf(Keyword.DEFINER)) {
        this.consume(Keyword.OPE_EQ)
        const definer = this.userRole()
        if (this.consumeIf(TokenType.UserVariable)) {
          definer.host = new model.UserVariable(this.token(-1).text)
        } else {
          definer.host = new model.UserVariable("%", true)
        }
        if (this.peekIf(Keyword.SQL)) {
          const sqlSecurity = this.sqlSecurity()
          this.consume(Keyword.VIEW)
          stmt = new model.CreateViewStatement()
          stmt.orReplace = orReplace
          stmt.definer = definer
          stmt.sqlSecurity = sqlSecurity
          this.parseCreateViewStatement(stmt)
        } else if (this.consumeIf(Keyword.VIEW)) {
          stmt = new model.CreateViewStatement()
          stmt.orReplace = orReplace
          stmt.definer = definer
          this.parseCreateViewStatement(stmt)
        } else if (this.consumeIf(Keyword.PACKAGE, Keyword.BODY)) {
          stmt = new model.CreatePackageBodyStatement()
          stmt.orReplace = orReplace
          stmt.definer = definer
          this.parseCreatePackageBodyStatement(stmt)
        } else if (this.consumeIf(Keyword.PACKAGE)) {
          stmt = new model.CreatePackageStatement()
          stmt.orReplace = orReplace
          stmt.definer = definer
          this.parseCreatePackageStatement(stmt)
        } else if (this.consumeIf(Keyword.PROCEDURE)) {
          stmt = new model.CreateProcedureStatement()
          stmt.orReplace = orReplace
          stmt.definer = definer
          this.parseCreateProcedureStatement(stmt)
        } else if (this.consumeIf(Keyword.AGGREGATE, Keyword.FUNCTION)) {
          stmt = new model.CreateFunctionStatement()
          stmt.orReplace = orReplace
          stmt.definer = definer
          stmt.aggregate = true
          this.parseCreateFunctionStatement(stmt)
        } else if (this.consumeIf(Keyword.FUNCTION)) {
          stmt = new model.CreateFunctionStatement()
          stmt.orReplace = orReplace
          stmt.definer = definer
          this.parseCreateFunctionStatement(stmt)
        } else if (this.consumeIf(Keyword.TRIGGER)) {
          stmt = new model.CreateTriggerStatement()
          stmt.orReplace = orReplace
          stmt.definer = definer
          this.parseCreateTriggerStatement(stmt)
        } else if (this.consumeIf(Keyword.EVENT)) {
          stmt = new model.CreateEventStatement()
          stmt.orReplace = orReplace
          stmt.definer = definer
          this.parseCreateEventStatement(stmt)
        }
      } else if (this.peekIf(Keyword.SQL)) {
        const sqlSecurity = this.sqlSecurity()
        this.consume(Keyword.VIEW)
        stmt = new model.CreateViewStatement()
        stmt.orReplace = orReplace
        stmt.sqlSecurity = sqlSecurity
        this.parseCreateViewStatement(stmt)
      } else if (this.consumeIf(Keyword.VIEW)) {
        stmt = new model.CreateViewStatement()
        stmt.orReplace = orReplace
        this.parseCreateViewStatement(stmt)
      } else if (this.consumeIf(Keyword.PACKAGE, Keyword.BODY)) {
        stmt = new model.CreatePackageBodyStatement()
        stmt.orReplace = orReplace
        this.parseCreatePackageBodyStatement(stmt)
      } else if (this.consumeIf(Keyword.PACKAGE)) {
        stmt = new model.CreatePackageStatement()
        stmt.orReplace = orReplace
        this.parseCreatePackageStatement(stmt)
      } else if (this.consumeIf(Keyword.PROCEDURE)) {
        stmt = new model.CreateProcedureStatement()
        stmt.orReplace = orReplace
        this.parseCreateProcedureStatement(stmt)
      } else if (this.consumeIf(Keyword.AGGREGATE, Keyword.FUNCTION)) {
        stmt = new model.CreateFunctionStatement()
        stmt.orReplace = orReplace
        stmt.aggregate = true
        this.parseCreateFunctionStatement(stmt)
      } else if (this.consumeIf(Keyword.FUNCTION)) {
        stmt = new model.CreateFunctionStatement()
        stmt.orReplace = orReplace
        this.parseCreateFunctionStatement(stmt)
      } else if (this.consumeIf(Keyword.TRIGGER)) {
        stmt = new model.CreateTriggerStatement()
        stmt.orReplace = orReplace
        this.parseCreateTriggerStatement(stmt)
      } else if (this.consumeIf(Keyword.EVENT)) {
        stmt = new model.CreateEventStatement()
        stmt.orReplace = orReplace
        this.parseCreateEventStatement(stmt)
      } else if (
        this.consumeIf(Keyword.SPATIAL, Keyword.REFERENCE) ||
        this.consumeIf(Keyword.SPATIAL) ||
        this.consumeIf(Keyword.TEMPORARY) ||
        this.consumeIf(Keyword.UNIQUE) ||
        this.consumeIf(Keyword.FULLTEXT) ||
        this.consumeIf(Keyword.SPATIAL)
      ) {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.ALTER)) {
      if (this.consumeIf(Keyword.INSTANCE)) {
        stmt = new model.AlterInstanceStatement()
        this.parseAlterInstanceStatement(stmt)
      } else if (this.consumeIf(Keyword.DATABASE) || this.consumeIf(Keyword.SCHEMA)) {
        stmt = new model.AlterDatabaseStatement()
        this.parseAlterDatabaseStatement(stmt)
      } else if (this.consumeIf(Keyword.USER)) {
        stmt = new model.AlterUserStatement()
        this.parseAlterUserStatement(stmt)
      } else if (this.consumeIf(Keyword.UNDO, Keyword.TABLESPACE)) {
        stmt = new model.AlterTablespaceStatement()
        stmt.undo = true
        this.parseAlterTablespaceStatement(stmt)
      } else if (this.consumeIf(Keyword.TABLESPACE)) {
        stmt = new model.AlterTablespaceStatement()
        this.parseAlterTablespaceStatement(stmt)
      } else if (this.consumeIf(Keyword.SERVER)) {
        stmt = new model.AlterServerStatement()
        this.parseAlterServerStatement(stmt)
      } else if (this.consumeIf(Keyword.RESOURCE)) {
        this.consume(Keyword.GROUP)
        stmt = new model.AlterResourceGroupStatement()
        this.parseAlterResourceGroupStatement(stmt)
      } else if (this.consumeIf(Keyword.LOGFILE)) {
        this.consume(Keyword.GROUP)
        stmt = new model.AlterLogfileGroupStatement()
        this.parseAlterLogfileGroupStatement(stmt)
      } else if (this.consumeIf(Keyword.TABLE)) {
        stmt = new model.AlterTableStatement()
        this.parseAlterTableStatement(stmt)
      } else if (this.consumeIf(Keyword.ALGORITHM)) {
        stmt = new model.AlterViewStatement()
        stmt.algorithm = this.viewAlgorithm()
        if (this.consumeIf(Keyword.DEFINER)) {
          this.consume(Keyword.OPE_EQ)
          stmt.definer = this.userRole()
          if (this.consumeIf(TokenType.UserVariable)) {
            stmt.definer.host = new model.UserVariable(this.token(-1).text)
          } else {
            stmt.definer.host = new model.UserVariable("%", true)
          }
        }
        if (this.peekIf(Keyword.SQL)) {
          stmt.sqlSecurity = this.sqlSecurity()
        }
        this.consume(Keyword.VIEW)
        this.parseAlterInstanceStatement(stmt)
      } else if (this.peekIf(Keyword.DEFINER)) {
        this.consume(Keyword.OPE_EQ)
        const definer = this.userRole()
        if (this.consumeIf(TokenType.UserVariable)) {
          definer.host = new model.UserVariable(this.token(-1).text)
        } else {
          definer.host = new model.UserVariable("%", true)
        }
        if (this.peekIf(Keyword.SQL)) {
          const sqlSecurity = this.sqlSecurity()
          if (this.consumeIf(Keyword.VIEW)) {
            stmt = new model.AlterViewStatement()
            stmt.definer = definer
            stmt.sqlSecurity = sqlSecurity
          }
        } else if (this.consumeIf(Keyword.VIEW)) {
          stmt = new model.AlterViewStatement()
          stmt.definer = definer
          this.parseAlterViewStatement(stmt)
        } else if (this.consumeIf(Keyword.PROCEDURE)) {
          stmt = new model.AlterProcedureStatement()
          stmt.definer = definer
          this.parseAlterProcedureStatement(stmt)
        } else if (this.consumeIf(Keyword.FUNCTION)) {
          stmt = new model.AlterFunctionStatement()
          stmt.definer = definer
          this.parseAlterFunctionStatement(stmt)
        } else if (this.consumeIf(Keyword.EVENT)) {
          stmt = new model.AlterEventStatement()
          stmt.definer = definer
          this.parseAlterEventStatement(stmt)
        }
      } else if (this.peekIf(Keyword.SQL)) {
        const sqlSecurity = this.sqlSecurity()
        this.consumeIf(Keyword.VIEW)
        stmt = new model.AlterViewStatement()
        stmt.sqlSecurity = sqlSecurity
        this.parseAlterViewStatement(stmt)
      } else if (this.consumeIf(Keyword.VIEW)) {
        stmt = new model.AlterViewStatement()
        this.parseAlterViewStatement(stmt)
      } else if (this.consumeIf(Keyword.PROCEDURE)) {
        stmt = new model.AlterProcedureStatement()
        this.parseAlterProcedureStatement(stmt)
      } else if (this.consumeIf(Keyword.FUNCTION)) {
        stmt = new model.AlterFunctionStatement()
        this.parseAlterFunctionStatement(stmt)
      } else if (this.consumeIf(Keyword.EVENT)) {
        stmt = new model.AlterEventStatement()
        this.parseAlterEventStatement(stmt)
      }
    } else if (this.consumeIf(Keyword.RENAME)) {
      if (this.consumeIf(Keyword.TABLE)) {
        stmt = new model.RenameTableStatement()
        this.parseRenameTableStatement(stmt)
      } else if (this.consumeIf(Keyword.USER)) {
        stmt = new model.RenameUserStatement()
        this.parseRenameUserStatement(stmt)
      }
    } else if (this.consumeIf(Keyword.DROP)) {
      if (this.consumeIf(Keyword.DATABASE) || this.consumeIf(Keyword.SCHEMA)) {
        stmt = new model.DropDatabaseStatement()
        this.parseDropDatabaseStatement(stmt)
      } else if (this.consumeIf(Keyword.ROLE)) {
        stmt = new model.DropRoleStatement()
        this.parseDropRoleStatement(stmt)
      } else if (this.consumeIf(Keyword.USER)) {
        stmt = new model.DropUserStatement()
        this.parseDropUserStatement(stmt)
      } else if (this.consumeIf(Keyword.UNDO, Keyword.TABLESPACE)) {
        stmt = new model.DropTablespaceStatement()
        stmt.undo = true
        this.parseDropTablespaceStatement(stmt)
      } else if (this.consumeIf(Keyword.TABLESPACE)) {
        stmt = new model.DropTablespaceStatement()
        this.parseDropTablespaceStatement(stmt)
      } else if (this.consumeIf(Keyword.SERVER)) {
        stmt = new model.DropServerStatement()
        this.parseDropServerStatement(stmt)
      } else if (this.consumeIf(Keyword.RESOURCE)) {
        this.consume(Keyword.GROUP)
        stmt = new model.DropResourceGroupStatement()
        this.parseDropResourceGroupStatement(stmt)
      } else if (this.consumeIf(Keyword.LOGFILE)) {
        this.consume(Keyword.GROUP)
        stmt = new model.DropLogfileGroupStatement()
        this.parseDropLogfileGroupStatement(stmt)
      } else if (this.consumeIf(Keyword.SPATIAL, Keyword.REFERENCE, Keyword.SYSTEM)) {
        stmt = new model.DropSpatialReferenceSystemStatement()
        this.parseDropSpatialReferenceSystemStatement(stmt)
      } else if (this.consumeIf(Keyword.TEMPORARY, Keyword.TABLE)) {
        stmt = new model.DropTableStatement()
        stmt.temporary = true
        this.parseDropTableStatement(stmt)
      } else if (this.consumeIf(Keyword.TABLE)) {
        stmt = new model.DropTableStatement()
        this.parseDropTableStatement(stmt)
      } else if (this.consumeIf(Keyword.SEQUENCE)) {
        stmt = new model.DropSequenceStatement()
        this.parseDropSequenceStatement(stmt)
      } else if (this.consumeIf(Keyword.VIEW)) {
        stmt = new model.DropViewStatement()
        this.parseDropViewStatement(stmt)
      } else if (this.consumeIf(Keyword.PACKAGE, Keyword.BODY)) {
        stmt = new model.DropPackageBodyStatement()
        this.parseDropPackageBodyStatement(stmt)
      } else if (this.consumeIf(Keyword.PACKAGE)) {
        stmt = new model.DropPackageStatement()
        this.parseDropPackageStatement(stmt)
      } else if (this.consumeIf(Keyword.PROCEDURE)) {
        stmt = new model.DropProcedureStatement()
        this.parseDropProcedureStatement(stmt)
      } else if (this.consumeIf(Keyword.FUNCTION)) {
        stmt = new model.DropFunctionStatement()
        this.parseDropFunctionStatement(stmt)
      } else if (this.consumeIf(Keyword.TRIGGER)) {
        stmt = new model.DropTriggerStatement()
        this.parseDropTriggerStatement(stmt)
      } else if (this.consumeIf(Keyword.EVENT)) {
        stmt = new model.DropEventStatement()
        this.parseDropEventStatement(stmt)
      } else if (this.consumeIf(Keyword.INDEX)) {
        stmt = new model.DropIndexStatement()
        this.parseDropIndexStatement(stmt)
      } else if (this.consumeIf(Keyword.PREPARE)) {
        stmt = new model.DeallocatePrepareStatement()
        this.parseDeallocatePrepareStatement(stmt)
      } else if (
        this.consumeIf(Keyword.SPATIAL, Keyword.REFERENCE) ||
        this.consumeIf(Keyword.SPATIAL) ||
        this.consumeIf(Keyword.TEMPORARY)
      ) {
        throw this.createParseError()
      }
    } else if (this.consumeIf(Keyword.TRUNCATE)) {
      this.consumeIf(Keyword.TABLE)
      stmt = new model.TruncateTableStatement()
      this.parseTruncateTableStatement(stmt)
    } else if (this.consumeIf(Keyword.PREPARE)) {
      stmt = new model.PrepareStatement()
      this.parsePrepareStatement(stmt)
    } else if (this.consumeIf(Keyword.EXECUTE)) {
      stmt = new model.ExecuteStatement()
      this.parseExecuteStatement(stmt)
    } else if (this.consumeIf(Keyword.DEALLOCATE)) {
      this.consume(Keyword.PREPARE)
    } else if (this.consumeIf(Keyword.START)) {
      if (this.consumeIf(Keyword.TRANSACTION)) {
        stmt = new model.StartTransactionStatement()
        this.parseStartTransactionStatement(stmt)
      } else if (this.consumeIf(Keyword.REPLICA) || this.consumeIf(Keyword.SLAVE)) {
        stmt = new model.StartReplicaStatement()
        this.parseStartReplicaStatement(stmt)
      }
    } else if (this.consumeIf(Keyword.CHANGE)) {
      this.consume(Keyword.MASTER)
      stmt = new model.ChangeMasterStatement()
      this.parseChangeMasterStatement(stmt)
    } else if (this.consumeIf(Keyword.STOP)) {
      if (this.consumeIf(Keyword.REPLICA) || this.consumeIf(Keyword.SLAVE)) {
        stmt = new model.StopReplicaStatement()
        this.parseStopReplicaStatement(stmt)
      }
    } else if (this.consumeIf(Keyword.BEGIN)) {
      stmt = new model.BeginStatement()
      this.parseBeginStatement(stmt)
    } else if (this.consumeIf(Keyword.SAVEPOINT)) {
      stmt = new model.SavepointStatement()
      this.parseSavepointStatement(stmt)
    } else if (this.consumeIf(Keyword.RELEASE)) {
      this.consumeIf(Keyword.SAVEPOINT)
      stmt = new model.ReleaseSavepointStatement()
      this.parseReleaseSavepointStatement(stmt)
    } else if (this.consumeIf(Keyword.COMMIT)) {
      stmt = new model.CommitStatement()
      this.parseCommitStatement(stmt)
    } else if (this.consumeIf(Keyword.ROLLBACK)) {
      stmt = new model.RollbackStatement()
      this.parseRollbackStatement(stmt)
    } else if (this.consumeIf(Keyword.LOCK)) {
      this.consume(Keyword.TABLES)
      stmt = new model.LockTablesStatement()
      this.parseLockTablesStatement(stmt)
    } else if (this.consumeIf(Keyword.UNLOCK)) {
      this.consumeIf(Keyword.TABLES)
      stmt = new model.UnlockTablesStatement()
      this.parseUnlockTablesStatement(stmt)
    } else if (this.consumeIf(Keyword.XA)) {
      if (this.consumeIf(Keyword.START)) {
        stmt = new model.XaStartStatement()
        this.parseXaStartStatement(stmt)
      } else if (this.consumeIf(Keyword.BEGIN)) {
        stmt = new model.XaBeginStatement()
        this.parseXaBeginStatement(stmt)
      } else if (this.consumeIf(Keyword.END)) {
        stmt = new model.XaEndStatement()
        this.parseXaEndStatement(stmt)
      } else if (this.consumeIf(Keyword.PREPARE)) {
        stmt = new model.XaPrepareStatement()
        this.parseXaPrepareStatement(stmt)
      } else if (this.consumeIf(Keyword.COMMIT)) {
        stmt = new model.XaCommitStatement()
        this.parseXaCommitStatement(stmt)
      } else if (this.consumeIf(Keyword.ROLLBACK)) {
        stmt = new model.XaRollbackStatement()
        this.parseXaRollbackStatement(stmt)
      } else if (this.consumeIf(Keyword.RECOVER)) {
        stmt = new model.XaRecoverStatement()
        this.parseXaRecoverStatement(stmt)
      }
    } else if (this.consumeIf(Keyword.PURGE)) {
      if (
        this.consumeIf(Keyword.BINARY, Keyword.LOGS) ||
        this.consumeIf(Keyword.MASTER, Keyword.LOGS)
      ) {
        stmt = new model.PurgeBinaryLogsStatement()
        this.parsePurgeBinaryLogsStatement(stmt)
      }
    } else if (this.consumeIf(Keyword.RESET)) {
      if (this.consumeIf(Keyword.MASTER)) {
        stmt = new model.ResetMasterStatement()
        this.parseResetMasterStatement(stmt)
      } else if (this.consumeIf(Keyword.REPLICA) || this.consumeIf(Keyword.SLAVE)) {
        stmt = new model.ResetReplicaStatement()
        this.parseResetReplicaStatement(stmt)
      }
    } else if (this.consumeIf(Keyword.GRANT)) {
      stmt = new model.GrantStatement()
      this.parseGrantStatement(stmt)
    } else if (this.consumeIf(Keyword.REVOKE)) {
      stmt = new model.RevokeStatement()
      this.parseRevokeStatement(stmt)
    } else if (this.consumeIf(Keyword.ANALYZE)) {
      stmt = new model.AnalyzeTableStatement()
      if (this.consumeIf(Keyword.NO_WRITE_TO_BINLOG) || this.consumeIf(Keyword.LOCAL)) {
        stmt.noWriteToBinlog = true
      }
      this.consume(Keyword.TABLE)
      this.parseAnalyzeTableStatement(stmt)
    } else if (this.consumeIf(Keyword.CHECK)) {
      if (this.consumeIf(Keyword.TABLE)) {
        stmt = new model.CheckTableStatement()
        this.parseCheckTableStatement(stmt)
      } else if (this.consumeIf(Keyword.INDEX)) {
        stmt = new model.CheckIndexStatement()
        this.parseCheckIndexStatement(stmt)
      }
    } else if (this.consumeIf(Keyword.CHECKSUM)) {
      this.consume(Keyword.TABLE)
      stmt = new model.ChecksumTableStatement()
      this.parseChecksumTableStatement(stmt)
    } else if (this.consumeIf(Keyword.OPTIMIZE)) {
      stmt = new model.OptimizeTableStatement()
      if (this.consumeIf(Keyword.NO_WRITE_TO_BINLOG) || this.consumeIf(Keyword.LOCAL)) {
        stmt.noWriteToBinlog = true
      }
      this.consume(Keyword.TABLE)
      this.parseOptimizeTableStatement(stmt)
    } else if (this.consumeIf(Keyword.REPAIR)) {
      stmt = new model.RepairTableStatement()
      if (this.consumeIf(Keyword.NO_WRITE_TO_BINLOG) || this.consumeIf(Keyword.LOCAL)) {
        stmt.noWriteToBinlog = true
      }
      this.consume(Keyword.TABLE)
      this.parseRepairTableStatement(stmt)
    } else if (this.consumeIf(Keyword.INSTALL)) {
      if (this.consume(Keyword.PLUGIN)) {
        stmt = new model.InstallPluginStatement()
        this.parseInstallPluginStatement(stmt)
      } else if (this.consume(Keyword.COMPONENT)) {
        stmt = new model.InstallComponentStatement()
        this.parseInstallComponentStatement(stmt)
      }
    } else if (this.consumeIf(Keyword.UNINSTALL)) {
      if (this.consume(Keyword.PLUGIN)) {
        stmt = new model.UninstallPluginStatement()
        this.parseUninstallPluginStatement(stmt)
      } else if (this.consume(Keyword.COMPONENT)) {
        stmt = new model.UninstallComponentStatement()
        this.parseUninstallComponentStatement(stmt)
      }
    } else if (this.consumeIf(Keyword.BINLOG)) {
      stmt = new model.BinlogStatement()
      this.parseBinlogStatement(stmt)
    } else if (this.consumeIf(Keyword.CACHE)) {
      this.consume(Keyword.INDEX)
      stmt = new model.CacheIndexStatement()
      this.parseCacheIndexStatement(stmt)
    } else if (this.consumeIf(Keyword.FLUSH)) {
      stmt = new model.FlushStatement()
      this.parseFlushStatement(stmt)
    } else if (this.consumeIf(Keyword.KILL)) {
      stmt = new model.KillStatement()
      this.parseKillStatement(stmt)
    } else if (this.consumeIf(Keyword.RESTART)) {
      stmt = new model.RestartStatement()
      this.parseRestartStatement(stmt)
    } else if (this.consumeIf(Keyword.SHUTDOWN)) {
      stmt = new model.ShutdownStatement()
      this.parseShutdownStatement(stmt)
    } else if (this.consumeIf(Keyword.CLONE)) {
      stmt = new model.CloneStatement()
      this.parseCloneStatement(stmt)
    } else if (this.consumeIf(Keyword.LOAD)) {
      if (this.consumeIf(Keyword.DATA)) {
        stmt = new model.LoadDataStatement()
        this.parseLoadDataStatement(stmt)
      } else if (this.consumeIf(Keyword.XML)) {
        stmt = new model.LoadXmlStatement()
        this.parseLoadXmlStatement(stmt)
      } else if (this.consumeIf(Keyword.INDEX)) {
        this.consume(Keyword.INTO, Keyword.CACHE)
        stmt = new model.LoadIndexIntoCacheStatement()
        this.parseLoadIndexIntoCacheStatement(stmt)
      }
    } else if (this.consumeIf(Keyword.EXPLAIN) || this.consumeIf(Keyword.DESCRIBE)) {
      stmt = new model.ExplainStatement()
      this.parseExplainStatement(stmt)
    } else if (this.consumeIf(Keyword.SET)) {
      if (this.consumeIf(Keyword.RESOURCE)) {
        this.consume(Keyword.GROUP)
        stmt = new model.SetResourceGroupStatement()
        this.parseSetResourceGroupStatement(stmt)
      } else if (this.consumeIf(Keyword.DEFAULT)) {
        this.consume(Keyword.ROLE)
        stmt = new model.SetDefaultRoleStatement()
        this.parseSetDefaultRoleStatement(stmt)
      } else if (this.consumeIf(Keyword.ROLE)) {
        stmt = new model.SetRoleStatement()
        this.parseSetRoleStatement(stmt)
      } else if (this.consumeIf(Keyword.PASSWORD)) {
        stmt = new model.SetPasswordStatement()
        this.parseSetPasswordStatement(stmt)
      } else if (this.consumeIf(Keyword.CHARACTER)) {
        this.consume(Keyword.SET)
        stmt = new model.SetCharacterSetStatement()
        this.parseSetCharacterSetStatement(stmt)
      } else if (this.consumeIf(Keyword.NAMES)) {
        stmt = new model.SetNamesStatement()
        this.parseSetNamesStatement(stmt)
      } else if (this.consumeIf(Keyword.GLOBAL, Keyword.TRANSACTION)) {
        stmt = new model.SetTransactionStatement()
        stmt.type = model.GLOBAL
        this.parseSetTransactionStatement(stmt)
      } else if (
        this.consumeIf(Keyword.SESSION, Keyword.TRANSACTION) ||
        this.consumeIf(Keyword.LOCAL, Keyword.TRANSACTION)
      ) {
        stmt = new model.SetTransactionStatement()
        stmt.type = model.SESSION
        this.parseSetTransactionStatement(stmt)
      } else if (this.consumeIf(Keyword.TRANSACTION)) {
        stmt = new model.SetTransactionStatement()
        this.parseSetTransactionStatement(stmt)
      } else {
        stmt = new model.SetStatement()
        this.parseSetStatement(stmt)
      }
    } else if (this.consumeIf(Keyword.CALL)) {
      stmt = new model.CallStatement()
      this.parseCallStatement(stmt)
    } else if (this.consumeIf(Keyword.DO)) {
      stmt = new model.DoStatement()
      this.parseDoStatement(stmt)
    } else if (this.consumeIf(Keyword.USE)) {
      stmt = new model.UseStatement()
      this.parseUseStatement(stmt)
    } else if (this.consumeIf(Keyword.INSERT)) {
      stmt = new model.InsertStatement()
      this.parseInsertStatement(stmt)
    } else if (this.consumeIf(Keyword.UPDATE)) {
      stmt = new model.UpdateStatement()
      this.parseUpdateStatement(stmt)
    } else if (this.consumeIf(Keyword.REPLACE)) {
      stmt = new model.ReplaceStatement()
      this.parseReplaceStatement(stmt)
    } else if (this.consumeIf(Keyword.DELETE)) {
      stmt = new model.DeleteStatement()
      this.parseDeleteStatement(stmt)
    } else if (this.consumeIf(Keyword.HELP)) {
      stmt = new model.HelpStatement()
      this.parseHelpStatement(stmt)
    } else if (this.consumeIf(Keyword.HANDLER)) {
      stmt = new model.HandlerStatement()
      this.parseHandlerStatement(stmt)
    } else if (this.consumeIf(Keyword.SHOW)) {
      stmt = new model.ShowStatement()
      this.parseShowStatement(stmt)
    } else if (this.consumeIf(Keyword.TABLE)) {
      stmt = new model.TableStatement()
      this.parseTableStatement(stmt)
    } else if (this.peekIf(Keyword.WITH) || this.peekIf(Keyword.SELECT)) {
      stmt = new model.SelectStatement()
      this.parseSelectStatement(stmt)
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
    stmt.tokens = this.tokens.slice(this.stmtStart, this.pos)

    return stmt
  }

  private parseCreateDatabaseStatement(stmt: model.CreateDatabaseStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.NOT, Keyword.EXISTS)
      stmt.ifNotExists = true
    }
    stmt.name = this.identifier()
    while (this.token()) {
      if (
        this.consumeIf(Keyword.DEFAULT, Keyword.CHARACTER) ||
        this.consumeIf(Keyword.CHARACTER)
      ) {
        this.consume(Keyword.SET)
        this.consumeIf(Keyword.OPE_EQ)
        stmt.characterSet = this.identifierOrStringValue()
      } else if (
        this.consumeIf(Keyword.DEFAULT, Keyword.COLLATE) ||
        this.consumeIf(Keyword.COLLATE)
      ) {
        this.consumeIf(Keyword.OPE_EQ)
        stmt.collate = this.identifierOrStringValue()
      } else if (this.consumeIf(Keyword.COMMENT)) {
        this.consumeIf(Keyword.OPE_EQ)
        stmt.comment = this.stringValue()
      } else if (
        this.consumeIf(Keyword.DEFAULT, Keyword.ENCRYPTION) ||
        this.consumeIf(Keyword.ENCRYPTION)
      ) {
        this.consumeIf(Keyword.OPE_EQ)
        stmt.encryption = this.stringValue()
      } else {
        break
      }
    }
  }

  private parseCreateServerStatement(stmt: model.CreateServerStatement) {
    stmt.name = this.identifier()
    this.consume(Keyword.FOREIGN, Keyword.DATA, Keyword.WRAPPER)
    stmt.wrapper = this.identifier()
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
        stmt.port = this.numericValue()
      } else {
        throw this.createParseError()
      }
    }
    this.consume(TokenType.RightParen)
  }

  private parseCreateResourceGroupStatement(stmt: model.CreateResourceGroupStatement) {
    stmt.name = this.identifier()
    this.consume(Keyword.TYPE, Keyword.OPE_EQ)
    if (this.consumeIf(Keyword.SYSTEM)) {
      stmt.type = model.SYSTEM
    } else if (this.consumeIf(Keyword.USER)) {
      stmt.type = model.USER
    } else {
      throw this.createParseError()
    }
    if (this.consumeIf(Keyword.VCPU)) {
      this.consumeIf(Keyword.OPE_EQ)
      const start = this.pos
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        this.expression([
          Keyword.THREAD_PRIORITY,
          Keyword.ENABLE,
          Keyword.DISABLE,
        ])
      }
      stmt.vcpu = toExpression(this.tokens, start, this.pos)
    }
    if (this.consumeIf(Keyword.THREAD_PRIORITY)) {
      this.consumeIf(Keyword.OPE_EQ)
      stmt.threadPriority = this.numericValue()
    }
    if (this.consumeIf(Keyword.ENABLE)) {
      stmt.disable = false
    } else if (this.consumeIf(Keyword.DISABLE)) {
      stmt.disable = true
    }
  }

  private parseCreateLogfileGroupStatement(stmt: model.CreateLogfileGroupStatement) {
    stmt.name = this.identifier()
    this.consume(Keyword.ADD, Keyword.UNDOFILE)
    stmt.undofile = this.stringValue()
    while (this.token()) {
      if (this.consumeIf(Keyword.INITIAL_SIZE)) {
        this.consumeIf(Keyword.OPE_EQ)
        stmt.initialSize = this.sizeValue()
      } else if (this.consumeIf(Keyword.UNDO_BUFFER_SIZE)) {
        this.consumeIf(Keyword.OPE_EQ)
        stmt.undoBufferSize = this.sizeValue()
      } else if (this.consumeIf(Keyword.REDO_BUFFER_SIZE)) {
        this.consumeIf(Keyword.OPE_EQ)
        stmt.redoBufferSize = this.sizeValue()
      } else if (this.consumeIf(Keyword.NODEGROUP)) {
        this.consumeIf(Keyword.OPE_EQ)
        stmt.nodeGroup = this.unsignedIntegerValue()
      } else if (this.consumeIf(Keyword.WAIT)) {
        stmt.wait = true
      } else if (this.consumeIf(Keyword.COMMENT)) {
        this.consumeIf(Keyword.OPE_EQ)
        stmt.comment = this.stringValue()
      } else if (this.consumeIf(Keyword.ENGINE)) {
        this.consumeIf(Keyword.OPE_EQ)
        stmt.engine = this.identifier()
      } else {
        break
      }
    }
  }

  private parseCreateTablespaceStatement(stmt: model.CreateTablespaceStatement) {
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
      this.consume(Keyword.LOGFILE, Keyword.GROUP)
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
      stmt.nodeGroup = this.unsignedIntegerValue()
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
  }

  private parseCreateRoleStatement(stmt: model.CreateRoleStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.NOT, Keyword.EXISTS)
      stmt.ifNotExists = true
    }
    if (this.options.variant === "mariadb") {
      stmt.markers.set(`roleStart.0`, this.pos - this.stmtStart)
      stmt.roles.push(this.userRole())
      stmt.markers.set(`roleEnd.0`, this.pos - this.stmtStart)
      if (this.peekIf(Keyword.WITH)) {
        stmt.markers.set("optionsStart", this.pos - this.stmtStart)
        this.consume(Keyword.WITH, Keyword.ADMIN)
        if (this.consumeIf(Keyword.CURRENT_USER)) {
          const admin = new model.UserRole()
          admin.name = model.CURRENT_USER
          stmt.admin = admin
        } else if (this.consumeIf(Keyword.CURRENT_ROLE)) {
          const admin = new model.UserRole()
          admin.name = model.CURRENT_ROLE
          stmt.admin = admin
        } else {
          stmt.admin = this.userRole()
          if (this.consumeIf(TokenType.UserVariable)) {
            stmt.admin.host = new model.UserVariable(this.token(-1).text)
          } else {
            stmt.admin.host = new model.UserVariable("%", true)
          }
        }
        stmt.markers.set("optionsEnd", this.pos - this.stmtStart)
      }
    } else {
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        stmt.markers.set(`roleStart.${i}`, this.pos - this.stmtStart)
        const role = this.userRole()
        if (this.consumeIf(TokenType.UserVariable)) {
          role.host = new model.UserVariable(this.token(-1).text)
        } else {
          role.host = new model.UserVariable("%", true)
        }
        stmt.roles.push(role)
        stmt.markers.set(`roleEnd.${i}`, this.pos - this.stmtStart)
      }
    }
  }

  private parseCreateUserStatement(stmt: model.CreateUserStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.NOT, Keyword.EXISTS)
      stmt.ifNotExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.markers.set(`userStart.${i}`, this.pos - this.stmtStart)
      const user = this.userRole()
      if (this.consumeIf(TokenType.UserVariable)) {
        user.host = new model.UserVariable(this.token(-1).text)
      } else {
        user.host = new model.UserVariable("%", true)
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
      stmt.markers.set(`userEnd.${i}`, this.pos - this.stmtStart)
    }
    stmt.markers.set("optionsStart", this.pos - this.stmtStart)
    if (this.consumeIf(Keyword.DEFAULT)) {
      this.consume(Keyword.ROLE)
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        const role = this.userRole()
        if (this.consumeIf(TokenType.UserVariable)) {
          role.host = new model.UserVariable(this.token(-1).text)
        } else {
          role.host = new model.UserVariable("%", true)
        }
        stmt.defaultRoles.push(role)
      }
    }
    if (this.consumeIf(Keyword.REQUIRE)) {
      if (this.consumeIf(Keyword.NONE)) {
        // no handle
      } else {
        stmt.tlsOptions = this.tlsOptions()
      }
    }
    if (this.consumeIf(Keyword.WITH)) {
      stmt.resourceOptions = this.resourceOptions()
    }

    while (this.token()) {
      if (this.consumeIf(Keyword.PASSWORD)) {
        if (this.consumeIf(Keyword.EXPIRE)) {
          if (this.consumeIf(Keyword.DEFAULT)) {
            stmt.passwordExpire = model.DEFAULT
          } else if (this.consumeIf(Keyword.NEVER)) {
            stmt.passwordExpire = model.NEVER
          } else if (this.consumeIf(Keyword.INTERVAL)) {
            const start = this.pos
            if (this.consumeIf(TokenType.Number)) {
              this.consume(Keyword.DAY)
              stmt.passwordExpire = toExpression(this.tokens, start, this.pos)
            } else {
              throw this.createParseError()
            }
          } else {
            stmt.passwordExpire = true
          }
        } else if (this.consumeIf(Keyword.HISTORY)) {
          if (this.consumeIf(Keyword.DEFAULT)) {
            stmt.passwordHistory = model.DEFAULT
          } else if (this.consumeIf(TokenType.Number)) {
            stmt.passwordHistory = new model.Numeric(this.token(-1).text)
          } else {
            throw this.createParseError()
          }
        } else if (this.consumeIf(Keyword.REUSE)) {
          this.consume(Keyword.INTERVAL)
          if (this.consumeIf(Keyword.DEFAULT)) {
            stmt.passwordReuseInterval = model.DEFAULT
          } else if (this.consumeIf(TokenType.Number)) {
            stmt.passwordReuseInterval = new model.Numeric(this.token(-1).text)
          } else {
            throw this.createParseError()
          }
        } else if (this.consumeIf(Keyword.REQUIRE)) {
          this.consumeIf(Keyword.CURRENT)
          if (this.consumeIf(Keyword.DEFAULT)) {
            stmt.passwordRequireCurrent = model.DEFAULT
          } else if (this.consumeIf(Keyword.OPTIONAL)) {
            stmt.passwordRequireCurrent = model.OPTIONAL
          } else {
            stmt.passwordRequireCurrent = true
          }
        } else {
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.FAILED_LOGIN_ATTEMPTS)) {
        if (this.consumeIf(TokenType.Number)) {
          stmt.failedLoginAttempts = new model.Numeric(this.token(-1).text)
        } else {
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.PASSWORD_LOCK_TIME)) {
        if (this.consumeIf(Keyword.UNBOUNDED)) {
          stmt.passwordLockTime = model.UNBOUNDED
        } else if (this.consumeIf(TokenType.Number)) {
          stmt.passwordLockTime = new model.Numeric(this.token(-1).text)
        } else {
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.ACCOUNT)) {
        if (this.consumeIf(Keyword.LOCK)) {
          stmt.accountLock = true
        } else if (this.consumeIf(Keyword.UNLOCK)) {
          stmt.accountLock = false
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
    stmt.markers.set("optionsEnd", this.pos - this.stmtStart)
  }

  private parseCreateSpatialReferenceSystemStatement(stmt: model.CreateSpatialReferenceSystemStatement) {
    if (this.consumeIf(TokenType.Number)) {
      stmt.srid = new model.Numeric(this.token(-1).text)
    }
  }

  private parseCreateTableStatement(stmt: model.CreateTableStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.NOT, Keyword.EXISTS)
      stmt.ifNotExists = true
    }

    const obj = this.schemaObject()
    stmt.schema = obj.schema
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
              constraint.type = model.PRIMARY_KEY
            } else if (this.consumeIf(Keyword.UNIQUE)) {
              if (this.consumeIf(Keyword.INDEX) || this.consumeIf(Keyword.KEY)) {
                constraint = new model.IndexConstraint()
                constraint.type = model.UNIQUE
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
            constraint.type = model.PRIMARY_KEY
          } else if (this.consumeIf(Keyword.UNIQUE)) {
            if (this.consumeIf(Keyword.INDEX) || this.consumeIf(Keyword.KEY)) {
              constraint = new model.IndexConstraint()
              constraint.type = model.UNIQUE
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
              constraint.type = model.FULLTEXT
            } else {
              throw this.createParseError()
            }
          } else if (this.consumeIf(Keyword.SPATIAL)) {
            if (this.consumeIf(Keyword.INDEX) || this.consumeIf(Keyword.KEY)) {
              constraint = new model.IndexConstraint()
              constraint.type = model.SPATIAL
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
              constraint.index = this.identifier()
            }

            if (this.consumeIf(Keyword.USING)) {
              if (this.consumeIf(Keyword.BTREE)) {
                constraint.algorithm = model.BTREE
              } else if (this.consumeIf(Keyword.HASH)) {
                constraint.algorithm = model.HASH
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
                keyPart.sortOrder = model.ASC
              } else if (this.consumeIf(Keyword.DESC)) {
                keyPart.sortOrder = model.DESC
              }
              constraint.keyParts.push(keyPart)
            }
            this.consume(TokenType.RightParen)
          } else if (constraint instanceof model.ForeignKeyConstraint) {
            constraint.name = constraintName
            if (!this.peekIf(TokenType.LeftParen)) {
              constraint.index = this.identifier()
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
      stmt.tableOptions = this.tableOptions()
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
            partition.algorithm = this.numericValue()
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
          stmt.partition.num = this.numericValue()
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
              partition.algorithm = this.numericValue()
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
            stmt.partition.subpartition.num = this.numericValue()
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
              def.maxRows = this.numericValue()
            }
            if (this.consumeIf(Keyword.MIN_ROWS)) {
              this.consumeIf(Keyword.OPE_EQ)
              def.minRows = this.numericValue()
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
                  subDef.maxRows = this.numericValue()
                }
                if (this.consumeIf(Keyword.MIN_ROWS)) {
                  this.consumeIf(Keyword.OPE_EQ)
                  subDef.minRows = this.numericValue()
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
        stmt.conflictAction = model.IGNORE
        stmt.asSelect = true
      } else if (this.consumeIf(Keyword.REPLACE)) {
        stmt.conflictAction = model.REPLACE
        stmt.asSelect = true
      }
      if (this.consumeIf(Keyword.AS)) {
        stmt.asSelect = true
      }
      if (stmt.asSelect || this.peekIf(Keyword.WITH) || this.peekIf(Keyword.SELECT)) {
        this.selectClause()
      }
    }
  }

  private parseCreateSequenceStatement(stmt: model.CreateSequenceStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.NOT, Keyword.EXISTS)
      stmt.ifNotExists = true
    }

    const obj = this.schemaObject()
    stmt.schema = obj.schema
    stmt.name = obj.name

    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      if (this.consumeIf(Keyword.INCREMENT)) {
        this.consumeIf(Keyword.BY) || this.consumeIf(Keyword.OPE_EQ)
        stmt.increment = this.numericValue()
      } else if (this.consumeIf(Keyword.MINVALUE)) {
        this.consumeIf(Keyword.OPE_EQ)
        if (
          this.consumeIf(Keyword.NOMINVALUE) ||
          (this.consumeIf(Keyword.NO) && this.consumeIf(Keyword.MINVALUE))
        ) {
          stmt.minvalue = model.NOMINVALUE
        } else {
          stmt.minvalue = this.numericValue()
        }
      } else if (this.consumeIf(Keyword.MAXVALUE)) {
        this.consumeIf(Keyword.OPE_EQ)
        if (
          this.consumeIf(Keyword.NOMAXVALUE) ||
          (this.consumeIf(Keyword.NO) && this.consumeIf(Keyword.MAXVALUE))
        ) {
          stmt.maxvalue = model.NOMAXVALUE
        } else {
          stmt.maxvalue = this.numericValue()
        }
      } else if (this.consumeIf(Keyword.START)) {
        this.consumeIf(Keyword.WITH) || this.consumeIf(Keyword.OPE_EQ)
        stmt.start = this.numericValue()
      } else if (this.consumeIf(Keyword.CACHE)) {
        if (this.consumeIf(Keyword.NOCACHE)) {
          stmt.cache = model.NOCACHE
        } else {
          stmt.cache = this.numericValue()
        }
        if (this.consumeIf(Keyword.CYCLE)) {
          stmt.noCycle = false
        } else if (this.consumeIf(Keyword.NOCYCLE)) {
          stmt.noCycle = true
        }
      } else {
        break
      }
    }

    stmt.tableOptions = this.tableOptions()
  }

  private parseCreateIndexStatement(stmt: model.CreateIndexStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.NOT, Keyword.EXISTS)
      stmt.ifNotExists = true
    }

    const obj = this.schemaObject()
    stmt.schema = obj.schema
    stmt.name = obj.name

    if (this.consumeIf(Keyword.USING)) {
      if (this.consumeIf(Keyword.BTREE)) {
        stmt.algorithm = model.BTREE
      } else if (this.consumeIf(Keyword.HASH)) {
        stmt.algorithm = model.HASH
      } else if (this.consumeIf(Keyword.RTREE)) {
        stmt.algorithm = model.RTREE
      } else {
        throw this.createParseError()
      }
    }
    this.consume(Keyword.ON)
    stmt.table.schema = this.identifier()
    if (this.consumeIf(TokenType.Dot)) {
      stmt.table.schema = stmt.table.name
      stmt.table.name = this.identifier()
    }
    this.consume(TokenType.LeftParen)
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      const column = new model.IndexColumn()
      const start = this.pos
      const expr = this.expression([Keyword.ASC, Keyword.DESC])
      if (expr.length === 1) {
        this.pos = start
        column.expr = this.identifier()
      } else {
        column.expr = expr
      }
      if (this.consumeIf(Keyword.ASC)) {
        column.sortOrder = model.ASC
      } else if (this.consumeIf(Keyword.DESC)) {
        column.sortOrder = model.DESC
      }
      stmt.columns.push(column)
    }
    this.consume(TokenType.RightParen)
    stmt.indexOptions = this.indexOptions()
    while (this.token()) {
      if (this.consumeIf(Keyword.ALGORITHM)) {
        this.consumeIf(Keyword.OPE_EQ)
        if (this.consumeIf(Keyword.DEFAULT)) {
          stmt.algorithmOption = model.DEFAULT
        } else if (this.consumeIf(Keyword.INPLACE)) {
          stmt.algorithmOption = model.INPLACE
        } else if (this.consumeIf(Keyword.COPY)) {
          stmt.algorithmOption = model.COPY
        } else {
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.LOCK)) {
        this.consumeIf(Keyword.OPE_EQ)
        if (this.consumeIf(Keyword.DEFAULT)) {
          stmt.lockOption = model.DEFAULT
        } else if (this.consumeIf(Keyword.NONE)) {
          stmt.lockOption = model.NONE
        } else if (this.consumeIf(Keyword.SHARED)) {
          stmt.lockOption = model.SHARED
        } else if (this.consumeIf(Keyword.EXCLUSIVE)) {
          stmt.lockOption = model.EXCLUSIVE
        } else {
          throw this.createParseError()
        }
      } else {
        break
      }
    }
  }

  private parseCreateViewStatement(stmt: model.CreateViewStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.NOT, Keyword.EXISTS)
      stmt.ifNotExists = true
    }

    const obj = this.schemaObject()
    stmt.schema = obj.schema
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
        stmt.checkOption = model.CASCADED
      } else if (this.consumeIf(Keyword.LOCAL)) {
        stmt.checkOption = model.LOCAL
      }
      this.consume(Keyword.CHECK)
      this.consume(Keyword.OPTION)
    }
  }

  private parseCreatePackageBodyStatement(stmt: model.CreatePackageBodyStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.NOT, Keyword.EXISTS)
      stmt.ifNotExists = true
    }

    const obj = this.schemaObject()
    stmt.schema = obj.schema
    stmt.name = obj.name
    while (this.token()) {
      if (this.consumeIf(Keyword.COMMENT)) {
        stmt.comment = this.stringValue()
      } else if (this.consumeIf(Keyword.SQL, Keyword.SECURITY)) {
        if (this.consumeIf(Keyword.DEFINER)) {
          stmt.sqlSecurity = model.DEFINER
        } else if (this.consumeIf(Keyword.INVOKER)) {
          stmt.sqlSecurity = model.INVOKER
        } else {
          throw this.createParseError()
        }
      } else {
        break
      }
    }
    if (this.consumeIf(Keyword.AS) || this.consumeIf(Keyword.IS)) {
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else {
      throw this.createParseError()
    }
  }

  private parseCreatePackageStatement(stmt: model.CreatePackageStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.NOT, Keyword.EXISTS)
      stmt.ifNotExists = true
    }

    const obj = this.schemaObject()
    stmt.schema = obj.schema
    stmt.name = obj.name
    while (this.token()) {
      if (this.consumeIf(Keyword.COMMENT)) {
        stmt.comment = this.stringValue()
      } else if (this.consumeIf(Keyword.SQL, Keyword.SECURITY)) {
        if (this.consumeIf(Keyword.DEFINER)) {
          stmt.sqlSecurity = model.DEFINER
        } else if (this.consumeIf(Keyword.INVOKER)) {
          stmt.sqlSecurity = model.INVOKER
        } else {
          throw this.createParseError()
        }
      } else {
        break
      }
    }
    if (this.consumeIf(Keyword.AS) || this.consumeIf(Keyword.IS)) {
      while (this.token() && !this.peekIf(TokenType.Delimiter)) {
        this.consume()
      }
    } else {
      throw this.createParseError()
    }
  }

  private parseCreateProcedureStatement(stmt: model.CreateProcedureStatement) {
    const obj = this.schemaObject()
    stmt.schema = obj.schema
    stmt.name = obj.name
    this.consume(TokenType.LeftParen)
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      const param = new model.ProcedureParam()
      if (this.consumeIf(Keyword.IN)) {
        param.direction = model.IN
      } else if (this.consumeIf(Keyword.OUT)) {
        param.direction = model.OUT
      } else if (this.consumeIf(Keyword.INOUT)) {
        param.direction = model.INOUT
      }
      param.name = this.identifier()
      param.dataType = this.dataType()
      stmt.params.push(param)
    }
    this.consume(TokenType.RightParen)
    while (this.token()) {
      if (this.consumeIf(Keyword.COMMENT)) {
        stmt.comment = this.stringValue()
      } else if (this.consumeIf(Keyword.LANGUAGE)) {
        this.consume(Keyword.SQL)
        stmt.language = model.SQL
      } else if (this.consumeIf(Keyword.DETERMINISTIC)) {
        stmt.deterministic = true
      } else if (this.consumeIf(Keyword.NOT, Keyword.DETERMINISTIC)) {
        stmt.deterministic = false
      } else if (this.consumeIf(Keyword.CONTAINS, Keyword.SQL)) {
        stmt.characteristic = model.CONTAINS_SQL
      } else if (this.consumeIf(Keyword.NO, Keyword.SQL)) {
        stmt.characteristic = model.NO_SQL
      } else if (this.consumeIf(Keyword.READS, Keyword.SQL, Keyword.DATA)) {
        stmt.characteristic = model.READS_SQL_DATA
      } else if (this.consumeIf(Keyword.MODIFIES, Keyword.SQL, Keyword.DATA)) {
        stmt.characteristic = model.MODIFIES_SQL_DATA
      } else if (this.consumeIf(Keyword.SQL, Keyword.SECURITY)) {
        if (this.consumeIf(Keyword.DEFINER)) {
          stmt.sqlSecurity = model.DEFINER
        } else if (this.consumeIf(Keyword.INVOKER)) {
          stmt.sqlSecurity = model.INVOKER
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
  }

  private parseCreateFunctionStatement(stmt: model.CreateFunctionStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.NOT, Keyword.EXISTS)
      stmt.ifNotExists = true
    }

    const obj = this.schemaObject()
    stmt.schema = obj.schema
    stmt.name = obj.name
    this.consume(TokenType.LeftParen)
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      const param = new model.FunctionParam()
      param.name = this.identifier()
      param.dataType = this.dataType()
      stmt.params.push(param)
    }
    this.consume(TokenType.RightParen)
    this.consume(Keyword.RETURN)
    stmt.returnDataType = this.dataType()
    while (this.token()) {
      if (this.consumeIf(Keyword.COMMENT)) {
        stmt.comment = this.stringValue()
      } else if (this.consumeIf(Keyword.LANGUAGE)) {
        this.consume(Keyword.SQL)
        stmt.language = model.SQL
      } else if (this.consumeIf(Keyword.DETERMINISTIC)) {
        stmt.deterministic = true
      } else if (this.consumeIf(Keyword.NOT, Keyword.DETERMINISTIC)) {
        stmt.deterministic = false
      } else if (this.consumeIf(Keyword.CONTAINS, Keyword.SQL)) {
        stmt.characteristic = model.CONTAINS_SQL
      } else if (this.consumeIf(Keyword.NO, Keyword.SQL)) {
        stmt.characteristic = model.NO_SQL
      } else if (this.consumeIf(Keyword.READS, Keyword.SQL, Keyword.DATA)) {
        stmt.characteristic = model.READS_SQL_DATA
      } else if (this.consumeIf(Keyword.MODIFIES, Keyword.SQL, Keyword.DATA)) {
        stmt.characteristic = model.MODIFIES_SQL_DATA
      } else if (this.consumeIf(Keyword.SQL, Keyword.SECURITY)) {
        if (this.consumeIf(Keyword.DEFINER)) {
          stmt.sqlSecurity = model.DEFINER
        } else if (this.consumeIf(Keyword.INVOKER)) {
          stmt.sqlSecurity = model.INVOKER
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
  }

  private parseCreateTriggerStatement(stmt: model.CreateTriggerStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.NOT, Keyword.EXISTS)
      stmt.ifNotExists = true
    }

    const obj = this.schemaObject()
    stmt.schema = obj.schema
    stmt.name = obj.name
    if (this.consumeIf(Keyword.BEFORE)) {
      stmt.triggerTime = model.BEFORE
    } else if (this.consumeIf(Keyword.AFTER)) {
      stmt.triggerTime = model.AFTER
    } else {
      throw this.createParseError()
    }
    if (this.consumeIf(Keyword.INSERT)) {
      stmt.triggerEvent = model.INSERT
    } else if (this.consumeIf(Keyword.UPDATE)) {
      stmt.triggerEvent = model.UPDATE
    } else if (this.consumeIf(Keyword.DELETE)) {
      stmt.triggerEvent = model.DELETE
    } else {
      throw this.createParseError()
    }
    this.consume(Keyword.ON)
    stmt.table = this.schemaObject()
    this.consume(Keyword.FOR, Keyword.EACH, Keyword.ROW)
    if (this.consumeIf(Keyword.FOLLOWS)) {
      const triggerOrder = new model.TriggerOrder()
      triggerOrder.position = model.FOLLOWS
      triggerOrder.table = this.identifier()
      stmt.triggerOrder = triggerOrder
    } else if (this.consumeIf(Keyword.PRECEDES)) {
      const triggerOrder = new model.TriggerOrder()
      triggerOrder.position = model.PRECEDES
      triggerOrder.table = this.identifier()
      stmt.triggerOrder = triggerOrder
    }
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseCreateEventStatement(stmt: model.CreateEventStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.NOT, Keyword.EXISTS)
      stmt.ifNotExists = true
    }

    const obj = this.schemaObject()
    stmt.schema = obj.schema
    stmt.name = obj.name
    this.consume(Keyword.ON)
    this.consume(Keyword.SCHEDULE)
    const stopped = [
      Keyword.ON,
      Keyword.ENABLE,
      Keyword.DISABLE,
      Keyword.COMMENT,
      Keyword.DO,
    ]
    if (this.consumeIf(Keyword.AT)) {
      stmt.at = this.expression(stopped)
    } else if (this.consumeIf(Keyword.EVERY)) {
      stmt.every = this.expression([
        Keyword.STARTS,
        Keyword.ENDS,
        ...stopped
      ])
      if (this.consumeIf(Keyword.STARTS)) {
        stmt.starts = this.expression([
          Keyword.ENDS,
          ...stopped
        ])
      }
      if (this.consumeIf(Keyword.ENDS)) {
        stmt.ends = this.expression(stopped)
      }
    }
    if (this.consumeIf(Keyword.ON)) {
      this.consume(Keyword.COMPLETION)
      if (this.consumeIf(Keyword.NOT)) {
        this.consume(Keyword.PRESERVE)
        stmt.onCompletionPreserve = false
      } else {
        this.consume(Keyword.PRESERVE)
        stmt.onCompletionPreserve = true
      }
    }
    if (this.consumeIf(Keyword.ENABLE)) {
      stmt.disable = false
    } else if (this.consumeIf(Keyword.DISABLE)) {
      if (this.consumeIf(Keyword.ON)) {
        this.consume(Keyword.SLAVE)
        stmt.disable = model.ON_SLAVE
      } else {
        stmt.disable = true
      }
    }
    if (this.consumeIf(Keyword.COMMENT)) {
      stmt.comment = this.stringValue()
    }
    this.consume(Keyword.DO)
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseAlterDatabaseStatement(stmt: model.AlterDatabaseStatement) {
    stmt.schema = this.identifier()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseAlterServerStatement(stmt: model.AlterServerStatement) {
    stmt.server = this.identifier()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseAlterResourceGroupStatement(stmt: model.AlterResourceGroupStatement) {
    stmt.resourceGroup = this.identifier()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseAlterLogfileGroupStatement(stmt: model.AlterLogfileGroupStatement) {
    stmt.logfileGroup = this.identifier()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseAlterTablespaceStatement(stmt: model.AlterTablespaceStatement) {
    stmt.tablespace = this.identifier()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseAlterUserStatement(stmt: model.AlterUserStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    if (this.consumeIf(Keyword.USER)) {
      this.consume(TokenType.LeftParen)
      this.consume(TokenType.RightParen)
      const user = new model.UserRole()
      user.name = model.USER
      stmt.users = [user]
    } else {
      stmt.users = []
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        if (this.consumeIf(Keyword.CURRENT_USER)) {
          if (this.consumeIf(TokenType.LeftParen)) {
            this.consumeIf(TokenType.RightParen)
          }
          const user = new model.UserRole()
          user.name = model.CURRENT_USER
          stmt.users.push(user)
        } else {
          const user = this.userRole()
          if (this.consumeIf(TokenType.UserVariable)) {
            user.host = new model.UserVariable(this.token(-1).text)
          } else {
            user.host = new model.UserVariable("%", true)
          }
          stmt.users.push(user)
        }
        while (this.token() && !this.peekIf(TokenType.Delimiter) && !this.peekIf(TokenType.Comma)) {
          this.consume()
        }
      }
    }
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseAlterTableStatement(stmt: model.AlterTableStatement) {
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
  }

  private parseAlterInstanceStatement(stmt: model.AlterInstanceStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseAlterViewStatement(stmt: model.AlterViewStatement) {
    stmt.view = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseAlterProcedureStatement(stmt: model.AlterProcedureStatement) {
    stmt.procedure = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseAlterFunctionStatement(stmt: model.AlterFunctionStatement) {
    stmt.function = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseAlterEventStatement(stmt: model.AlterEventStatement) {
    stmt.event = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseRenameTableStatement(stmt: model.RenameTableStatement) {
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      const pair = new model.RenameTablePair()
      pair.table = this.schemaObject()
      this.consumeIf(Keyword.TO)
      pair.newTable = this.schemaObject()
      stmt.pairs.push(pair)
    }
  }

  private parseRenameUserStatement(stmt: model.RenameUserStatement) {
    stmt = new model.RenameUserStatement()
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      const pair = new model.RenameUserPair()
      pair.user = this.userRole()
      if (this.consumeIf(TokenType.UserVariable)) {
        pair.user.host = new model.UserVariable(this.token(-1).text)
      } else {
        pair.user.host = new model.UserVariable("%", true)
      }
      this.consumeIf(Keyword.TO)
      pair.newUser = this.userRole()
      if (this.consumeIf(TokenType.UserVariable)) {
        pair.newUser.host = new model.UserVariable(this.token(-1).text)
      } else {
        pair.newUser.host = new model.UserVariable("%", true)
      }
      stmt.pairs.push(pair)
    }
  }

  private parseDropDatabaseStatement(stmt: model.DropDatabaseStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.schema = this.identifier()
  }

  private parseDropServerStatement(stmt: model.DropServerStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.server = this.identifier()
  }

  private parseDropResourceGroupStatement(stmt: model.DropResourceGroupStatement) {
    stmt.resourceGroup = this.identifier()
    if (this.consumeIf(Keyword.FORCE)) {
      stmt.force = true
    }
  }

  private parseDropLogfileGroupStatement(stmt: model.DropLogfileGroupStatement) {
    stmt.logfileGroup = this.identifier()
    this.consume(Keyword.ENGINE)
    this.consumeIf(Keyword.OPE_EQ)
    stmt.engine = this.identifier()
  }

  private parseDropTablespaceStatement(stmt: model.DropTablespaceStatement) {
    stmt.tablespace = this.identifier()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseDropSpatialReferenceSystemStatement(stmt: model.DropSpatialReferenceSystemStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.srid = this.numericValue()
  }

  private parseDropRoleStatement(stmt: model.DropRoleStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      if (this.options.variant === "mariadb") {
        stmt.roles.push(this.userRole())
      } else {
        const user = this.userRole()
        if (this.consumeIf(TokenType.UserVariable)) {
          user.host = new model.UserVariable(this.token(-1).text)
        } else {
          user.host = new model.UserVariable("%", true)
        }
        stmt.roles.push(user)
      }
    }
  }

  private parseDropUserStatement(stmt: model.DropUserStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      const user = this.userRole()
      if (this.consumeIf(TokenType.UserVariable)) {
        user.host = new model.UserVariable(this.token(-1).text)
      } else {
        user.host = new model.UserVariable("%", true)
      }
      stmt.users.push(user)
    }
  }

  private parseDropTableStatement(stmt: model.DropTableStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.tables.push(this.schemaObject())
    }
    if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dropOption = model.RESTRICT
    } else if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dropOption = model.CASCADE
    }
  }

  private parseDropSequenceStatement(stmt: model.DropSequenceStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.sequences.push(this.schemaObject())
    }
  }

  private parseDropViewStatement(stmt: model.DropViewStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.views.push(this.schemaObject())
    }
    if (this.consumeIf(Keyword.RESTRICT)) {
      stmt.dropOption = model.RESTRICT
    } else if (this.consumeIf(Keyword.CASCADE)) {
      stmt.dropOption = model.CASCADE
    }
  }

  private parseDropPackageBodyStatement(stmt: model.DropPackageBodyStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.packageBody = this.schemaObject()
  }

  private parseDropPackageStatement(stmt: model.DropPackageStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.package = this.schemaObject()
  }

  private parseDropProcedureStatement(stmt: model.DropProcedureStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.procedure = this.schemaObject()
  }

  private parseDropFunctionStatement(stmt: model.DropFunctionStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.function = this.schemaObject()
  }

  private parseDropTriggerStatement(stmt: model.DropTriggerStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.trigger = this.schemaObject()
  }

  private parseDropEventStatement(stmt: model.DropEventStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.event = this.schemaObject()
  }

  private parseDropIndexStatement(stmt: model.DropIndexStatement) {
    if (this.consumeIf(Keyword.IF)) {
      this.consume(Keyword.EXISTS)
      stmt.ifExists = true
    }
    stmt.index = this.schemaObject()
    this.consumeIf(Keyword.ON)
    stmt.table = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseDeallocatePrepareStatement(stmt: model.DeallocatePrepareStatement) {
    stmt.prepare = this.identifier()
  }

  private parseTruncateTableStatement(stmt: model.TruncateTableStatement) {
    stmt.table = this.schemaObject()
  }

  private parsePrepareStatement(stmt: model.PrepareStatement) {
    stmt.name = this.identifier()
    this.consume(Keyword.FROM)
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseExecuteStatement(stmt: model.ExecuteStatement) {
    stmt.prepare = this.identifier()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseStartTransactionStatement(stmt: model.StartTransactionStatement) {
    stmt = new model.StartTransactionStatement()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseStartReplicaStatement(stmt: model.StartReplicaStatement) {
    stmt = new model.StartReplicaStatement()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseChangeMasterStatement(stmt: model.ChangeMasterStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseStopReplicaStatement(stmt: model.StopReplicaStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseBeginStatement(stmt: model.BeginStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseSavepointStatement(stmt: model.SavepointStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseReleaseSavepointStatement(stmt: model.ReleaseSavepointStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseCommitStatement(stmt: model.CommitStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseRollbackStatement(stmt: model.RollbackStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseLockTablesStatement(stmt: model.LockTablesStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseUnlockTablesStatement(stmt: model.UnlockTablesStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseXaStartStatement(stmt: model.XaStartStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseXaBeginStatement(stmt: model.XaBeginStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseXaEndStatement(stmt: model.XaEndStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseXaPrepareStatement(stmt: model.XaPrepareStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseXaCommitStatement(stmt: model.XaCommitStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseXaRollbackStatement(stmt: model.XaRollbackStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseXaRecoverStatement(stmt: model.XaRecoverStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parsePurgeBinaryLogsStatement(stmt: model.PurgeBinaryLogsStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseResetMasterStatement(stmt: model.ResetMasterStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseResetReplicaStatement(stmt: model.ResetReplicaStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseGrantStatement(stmt: model.GrantStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseRevokeStatement(stmt: model.RevokeStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseAnalyzeTableStatement(stmt: model.AnalyzeTableStatement) {
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.tables.push(this.schemaObject())
    }
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseCheckTableStatement(stmt: model.CheckTableStatement) {
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.tables.push(this.schemaObject())
    }
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseChecksumTableStatement(stmt: model.ChecksumTableStatement) {
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.tables.push(this.schemaObject())
    }
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseOptimizeTableStatement(stmt: model.OptimizeTableStatement) {
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.tables.push(this.schemaObject())
    }
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseRepairTableStatement(stmt: model.RepairTableStatement) {
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.tables.push(this.schemaObject())
    }
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseCheckIndexStatement(stmt: model.CheckIndexStatement) {
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      stmt.indexes.push(this.schemaObject())
    }
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseCacheIndexStatement(stmt: model.CacheIndexStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseInstallPluginStatement(stmt: model.InstallPluginStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseInstallComponentStatement(stmt: model.InstallComponentStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseUninstallPluginStatement(stmt: model.UninstallPluginStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseUninstallComponentStatement(stmt: model.UninstallComponentStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseBinlogStatement(stmt: model.BinlogStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseFlushStatement(stmt: model.FlushStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseKillStatement(stmt: model.KillStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseRestartStatement(stmt: model.RestartStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseShutdownStatement(stmt: model.ShutdownStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseCloneStatement(stmt: model.CloneStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseLoadDataStatement(stmt: model.LoadDataStatement) {
    if (this.consumeIf(Keyword.LOW_PRIORITY)) {
      stmt.concurrency = model.LOW_PRIORITY
    } else if (this.consumeIf(Keyword.CONCURRENT)) {
      stmt.concurrency = model.CONCURRENT
    }
    if (this.consumeIf(Keyword.LOCAL)) {
      stmt.local = true
    }
    this.consume(Keyword.INFILE)
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseLoadXmlStatement(stmt: model.LoadXmlStatement) {
    if (this.consumeIf(Keyword.LOW_PRIORITY)) {
      stmt.concurrency = model.LOW_PRIORITY
    } else if (this.consumeIf(Keyword.CONCURRENT)) {
      stmt.concurrency = model.CONCURRENT
    }
    if (this.consumeIf(Keyword.LOCAL)) {
      stmt.local = true
    }
    this.consume(Keyword.INFILE)
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseLoadIndexIntoCacheStatement(stmt: model.LoadIndexIntoCacheStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseExplainStatement(stmt: model.ExplainStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseSetResourceGroupStatement(stmt: model.SetResourceGroupStatement) {
    stmt.resourceGroup = this.identifier()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseSetDefaultRoleStatement(stmt: model.SetDefaultRoleStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseSetRoleStatement(stmt: model.SetRoleStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseSetPasswordStatement(stmt: model.SetPasswordStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseSetCharacterSetStatement(stmt: model.SetCharacterSetStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseSetNamesStatement(stmt: model.SetNamesStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseSetTransactionStatement(stmt: model.SetTransactionStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseSetStatement(stmt: model.SetStatement) {
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      const va = new model.VariableAssignment()
      if (this.consumeIf(Keyword.GLOBAL)) {
        va.type = model.GLOBAL
        va.name = this.identifier()
      } else if (this.consumeIf(Keyword.SESSION) || this.consumeIf(Keyword.LOCAL)) {
        va.type = model.SESSION
        va.name = this.identifier()
      } else if (this.consumeIf(Keyword.VAR_GLOBAL)) {
        va.type = model.GLOBAL
        this.consume(TokenType.Dot)
        va.name = this.identifier()
      } else if (this.consumeIf(Keyword.VAR_SESSION) || this.consumeIf(Keyword.VAR_LOCAL)) {
        va.type = model.SESSION
        this.consume(TokenType.Dot)
        va.name = this.identifier()
      } else if (this.consumeIf(TokenType.SessionVariable)) {
        const name = this.token(-1).text.substring(2)
        va.type = model.SESSION
        va.name = /^['"`]/.test(name) ? unbackslashed(dequote(name)) : lcase(name)
      } else if (this.consumeIf(TokenType.UserVariable)) {
        const name = this.token(-1).text.substring(1)
        va.type = model.USER_DEFINED
        va.name = /^['"`]/.test(name) ? unbackslashed(dequote(name)) : lcase(name)
      } else {
        throw this.createParseError()
      }
      if (this.consumeIf(Keyword.OPE_EQ) || this.consumeIf(Keyword.OPE_COLON_EQ)) {
        va.value = this.expression()
      } else {
        throw this.createParseError()
      }
      stmt.variableAssignments.push(va)

      if (va.type !== model.USER_DEFINED && va.name === "sql_mode" && va.value) {
        if (va.value.length === 1 && va.value instanceof model.Text) {
          this.setSqlMode(va.value.value)
        }
      }
    }
  }

  private parseCallStatement(stmt: model.CallStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseUseStatement(stmt: model.UseStatement) {
    stmt.schema = this.identifier()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseInsertStatement(stmt: model.InsertStatement) {
    if (this.consumeIf(Keyword.LOW_PRIORITY)) {
      stmt.concurrency = model.LOW_PRIORITY
    } else if (this.consumeIf(Keyword.DELAYED)) {
      stmt.concurrency = model.DELAYED
    } else if (this.consumeIf(Keyword.HIGH_PRIORITY)) {
      stmt.concurrency = model.HIGH_PRIORITY
    }
    if (this.consumeIf(Keyword.IGNORE)) {
      stmt.conflictAction = model.IGNORE
    }
    this.consumeIf(Keyword.INTO)
    stmt.table = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseUpdateStatement(stmt: model.UpdateStatement) {
    if (this.consumeIf(Keyword.LOW_PRIORITY)) {
      stmt.concurrency = model.LOW_PRIORITY
    }
    if (this.consumeIf(Keyword.IGNORE)) {
      stmt.conflictAction = model.IGNORE
    }
    stmt.table = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseReplaceStatement(stmt: model.ReplaceStatement) {
    if (this.consumeIf(Keyword.LOW_PRIORITY)) {
      stmt.concurrency = model.LOW_PRIORITY
    } else if (this.consumeIf(Keyword.DELAYED)) {
      stmt.concurrency = model.DELAYED
    }
    if (this.consumeIf(Keyword.IGNORE)) {
      stmt.conflictAction = model.IGNORE
    }
    this.consumeIf(Keyword.INTO)
    stmt.table = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseDeleteStatement(stmt: model.DeleteStatement) {
    if (this.consumeIf(Keyword.LOW_PRIORITY)) {
      stmt.concurrency = model.LOW_PRIORITY
    }
    if (this.consumeIf(Keyword.QUICK)) {
      stmt.quick = true
    }
    if (this.consumeIf(Keyword.IGNORE)) {
      stmt.conflictAction = model.IGNORE
    }
    this.consumeIf(Keyword.FROM)
    stmt.table = this.schemaObject()
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseTableStatement(stmt: model.TableStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseDoStatement(stmt: model.DoStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseHandlerStatement(stmt: model.HandlerStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseShowStatement(stmt: model.ShowStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseHelpStatement(stmt: model.HelpStatement) {
    while (this.token() && !this.peekIf(TokenType.Delimiter)) {
      this.consume()
    }
  }

  private parseSelectStatement(stmt: model.SelectStatement) {
    if (this.peekIf(Keyword.WITH)) {
      throw this.createParseError()
    }
    this.selectClause()
  }

  viewAlgorithm() {
    this.consume(Keyword.ALGORITHM, Keyword.OPE_EQ)
    if (this.consumeIf(Keyword.UNDEFINED)) {
      return model.UNDEFINED
    } else if (this.consumeIf(Keyword.MERGE)) {
      return model.MERGE
    } else if (this.consumeIf(Keyword.TEMPTABLE)) {
      return model.TEMPTABLE
    } else {
      throw this.createParseError()
    }
  }

  sqlSecurity() {
    this.consume(Keyword.SQL, Keyword.SECURITY)
    if (this.consumeIf(Keyword.DEFINER)) {
      return model.DEFINER
    } else if (this.consumeIf(Keyword.INVOKER)) {
      return model.INVOKER
    } else {
      throw this.createParseError()
    }
  }

  private tlsOptions() {
    const options = new model.TlsOptions()

    const stopped = [
      Keyword.SSL,
      Keyword.X509,
      Keyword.ISSUER,
      Keyword.SUBJECT,
      Keyword.CIPHER,
    ]

    for (let i = 0; true; i++) {
      if (i > 0) {
        this.consumeIf(Keyword.AND)
      }
      if (this.consumeIf(Keyword.SSL)) {
        options.ssl = true
      } else if (this.consumeIf(Keyword.X509)) {
        options.x509 = true
      } else if (this.consumeIf(Keyword.ISSUER)) {
        options.issuer = this.expression(stopped)
      } else if (this.consumeIf(Keyword.SUBJECT)) {
        options.subject = this.expression(stopped)
      } else if (this.consumeIf(Keyword.CIPHER)) {
        options.cipher = this.expression(stopped)
      } else {
        break
      }
    }
    return options
  }

  private resourceOptions() {
    const options = new model.ResourceOptions()

    while (true) {
      if (this.consumeIf(Keyword.MAX_QUERIES_PER_HOUR)) {
        this.consume(TokenType.Number)
        options.maxQueriesPerHour = new model.Numeric(this.token(-1).text)
    } else if (this.consumeIf(Keyword.MAX_UPDATES_PER_HOUR)) {
      this.consume(TokenType.Number)
      options.maxUpdatesPerHour = new model.Numeric(this.token(-1).text)
      } else if (this.consumeIf(Keyword.MAX_CONNECTIONS_PER_HOUR)) {
        this.consume(TokenType.Number)
        options.maxConnectionsPerHour = new model.Numeric(this.token(-1).text)
      } else if (this.consumeIf(Keyword.MAX_USER_CONNECTIONS)) {
        this.consume(TokenType.Number)
        options.maxUserConnections = new model.Numeric(this.token(-1).text)
      } else {
        break
      }
    }
    return options
  }

  private tableOptions() {
    const options = new Array<{ key: string, value: any }>()

    const stopped = [
      Keyword.AUTOEXTEND_SIZE,
      Keyword.AUTO_INCREMENT,
      Keyword.AVG_ROW_LENGTH,
      Keyword.CHARACTER,
      Keyword.CHARSET,
      Keyword.COLLATE,
      Keyword.DEFAULT,
      Keyword.COMMENT,
      Keyword.COMPRESSION,
      Keyword.CONNECTION,
      Keyword.DATA,
      Keyword.INDEX,
      Keyword.DELAY_KEY_WRITE,
      Keyword.ENCRYPTED,
      Keyword.ENCRYPTION_KEY_ID,
      Keyword.ENCRYPTION,
      Keyword.IETF_QUOTES,
      Keyword.STORAGE,
      Keyword.ENGINE,
      Keyword.ENGINE_ATTRIBUTE,
      Keyword.INSERT_METHOD,
      Keyword.KEY_BLOCK_SIZE,
      Keyword.MAX_ROWS,
      Keyword.MIN_ROWS,
      Keyword.PACK_KEYS,
      Keyword.PAGE_CHECKSUM,
      Keyword.PAGE_COMPRESSED,
      Keyword.PAGE_COMPRESSION_LEVEL,
      Keyword.PASSWORD,
      Keyword.ROW_FORMAT,
      Keyword.SECONDARY_ENGINE_ATTRIBUTE,
      Keyword.STATS_AUTO_RECALC,
      Keyword.STATS_PERSISTENT,
      Keyword.STATS_SAMPLE_PAGES,
      Keyword.SEQUENCE,
      Keyword.TABLESPACE,
      Keyword.TRANSACTIONAL,
      Keyword.UNION,
      Keyword.WITH,
    ]

    for (let i = 0; i === 0 || !this.consumeIf(TokenType.Delimiter); i++) {
      this.consumeIf(TokenType.Comma)
      if (this.consumeIf(Keyword.AUTOEXTEND_SIZE)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "AUTOEXTEND_SIZE", value: this.sizeValue() })
      } else if (this.consumeIf(Keyword.AUTO_INCREMENT)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "AUTO_INCREMENT", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.AVG_ROW_LENGTH)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "AVG_ROW_LENGTH", value: this.expression(stopped) })
      } else if (
        this.consumeIf(Keyword.CHARACTER, Keyword.SET) ||
        this.consumeIf(Keyword.DEFAULT, Keyword.CHARACTER, Keyword.SET) ||
        this.consumeIf(Keyword.CHARSET) ||
        this.consumeIf(Keyword.DEFAULT, Keyword.CHARSET)
      ) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "CHARACTER SET", value: this.identifier() })
      } else if (this.consumeIf(Keyword.CHECKSUM)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "CHECKSUM", value: this.expression(stopped) })
      } else if (
        this.consumeIf(Keyword.COLLATE) ||
        this.consumeIf(Keyword.DEFAULT, Keyword.COLLATE)
      ) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "COLLATE", value: this.identifier() })
      } else if (this.consumeIf(Keyword.COMMENT)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "COMMENT", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.COMPRESSION)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "COMPRESSION", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.CONNECTION)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "CONNECTION", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.DATA, Keyword.DIRECTORY)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "DIRECTORY", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.INDEX, Keyword.DIRECTORY)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "INDEX DIRECTORY", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.DELAY_KEY_WRITE)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "DELAY_KEY_WRITE", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.ENCRYPTED)) {
        this.consumeIf(Keyword.OPE_EQ)
        if (this.consumeIf(Keyword.YES)) {
          options.push({ key: "ENCRYPTED", value: "YES" })
        } else if (this.consumeIf(Keyword.NO)) {
          options.push({ key: "ENCRYPTED", value: "NO" })
        } else {
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.ENCRYPTION_KEY_ID)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "ENCRYPTION_KEY_ID", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.ENCRYPTION)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "ENCRYPTION", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.IETF_QUOTES)) {
        this.consumeIf(Keyword.OPE_EQ)
        if (this.consumeIf(Keyword.YES)) {
          options.push({ key: "IETF_QUOTES", value: "YES" })
        } else if (this.consumeIf(Keyword.NO)) {
          options.push({ key: "IETF_QUOTES", value: "NO" })
        } else {
          throw this.createParseError()
        }
      } else if (
        this.consumeIf(Keyword.STORAGE, Keyword.ENGINE) ||
        this.consumeIf(Keyword.ENGINE)
      ) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "ENGINE", value: this.identifier() })
      } else if (this.consumeIf(Keyword.ENGINE_ATTRIBUTE)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "ENGINE_ATTRIBUTE", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.INSERT_METHOD)) {
        this.consumeIf(Keyword.OPE_EQ)
        if (this.consumeIf(Keyword.NO)) {
          options.push({ key: "INSERT_METHOD", value: model.NO })
        } else if (this.consumeIf(Keyword.FIRST)) {
          options.push({ key: "INSERT_METHOD", value: model.FIRST })
        } else if (this.consumeIf(Keyword.LAST)) {
          options.push({ key: "INSERT_METHOD", value: model.LAST })
        } else {
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.KEY_BLOCK_SIZE)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "KEY_BLOCK_SIZE", value: this.sizeValue() })
      } else if (this.consumeIf(Keyword.MAX_ROWS)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "MAX_ROWS", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.MIN_ROWS)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "MIN_ROWS", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.PACK_KEYS)) {
        this.consumeIf(Keyword.OPE_EQ)
        if (this.consumeIf(Keyword.DEFAULT)) {
          options.push({ key: "PACK_KEYS", value: "DEFAULT" })
        } else {
          options.push({ key: "PACK_KEYS", value: this.expression(stopped) })
        }
      } else if (this.consumeIf(Keyword.PAGE_CHECKSUM)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "PAGE_CHECKSUM", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.PAGE_COMPRESSED)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "PAGE_COMPRESSED", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.PAGE_COMPRESSION_LEVEL)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "PAGE_COMPRESSION_LEVEL", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.PASSWORD)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "PASSWORD", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.ROW_FORMAT)) {
        this.consumeIf(Keyword.OPE_EQ)
        if (this.consumeIf(Keyword.DEFAULT)) {
          options.push({ key: "ROW_FORMAT", value: model.DEFAULT })
        } else if (this.consumeIf(Keyword.DYNAMIC)) {
          options.push({ key: "ROW_FORMAT", value: model.DYNAMIC })
        } else if (this.consumeIf(Keyword.FIXED)) {
          options.push({ key: "ROW_FORMAT", value: model.FIXED })
        } else if (this.consumeIf(Keyword.COMPRESSED)) {
          options.push({ key: "ROW_FORMAT", value: model.COMPRESSED })
        } else if (this.consumeIf(Keyword.REDUNDANT)) {
          options.push({ key: "ROW_FORMAT", value: model.REDUNDANT })
        } else if (this.consumeIf(Keyword.COMPACT)) {
          options.push({ key: "ROW_FORMAT", value: model.COMPACT })
        } else {
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.SECONDARY_ENGINE_ATTRIBUTE)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "SECONDARY_ENGINE_ATTRIBUTE", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.STATS_AUTO_RECALC)) {
        this.consumeIf(Keyword.OPE_EQ)
        if (this.consumeIf(Keyword.DEFAULT)) {
          options.push({ key: "STATS_AUTO_RECALC", value: "DEFAULT" })
        } else {
          options.push({ key: "STATS_AUTO_RECALC", value: this.expression(stopped) })
        }
      } else if (this.consumeIf(Keyword.STATS_PERSISTENT)) {
        this.consumeIf(Keyword.OPE_EQ)
        if (this.consumeIf(Keyword.DEFAULT)) {
          options.push({ key: "STATS_PERSISTENT", value: "DEFAULT" })
        } else {
          options.push({ key: "STATS_PERSISTENT", value: this.expression(stopped) })
        }
      } else if (this.consumeIf(Keyword.STATS_SAMPLE_PAGES)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "STATS_SAMPLE_PAGES", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.SEQUENCE)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "SEQUENCE", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.TABLESPACE)) {
        options.push({ key: "TABLESPACE", value: this.identifier() })
        if (this.consumeIf(Keyword.STORAGE)) {
          if (this.consumeIf(Keyword.DISK)) {
            options.push({ key: "TABLESPACE STORAGE DISK", value: model.DISK })
          } else if (this.consumeIf(Keyword.MEMORY)) {
            options.push({ key: "TABLESPACE STORAGE DISK", value: model.MEMORY })
          } else {
            throw this.createParseError()
          }
        }
      } else if (this.consumeIf(Keyword.TRANSACTIONAL)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "TRANSACTIONAL", value: this.expression(stopped) })
      } else if (this.consumeIf(Keyword.UNION)) {
        this.consumeIf(Keyword.OPE_EQ)
        this.consume(TokenType.LeftParen)
        const union = []
        for (let j = 0; j === 0 || this.consumeIf(TokenType.Comma); j++) {
          union.push(this.identifier())
        }
        options.push({ key: "UNION", value: union })
        this.consume(TokenType.RightParen)
      } else if (this.consumeIf(Keyword.WITH, Keyword.SYSTEM, Keyword.VERSIONING)) {
        options.push({ key: "WITH SYSTEM VERSIONING", value: true })
      } else {
        break
      }
    }
    return options
  }

  indexOptions() {
    const options = new Array<{ key: string, value: any }>()
    while (this.token()) {
      if (this.consumeIf(Keyword.KEY_BLOCK_SIZE)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "KEY_BLOCK_SIZE", value: this.sizeValue() })
      } else if (this.consumeIf(Keyword.USING)) {
        if (this.consumeIf(Keyword.BTREE)) {
          options.push({ key: "USING", value: model.BTREE })
        } else if (this.consumeIf(Keyword.HASH)) {
          options.push({ key: "USING", value: model.HASH })
        } else if (this.consumeIf(Keyword.HASH)) {
          options.push({ key: "USING", value: model.RTREE })
        } else {
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.WITH, Keyword.PARSER)) {
        options.push({ key: "WITH PARSER", value: this.identifier() })
      } else if (this.consumeIf(Keyword.COMMENT)) {
        options.push({ key: "COMMENT", value: this.stringValue() })
      } else if (this.consumeIf(Keyword.VISIBLE)) {
        options.push({ key: "INVISIBLE", value: false })
      } else if (this.consumeIf(Keyword.INVISIBLE)) {
        options.push({ key: "INVISIBLE", value: true })
      } else if (this.consumeIf(Keyword.ENGINE_ATTRIBUTE)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "ENGINE_ATTRIBUTE", value: this.stringValue() })
      } else if (this.consumeIf(Keyword.SECONDARY_ENGINE_ATTRIBUTE)) {
        this.consumeIf(Keyword.OPE_EQ)
        options.push({ key: "SECONDARY_ENGINE_ATTRIBUTE", value: this.stringValue() })
      } else if (this.consumeIf(Keyword.CLUSTERING)) {
        this.consumeIf(Keyword.OPE_EQ)
        if (this.consumeIf(Keyword.YES)) {
          options.push({ key: "CLUSTERING", value: "YES" })
        } else if (this.consumeIf(Keyword.NO)) {
          options.push({ key: "CLUSTERING", value: "NO" })
        } else {
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.IGNORED)) {
        options.push({ key: "IGNORED", value: true })
      } else if (this.consumeIf(Keyword.NOT, Keyword.IGNORED)) {
        options.push({ key: "IGNORED", value: false })
      } else {
        break
      }
    }
    return options
  }

  selectClause() {
    if (this.peekIf(Keyword.WITH)) {
      this.withClause()
    }
    this.consume(Keyword.SELECT)
    let depth = 0
    while (this.token() &&
      !this.peekIf(TokenType.Delimiter) &&
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
      sobj.schema = sobj.name
      sobj.name = this.identifier()
    }
    return sobj
  }

  userRole() {
    const userRole = new model.UserRole()
    if (
      this.consumeIf(TokenType.QuotedIdentifier) ||
      this.consumeIf(TokenType.QuotedValue) ||
      (this.sqlMode.has("ANSI_QUOTE") && this.consumeIf(TokenType.QuotedValue))
    ) {
      userRole.name = new model.Text(dequote(this.token(-1).text), true)
    } else if (
      this.consumeIf(TokenType.String) ||
      (!this.sqlMode.has("ANSI_QUOTE") && this.consumeIf(TokenType.QuotedValue))
    ) {
      userRole.name = new model.Text(this.token(-1).text)
    } else if (this.consumeIf(TokenType.Identifier)) {
      userRole.name = new model.Text(lcase(this.token(-1).text), true)
    } else {
      throw this.createParseError()
    }
    return userRole
  }

  tableColumn() {
    const column = new model.TableColumn()
    column.name = this.identifier()
    column.dataType = this.dataType()

    const stopped = [
      Keyword.NULL,

    ]

    let start = this.pos
    let collate
    if (this.consumeIf(Keyword.COLLATE)) {
      collate = this.identifierOrStringValue()
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
        generatedColumn.storeType = model.VIRTUAL
      } else if (this.consumeIf(Keyword.STORED)) {
        generatedColumn.storeType = model.STORED
      }
      column.generatedColumn = generatedColumn
    } else {
      // Rollback
      this.pos = start
    }

    while (this.token()) {
      if (this.consumeIf(Keyword.NOT)) {
        this.consume(Keyword.NULL)
        column.notNull = true
      } else if (this.consumeIf(Keyword.NULL)) {
        column.notNull = false
      } else if (this.consumeIf(Keyword.VISIBLE)) {
        column.visible = true
      } else if (this.consumeIf(Keyword.INVISIBLE)) {
        column.visible = false
      } else if (this.consumeIf(Keyword.UNIQUE)) {
        this.consumeIf(Keyword.KEY)
        column.indexType = model.UNIQUE
      } else if (this.consumeIf(Keyword.PRIMARY)) {
        this.consumeIf(Keyword.KEY)
        column.indexType = model.PRIMARY_KEY
      } else if (this.consumeIf(Keyword.KEY)) {
        column.indexType = model.PRIMARY_KEY
      } else if (this.consumeIf(Keyword.COMMENT)) {
        column.comment = this.stringValue()
      } else if (this.consumeIf(Keyword.REFERENCES)) {
        column.references = this.references()
      } else if (this.peekIf(Keyword.CONSTRAINT) || this.peekIf(Keyword.CHECK)) {
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
      } else if (!column.generatedColumn && this.consumeIf(Keyword.DEFAULT)) {
        const start = this.pos
        if (this.consumeIf(TokenType.LeftParen)) {
          column.defaultValue = this.expression()
          this.consume(TokenType.RightParen)
        } else if (
          this.consumeIf(Keyword.OPE_PLUS) ||
          this.consumeIf(Keyword.OPE_MINUS)
        ) {
          this.consume(TokenType.Number)
          column.defaultValue = toExpression(this.tokens, start, this.pos)
        } else if (
          this.consumeIf(Keyword.DATE) ||
          this.consumeIf(Keyword.TIME) ||
          this.consumeIf(Keyword.TIMESTAMP)
        ) {
          if (
            this.consumeIf(TokenType.String) ||
            (!this.sqlMode.has("ANSI_QUOTE") && this.consumeIf(TokenType.QuotedValue))
          ) {
            column.defaultValue = toExpression(this.tokens, start, this.pos)
          } else {
            throw this.createParseError()
          }
        } else if (this.consumeIf(TokenType.LeftBrace)) {
          if (this.consumeIf(Keyword.D) || this.consumeIf(Keyword.T) || this.consumeIf(Keyword.TS)) {
            if (
              this.consumeIf(TokenType.String) ||
              (!this.sqlMode.has("ANSI_QUOTE") && this.consumeIf(TokenType.QuotedValue))
            ) {
              column.defaultValue = toExpression(this.tokens, start, this.pos)
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
          this.consume(TokenType.Number) ||
          this.consumeIf(Keyword.CURRENT_TIMESTAMP) ||
          this.consumeIf(Keyword.TRUE) ||
          this.consumeIf(Keyword.FALSE) ||
          this.consumeIf(Keyword.NULL)
        ) {
          column.defaultValue = toExpression(this.tokens, start, this.pos)
        } else {
          throw this.createParseError()
        }
      } else if (!column.generatedColumn && this.consumeIf(Keyword.AUTO_INCREMENT)) {
        column.autoIncrement = true
      } else if (!column.generatedColumn && this.consumeIf(Keyword.COLLATE)) {
        column.collate = this.identifierOrStringValue()
      } else if (!column.generatedColumn && this.consumeIf(Keyword.COLUMN_FORMAT)) {
        if (this.consumeIf(Keyword.FIXED)) {
          column.columnFormat = model.FIXED
        } else if (this.consumeIf(Keyword.DYNAMIC)) {
          column.columnFormat = model.DYNAMIC
        } else if (this.consumeIf(Keyword.DEFAULT)) {
          column.columnFormat = model.DEFAULT
        } else {
          throw this.createParseError()
        }
      } else if (!column.generatedColumn && this.consumeIf(Keyword.ENGINE_ATTRIBUTE)) {
        this.consumeIf(Keyword.OPE_EQ)
        column.engineAttribute = this.stringValue()
      } else if (!column.generatedColumn && this.consumeIf(Keyword.SECONDARY_ENGINE_ATTRIBUTE)) {
        this.consumeIf(Keyword.OPE_EQ)
        column.secondaryEngineAttribute = this.stringValue()
      } else if (!column.generatedColumn && this.consumeIf(Keyword.STORAGE)) {
        if (this.consumeIf(Keyword.DISK)) {
          column.storageType = model.DISK
        } else if (this.consumeIf(Keyword.MEMORY)) {
          column.storageType = model.MEMORY
        } else {
          throw this.createParseError()
        }
      } else {
        break
      }
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
        this.consume(TokenType.Number)
        dataType.length = this.token(-1).text
        if (withScale) {
          this.consume(TokenType.Comma, TokenType.Number)
          dataType.scale = this.token(-1).text
        }
        this.consume(TokenType.RightParen)
      }
    } else if (collective) {
      this.consume(TokenType.LeftParen)
      const values = []
      for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
        if (this.consumeIf(TokenType.String)) {
          values.push(unbackslashed(dequote(this.token(-1).text)))
        } else if (!this.sqlMode.has("ANSI_QUOTE") && this.consumeIf(TokenType.QuotedValue)) {
          values.push(unbackslashed(dequote(this.token(-1).text)))
        } else {
          throw this.createParseError()
        }
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
        dataType.characterSet = this.identifierOrStringValue()
      } else if (this.consumeIf(Keyword.CHARSET)) {
        dataType.characterSet = this.identifierOrStringValue()
      }

      if (this.consumeIf(Keyword.BINARY)) {
        dataType.binary = true
      } else if (this.consumeIf(Keyword.COLLATE)) {
        dataType.collate = this.identifierOrStringValue()
      }
    }

    return dataType
  }

  references() {
    const references = new model.References()
    references.table = this.identifier()
    this.consume(TokenType.LeftParen)
    for (let i = 0; i === 0 || this.consumeIf(TokenType.Comma); i++) {
      references.columns.push(this.identifier())
    }
    this.consume(TokenType.RightParen)
    if (this.consumeIf(Keyword.MATCH)) {
      if (this.consumeIf(Keyword.FULL)) {
        references.match = model.FULL
      } else if (this.consumeIf(Keyword.PARTIAL)) {
        references.match = model.PARTIAL
      } else if (this.consumeIf(Keyword.SIMPLE)) {
        references.match = model.SIMPLE
      } else {
        throw this.createParseError()
      }
    }
    if (this.consumeIf(Keyword.ON, Keyword.DELETE)) {
      if (this.consumeIf(Keyword.CASCADE)) {
        references.onDelete = model.CASCADE
      } else if (this.consumeIf(Keyword.SET)) {
        if (this.consumeIf(Keyword.NULL)) {
          references.onDelete = model.SET_NULL
        } else if (this.consumeIf(Keyword.DEFAULT)) {
          references.onDelete = model.SET_DEFAULT
        } else {
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.RESTRICT)) {
        references.onDelete = model.RESTRICT
      } else if (this.consumeIf(Keyword.NO)) {
        this.consume(Keyword.ACTION)
        references.onDelete = model.NO_ACTION
      } else {
        throw this.createParseError()
      }
    }
    if (this.consumeIf(Keyword.ON, Keyword.UPDATE)) {
      if (this.consumeIf(Keyword.CASCADE)) {
        references.onUpdate = model.CASCADE
      } else if (this.consumeIf(Keyword.SET)) {
        if (this.consumeIf(Keyword.NULL)) {
          references.onUpdate = model.SET_NULL
        } else if (this.consumeIf(Keyword.DEFAULT)) {
          references.onUpdate = model.SET_DEFAULT
        } else {
          throw this.createParseError()
        }
      } else if (this.consumeIf(Keyword.RESTRICT)) {
        references.onUpdate = model.RESTRICT
      } else if (this.consumeIf(Keyword.NO)) {
        this.consume(Keyword.ACTION)
        references.onUpdate = model.NO_ACTION
      } else {
        throw this.createParseError()
      }
    }
    return references
  }

  expression(stopped?: Array<Keyword>) {
    const start = this.pos
    let depth = 0
    loop: while (this.token() &&
      (depth === 0 && !this.peekIf(TokenType.Comma)) &&
      (depth === 0 && !this.peekIf(TokenType.RightParen)) &&
      !this.peekIf(TokenType.Delimiter)
    ) {
      if (depth === 0 && stopped) {
        for (const keyword of stopped) {
          if (this.peekIf(keyword)) {
            break loop
          }
        }
      }

      if (this.consumeIf(TokenType.LeftParen)) {
        depth++
      } else if (this.consumeIf(TokenType.RightParen)) {
        depth--
      } else {
        this.consume()
      }
    }
    return toExpression(this.tokens, start, this.pos)
  }

  identifierOrStringValue() {
    if (this.consumeIf(TokenType.Identifier)) {
      return lcase(this.token(-1).text)
    } else if (this.consumeIf(TokenType.QuotedIdentifier)) {
      return lcase(unbackslashed(dequote(this.token(-1).text)))
    } else if (this.consumeIf(TokenType.QuotedValue)) {
      return lcase(unbackslashed(dequote(this.token(-1).text)))
    } else if (this.consumeIf(TokenType.String)) {
      return lcase(unbackslashed(dequote(this.token(-1).text)))
    } else {
      throw this.createParseError()
    }
  }

  identifier() {
    if (this.consumeIf(TokenType.Identifier)) {
      return lcase(this.token(-1).text)
    } else if (
      this.consumeIf(TokenType.QuotedIdentifier) ||
      (!this.sqlMode.has("ANSI_QUOTES") && this.consumeIf(TokenType.QuotedValue))
    ) {
      return dequote(this.token(-1).text)
    } else {
      throw this.createParseError()
    }
  }

  stringValue() {
    if (
      this.consumeIf(TokenType.String) ||
      (!this.sqlMode.has("ANSI_QUOTE") && this.consumeIf(TokenType.QuotedValue))
    ) {
      return new model.Text(this.token(-1).text)
    } else {
      throw this.createParseError()
    }
  }

  unsignedIntegerValue() {
    if (this.consumeIf(TokenType.Number)) {
      return new model.Numeric(this.token(-1).text)
    } else {
      throw this.createParseError()
    }
  }

  numericValue() {
    const start = this.pos
    if (this.consumeIf(Keyword.OPE_MINUS)) {
      this.consume(TokenType.Number)
      return new model.Numeric(`-${this.token(-1).text}`)
    } else if (this.consumeIf(Keyword.OPE_PLUS)) {
      this.consume(TokenType.Number)
      return new model.Numeric(this.token(-1).text)
    } else if (this.consumeIf(TokenType.Number)) {
      return new model.Numeric(this.token(-1).text)
    } else {
      throw this.createParseError()
    }
  }

  sizeValue() {
    if (this.consumeIf(TokenType.Number)) {
      return new model.Numeric(this.token(-1).text)
    } else if (this.consumeIf(TokenType.Size)) {
      return new model.Numeric(sizeToNumber(this.token(-1).text))
    } else {
      throw this.createParseError()
    }
  }
}

export function toExpression(tokens: Array<Token>, start: number = 0, end: number = tokens.length) {
  const expr = new model.Expression()
  for (let i = start; i < end; i++) {
    let text = tokens[i].text
    if (tokens[i].type === TokenType.Identifier) {
      expr.push(new model.Identity(text))
    } else if (tokens[i].type === TokenType.String) {
      expr.push(new model.Text(text))
    } else if (tokens[i].type === TokenType.Number) {
      expr.push(new model.Numeric(text))
    } else if (tokens[i].type === TokenType.Size) {
      expr.push(new model.Numeric(sizeToNumber(text)))
    } else if (tokens[i].type === TokenType.SessionVariable) {
      expr.push(new model.SessionVariable(text))
    } else if (tokens[i].type === TokenType.UserVariable) {
      expr.push(new model.UserVariable(text))
    } else {
      expr.push(new model.Identity(text))
    }
  }
  return expr
}

function sizeToNumber(text: string) {
  let num = BigInt(text.substring(0, text.length - 1))
  switch (ucase(text.charAt(text.length - 1))) {
    case "K":
      num = num * BigInt(1024)
      break
    case "M":
      num = num * BigInt(1024 * 1024)
      break
    case "G":
      num = num * BigInt(1024 * 1024 * 1024)
      break
    case "T":
      num = num * BigInt(1024 * 1024 * 1024 * 1024)
      break
    defualt:
      throw new Error(`Illegal size: ${text}`)
  }
  return num.toString()
}

function toSemverString(version: string) {
  const value = Number.parseInt(version, 10)
  const major = Math.trunc(value / 10000)
  const minor = Math.trunc(value / 100 % 100)
  const patch = Math.trunc(value % 100)
  return `${major}.${minor}.${patch}`
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
