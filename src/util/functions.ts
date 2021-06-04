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
