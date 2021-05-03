import cac from 'cac'
import initCommand from './commands/init'
import planCommand from './commands/plan'
import applyCommand from './commands/apply'

const cli = cac('ddlsync')

initCommand(cli)
planCommand(cli)
applyCommand(cli)

cli.help()

cli.parse()
