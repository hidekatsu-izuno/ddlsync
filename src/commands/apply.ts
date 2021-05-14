import { Command } from 'commander';

export default (program: Command) => {
  program.command('apply')
    .description("apply changes.")
    .action(async function (options) {
      await process([], { ...program.opts(), ...options })
    })
}

async function process(
  args: string[],
  options: { [key: string]: any }
) {
  console.log(args, options)

}
