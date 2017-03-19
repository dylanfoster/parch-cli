"use strict";

class Command {
  get name() {
    return this.constructor.name.split(/command/i)[0].toLowerCase();
  }

  constructor(cli) {
    this.cli = cli;
  }

  execute(options) {
    if (options.help) {
      return this.runHelp();
    }
  }

  runHelp() {
    this.cli.log(`No help for command '${this.name}'`);
  }
}

module.exports = Command;
