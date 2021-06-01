const model = require("../../src/mysql/mysql_models")
const { MysqlParser } = require ("../../src/mysql/mysql_parser")

describe("parse", () => {
  test.each([
    [""],
    [";"],
    ["  "],
    ["-- test"],
    ["/*test*/"],
    [" /*test*/;  -- test"],
  ])("empty imput \"%s\"", (input) => {
    const options = {}
    const result = new MysqlParser(input, options).root()
    expect(result.length).toBe(0)
  })

  test.each([
    ["help", "help", []],
    ["\\. test.db", "source", ["test.db"]],
    ["source \"test test.db\"", "source", ["\"test", "test.db\""]],
    ["source 'test test.db'", "source", ["test test.db"]],
    ["source `test test.db`", "source", ["`test", "test.db`"]],
  ])("command %s", (input, name, args) => {
    const options = {}
    const result = new MysqlParser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CommandStatement)
    expect(result[0].name).toBe(name)
    expect(result[0].args).toStrictEqual(args)
  })

  test("create database", () => {
    const input = `CREATE DATABASE x`
    const options = {}
    const result = new MysqlParser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateDatabaseStatement)
    expect(result[0].name).toBe("x")
  })

  test("create database", () => {
    const input = `DROP DATABASE x`
    const options = {}
    const result = new MysqlParser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DropDatabaseStatement)
    expect(result[0].name).toBe("x")
  })

  test.each([
    ["", false],
    ["temporary", true],
    ["temp", true]
  ])("create %s table", (modifier, temporary) => {
    const input = `CREATE ${modifier} TABLE x (x int)`
    const options = {}
    const result = new MysqlParser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateTableStatement)
    expect(result[0].ifNotExists).toBe(false)
    expect(result[0].temporary).toBe(temporary)
    expect(result[0].asSelect).toBe(false)
    expect(result[0].obj.name).toBe("x")
    expect(result[0].columns?.length).toBe(1)
    expect(result[0].columns[0]?.name).toBe("x")
  })

  test("create table as select", () => {
    const input = `CREATE TABLE x AS SELECT * FROM x`
    const options = {}
    const result = new MysqlParser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateTableStatement)
    expect(result[0].temporary).toBe(false)
    expect(result[0].asSelect).toBe(true)
    expect(result[0].obj.name).toBe("x")
    expect(result[0].columns).toBe(undefined)
  })

  test("drop table", () => {
    const input = `DROP TABLE x`
    const options = {}
    const result = new MysqlParser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DropTableStatement)
    expect(result[0].objs[0].name).toBe("x")
    expect(result[0].ifExists).toBe(false)
  })

  test("create view", () => {
    const input = `CREATE VIEW  x AS SELECT * FROM x`
    const options = {}
    const result = new MysqlParser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateViewStatement)
    expect(result[0].obj.name).toBe("x")
    expect(result[0].columns).toBe(undefined)
  })

  test("drop view", () => {
    const input = `DROP VIEW x`
    const options = {}
    const result = new MysqlParser(input, options).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DropViewStatement)
    expect(result[0].objs[0].name).toBe("x")
  })
})
