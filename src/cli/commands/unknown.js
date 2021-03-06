"use strict";

import Command from "../command";

export default class UnknownCommand extends Command {
  execute(options) {
    const { argv: { original }} = options;

    this.cli.error(`Unknown command: '${original[0]}'`);
    this.cli.log("Run parch -h for help");
  }
}
