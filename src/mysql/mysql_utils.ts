export function backslashed(text: string) {
  return text.replace(/\\./g, (m, g1) => {
    switch (m) {
      case "\0": return "\\0"
      case "\b": return "\\b"
      case "\n": return "\\n"
      case "\r": return "\\r"
      case "\t": return "\\t"
      case "\u001A": return "\\Z"
      case "\\": return "\\\\"
      default: return g1
    }
  })
}

export function unbackslashed(text: string) {
  return text.replace(/\\(.)/g, (m, g1) => {
    switch (m) {
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
