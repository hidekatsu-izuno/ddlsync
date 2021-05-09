import { TokenType, Reserved, Token, tokenize } from "./tokenizer"

export class Statement {
  public text?: string
}

export class CreateTableStatement extends Statement {
  public schemaName?: string
  public objectName?: string
  public temporary = false
  public virtual = false
  public asSelect = false
  public ifNotExists = false
  public columns?: TableColumn[]
  public constraints?: TableConstraint[]
  public body?: Token[]
}

export class CreateIndexStatement extends Statement {
  public schemaName?: string
  public objectName?: string
  public tableName?: string
  public unique = false
  public ifNotExists = false
  public columns?: IndexColumn[]
  public where?: Token[]
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

export class TableColumn {

}

export class TableConstraint {

}

export class IndexColumn {

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
    let stmt, token
    if (stmt = this.statement()) {
      root.push(stmt)
    }
    while (this.consumeIf(TokenType.SemiColon)) {
      if (stmt = this.statement()) {
        root.push(stmt)
      }
    }
    if (token = this.tokens[this.pos]) {
      throw new Error(`Unexpected token: ${token.text}`)
    }
    return root
  }

  statement() {
    const token1 = this.tokens[this.pos]
    if (!token1) {
      return null
    }

    const start = token1.start

    let stmt
    if (this.consumeIf(Reserved.Create)) {
      let temporary = false
      let virtual = false
      let unique = false
      for (let token; token = this.tokens[this.pos]; token && token.type !== TokenType.SemiColon) {
        if (this.consumeIf(Reserved.Table)) {
          stmt = new CreateTableStatement()
          stmt.temporary = temporary
          stmt.virtual = virtual
          break
        } else if (this.consumeIf(Reserved.Index)) {
          stmt = new CreateIndexStatement()
          stmt.unique = unique
          break
        } else if (this.consumeIf(Reserved.View)) {
          stmt = new CreateViewStatement()
          break
        } else if (this.consumeIf(Reserved.Trigger)) {
          stmt = new CreateTriggerStatement()
          stmt.temporary = temporary
          break
        } else if (this.consumeIf(Reserved.Virtual)) {
          virtual = true
        } else if (
          this.consumeIf(Reserved.Temp) ||
          this.consumeIf(Reserved.Temporary)
        ) {
          temporary = true
        } else if (this.consumeIf(Reserved.Unique)) {
          unique = true
        } else {
          this.consume()
        }
      }

      if (stmt) {
        if (this.consumeIf(Reserved.If)) {
          this.consume(Reserved.Not)
          this.consume(Reserved.Exists)
          stmt.ifNotExists = true
        }

        stmt.objectName = this.identifier()
        if (this.consumeIf(TokenType.Dot)) {
          stmt.schemaName = stmt.objectName
          stmt.objectName = this.identifier()
        }
      }

      if (stmt instanceof CreateTableStatement) {
        if (!stmt.virtual) {
          stmt.columns = []
          stmt.constraints = []
          if (this.consumeIf(TokenType.LeftParen)) {
            stmt.columns.push(this.tableColumn())
            while (this.consumeIf(TokenType.Comma)) {
              const token = this.tokens[this.pos]
              if (token.value instanceof Reserved) {
                stmt.constraints.push(this.tableConstraint())
                while (this.consumeIf(TokenType.Comma)) {
                  stmt.constraints.push(this.tableConstraint())
                }
                break
              } else {
                stmt.columns.push(this.tableColumn())
              }
            }
            this.consume(TokenType.RightParen)
            if (this.consumeIf(Reserved.Without)) {
              this.consume(Reserved.Rowid)
            }
          } else {
            this.consume(Reserved.As)
            stmt.asSelect = true
            const bodyStart = this.pos
            for (let token; token = this.tokens[this.pos]; token && token.type !== TokenType.SemiColon) {
              this.consume()
            }
            stmt.body = this.tokens.slice(bodyStart, this.pos)
          }
        } else {
          this.consume(Reserved.Using)
          this.consume(TokenType.LeftParen)
          const bodyStart = this.pos
          for (let token; token = this.tokens[this.pos]; token && token.type !== TokenType.SemiColon) {
            if (token.type === TokenType.RightParen) {
              stmt.body = this.tokens.slice(bodyStart, this.pos)
              this.consume()
              break;
            } else {
              this.consume()
            }
          }
        }
      } else if (stmt instanceof CreateIndexStatement) {
        this.consume(Reserved.On)
        let token
        if (token = this.consumeIf(TokenType.QuotedIdentifier)) {
          stmt.tableName = unescapeIdentifier(token.text)
        } else if (token = this.consumeIf(TokenType.QuotedValue)) {
          stmt.tableName = unescapeIdentifier(token.text)
        } else {
          token = this.consume(TokenType.Identifier)
          stmt.tableName = token.text
        }
        stmt.columns = []
        this.consume(TokenType.LeftParen)
        stmt.columns.push(this.indexColumn())
        while (this.consumeIf(TokenType.Comma)) {
          stmt.columns.push(this.indexColumn())
        }
        this.consume(TokenType.RightParen)
        if (this.consumeIf(Reserved.Where)) {
          const whereStart = this.pos
          for (let token; token = this.tokens[this.pos]; token && token.type !== TokenType.SemiColon) {
            this.consume()
          }
          stmt.where = this.tokens.slice(whereStart, this.pos)
        }
      }
    } else if (this.consumeIf(Reserved.Alter)) {
      for (let token; token = this.tokens[this.pos]; token && token.type !== TokenType.SemiColon) {
        if (this.consumeIf(Reserved.Table)) {
          stmt = new AlterTableStatement()
          break
        } else {
          this.consume()
        }
      }

      if (stmt) {
        stmt.objectName = this.identifier()
        if (this.consumeIf(TokenType.Dot)) {
          stmt.schemaName = stmt.objectName
          stmt.objectName = this.identifier()
        }
      }
    } else if (this.consumeIf(Reserved.Drop)) {
      for (let token; token = this.tokens[this.pos]; token && token.type !== TokenType.SemiColon) {
        if (this.consumeIf(Reserved.Table)) {
          stmt = new DropTableStatement()
          break
        } else if (this.consumeIf(Reserved.Index)) {
          stmt = new DropIndexStatement()
          break
        } else if (this.consumeIf(Reserved.View)) {
          stmt = new DropViewStatement()
          break
        } else if (this.consumeIf(Reserved.Trigger)) {
          stmt = new DropTriggerStatement()
          break
        } else {
          this.consume()
        }
      }

      if (stmt) {
        if (this.consumeIf(Reserved.If)) {
          this.consume(Reserved.Exists)
          stmt.ifExists = true
        }

        stmt.objectName = this.identifier()
        if (this.consumeIf(TokenType.Dot)) {
          stmt.schemaName = stmt.objectName
          stmt.objectName = this.identifier()
        }
      }
    } else if (this.consumeIf(Reserved.Attach)) {
      if (this.consumeIf(Reserved.Database)) {
        stmt = new AttachDatabaseStatement()
      }
    } else if (this.consumeIf(Reserved.Detach)) {
      if (this.consumeIf(Reserved.Database)) {
        stmt = new DetachDatabaseStatement()
      }
    } else if (this.consumeIf(Reserved.Pragma)) {
      stmt = new PragmaStatement()
    }

    if (!stmt) {
      stmt = new Statement()
    }

    for (let token; token = this.tokens[this.pos]; token && token.type !== TokenType.SemiColon) {
      this.consume()
    }

    const end = this.tokens[this.pos - 1].end
    stmt.text = this.input.substring(start, end)

    return stmt
  }

  identifier() {
    let token
    if (token = this.consumeIf(TokenType.QuotedIdentifier)) {
      return unescapeIdentifier(token.text)
    } else if (token = this.consumeIf(TokenType.QuotedValue)) {
      return unescapeIdentifier(token.text)
    } else {
      token = this.consume(TokenType.Identifier)
      return token.text
    }
  }

  tableColumn() {
    //TODO
    return []
  }

  tableConstraint() {
    //TODO
    return []
  }

  indexColumn() {
    //TODO
    return []
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

  consumeIf(type: TokenType) {
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
