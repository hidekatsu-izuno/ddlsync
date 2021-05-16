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
} from "../parser"
import { Reserved } from "./mssql_models"
import semver from "semver"

export class MssqlLexer extends Lexer {
  private reservedMap

  constructor(
    private options: { [key: string]: any } = {}
  ) {
    super([
      { type: TokenType.WhiteSpace, re: /[ \t]+/y },
      { type: TokenType.BlockComment, re: /\/\*(?:(?!\/\*|\*\/).)*\*\//sy },
      { type: TokenType.LineComment, re: /--.*/y },
      { type: TokenType.Delimiter, re: /^[ \t]*go(?=[ \t-]|$)/imy },
      { type: TokenType.LineBreak, re: /(?:\r\n?|\n)/y },
      { type: TokenType.SemiColon, re: /;/y },
      { type: TokenType.LeftParen, re: /\(/y },
      { type: TokenType.RightParen, re: /\)/y },
      { type: TokenType.Comma, re: /,/y },
      { type: TokenType.Number, re: /0[xX][0-9a-fA-F]+|((0|[1-9][0-9]*)(\.[0-9]+)?|(\.[0-9]+))([eE][+-]?[0-9]+)?/y },
      { type: TokenType.Dot, re: /\./y },
      { type: TokenType.String, re: /'([^']|'')*'/y },
      { type: TokenType.QuotedIdentifier, re: /"([^"]|"")*"/y },
      { type: TokenType.BindVariable, re: /:[a-zA-Z\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y },
      { type: TokenType.Identifier, re: /[a-zA-Z\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF][a-zA-Z0-9_$#\u8000-\uFFEE\uFFF0-\uFFFD\uFFFF]*/y },
      { type: TokenType.Operator, re: /\|\||<<|>>|<>|[=<>!^]=?|[~&|*/+-]/y },
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
    }
    return token
  }
}

export class MssqlParser extends Parser {
  constructor(
    input: string,
    private options: { [key: string]: any} = {}
  ) {
    super(input, new MssqlLexer(options))
  }

  root() {
    return []
  }
}
