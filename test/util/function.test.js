const { ucamel, lcamel } = require("../../src/util/functions")

describe("test functions", () => {
  test.each([
    ["aaa_bbb_ccc"],
  ])("ucamel %#", (input) => {
    expect(ucamel(input)).toBe("AaaBbbCcc")
  })

  test.each([
    ["aaa_bbb_ccc"],
  ])("lcamel %#", (input) => {
    expect(lcamel(input)).toBe("aaaBbbCcc")
  })
})
