const model = require("../../src/sqlite3/sqlite3_models")
const { Sqlite3Parser } = require ("../../src/sqlite3/sqlite3_parser")

describe("test sqlite3_parser", () => {
  test.each([
    [""],
    [";"],
    ["  "],
    ["--test"],
    ["/*test*/"],
    [" /*test*/;  --test"],
  ])("empty input %#", (input) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(0)
  })

  test.each([
    ["SELECT 1; SELECT 2"],
  ])("multi statement %#", (input) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(2)
  })

  test.each([
    [".help",
      { name:".help", args: [] }],
    [".read test.db",
      { name: ".read", args: ["test.db"] }],
    [".read \"test test.db\"",
      { name: ".read", args: ["test test.db"] }],
    [".read 'test test.db'",
      { name: ".read", args: ["test test.db"] }],
    [".read `test test.db`",
      { name: ".read", args: ["`test", "test.db`"] }],
  ])("command %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CommandStatement)
    expect(result[0].name).toBe(expected.name)
    expect(result[0].args).toStrictEqual(expected.args)
  })

  test.each([
    ["ATTACH DATABASE 'x.db' as x",
      { name: "x", expr: ["'x.db'"] }]
  ])("attach database %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.AttachDatabaseStatement)
    expect(result[0].name).toBe(expected.name)
    expect(result[0].expr.map(t => t.text)).toStrictEqual(expected.expr)
  })

  test.each([
    ["DETACH DATABASE x",
      { name: "x" }]
  ])("detach database %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DetachDatabaseStatement)
    expect(result[0].name).toBe("x")
  })

  test.each([
    ["CREATE TABLE x (x)",
      { name: "x", columns: [ { name: "x", dataType: { name: "" } } ]}],
    ["create table if not exists x (x)",
      { name: "x", ifNotExists: true, columns: [ { name: "x", dataType: { name: "" }} ]}],
    ["CREATE TABLE 'x' (`a1` char, \"a2\", a3 int)",
      { name: "x", columns: [ { name: "a1", dataType: { name: "char" } }, { name: "a2", dataType: { name: "" } }, { name: "a3", dataType: { name: "int" } } ] }],
    ["CREATE TABLE \"x\" AS SELECT * FROM x",
      { name: "x", asSelect: true }],
    ["Create Temporary Table x (x)",
      { name: "x", temporary: true, columns: [ { name: "x", dataType: { name: "" } } ]}],
    ["CREATE TEMPORARY TABLE IF NOT EXISTS x (x)",
      { name: "x", temporary: true, ifNotExists: true, columns: [ { name: "x", dataType: { name: "" } } ]}],
    ["CREATE temp table [x] (x)",
      { name: "x", temporary: true, columns: [ { name: "x", dataType: { name: "" } } ]}],
    ["CREATE TEMP TABLE If Not Exists 'x' (x)",
      { name: "x", temporary: true, ifNotExists: true, columns: [ { name: "x", dataType: { name: "" } } ]}]
  ])("create table %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateTableStatement)
    expect(result[0].ifNotExists).toBe(expected.ifNotExists || false)
    expect(result[0].temporary).toBe(expected.temporary || false)
    expect(result[0].virtual).toBe(expected.virtual || false)
    expect(result[0].asSelect).toBe(expected.asSelect || false)
    expect(result[0].name).toBe(expected.name)
    expect(result[0].columns?.length).toBe(expected.columns?.length)
    for (let i = 0; i < 3; i++) {
      expect(result[0].columns?.[i]?.name).toBe(expected.columns?.[i]?.name)
      expect(result[0].columns?.[i]?.dataType?.name).toBe(expected.columns?.[i]?.dataType?.name)
      expect(result[0].columns?.[i]?.dataType?.length).toBe(expected.columns?.[i]?.dataType?.length)
      expect(result[0].columns?.[i]?.dataType?.scale).toBe(expected.columns?.[i]?.dataType?.scale)
    }
  })

  test.each([
    ["CREATE VIRTUAL TABLE x USING x",
      { name: "x", virtual: true, moduleName: "x", moduleArgs: [] }],
    ["CREATE VIRTUAL TABLE x USING x (x)",
      { name: "x", virtual: true, moduleName: "x", moduleArgs: ["x"] }],
    ["CREATE VIRTUAL TABLE x USING xyz( x1, y2)",
    { name: "x", virtual: true, moduleName: "xyz", moduleArgs: ["x1", "y2"] }],
  ])("create virtual table %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateTableStatement)
    expect(result[0].temporary).toBe(expected.temporary || false)
    expect(result[0].virtual).toBe(expected.virtual || false)
    expect(result[0].asSelect).toBe(expected.asSelect || false)
    expect(result[0].name).toBe(expected.name)
    expect(result[0].moduleName).toBe(expected.moduleName)
    expect(result[0].moduleArgs).toStrictEqual(expected.moduleArgs)
    expect(result[0].columns?.length).toBe(expected.columns?.length)
  })

  test.each([
    ["DROP TABLE x",
      { table: { name: "x"} }],
    ["DROP TABLE IF EXISTS x",
      { table: { name: "x"}, ifExists: true }],
  ])("drop table %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DropTableStatement)
    expect(result[0].table.name).toBe(expected.table.name)
    expect(result[0].ifExists).toBe(expected.ifExists || false)
  })

  test.each([
    ["CREATE VIEW x AS SELECT * FROM x",
      { name: "x" }],
    ["CREATE TEMPORARY VIEW x AS SELECT * FROM x",
      { name: "x", temporary: true }],
    ["CREATE TEMP VIEW x AS SELECT * FROM x",
      { name: "x", temporary: true }]
  ])("create view %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateViewStatement)
    expect(result[0].name).toBe(expected.name)
    expect(result[0].temporary).toBe(expected.temporary || false)
    expect(result[0].columns?.length).toBe(expected.columns?.length)
  })

  test.each([
    ["DROP VIEW x",
      { view: { name: "x" } }],
    ["DROP VIEW IF EXISTS x",
      { view: { name: "x" }, ifExists: true }],
    ["DROP VIEW main.x",
      { view: { schema: "main", name: "x" } }],
    ["DROP VIEW IF EXISTS temp.x",
      { view: { schema: "temp", name: "x" }, ifExists: true }],
  ])("drop view %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DropViewStatement)
    expect(result[0].view.schema).toBe(expected.view.schema)
    expect(result[0].view.name).toBe(expected.view.name)
    expect(result[0].ifExists).toBe(expected.ifExists || false)
  })

  test.each([
    ["CREATE TRIGGER x BEFORE DELETE ON y BEGIN SELECT 1; END",
      { name: "x" }],
    ["CREATE TEMPORARY TRIGGER x BEFORE DELETE ON y BEGIN SELECT 1; END",
      { name: "x", temporary: true }],
    ["CREATE TEMP TRIGGER x BEFORE DELETE ON y BEGIN SELECT 1; UPDATE a SET x = 1; END",
      { name: "x", temporary: true }]
  ])("create trigger %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateTriggerStatement)
    expect(result[0].temporary).toBe(expected.temporary || false)
    expect(result[0].name).toBe(expected.name)
    expect(result[0].columns?.length).toBe(expected.columns?.length)
  })

  test.each([
    ["DROP TRIGGER x",
      { trigger: { name: "x" } }],
    ["DROP TRIGGER IF EXISTS x",
      { trigger: { name: "x" }, ifExists: true }],
    ["DROP TRIGGER main.x",
      { schema: "main", trigger: { name: "x" } }],
    ["DROP TRIGGER IF EXISTS temp.x",
      { trigger: { schema: "temp", name: "x" }, ifExists: true }],
  ])("drop trigger %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DropTriggerStatement)
    expect(result[0].name).toBe(expected.name)
    expect(result[0].ifExists).toBe(expected.ifExists || false)
  })

  test.each([
    ["CREATE INDEX ix ON x (y)",
      { name: "ix", table: { name: "x" }, columns: [{ name: "y",  sortOrder: "ASC" }] }],
    ["CREATE UNIQUE INDEX ix ON x (y ASC)",
      { name: "ix", type: "UNIQUE", table: { name: "x" }, columns: [{ name: "y", sortOrder: "ASC" }] }],
    ["CREATE INDEX ix ON x (y1 DESC, y2 ASC)",
      { name: "ix", table: { name: "x" }, columns: [{ name: "y1", sortOrder: "DESC" }, { name: "y2", sortOrder: "ASC" }] }]
  ])("create index %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateIndexStatement)
    expect(result[0].name).toBe(expected.name)
    expect(result[0].type).toBe(expected.type)
    expect(result[0].table.name).toBe(expected.table.name)
    expect(result[0].columns?.length).toBe(expected.columns?.length)
    expect(result[0].columns?.[0]?.name).toBe(expected.columns?.[0]?.name)
    expect(result[0].columns?.[0]?.sortOrder).toBe(expected.columns?.[0]?.sortOrder)
  })

  test.each([
    ["DROP INDEX x",
      { index: { name: "x" } }],
    ["DROP INDEX main.x",
      { index: { schema: "main", name: "x" } }],
    ["DROP INDEX IF EXISTS x",
      { index: { name: "x" }, ifExists: true }],
    ["DROP INDEX IF EXISTS temp.x",
      { index: { schema: "temp", name: "x" }, ifExists: true }],
  ])("drop index %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DropIndexStatement)
    expect(result[0].index.schema).toBe(expected.index.schema)
    expect(result[0].index.name).toBe(expected.index.name)
    expect(result[0].ifExists).toBe(expected.ifExists || false)
  })

  test.each([
    ["REINDEX x",
      {name: "x"}],
  ])("reindex %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.ReindexStatement)
    expect(result[0].name).toBe(expected.name)
  })

  test.each([
    ["VACUUM",
      {}],
    ["VACUUM x",
      { schema: "x" }],
  ])("vacuum %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.VacuumStatement)
    expect(result[0].schema).toBe(expected.schema)
  })

  test.each([
    ["ANALYZE x",
      { name: "x" }],
  ])("analyze %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.AnalyzeStatement)
    expect(result[0].name).toBe(expected.name)
  })

  test.each([
    ["EXPLAIN SELECT * FROM x"],
  ])("explain %#", (input) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.ExplainStatement)
  })

  test.each([
    ["BEGIN"],
    ["BEGIN DEFERRED"],
    ["BEGIN IMMEDIATE"],
    ["BEGIN EXCLUSIVE"],
    ["BEGIN TRANSACTION"],
    ["BEGIN DEFERRED TRANSACTION"],
    ["BEGIN IMMEDIATE TRANSACTION"],
    ["BEGIN EXCLUSIVE TRANSACTION"],
  ])("begin transaction %#", (input) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.BeginTransactionStatement)
  })

  test.each([
    ["SAVEPOINT x",
      { name: "x" } ]
  ])("savepoint %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.SavepointStatement)
    expect(result[0].name).toBe(expected.name)
  })

  test.each([
    ["RELEASE SAVEPOINT x", { savepoint: "x" }]
  ])("release savepoint %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.ReleaseSavepointStatement)
    expect(result[0].savepoint).toBe(expected.savepoint)
  })

  test.each([
    ["COMMIT"],
    ["COMMIT TRANSACTION"],
    ["END"],
    ["END TRANSACTION"],
  ])("commit transaction %#", (input) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CommitTransactionStatement)
  })

  test.each([
    ["ROLLBACK", {}],
    ["ROLLBACK TRANSACTION", {}],
    ["ROLLBACK TO x", { savepoint: "x" }],
    ["ROLLBACK TRANSACTION TO x", { savepoint: "x" }],
    ["ROLLBACK TO SAVEPOINT x", { savepoint: "x" }],
    ["ROLLBACK TRANSACTION TO SAVEPOINT x", { savepoint: "x" }],
  ])("commit transaction %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.RollbackTransactionStatement)
    expect(result[0].savepoint).toBe(expected.savepoint)
  })

  test.each([
    ["PRAGMA x", { name: "x"}],
    ["PRAGMA x = 1", { name: "x", value: ["1"]}],
    ["PRAGMA x ('1')", { name: "x", value: ["'1'"]}],
    ["PRAGMA x (-1)", { name: "x", value: ["-", "1"]}],
  ])("pragmra %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.PragmaStatement)
    expect(result[0].name).toBe(expected.name)
    expect(result[0].value?.map(t => t.text)).toStrictEqual(expected.value)
  })

  test.each([
    ["INSERT INTO x (x) VALUES (1)", { table: { name: "x" } }],
    ["REPLACE INTO x (x) VALUES (1)", { table: { name: "x" } }],
    ["INSERT OR ABORT INTO x (x, y, z) VALUES (1, 2, 3)", { table: { name: "x" }, conflictAction: "ABORT" }],
    ["INSERT OR FAIL INTO main.x (x) VALUES (1)", { table: { schema: "main", name: "x" }, conflictAction: "FAIL" }],
    ["INSERT OR IGNORE INTO x (x) VALUES (1)", { table: { name: "x" }, conflictAction: "IGNORE" }],
    ["INSERT OR REPLACE INTO x (x) VALUES (1)", { table: { name: "x" }, conflictAction: "REPLACE" }],
    ["INSERT OR ROLLBACK INTO temp.x (x) VALUES (1)", { table: { schema: "temp", name: "x" }, conflictAction: "ROLLBACK" }],
    ["WITH c AS (SELECT 1) INSERT INTO x (x) VALUES (1)", { table: { name: "x" } }],
    ["WITH c AS (SELECT 1) REPLACE INTO x (x) VALUES (1)", { table: { name: "x" } }],
  ])("insert %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.InsertStatement)
    expect(result[0].table.schema).toBe(expected.table.schema)
    expect(result[0].table.name).toBe(expected.table.name)
  })

  test.each([
    ["UPDATE x SET x = 1 WHERE x = 1", { table: { name: "x" } }],
    ["UPDATE OR ABORT main.x SET x = 1 WHERE x = 1", { table: { schema: "main", name: "x" } }],
    ["UPDATE OR FAIL x SET x = 1 WHERE x = 1", { table: { name: "x" } }],
    ["UPDATE OR IGNORE temp.x SET x = 1 WHERE x = 1", { table: { schema: "temp", name: "x" } }],
    ["UPDATE OR REPLACE x SET x = 1 WHERE x = 1", { table: { name: "x" } }],
    ["UPDATE OR ROLLBACK x SET x = 1 WHERE x = 1", { table: { name: "x" } }],
    ["WITH c AS (SELECT 1) UPDATE x SET x = 1 WHERE x = 1", { table: { name: "x" } }],
  ])("update %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.UpdateStatement)
    expect(result[0].table.schema).toBe(expected.table.schema)
    expect(result[0].table.name).toBe(expected.table.name)
  })

  test.each([
    ["DELETE FROM x WHERE x = 1", { table: { name: "x" } }],
    ["DELETE FROM main.x WHERE x = 1", { table: { schema: "main", name: "x" } }],
    ["WITH c AS (SELECT 1) DELETE FROM x WHERE x = 1", { table: { name: "x" } }],
  ])("delete %#", (input, expected) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DeleteStatement)
    expect(result[0].table.schema).toBe(expected.table.schema)
    expect(result[0].table.name).toBe(expected.table.name)
  })

  test.each([
    ["SELECT a, b, c FROM x"],
    ["WITH c AS (SELECT 1) SELECT a, b, c FROM c"],
    ["WITH c1 (cc1) AS (SELECT 1), c2 AS (SELECT 2 FROM c2) SELECT a, b, c FROM c1, c2"],
  ])("select %#", (input) => {
    const result = new Sqlite3Parser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.SelectStatement)
  })
})
