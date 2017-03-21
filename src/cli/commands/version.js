"use strict";

import Command from "../command";
import pkg from "../../../package";

class VersionCommand extends Command {
  constructor(cli) {
    super(cli);
  }

  execute(options) {
    this.cli.log(pkg.version);
  }
}

module.exports = VersionCommand;
