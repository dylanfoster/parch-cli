"use strict";

import Command from "../command";

export default class InstallCommand extends Command {
  constructor(cli) {
    super(cli);

    this.aliases = ["i"];
    this.description = "Install project dependencies";
  }

  execute(options) {
    this.cli.log("Not yet implemented");
  }
}
