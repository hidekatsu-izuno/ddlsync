import { TokenType, Token, tokenize } from "./tokenizer"

export class Node {
  public children: Node[] = []

  constructor(
    public name: string
  ) {
  }
}

class Parser {
  private pos = 0
  private token: Token

  constructor(
    public tokens: Token[]
  ) {
    this.token = this.tokens[0]
  }

  private next(): boolean {
    return false
  }

  root() {
    const root = []
    root.push(this.statement())
    while (this.next()) {
      switch (this.token.type) {
        case TokenType.Delimiter: break;
        default: throw new Error(`Invalid token: ${this.token}`)
      }
      root.push(this.statement())
    }
    return root
  }

  statement() {

  }
}

function toNumericMysqlVersion(version?: string) {
  if (version) {
    const m = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]?)\.(0|[1-9][0-9]?)$/.exec(version)
    if (m) {
      return Number.parseInt(m[1], 10) * 10000 + Number.parseInt(m[2], 10) * 100 + Number.parseInt(m[3], 10)
    }
  }
  return -1
}

export function parse(input: string, client: string, options: { [key: string]: any} = {}) {
  if (client === "mysql" || client === "mysql2") {
    input = input.replace(/\/\*!(0|[0-9][1-9]*)?(.*?)\*\//g, (m, p1, p2) => {
      if (p1) {
        const targetVersion = Number.parseInt(p1, 10)
        const curretVersion = toNumericMysqlVersion(options.version)
        if (curretVersion < targetVersion) {
          return m
        }
      }
      return " ".repeat((p1 ? p1.length : 0) + 2) + p2 + "  "
    })
  }

  const tokens = tokenize(client, input)
  const parser = new Parser(tokens)
  return parser.root()
}
