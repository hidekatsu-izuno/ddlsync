import { TokenType, Token, Statement, TableConstraint, ColumnConstraint, IExpression, Idnetifier, NumberValue } from "./common"
import semver from "semver"

const ReservedMap = new Map<string, Reserved>()
export class Reserved extends TokenType {
  static ALL = new Reserved("ALL")
  static ANALYSE = new Reserved("ANALYSE")
  static ANALYZE = new Reserved("ANALYZE")
  static AND = new Reserved("AND")
  static ANY = new Reserved("ANY")
  static ARRAY = new Reserved("ARRAY")
  static AS = new Reserved("AS")
  static ASC = new Reserved("ASC")
  static ASYMMETRIC = new Reserved("ASYMMETRIC")
  static AUTHORIZATION = new Reserved("AUTHORIZATION", { partial: true })
  static BINARY = new Reserved("BINARY", { partial: true })
  static BOTH = new Reserved("BOTH")
  static CASE = new Reserved("CASE")
  static CAST = new Reserved("CAST")
  static CHECK = new Reserved("CHECK")
  static COLLATE = new Reserved("COLLATE")
  static COLLATION = new Reserved("COLLATION", { partial: true })
  static COLUMN = new Reserved("COLUMN")
  static CONCURRENTLY = new Reserved("CONCURRENTLY", { partial: true })
  static CONSTRAINT = new Reserved("CONSTRAINT")
  static CREATE = new Reserved("CREATE")
  static CROSS = new Reserved("CROSS", { partial: true })
  static CURRENT_CATALOG = new Reserved("CURRENT_CATALOG")
  static CURRENT_DATE = new Reserved("CURRENT_DATE")
  static CURRENT_ROLE = new Reserved("CURRENT_ROLE")
  static CURRENT_SCHEMA = new Reserved("CURRENT_SCHEMA", { partial: true })
  static CURRENT_TIME = new Reserved("CURRENT_TIME")
  static CURRENT_TIMESTAMP = new Reserved("CURRENT_TIMESTAMP")
  static CURRENT_USER = new Reserved("CURRENT_USER")
  static DEFAULT = new Reserved("DEFAULT")
  static DEFERRABLE = new Reserved("DEFERRABLE")
  static DESC = new Reserved("DESC")
  static DISTINCT = new Reserved("DISTINCT")
  static DO = new Reserved("DO")
  static ELSE = new Reserved("ELSE")
  static END = new Reserved("END")
  static EXCEPT = new Reserved("EXCEPT")
  static FALSE = new Reserved("FALSE")
  static FETCH = new Reserved("FETCH")
  static FOR = new Reserved("FOR")
  static FOREIGN = new Reserved("FOREIGN")
  static FREEZE = new Reserved("FREEZE", { partial: true })
  static FROM = new Reserved("FROM")
  static FULL = new Reserved("FULL", { partial: true })
  static GRANT = new Reserved("GRANT")
  static GROUP = new Reserved("GROUP")
  static HAVING = new Reserved("HAVING")
  static ILIKE = new Reserved("ILIKE", { partial: true })
  static IN = new Reserved("IN")
  static INITIALLY = new Reserved("INITIALLY")
  static INNER = new Reserved("INNER", { partial: true })
  static INTERSECT = new Reserved("INTERSECT")
  static INTO = new Reserved("INTO")
  static IS = new Reserved("IS", { partial: true })
  static ISNULL = new Reserved("ISNULL", { partial: true })
  static JOIN = new Reserved("JOIN", { partial: true })
  static LATERAL = new Reserved("LATERAL")
  static LEADING = new Reserved("LEADING")
  static LEFT = new Reserved("LEFT", { partial: true })
  static LIKE = new Reserved("LIKE", { partial: true })
  static LIMIT = new Reserved("LIMIT")
  static LOCALTIME = new Reserved("LOCALTIME")
  static LOCALTIMESTAMP = new Reserved("LOCALTIMESTAMP")
  static NATURAL = new Reserved("NATURAL", { partial: true })
  static NOT = new Reserved("NOT")
  static NOTNULL = new Reserved("NOTNULL", { partial: true })
  static NULL = new Reserved("NULL")
  static OFFSET = new Reserved("OFFSET")
  static ON = new Reserved("ON")
  static ONLY = new Reserved("ONLY")
  static OR = new Reserved("OR")
  static ORDER = new Reserved("ORDER")
  static OUTER = new Reserved("OUTER", { partial: true })
  static OVERLAPS = new Reserved("OVERLAPS", { partial: true })
  static PLACING = new Reserved("PLACING")
  static PRIMARY = new Reserved("PRIMARY")
  static REFERENCES = new Reserved("REFERENCES")
  static RETURNING = new Reserved("RETURNING")
  static RIGHT = new Reserved("RIGHT", { partial: true })
  static SELECT = new Reserved("SELECT")
  static SESSION_USER = new Reserved("SESSION_USER")
  static SIMILAR = new Reserved("SIMILAR", { partial: true })
  static SOME = new Reserved("SOME")
  static SYMMETRIC = new Reserved("SYMMETRIC")
  static TABLE = new Reserved("TABLE")
  static TABLESAMPLE = new Reserved("TABLESAMPLE", { partial: true })
  static THEN = new Reserved("THEN")
  static TO = new Reserved("TO")
  static TRAILING = new Reserved("TRAILING")
  static TRUE = new Reserved("TRUE")
  static UNION = new Reserved("UNION")
  static UNIQUE = new Reserved("UNIQUE")
  static USER = new Reserved("USER")
  static USING = new Reserved("USING")
  static VARIADIC = new Reserved("VARIADIC")
  static VERBOSE = new Reserved("VERBOSE", { partial: true })
  static WHEN = new Reserved("WHEN")
  static WHERE = new Reserved("WHERE")
  static WINDOW = new Reserved("WINDOW")
  static WITH = new Reserved("WITH")

  constructor(
    name: string,
    public options: {
      version?: string,
      partial?: boolean,
    } = {}
  ) {
    super(name)
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