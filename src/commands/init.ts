import { Command } from 'commander';
import { prompt } from 'enquirer'
import { promises as fs } from 'fs'

export default (program: Command) => {
  program.command('init', 'create a knexfile.js')
    .action(process)
}

async function process() {
  const config: any = await prompt({
    type: 'select',
    name: 'client',
    message: 'Database client',
    choices: ['sqlite3', 'pg', 'mysql2', 'oracledb', 'tedious']
  });

  const connectionOptions = []
  if (config.client === 'sqlite3') {
    connectionOptions.push({
      type: 'input',
      name: 'client',
      message: 'Database filename',
      initial: './sqlite3.db'
    })
  } else {
    connectionOptions.push({
      type: 'input',
      name: 'host',
      message: 'Connecting database host',
      initial: 'localhost'
    })
    connectionOptions.push({
      type: 'input',
      name: 'user',
      message: 'Connecting database user'
    })
    connectionOptions.push({
      type: 'input',
      name: 'password',
      message: 'Connecting database password'
    })
    if (config.client !== "oracledb") {
      connectionOptions.push({
        type: 'input',
        name: 'database',
        message: 'Connecting database name'
      })
    }
  }

  config.connection = await prompt(connectionOptions)

  config.ddlsync = await prompt({
    type: 'input',
    name: 'include',
    message: 'ddlsync including files',
    initial: 'ddl/**/*.sql'
  });

  const text = JSON.stringify({
    development: config
  }, null, 2).replace(/"(\w+)"\s*:/g, '$1:')

  await fs.writeFile('knexfile.js', `export default ${text}`)
}
