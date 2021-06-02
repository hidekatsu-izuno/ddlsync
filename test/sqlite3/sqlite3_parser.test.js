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
    ["", false],
    ["temporary", true],
    ["temp", true]
  ])("create %s table if not exists", (modifier, temporary) => {
    const input = `CREATE ${modifier} TABLE IF NOT EXISTS [a b c] (\`a b c\` text null, d not null, "f""e" int null)`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateTableStatement)
    expect(result[0].ifNotExists).toBe(true)
    expect(result[0].temporary).toBe(temporary)
    expect(result[0].virtual).toBe(false)
    expect(result[0].asSelect).toBe(false)
    expect(result[0].name).toBe("a b c")
    expect(result[0].columns?.length).toBe(3)
    expect(result[0].columns[0]?.name).toBe("a b c")
    expect(result[0].columns[1]?.name).toBe("d")
    expect(result[0].columns[2]?.name).toBe("f\"e")
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

  test.each([
    ["", false],
    ["temporary", true],
    ["temp", true]
  ])("create %s trigger", (modifier, temporary) => {
    const input = `CREATE ${modifier} TRIGGER x BEFORE DELETE ON y BEGIN SELECT 1; END`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateTriggerStatement)
    expect(result[0].temporary).toBe(temporary)
    expect(result[0].name).toBe("x")
    expect(result[0].columns).toBe(undefined)
  })

  test("drop trigger", () => {
    const input = `DROP TRIGGER x`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DropTriggerStatement)
    expect(result[0].name).toBe("x")
    expect(result[0].ifExists).toBe(false)
  })

  test.each([
    ["", undefined],
    ["unique", "UNIQUE"],
  ])("create %s index", (modifier, type) => {
    const input = `CREATE ${modifier} INDEX ix ON x (y DESC)`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateIndexStatement)
    expect(result[0].type).toBe(type)
    expect(result[0].name).toBe("ix")
    expect(result[0].tableName).toBe("x")
    expect(result[0].columns.length).toBe(1)
    //expect(result[0].columns[0].name).toBe("y")
    expect(result[0].columns[0].sortOrder).toBe("DESC")
  })

  test("drop index", () => {
    const input = `DROP INDEX x`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DropIndexStatement)
    expect(result[0].name).toBe("x")
  })

  test("reindex", () => {
    const input = `REINDEX x`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.ReindexStatement)
    expect(result[0].name).toBe("x")
  })

  test("vacuum", () => {
    const input = `VACUUM`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.VacuumStatement)
    expect(result[0].schemaName).toBe(undefined)
  })

  test("analyze", () => {
    const input = `ANALYZE x`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.AnalyzeStatement)
    expect(result[0].name).toBe("x")
  })

  test("explain", () => {
    const input = `EXPLAIN SELECT * FROM x`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.ExplainStatement)
  })

  test("begin transaction", () => {
    const input = `BEGIN TRANSACTION`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.BeginTransactionStatement)
  })

  test("savepoint", () => {
    const input = `SAVEPOINT x`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.SavepointStatement)
    expect(result[0].name).toBe("x")
  })

  test("release savepoint", () => {
    const input = `RELEASE SAVEPOINT x`
    const options = {}
    const result = new Sqlite3Parser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.ReleaseSavepointStatement)
    expect(result[0].savepointName).toBe("x")
  })

  test.each([
    ["COMMIT"],
    ["COMMIT TRANSACTION"],
    ["END"],
    ["END TRANSACTION"],
  ])("commit transaction", (input) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CommitTransactionStatement)
  })

  test.each([
    ["ROLLBACK", undefined],
    ["ROLLBACK TRANSACTION", undefined],
    ["ROLLBACK TO x", "x"],
    ["ROLLBACK TRANSACTION TO x", "x"],
    ["ROLLBACK TO SAVEPOINT x", "x"],
    ["ROLLBACK TRANSACTION TO SAVEPOINT x", "x"],
  ])("commit transaction", (input, savepoint) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.RollbackTransactionStatement)
    expect(result[0].savepointName).toBe(savepoint)
  })
})
