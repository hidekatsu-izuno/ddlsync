export class Table {
  public mode: string
  public schema?: string
  public name: string
  public temporary: boolean = false
  public ifNotExists: boolean = false
  public withoutRowid: boolean = false
  public columns: Column[] = []
  public constraints: Constraint[] = []

  constructor(mode: string, name: string) {
    this.mode = mode
    this.name = name
  }
}

export class Column {
  public mode: string
  public name: string
  public type?: string
  public len?: number
  public scale?: number

  public constraintName?: string

  constructor(mode: string, name: string) {
    this.mode = mode
    this.name = name
  }
}

export class Constraint {
  public mode: string
  public name: string

  constructor(mode: string, name: string) {
    this.mode = mode
    this.name = name
  }
}
