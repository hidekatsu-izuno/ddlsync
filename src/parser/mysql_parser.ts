import { TokenType, Reserved, Token } from "./tokenizer"

export class MysqlParser {
  static toNumericMysqlVersion(version?: string) {
    if (version) {
      const m = /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]?)\.(0|[1-9][0-9]?)$/.exec(version)
      if (m) {
        return Number.parseInt(m[1], 10) * 10000 + Number.parseInt(m[2], 10) * 100 + Number.parseInt(m[3], 10)
      }
    }
    return -1
  }

  private pos = 0

  constructor(
    public input: string
  ) {
  }

  root() {
  }
}
