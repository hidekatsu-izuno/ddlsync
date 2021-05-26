import {format} from "date-fns"

export function lcase(text: string) {
  return text.toLowerCase()
}

export function ucase(text: string) {
  return text.toUpperCase()
}

export function escapeRegExp(text: string) {
  return text.replace(/[.*+?^=!:${}()|[\]\/\\]/g, '\\$&')
}

export function dquote(text: string) {
  return '"' + text.replace(/"/g, '""') + '"'
}

export function bquote(text: string) {
  return "`" + text.replace(/`/g, "``") + "`"
}

const ReplaceReMap: {[key: string]: RegExp} = {
  '"': /""/g,
  "'": /''/g,
  "`": /``/g,
}

export function dequote(text: string) {
  if (text.length >= 2) {
    const sc = text.charAt(0)
    const ec = text.charAt(text.length-1)
    if (sc === "[" && ec === "]" || sc === ec) {
      const re = ReplaceReMap[sc]
      let value = text.substring(1, text.length - 1)
      if (re != null) {
        value = value.replace(re, sc)
      }
      return value
    }
  }
  return text
}


export function sortBy(a: Array<{ [key:string]:any }>, key: string) {
  const na = [...a]
  na.sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
  return na
}

export function formatDateTime(date: number | Date, pattern: string) {
  return format(date, pattern)
}
