import { Token } from "./parser"

export abstract class Statement {
  filename?: string
  tokens = new Array<Token>()
  markers = new Map<string, number>()

  validate() {

  }

  process(vdb: VDatabase) {

  }

  summary() {
    let text = ""
    for (const token of this.tokens) {
      const hasSpace = text.length > 0 && token.before.length > 0
      const len = text.length + token.text.length + (hasSpace ? 1 : 0)
      if (len > 50) {
        return text + " ..."
      } else {
        text += (hasSpace ? " " : "") + token.text
      }
    }
    return text
  }
}


export class VDatabase {
  defaultSchemaName?: string
  schemas = new Map<string, VSchema>()
  collations = new Map<string, VCollation>()
}

export class VSchema {
  private objects = new Map<string, VObject>()
  public dropped = false

  constructor(
    public name: string,
    public system = false,
  ) {
  }

  add(name: string, obj: VObject) {
    this.objects.set(name, obj)
    return obj
  }

  get(name: string) {
    return this.objects.get(name)
  }

  [Symbol.iterator]() {
    return this.objects.values()
  }
}

export class VCollation {
  constructor(
    public name: string,
  ) {
  }
}

export class VObject {
  public dropped = false

  constructor(
    public type: string,
    public schemaName: string,
    public name: string,
    public tableName?: string,
  ) {
  }
}

