import {format} from "date-fns"

export function lcase(text: string) {
  return text.toLowerCase()
}

export function ucase(text: string) {
  return text.toUpperCase()
}

export function lcamel(text: string) {
  return text.replace(/(^|[_ \t-]+)([a-zA-Z])|(.)/g, (m, g1, g2, g3) => {
    if (g2) {
      if (g1) {
        return g2.toUpperCase()
      } else {
        return g2.toLowerCase()
      }
    } else {
      return g3.toLowerCase()
    }
  })
}

export function ucamel(text: string) {
  return text.replace(/(^|[_ \t-]+)([a-zA-Z])|(.)/g, (m, g1, g2, g3) => {
    if (g2) {
      return g2.toUpperCase()
    } else {
      return g3.toLowerCase()
    }
  })
}

export function squote(text: string) {
  return '"' + text.replace(/"/g, '""') + '"'
}

export function dquote(text: string) {
  return '"' + text.replace(/"/g, '""') + '"'
}

export function bquote(text: string) {
  return "`" + text.replace(/`/g, "``") + "`"
}

export function dequote(text: string) {
  if (text.length >= 2) {
    const sc = text.charAt(0)
    const ec = text.charAt(text.length-1)
    if (sc === "[" && ec === "]") {
      return text.substring(1, text.length - 1)
    } else if (sc === "`" && sc === ec) {
      return text.substring(1, text.length - 1).replace(/``/g, sc)
    } else if (sc === '"' && sc === ec) {
      return text.substring(1, text.length - 1).replace(/""/g, sc)
    } else if (sc === "'" && sc === ec) {
      return text.substring(1, text.length - 1).replace(/''/g, sc)
    }
  }
  return text
}

export function escapeRegExp(text: string) {
  return text.replace(/[.*+?^=!:${}()|[\]\/\\]/g, '\\$&')
}

export function sortBy(a: Array<{ [key:string]:any }>, key: string) {
  const na = [...a]
  na.sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
  return na
}

export function formatDateTime(date: number | Date, pattern: string) {
  return format(date, pattern)
}

export function eqSet(c1?: Array<any> | Set<any>, c2?: Array<any> | Set<any>) {
  const c1Len = c1 instanceof Set ? c1.size : c1 ? c1.length : 0
  const c2Len = c2 instanceof Set ? c2.size : c2 ? c2.length : 0

  if (!c1 || c1Len === 0) {
    return c2Len === 0
  } else if (!c2 || c2Len === 0) {
    return false
  } else if (c1Len !== c2Len) {
    return false
  }

  const c2Set = c2 instanceof Set ? c2 : new Set(c2)
  for (const c1Val of c1) {
    if (!c2Set.has(c1Val)) {
      return false
    }
  }
  return true
}
