import { Statement } from "../models"
import {
  TokenType,
  Keyword,
  Token,
  Lexer,
  Parser,
  Operator,
  ParseError,
  AggregateParseError,
} from "../parser"

export class MsSqlLexer extends Lexer {
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
  }
}

export class MsSqlParser extends Parser {
  constructor(
    input: string,
    options: { [key: string]: any} = {},
  ) {
    super(input, new MsSqlLexer(options), options)
  }

  root() {
    const root: Statement[] = []
    return root
  }
}
