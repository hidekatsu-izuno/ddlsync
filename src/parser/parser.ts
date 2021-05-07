import { TokenType, Reserved, Token, tokenize } from "./tokenizer"

export class Node {
  children: Node[] = []
  start?: Token
  end?: Token

  constructor(public name: string) {
  }

  toString() {
    return this.name
  }
}

export class CreateTableStatementNode extends Node {
  public schemaName?: string
  public tableName?: string
  public temporary = false
  public startSelectStatement?: Token
  public endSelectStatement?: Token

  constructor() {
    super("CreateTableStatement")
  }
}

export class CreateIndexStatementNode extends Node {
  constructor() {
    super("CreateIndexStatement")
  }
}

export class CreateVirtualTableStatementNode extends Node {
  constructor() {
    super("CreateVirtualTableStatement")
  }
}

export class CreateViewStatementNode extends Node {
  constructor() {
    super("CreateViewStatement")
  }
}

export class CreateTriggerStatementNode extends Node {
  constructor() {
    super("CreateTriggerStatement")
  }
}

export class AlterTableStatementNode extends Node {
  constructor() {
    super("AlterTableStatement")
  }
}

export class DropTableStatementNode extends Node {
  constructor() {
    super("DropTableStatement")
  }
}

export class DropIndexStatementNode extends Node {
  constructor() {
    super("DropIndexStatement")
  }
}

export class DropViewStatementNode extends Node {
  constructor() {
    super("DropViewStatement")
  }
}

export class DropTriggerStatementNode extends Node {
  constructor() {
    super("DropTriggerStatement")
  }
}

export class AttachStatementNode extends Node {
  tokens: Token[] = []

  constructor() {
    super("AttachStatement")
  }
}

export class DetachStatementNode extends Node {
  constructor() {
    super("DetachStatement")
  }
}

export class PragmaStatementNode extends Node {
  constructor() {
    super("PragmaStatement")
  }
}

export class OtherStatementNode extends Node {
  constructor() {
    super("OtherStatement")
  }
}

class Parser {
  private pos = 0

  constructor(
    public tokens: Token[]
  ) {
  }

  root() {
    const root = []
    let node
    if (node = this.statement()) {
      root.push(node)
    }
    while (true) {
      this.consume(TokenType.Delimiter)
      if (node = this.statement()) {
        root.push(node)
      }
    }
    return root
  }

  statement() {
    let node, token1, token
    if (token1 = this.consumeIfMatch(TokenType.Identifier, Reserved.Create)) {
      if (this.consumeIfMatch(TokenType.Identifier, Reserved.Temp) ||
        this.consumeIfMatch(TokenType.Identifier, Reserved.Temporary)) {
        this.consume(TokenType.Identifier, Reserved.Table)
        node = new CreateTableStatementNode()
        node.temporary = true
      } else if (this.consumeIfMatch(TokenType.Identifier, Reserved.Table)) {
        node = new CreateTableStatementNode()
      } else if (this.consumeIfMatch(TokenType.Identifier, Reserved.Index)) {
        node = new CreateIndexStatementNode()
      } else if (this.consumeIfMatch(TokenType.Identifier, Reserved.View)) {
        node = new CreateViewStatementNode()
      } else if (this.consumeIfMatch(TokenType.Identifier, Reserved.Trigger)) {
        node = new CreateTriggerStatementNode()
      } else if (this.consumeIfMatch(TokenType.Identifier, Reserved.Virtual)) {
        this.consume(TokenType.Identifier, Reserved.Table)
        node = new CreateVirtualTableStatementNode()
      } else {
        node = new OtherStatementNode()
      }
    } else if (token1 = this.consumeIfMatch(TokenType.Identifier, Reserved.Alter)) {
      if (this.consumeIfMatch(TokenType.Identifier, Reserved.Table)) {
        node = new AlterTableStatementNode()
      } else {
        node = new OtherStatementNode()
      }
    } else if (token1 = this.consumeIfMatch(TokenType.Identifier, Reserved.Drop)) {
      if (this.consumeIfMatch(TokenType.Identifier, Reserved.Table)) {
        node = new DropTableStatementNode()
      } else if (this.consumeIfMatch(TokenType.Identifier, Reserved.Index)) {
        node = new DropIndexStatementNode()
      } else if (this.consumeIfMatch(TokenType.Identifier, Reserved.View)) {
        node = new DropViewStatementNode()
      } else if (this.consumeIfMatch(TokenType.Identifier, Reserved.Trigger)) {
        node = new DropTriggerStatementNode()
      } else {
        node = new OtherStatementNode()
      }
    } else if (token1 = this.consumeIfMatch(TokenType.Identifier, Reserved.Attach)) {
      node = new AttachStatementNode()
    } else if (token1 = this.consumeIfMatch(TokenType.Identifier, Reserved.Detach)) {
      node = new DetachStatementNode()
    } else if (token1 = this.consumeIfMatch(TokenType.Identifier, Reserved.Pragma)) {
      node = new PragmaStatementNode()
    } else if (token1 = this.consumeIfMatch()) {
      node = new OtherStatementNode()
    } else {
      return null
    }

    if (node instanceof CreateTableStatementNode) {
      if (this.consumeIfMatch(TokenType.Identifier, Reserved.If)) {
        this.consume(TokenType.Identifier, Reserved.Not)
        this.consume(TokenType.Identifier, Reserved.Exists)
      }
      if (token = this.consumeIfMatch(TokenType.QuotedIdentifier)) {
        node.tableName = unescapeIdentifier(token.text)
      } else if (token = this.consumeIfMatch(TokenType.QuotedValue)) {
        node.tableName = unescapeIdentifier(token.text)
      } else {
        token = this.consume(TokenType.Identifier)
        node.tableName = token.text
      }
      if (this.consumeIfMatch(TokenType.Dot)) {
        node.schemaName = node.tableName
        if (token = this.consumeIfMatch(TokenType.QuotedIdentifier)) {
          node.tableName = unescapeIdentifier(token.text)
        } else if (token = this.consumeIfMatch(TokenType.QuotedValue)) {
          node.tableName = unescapeIdentifier(token.text)
        } else {
          token = this.consume(TokenType.Identifier)
          node.tableName = token.text
        }
      }

      if (this.consumeIfMatch(TokenType.LeftParen)) {
        //TODO
        this.consume(TokenType.RightParen)
        if (this.consumeIfMatch(TokenType.Identifier, Reserved.Without)) {
          this.consume(TokenType.Identifier, Reserved.Rowid)
        }
      } else {
        this.consume(TokenType.Identifier, Reserved.As)
        node.startSelectStatement = this.consume(TokenType.Identifier, Reserved.Select)
      }
    } else if (node instanceof CreateIndexStatementNode) {
      //TODO
    } else if (node instanceof CreateViewStatementNode) {
      //TODO
    } else if (node instanceof CreateTriggerStatementNode) {
      //TODO
    } else if (node instanceof CreateVirtualTableStatementNode) {
      //TODO
    } else if (node instanceof AlterTableStatementNode) {
      //TODO
    } else if (node instanceof DropTableStatementNode) {
      //TODO
    } else if (node instanceof DropIndexStatementNode) {
      //TODO
    } else if (node instanceof DropViewStatementNode) {
      //TODO
    } else if (node instanceof DropTriggerStatementNode) {
      //TODO
    }

    node.start = token1
    while (token = this.token(0)) {
      if (token.type === TokenType.Delimiter) {
        break
      }
      this.consume()
    }
    node.end = this.token(-1)

    if (node instanceof CreateTableStatementNode) {
      if (node.startSelectStatement != null) {
        node.endSelectStatement = node.end
      }
    }

    return node
  }

  token(pos: number) {
    return this.tokens[this.pos + pos]
  }

  consume(type?: TokenType, value?: any) {
    const token = this.tokens[this.pos++]
    if (type != null) {
      return token
    }
    if (token.type !== type) {
      throw new Error(`Unexpected token: ${token.text}`)
    }
    if (value != null && token.value !== value) {
      throw new Error(`Unexpected token: ${token.text}`)
    }
    return token
  }

  consumeIfMatch(type?: TokenType, value?: any) {
    const token = this.tokens[this.pos]
    if (token == null ||
      token.type !== type ||
      (value != null && token.value !== value)) {
      return null
    }
    this.pos++
    return token
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

const ReplaceReMap: {[key: string]: RegExp} = {
  "\"": /\"\"/g,
  "'": /''/g,
  "`": /``/g,
  "]": /\]\]/g,
}

function unescapeIdentifier(text: string) {
  if (text.length >= 2) {
    let value = text.substring(1, text.length - 1)
    const c = text.charAt(text.length - 1)
    const re = ReplaceReMap[c]
    if (re != null) {
      value = value.replace(re, c)
    }
    return value
  }
  return text
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
