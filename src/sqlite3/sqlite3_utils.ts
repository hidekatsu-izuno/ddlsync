
export enum AffinityType {
  INTEGER = "INTEGER",
  TEXT = "TEXT",
  BLOB = "BLOB",
  REAL = "REAL",
  NUMERIC = "NUMERIC",
}

export function getAffinityType(type?: string) {
  if (!type) {
    return AffinityType.BLOB
  } else if (/INT/i.test(type)) {
    return AffinityType.INTEGER
  } else if (/CHAR|CLOB|TEXT/i.test(type)) {
    return AffinityType.TEXT
  } else if (/BLOB/i.test(type)) {
    return AffinityType.BLOB
  } else if (/REAL|FLOA|DOUB/i.test(type)) {
    return AffinityType.REAL
  } else {
    return AffinityType.NUMERIC
  }
}

