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
import { Reserved } from "./oracle_models"
import semver from "semver"

/*
const PlSqlTargets = new Set<Reserved>()
PlSqlTargets.add(Reserved.FUNCTION)
PlSqlTargets.add(Reserved.LIBRARY)
PlSqlTargets.add(Reserved.PACKAGE)
PlSqlTargets.add(Reserved.PROCEDURE)
PlSqlTargets.add(Reserved.TRIGGER)
PlSqlTargets.add(Reserved.TYPE)
*/

export class OracleLexer extends Lexer {
  private reservedMap

  constructor(
    private options: { [key: string]: any } = {}
  ) {
    super([
      { type: TokenType.WhiteSpace, re: /[ \t]+/y },
      { type: TokenType.HintComment, re: /\/\*\+.*?\*\//sy },
      { type: TokenType.BlockComment, re: /\/\*.*?\*\//sy },
      { type: TokenType.LineComment, re: /--.*/y },
      { type: TokenType.Delimiter, re: /^[ \t]*[./](?=[ \t]|$)/my },
      { type: TokenType.LineBreak, re: /(?:\r\n?|\n)/y },
      { type: TokenType.SemiColon, re: /;/y },
      { type: TokenType.Operator, re: /\(\+\)=?/y },
      { type: TokenType.LeftParen, re: /\(/y },
      { type: TokenType.RightParen, re: /\)/y },
      { type: TokenType.Comma, re: /,/y },
      { type: TokenType.Number, re: /0[xX][0-9a-fA-F]+|((0|[1-9][0-9]*)(\.[0-9]+)?|(\.[0-9]+))([eE][+-]?[0-9]+)?/y },
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

export class OracleParser extends Parser {
  constructor(
    input: string,
    private options: { [key: string]: any} = {}
  ) {
    super(input, new OracleLexer(options))
  }

  root() {
    return []
  }
}
