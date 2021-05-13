import { Command } from 'commander';

export default (program: Command) => {
  program.command('apply', 'apply changes.')
    .action(process)
}

function process(args: any[]) {

}
