import {tokenize} from '../../src/parser/tokenizer'

describe('tokenize sql', () => {

  test("test empty query", () => {
    console.log(tokenize("CREATE TABLE test (aaa);", 'sqlite3'))
    console.log(tokenize("SELECT 1;\n" +
      "DELIMITER xxx\n" +
      "SELECT 1 xxx\n" +
      "DELIMITER ||\n" +
      "SELECT 1 || SELECT 2",
      'mysql'
    ))
  })
})
