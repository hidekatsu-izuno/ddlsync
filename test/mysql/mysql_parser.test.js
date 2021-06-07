const model = require("../../src/mysql/mysql_models")
const { MysqlParser } = require ("../../src/mysql/mysql_parser")

describe("test mysql_parser", () => {
  test.each([
    [""],
    [";"],
    ["  "],
    ["-- test"],
    ["/*test*/"],
    [" /*test*/;  -- test"],
  ])("empty input %#", (input) => {
    const result = new MysqlParser(input, {}).root()
    expect(result.length).toBe(0)
  })

  test.each([
    ["SELECT 1; SELECT 2"],
  ])("multi statement %#", (input) => {
    const result = new MysqlParser(input, {}).root()
    expect(result.length).toBe(2)
  })

  test.each([
    ["help",
      { name:"help", args: [] }],
    ["source test.db",
      { name: "source", args: ["test.db"] }],
    ["\\. \"test test.db\"",
      { name: "source", args: ["\"test", "test.db\""] }],
    ["SOURCE 'test test.db'",
      { name: "source", args: ["test test.db"] }],
    ["\\. `test test.db`",
      { name: "source", args: ["`test", "test.db`"] }],
  ])("command %#", (input, expected) => {
    const result = new MysqlParser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CommandStatement)
    expect(result[0].name).toBe(expected.name)
    expect(result[0].args).toStrictEqual(expected.args)
  })

  test.each([
    ["CREATE DATABASE x",
      { name: "x" }],
    ["CREATE SCHEMA x",
      { name: "x" }],
  ])("create database %#", (input, expected) => {
    const result = new MysqlParser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateDatabaseStatement)
    expect(result[0].name).toBe(expected.name)
  })

  test.each([
    ["DROP DATABASE x",
      { schemaName: "x" }],
    ["DROP SCHEMA x",
      { schemaName: "x" }],
  ])("drop database %#", (input, expected) => {
    const result = new MysqlParser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DropDatabaseStatement)
    expect(result[0].schemaName).toBe(expected.schemaName)
  })

  test.each([
    ["CREATE TABLE x (x int)",
      { name: "x", columns: [ { name: "x", dataType: { name: "INT" } } ]}],
    ["create table if not exists x (x date)",
      { name: "x", ifNotExists: true, columns: [ { name: "x", dataType: { name: "DATE" }} ]}],
    ["CREATE TABLE `x` (`a1` char, `a2` int, a3 varchar(3))",
      { name: "x", columns: [ { name: "a1", dataType: { name: "CHAR" } }, { name: "a2", dataType: { name: "INT" } }, { name: "a3", dataType: { name: "VARCHAR", length: "3" } } ] }],
    ["CREATE TABLE x AS SELECT * FROM x",
      { name: "x", asSelect: true }],
    ["Create Temporary Table x (x timestamp)",
      { name: "x", temporary: true, columns: [ { name: "x", dataType: { name: "TIMESTAMP" } } ]}],
    ["CREATE TEMPORARY TABLE IF NOT EXISTS x (x double)",
      { name: "x", temporary: true, ifNotExists: true, columns: [ { name: "x", dataType: { name: "DOUBLE" } } ]}],
  ])("create table %#", (input, expected) => {
    const result = new MysqlParser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateTableStatement)
    expect(result[0].schemaName).toBe(expected.schemaName)
    expect(result[0].orReplace).toBe(expected.orReplace || false)
    expect(result[0].name).toBe(expected.name)
    expect(result[0].ifNotExists).toBe(expected.ifNotExists || false)
    expect(result[0].temporary).toBe(expected.temporary || false)
    expect(result[0].asSelect).toBe(expected.asSelect || false)
    expect(result[0].columns?.length).toBe(expected.columns?.length)
    for (let i = 0; i < 3; i++) {
      expect(result[0].columns?.[i]?.name).toBe(expected.columns?.[i]?.name)
      expect(result[0].columns?.[i]?.dataType?.name).toBe(expected.columns?.[i]?.dataType?.name)
      expect(result[0].columns?.[i]?.dataType?.length).toBe(expected.columns?.[i]?.dataType?.length)
      expect(result[0].columns?.[i]?.dataType?.scale).toBe(expected.columns?.[i]?.dataType?.scale)
    }
  })

  test.each([
    ["DROP TABLE x", { tables: [{ name: "x" }] }],
    ["DROP TABLE IF EXISTS main.x, y", { tables: [{ schemaName: "main", name: "x" }, { name: "y" }], ifExists: true }],
  ])("drop table %#", (input, expected) => {
    const result = new MysqlParser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DropTableStatement)
    for (let i = 0; i < 3; i++) {
      expect(result[0].tables?.[i]?.schemaName).toBe(expected.tables?.[i]?.schemaName)
      expect(result[0].tables?.[i]?.name).toBe(expected.tables?.[i]?.name)
    }
    expect(result[0].ifExists).toBe(expected.ifExists || false)
  })

  test.each([
    ["CREATE SEQUENCE x",
      { name: "x" }],
    ["CREATE OR REPLACE SEQUENCE x",
      { name: "x", orReplace: true }],
    ["CREATE SEQUENCE IF NOT EXISTS x",
      { name: "x", ifNotExists: true }],
    ["CREATE SEQUENCE x INCREMENT = 1",
      { name: "x", increment: "1" }],
    ["CREATE SEQUENCE x INCREMENT BY 1",
      { name: "x", increment: "1" }],
    ["CREATE SEQUENCE x INCREMENT 1",
      { name: "x", increment: "1" }],
  ])("create sequence %#", (input, expected) => {
    const result = new MysqlParser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateSequenceStatement)
    expect(result[0].schemaName).toBe(expected.schemaName)
    expect(result[0].name).toBe(expected.name)
    expect(result[0].orReplace).toBe(expected.orReplace || false)
    expect(result[0].ifNotExists).toBe(expected.ifNotExists || false)
    expect(result[0].columns?.length).toBe(expected.columns?.length)
  })

  test.each([
    ["DROP SEQUENCE x", { sequences: [{ name: "x" }] }],
    ["DROP SEQUENCE IF EXISTS main.x, y", { sequences: [{ schemaName: "main", name: "x" }, { name: "y" }], ifExists: true }],
  ])("drop sequence %#", (input, expected) => {
    const result = new MysqlParser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DropSequenceStatement)
    for (let i = 0; i < 3; i++) {
      expect(result[0].sequences?.[i]?.schemaName).toBe(expected.sequences?.[i]?.schemaName)
      expect(result[0].sequences?.[i]?.name).toBe(expected.sequences?.[i]?.name)
    }
    expect(result[0].ifExists).toBe(expected.ifExists || false)
  })

  test.each([
    ["CREATE VIEW x AS SELECT * FROM x",
      { name: "x" }],
  ])("create view %#", (input, expected) => {
    const result = new MysqlParser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateViewStatement)
    expect(result[0].name).toBe(expected.name)
    expect(result[0].columns?.length).toBe(expected.columns?.length)
  })

  test.each([
    ["DROP VIEW x",
      { views: [{ name: "x" }] }],
    ["DROP VIEW IF EXISTS x",
      { views: [{ name: "x" }], ifExists: true }],
    ["DROP VIEW main.x",
      { views: [{ schemaName: "main", name: "x" }] }],
    ["DROP VIEW IF EXISTS temp.x, main.x",
      { views: [{ schemaName: "temp", name: "x" }, { schemaName: "main", name: "x" }], ifExists: true }],
  ])("drop view %#", (input, expected) => {
    const result = new MysqlParser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DropViewStatement)
    for (let i = 0; i < 3; i++) {
      expect(result[0].views?.[i]?.schemaName).toBe(expected.views?.[i]?.schemaName)
      expect(result[0].views?.[i]?.name).toBe(expected.views?.[i]?.name)
    }
    expect(result[0].ifExists).toBe(expected.ifExists || false)
  })

  test.each([
    ["DELIMITER //\nCREATE TRIGGER x BEFORE DELETE ON y FOR EACH ROW BEGIN SET x = 4; END",
      { name: "x" }],
  ])("create trigger %#", (input, expected) => {
    const result = new MysqlParser(input, {}).root()
    expect(result.length).toBe(2)
    expect(result[1]).toBeInstanceOf(model.CreateTriggerStatement)
    expect(result[1].name).toBe(expected.name)
  })

  test.each([
    ["DROP TRIGGER x",
      { triggers: [{ name: "x" }] }],
    ["DROP TRIGGER IF EXISTS x",
      { triggers: [{ name: "x" }], ifExists: true }],
    ["DROP TRIGGER main.x",
      { triggers: [{ schemaName: "main", name: "x" }] }],
    ["DROP TRIGGER IF EXISTS temp.x, main.x",
      { triggers: [{ schemaName: "temp", name: "x" }, { schemaName: "main", name: "x" }], ifExists: true }],
  ])("drop trigger %#", (input, expected) => {
    const result = new MysqlParser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DropTriggerStatement)
    for (let i = 0; i < 3; i++) {
      expect(result[0].views?.[i]?.schemaName).toBe(expected.views?.[i]?.schemaName)
      expect(result[0].views?.[i]?.name).toBe(expected.views?.[i]?.name)
    }
    expect(result[0].ifExists).toBe(expected.ifExists || false)
  })

  test.each([
    ["CREATE EVENT x ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL 1 HOUR DO UPDATE x SET x = x + 1",
      { name: "x" }],
    ["CREATE EVENT main.x ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL 1 HOUR DO UPDATE x SET x = x + 1",
      { schemaName: "main", name: "x" }],
  ])("create trigger %#", (input, expected) => {
    const result = new MysqlParser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.CreateEventStatement)
    expect(result[0].schemaName).toBe(expected.schemaName)
    expect(result[0].name).toBe(expected.name)
  })

  test.each([
    ["DROP EVENT x",
      { triggers: [{ name: "x" }] }],
    ["DROP EVENT IF EXISTS x",
      { triggers: [{ name: "x" }], ifExists: true }],
    ["DROP EVENT main.x",
      { triggers: [{ schemaName: "main", name: "x" }] }],
    ["DROP EVENT IF EXISTS temp.x, main.x",
      { triggers: [{ schemaName: "temp", name: "x" }, { schemaName: "main", name: "x" }], ifExists: true }],
  ])("drop trigger %#", (input, expected) => {
    const result = new MysqlParser(input, {}).root()
    expect(result.length).toBe(1)
    expect(result[0]).toBeInstanceOf(model.DropEventStatement)
    for (let i = 0; i < 3; i++) {
      expect(result[0].views?.[i]?.schemaName).toBe(expected.views?.[i]?.schemaName)
      expect(result[0].views?.[i]?.name).toBe(expected.views?.[i]?.name)
    }
    expect(result[0].ifExists).toBe(expected.ifExists || false)
  })
})
