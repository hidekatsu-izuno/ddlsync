module.exports = {
  development: {
    type: "sqlite3",
    database: "./sqlite3.db",
    ddlsync: {
      include: "ddl/**/*.sql"
    }
  }
}
