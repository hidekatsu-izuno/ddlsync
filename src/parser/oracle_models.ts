import { TokenType, Token, Statement, TableConstraint, ColumnConstraint, IExpression, Idnetifier, NumberValue } from "../parser"
import semver from "semver"

const ReservedMap = new Map<string, Reserved>()
export class Reserved extends TokenType {
  static ACCESS = new Reserved("ACCESS")
  static ADD = new Reserved("ADD")
  static ALL = new Reserved("ALL")
  static ALTER = new Reserved("ALTER")
  static AND = new Reserved("AND")
  static ANY = new Reserved("ANY")
  static AS = new Reserved("AS")
  static ASC = new Reserved("ASC")
  static AT = new Reserved("AT")
  static AUDIT = new Reserved("AUDIT")
  static BEGIN = new Reserved("BEGIN")
  static BETWEEN = new Reserved("BETWEEN")
  static BY = new Reserved("BY")
  static CASE = new Reserved("CASE")
  static CHAR = new Reserved("CHAR")
  static CHECK = new Reserved("CHECK")
  static CLUSTER = new Reserved("CLUSTER")
  static CLUSTERS = new Reserved("CLUSTERS")
  static COLAUTH = new Reserved("COLAUTH")
  static COLUMN = new Reserved("COLUMN")
  static COLUMNS = new Reserved("COLUMNS")
  static COLUMN_VALUE = new Reserved("COLUMN_VALUE", { partial: true })
  static COMMENT = new Reserved("COMMENT")
  static COMPRESS = new Reserved("COMPRESS")
  static CONNECT = new Reserved("CONNECT")
  static CRASH = new Reserved("CRASH")
  static CREATE = new Reserved("CREATE")
  static CURRENT = new Reserved("CURRENT")
  static CURSOR = new Reserved("CURSOR")
  static DATE = new Reserved("DATE")
  static DECIMAL = new Reserved("DECIMAL")
  static DECLARE = new Reserved("DECLARE")
  static DEFAULT = new Reserved("DEFAULT")
  static DELETE = new Reserved("DELETE")
  static DESC = new Reserved("DESC")
  static DISTINCT = new Reserved("DISTINCT")
  static DROP = new Reserved("DROP")
  static ELSE = new Reserved("ELSE")
  static END = new Reserved("END")
  static EXCEPTION = new Reserved("EXCEPTION")
  static EXCLUSIVE = new Reserved("EXCLUSIVE")
  static EXISTS = new Reserved("EXISTS")
  static FETCH = new Reserved("FETCH")
  static FILE = new Reserved("FILE")
  static FLOAT = new Reserved("FLOAT")
  static FOR = new Reserved("FOR")
  static FROM = new Reserved("FROM")
  static FUNCTION = new Reserved("FUNCTION")
  static GOTO = new Reserved("GOTO")
  static GRANT = new Reserved("GRANT")
  static GROUP = new Reserved("GROUP")
  static HAVING = new Reserved("HAVING")
  static IDENTIFIED = new Reserved("IDENTIFIED")
  static IF = new Reserved("IF")
  static IMMEDIATE = new Reserved("IMMEDIATE")
  static IN = new Reserved("IN")
  static INCREMENT = new Reserved("INCREMENT")
  static INDEX = new Reserved("INDEX")
  static INDEXES = new Reserved("INDEXES")
  static INITIAL = new Reserved("INITIAL")
  static INSERT = new Reserved("INSERT")
  static INTEGER = new Reserved("INTEGER")
  static INTERSECT = new Reserved("INTERSECT")
  static INTO = new Reserved("INTO")
  static IS = new Reserved("IS")
  static LEVEL = new Reserved("LEVEL")
  static LIKE = new Reserved("LIKE")
  static LOCK = new Reserved("LOCK")
  static LONG = new Reserved("LONG")
  static MAXEXTENTS = new Reserved("MAXEXTENTS")
  static MINUS = new Reserved("MINUS")
  static MLSLABEL = new Reserved("MLSLABEL")
  static MODE = new Reserved("MODE")
  static MODIFY = new Reserved("MODIFY")
  static NESTED_TABLE_ID = new Reserved("NESTED_TABLE_ID",{ partial: true })
  static NOAUDIT = new Reserved("NOAUDIT")
  static NOCOMPRESS = new Reserved("NOCOMPRESS")
  static NOT = new Reserved("NOT")
  static NOWAIT = new Reserved("NOWAIT")
  static NULL = new Reserved("NULL")
  static NUMBER = new Reserved("NUMBER")
  static OF = new Reserved("OF")
  static OFFLINE = new Reserved("OFFLINE")
  static ON = new Reserved("ON")
  static ONLINE = new Reserved("ONLINE")
  static OPTION = new Reserved("OPTION")
  static OR = new Reserved("OR")
  static ORDER = new Reserved("ORDER")
  static OVERLAPS = new Reserved("OVERLAPS")
  static PCTFREE = new Reserved("PCTFREE")
  static PRIOR = new Reserved("PRIOR")
  static PROCEDURE = new Reserved("PROCEDURE")
  static PUBLIC = new Reserved("PUBLIC")
  static RAW = new Reserved("RAW")
  static RENAME = new Reserved("RENAME")
  static RESOURCE = new Reserved("RESOURCE")
  static REVOKE = new Reserved("REVOKE")
  static ROW = new Reserved("ROW")
  static ROWID = new Reserved("ROWID")
  static ROWNUM = new Reserved("ROWNUM")
  static ROWS = new Reserved("ROWS")
  static SELECT = new Reserved("SELECT")
  static SESSION = new Reserved("SESSION")
  static SET = new Reserved("SET")
  static SHARE = new Reserved("SHARE")
  static SIZE = new Reserved("SIZE")
  static SMALLINT = new Reserved("SMALLINT")
  static SQL = new Reserved("SQL")
  static START = new Reserved("START")
  static SUBTYPE = new Reserved("SUBTYPE")
  static SUCCESSFUL = new Reserved("SUCCESSFUL")
  static SYNONYM = new Reserved("SYNONYM")
  static SYSDATE = new Reserved("SYSDATE")
  static TABAUTH = new Reserved("TABAUTH")
  static TABLE = new Reserved("TABLE")
  static THEN = new Reserved("THEN")
  static TO = new Reserved("TO")
  static TRIGGER = new Reserved("TRIGGER")
  static TYPE = new Reserved("TYPE")
  static UID = new Reserved("UID")
  static UNION = new Reserved("UNION")
  static UNIQUE = new Reserved("UNIQUE")
  static UPDATE = new Reserved("UPDATE")
  static USER = new Reserved("USER")
  static VALIDATE = new Reserved("VALIDATE")
  static VALUES = new Reserved("VALUES")
  static VARCHAR = new Reserved("VARCHAR")
  static VARCHAR2 = new Reserved("VARCHAR2")
  static VIEW = new Reserved("VIEW")
  static VIEWS = new Reserved("VIEWS")
  static WHEN = new Reserved("WHEN")
  static WHENEVER = new Reserved("WHENEVER")
  static WHERE = new Reserved("WHERE")
  static WITH = new Reserved("WITH")

  constructor(
    name: string,
    options: { [key: string]: any } = {}
  ) {
    super(name, options)
    ReservedMap.set(name, this)
  }

  static toMap(version: string) {
    if (!version) {
      return ReservedMap
    }

    const newMap = new Map<string, Reserved>()
    ReservedMap.forEach((value, key) => {
      if (!value.options.version || semver.satisfies(version, value.options.version)) {
        newMap.set(key, value)
      }
    })
    return newMap
  }
}
