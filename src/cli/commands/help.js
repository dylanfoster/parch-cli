"use strict";

import Command from "../command";

class HelpCommand extends Command {
  constructor(cli) {
    super(cli);
  }

  execute() {
    this.cli.log("Not yet implemented");
  }
}

module.exports = HelpCommand;
