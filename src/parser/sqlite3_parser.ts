import { TokenType, Reserved, Token, tokenize } from "./tokenizer"

export class Statement {
  public text?: string
}

export class CreateTableStatement extends Statement {
  public schemaName?: string
  public objectName?: string
  public temporary = false
  public virtual = false
  public ifNotExists = false
  public selectClause?: string
}

export class CreateIndexStatement extends Statement {
  public schemaName?: string
  public objectName?: string
  public tableName?: string
  public unique = false
  public ifNotExists = false
}

export class IndexColumn {

}

export class CreateViewStatement extends Statement {
  public schemaName?: string
  public objectName?: string
  public temporary = false
  public ifNotExists = false
}

export class CreateTriggerStatement extends Statement {
  public schemaName?: string
  public objectName?: string
  public temporary = false
  public ifNotExists = false
}

export class AlterTableStatement extends Statement {
  public schemaName?: string
  public objectName?: string
}

export class DropTableStatement extends Statement {
  public schemaName?: string
  public objectName?: string
  public ifExists = false
}

export class DropIndexStatement extends Statement {
  public schemaName?: string
  public objectName?: string
  public ifExists = false
}

export class DropViewStatement extends Statement {
  public schemaName?: string
  public objectName?: string
  public ifExists = false
}

export class DropTriggerStatement extends Statement {
  public schemaName?: string
  public objectName?: string
  public ifExists = false
}

export class AttachDatabaseStatement extends Statement {
}

export class DetachDatabaseStatement extends Statement {
}

export class PragmaStatement extends Statement {
}

export class Sqlite3Parser {
  private pos = 0
  private tokens: Token[]

  constructor(
    public input: string,
  ) {
    this.tokens = tokenize(input, "sqlite3")
  }

  root() {
    const root = []
    let stmt
    if (stmt = this.statement()) {
      root.push(stmt)
    }
    while (true) {
      this.consume(TokenType.SemiColon)
      if (stmt = this.statement()) {
        root.push(stmt)
      }
    }
    return root
  }

  statement() {
    const token1 = this.token(0)
    if (!token1) {
      return null
    }

    const start = token1.start

    let stmt, token, bodyStart
    if (this.consumeIfMatch(Reserved.Create)) {
      let temporary = false
      let virtual = false
      let unique = false
      while (token = this.token(0)) {
        if (token.type === TokenType.SemiColon) {
          break
        } else if (this.consumeIfMatch(Reserved.Table)) {
          stmt = new CreateTableStatement()
          stmt.temporary = temporary
          stmt.virtual = virtual
          break
        } else if (this.consumeIfMatch(Reserved.Index)) {
          stmt = new CreateIndexStatement()
          stmt.unique = unique
          break
        } else if (this.consumeIfMatch(Reserved.View)) {
          stmt = new CreateViewStatement()
          break
        } else if (this.consumeIfMatch(Reserved.Trigger)) {
          stmt = new CreateTriggerStatement()
          stmt.temporary = temporary
          break
        } else if (this.consumeIfMatch(Reserved.Virtual)) {
          virtual = true
        } else if (
          this.consumeIfMatch(Reserved.Temp) ||
          this.consumeIfMatch(Reserved.Temporary)
        ) {
          temporary = true
        } else if (this.consumeIfMatch(Reserved.Unique)) {
          unique = true
        } else {
          this.consume()
        }
      }

      if (stmt) {
        if (this.consumeIfMatch(Reserved.If)) {
          this.consume(Reserved.Not)
          this.consume(Reserved.Exists)
          stmt.ifNotExists = true
        }

        const result = this.objectName()
        stmt.schemaName = result.schemaName
        stmt.objectName = result.objectName
      }

      if (stmt instanceof CreateTableStatement) {
        if (!stmt.virtual) {
          if (this.consumeIfMatch(TokenType.LeftParen)) {
            //TODO
            this.consume(TokenType.RightParen)
            if (this.consumeIfMatch(Reserved.Without)) {
              this.consume(Reserved.Rowid)
            }
          } else {
            this.consume(Reserved.As)
            bodyStart = this.token(0).start
          }
        } else {
          this.consume(Reserved.Using)
          this.consume(TokenType.LeftParen)
          // TODO
          this.consume(TokenType.RightParen)
        }
      } else if (stmt instanceof CreateIndexStatement) {
        this.consume(Reserved.On)
        if (token = this.consumeIfMatch(TokenType.QuotedIdentifier)) {
          stmt.tableName = unescapeIdentifier(token.text)
        } else if (token = this.consumeIfMatch(TokenType.QuotedValue)) {
          stmt.tableName = unescapeIdentifier(token.text)
        } else {
          token = this.consume(TokenType.Identifier)
          stmt.tableName = token.text
        }
        this.consume(TokenType.LeftParen)
        // TODO
        this.consume(TokenType.RightParen)
      }
    } else if (this.consumeIfMatch(Reserved.Alter)) {
      while (token = this.token(0)) {
        if (token.type === TokenType.SemiColon) {
          break
        } else if (this.consumeIfMatch(Reserved.Table)) {
          stmt = new AlterTableStatement()
          break
        } else {
          this.consume()
        }
      }

      if (stmt) {
        const result = this.objectName()
        stmt.schemaName = result.schemaName
        stmt.objectName = result.objectName
      }
    } else if (this.consumeIfMatch(Reserved.Drop)) {
      while (token = this.token(0)) {
        if (token.type === TokenType.SemiColon) {
          break
        } else if (this.consumeIfMatch(Reserved.Table)) {
          stmt = new DropTableStatement()
          break
        } else if (this.consumeIfMatch(Reserved.Index)) {
          stmt = new DropIndexStatement()
          break
        } else if (this.consumeIfMatch(Reserved.View)) {
          stmt = new DropViewStatement()
          break
        } else if (this.consumeIfMatch(Reserved.Trigger)) {
          stmt = new DropTriggerStatement()
          break
        } else {
          this.consume()
        }
      }

      if (stmt) {
        if (this.consumeIfMatch(Reserved.If)) {
          this.consume(Reserved.Exists)
          stmt.ifExists = true
        }

        const result = this.objectName()
        stmt.schemaName = result.schemaName
        stmt.objectName = result.objectName
      }
    } else if (this.consumeIfMatch(Reserved.Attach)) {
      if (this.consumeIfMatch(Reserved.Database)) {
        stmt = new AttachDatabaseStatement()
      }
    } else if (this.consumeIfMatch(Reserved.Detach)) {
      if (this.consumeIfMatch(Reserved.Database)) {
        stmt = new DetachDatabaseStatement()
      }
    } else if (this.consumeIfMatch(Reserved.Pragma)) {
      stmt = new PragmaStatement()
    }

    if (!stmt) {
      stmt = new Statement()
    }

    while (token = this.token(0)) {
      if (token.type === TokenType.SemiColon) {
        break
      }
      this.consume()
    }
    const end = this.token(-1).end
    stmt.text = this.input.substring(start, end)

    if (bodyStart) {
      if (stmt instanceof CreateTableStatement) {
        stmt.selectClause = this.input.substring(bodyStart, end)
      }
    }

    return stmt
  }

  objectName() {
    const result: {schemaName?: string, objectName?: string} = {}

    let token
    if (token = this.consumeIfMatch(TokenType.QuotedIdentifier)) {
      result.objectName = unescapeIdentifier(token.text)
    } else if (token = this.consumeIfMatch(TokenType.QuotedValue)) {
      result.objectName = unescapeIdentifier(token.text)
    } else {
      token = this.consume(TokenType.Identifier)
      result.objectName = token.text
    }
    if (this.consumeIfMatch(TokenType.Dot)) {
      result.schemaName = result.objectName
      if (token = this.consumeIfMatch(TokenType.QuotedIdentifier)) {
        result.objectName = unescapeIdentifier(token.text)
      } else if (token = this.consumeIfMatch(TokenType.QuotedValue)) {
        result.objectName = unescapeIdentifier(token.text)
      } else {
        token = this.consume(TokenType.Identifier)
        result.objectName = token.text
      }
    }

    return result
  }

  token(pos: number) {
    return this.tokens[this.pos + pos]
  }

  consume(type?: TokenType) {
    const token = this.tokens[this.pos]
    if (!token) {
      throw new Error(`Unexpected token: EOF`)
    } else if (type instanceof Reserved) {
      if (token.value !== type) {
        throw new Error(`Unexpected token: ${token.text}`)
      }
    } else if (type instanceof TokenType) {
      if (token.type !== type) {
        throw new Error(`Unexpected token: ${token.text}`)
      }
    }

    this.pos++
    return token
  }

  consumeIfMatch(type: TokenType) {
    const token = this.tokens[this.pos]
    if (!token) {
      return null
    } else if (type instanceof Reserved) {
      if (token.value !== type) {
        return null
      }
    } else if (type instanceof TokenType) {
      if (token.type !== type) {
        return null
      }
    }

    this.pos++
    return token
  }
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
