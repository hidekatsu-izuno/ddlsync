import {
  TokenType,
  Token,
  Lexer,
  Parser,
  Expression,
  Idnetifier,
  StringValue,
  NumberValue,
  IExpression,
} from "./common"
import { Reserved } from "./mysql_models"
import semver from "semver"
import escapeRegExp from "lodash.escaperegexp"

export class MysqlLexer extends Lexer {
  private delimiter = /;/y
  private reservedMap

  constructor(
    private options: { [key: string]: any } = {}
  ) {
    super([
      { type: TokenType.HintComment, re: /\/\*\+.*?\*\//sy },
      { type: TokenType.BlockComment, re: /\/\*.*?\*\//sy },
      { type: TokenType.LineComment, re: /(#.*|--([ \t].*)$)/my },
      { type: TokenType.Command, re: /^[ \t]*delimiter(?:[ \t]+.*)?$/imy },
      { type: TokenType.WhiteSpace, re: /[ \t]+/y },
      { type: TokenType.LineBreak, re: /(?:\r\n?|\n)/y },
      { type: TokenType.Delimiter, re: () => this.delimiter },
      { type: TokenType.LeftParen, re: /\(/y },
      { type: TokenType.RightParen, re: /\)/y },
      { type: TokenType.Comma, re: /,/y },
      { type: TokenType.Number, re: /0[xX][0-9a-fA-F]+|((0|[1-9][0-9]*)(\.[0-9]+)?|(\.[0-9]+))([eE][+-]?[0-9]+)?/y },
      { type: TokenType.Dot, re: /\./y },
      { type: TokenType.String, re: /([bBnN]|_[a-zA-Z]+)?'([^']|'')*'/y },
      { type: TokenType.QuotedValue, re: /([bBnN]|_[a-zA-Z]+)?"([^"]|"")*"/y },
      { type: TokenType.QuotedIdentifier, re: /`([^`]|``)*`/y },
      { type: TokenType.BindVariable, re: /\?/y },
      { type: TokenType.Variable, re: /@@?([a-zA-Z_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*|'([^']|'')*'|"([^"]|"")*")/y },
      { type: TokenType.Identifier, re: /[a-zA-Z_$\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y },
      { type: TokenType.Operator, re: /\|\|&&|<=>|<<|>>|<>|->>?|[=<>!:]=?|[~&|^*/%+-]/y },
      { type: TokenType.Error, re: /./y },
    ])

    this.reservedMap = Reserved.toMap(options.version)
  }

  process(token: Token) {
    if (token.type === TokenType.Identifier) {
      const reserved = this.reservedMap.get(token.text.toUpperCase())
      if (reserved) {
        token.type = reserved
      }
    } else if (token.type === TokenType.Command) {
      const args = token.text.trim().split(/[ \t]+/g)
      if (/^delimiter$/i.test(args[0]) && args[1]) {
        this.delimiter = new RegExp(escapeRegExp(args[1]), "y")
      }
    }
    return token
  }
}

export class MysqlParser extends Parser {
  constructor(
    input: string,
    private options: { [key: string]: any} = {}
  ) {
    super(input.replace(
      /\/\*!(0|[0-9][1-9]*)?(.*?)\*\//g,
      (m, p1, p2) => {
        if (options.version && p1) {
          if (semver.lt(options.version, MysqlParser.toSemverString(p1))) {
            return m
          }
        }
        return " ".repeat((p1 ? p1.length : 0) + 2) + p2 + "  "
      }
    ), new MysqlLexer(options))
  }

  root() {
    return []
  }

  private static toSemverString(version: string) {
    const value = Number.parseInt(version, 10)
    const major = Math.trunc(value / 10000)
    const minor = Math.trunc(value / 100 % 100)
    const patch = Math.trunc(value % 100)
    return `${major}.${minor}.${patch}`
  }
}
