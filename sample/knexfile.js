export default {
  development: {
    client: "sqlite3",
    connection: {
      client: "./sqlite3.db"
    },
    ddlsync: {
      include: "ddl/**/*.sql"
    }
  }
}