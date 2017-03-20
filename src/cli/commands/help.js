"use strict";

import Command from "../command";

class HelpCommand extends Command {
  execute(options) {
    super.execute(options);

    this.cli.log("Not yet implemented");
  }
}

module.exports = HelpCommand;
