import { Token } from "./parser"

export abstract class Statement {
  filename?: string
  tokens = new Array<Token>()
  markers = new Map<string, number>()

  validate() {

  }

  process(vdb: VDatabase): any {

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

export interface IExpression {

}

export class VDatabase {
  defaultSchema?: string
  private schemas = new Map<string, VSchema>()
  private collations = new Map<string, VCollation>()

  constructor(
    public comparator = ((key: string) => key)
  ) {
  }

  addSchema(name: string, system = false) {
    const schema = new VSchema(this, name, system)
    this.schemas.set(this.comparator(name), schema)
    return schema
  }

  getSchema(name: string) {
    return this.schemas.get(this.comparator(name))
  }

  addCollation(name: string) {
    const collation = new VCollation(name)
    this.collations.set(this.comparator(name), collation)
    return collation
  }

  getCollation(name: string) {
    return this.collations.get(this.comparator(name))
  }
}

export class VSchema {
  private objects = new Map<string, VObject>()
  public dropped = false

  constructor(
    private vdb: VDatabase,
    public name: string,
    public system = false,
  ) {
  }

  addObject(type: string, name: string, target?: VObject) {
    const vobj = new VObject(this, type, name, target)
    this.objects.set(this.vdb.comparator(name), vobj)
    return vobj
  }

  getObject(name: string) {
    return this.objects.get(this.vdb.comparator(name))
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
    public schema: VSchema,
    public type: string,
    public name: string,
    public target?: VObject,
  ) {
  }
}

