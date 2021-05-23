module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./sqlite3.db",
    },
    ddlsync: {
      include: "ddl/**/*.sql"
    }
  }
}
