"use strict";

import Command from "../command";

class ServeCommand extends Command {
  constructor(cli) {
    super(cli);
  }

  execute(options) {
    super.execute(options);
    this.cli.log("Not yet implemented");
  }
}

module.exports = ServeCommand;
