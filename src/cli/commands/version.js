"use strict";

import Command from "../command";
import pkg from "../../../package";

export default class VersionCommand extends Command {
  constructor(cli) {
    super(cli);

    this.aliases = ["-v", "--version", "v"];
    this.description = "Output Parch version information";
  }

  execute() {
    this.cli.log(pkg.version);
  }
}
