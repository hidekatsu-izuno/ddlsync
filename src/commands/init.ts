import {CAC} from 'cac'
import {prompt} from 'enquirer'
import {promises as fs} from 'fs'

export default (cli: CAC) => {
  cli.command('init', 'generate knexfile.js')
    .action(async args => {
      const config: any = await prompt({
        type: 'select',
        name: 'client',
        message: 'Database client',
        choices: ['sqlite3', 'pg', 'mysql2', 'oracledb', 'mssql']
      });

      if (config.client === 'sqlite3') {
        config.connection = await prompt({
          type: 'input',
          name: 'client',
          message: 'Database filename',
          initial: './sqlite3.db'
        });
      } else if (config.client === 'pg' || config.client === 'mysql2') {
        config.connection = await prompt([
          {
            type: 'input',
            name: 'host',
            message: 'Connecting database host',
            initial: 'localhost'
          },
          {
            type: 'input',
            name: 'user',
            message: 'Connecting database user'
          },
          {
            type: 'input',
            name: 'password',
            message: 'Connecting database password'
          },
          {
            type: 'input',
            name: 'database',
            message: 'Connecting database name'
          },
        ]);
      }

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
    })
}
