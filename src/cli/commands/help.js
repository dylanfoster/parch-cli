"use strict";

import Command from "../command";

class HelpCommand extends Command {
  execute(options) {
    const help = `
parch <command> [options]

  commands:
    parch new <name>                  generate a new parch project
      alias: n

    parch generate <template> <name>  generate a new template file by name (e.g. parch g controller foo)
      alias: g

    parch serve
      alias: s
    `;

    this.cli.log(help);
  }
}

module.exports = HelpCommand;
