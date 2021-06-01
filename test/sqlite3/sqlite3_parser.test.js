const model = require("../../src/sqlite3/sqlite3_models")
const { Sqlite3Parser } = require ("../../src/sqlite3/sqlite3_parser")

describe("parse", () => {
  test.each([
    [""],
    [";"],
    ["  "],
    ["--test"],
    ["/*test*/"],
    [" /*test*/;  --test"],
  ])("empty imput \"%s\"", (input) => {
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(0)
  })

  test.each([
    [".help", ".help", []],
    [".read test.db", ".read", ["test.db"]],
    [".read \"test test.db\"", ".read", ["test test.db"]],
    [".read 'test test.db'", ".read", ["test test.db"]],
    [".read `test test.db`", ".read", ["`test", "test.db`"]],
  ])("command %s", (input, name, args) => {
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CommandStatement)
    expect(result[0].name).toBe(name)
    expect(result[0].args).toStrictEqual(args)
  })

  test("attach database", () => {
    const input = `ATTACH DATABASE "x.db" as x`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.AttachDatabaseStatement)
    expect(result[0].name).toBe("x")
  })

  test("detach database", () => {
    const input = `DETACH DATABASE x`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DetachDatabaseStatement)
    expect(result[0].name).toBe("x")
  })

  test.each([
    ["", false],
    ["temporary", true],
    ["temp", true]
  ])("create %s table", (modifier, temporary) => {
    const input = `CREATE ${modifier} TABLE x (x)`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateTableStatement)
    expect(result[0].ifNotExists).toBe(false)
    expect(result[0].temporary).toBe(temporary)
    expect(result[0].virtual).toBe(false)
    expect(result[0].asSelect).toBe(false)
    expect(result[0].name).toBe("x")
    expect(result[0].columns?.length).toBe(1)
    expect(result[0].columns[0]?.name).toBe("x")
  })

  test.each([
    ["x", "x", []],
    ["x (x)", "x", ["x"]],
    ["xyz( x1, y2)", "xyz", ["x1", "y2"]],
  ])("create virtual table", (command, name, args) => {
    const input = `CREATE VIRTUAL TABLE x USING ${command}`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateTableStatement)
    expect(result[0].temporary).toBe(false)
    expect(result[0].virtual).toBe(true)
    expect(result[0].asSelect).toBe(false)
    expect(result[0].name).toBe("x")
    expect(result[0].moduleName).toBe(name)
    expect(result[0].moduleArgs).toStrictEqual(args)
    expect(result[0].columns).toBe(undefined)
  })

  test("create table as select", () => {
    const input = `CREATE TABLE x AS SELECT * FROM x`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateTableStatement)
    expect(result[0].temporary).toBe(false)
    expect(result[0].virtual).toBe(false)
    expect(result[0].asSelect).toBe(true)
    expect(result[0].name).toBe("x")
    expect(result[0].moduleName).toBe(undefined)
    expect(result[0].moduleArgs).toStrictEqual(undefined)
    expect(result[0].columns).toBe(undefined)
  })

  test("drop table", () => {
    const input = `DROP TABLE x`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DropTableStatement)
    expect(result[0].name).toBe("x")
    expect(result[0].ifExists).toBe(false)
  })

  test.each([
    ["", false],
    ["temporary", true],
    ["temp", true]
  ])("create %s view", (modifier, temporary) => {
    const input = `CREATE ${modifier} VIEW x AS SELECT * FROM x`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateViewStatement)
    expect(result[0].temporary).toBe(temporary)
    expect(result[0].name).toBe("x")
    expect(result[0].columns).toBe(undefined)
  })

  test("drop view", () => {
    const input = `DROP VIEW x`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DropViewStatement)
    expect(result[0].name).toBe("x")
  })
})
