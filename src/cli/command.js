"use strict";

import path from "path";

class Command {
  get name() {
    return this.constructor.name.split(/command/i)[0].toLowerCase();
  }

  get projectName() {
    return path.basename(this.cli.process.cwd());
  }

  get projectRootPath() {
    return this.cli.process.cwd();
  }

  constructor(cli) {
    this.cli = cli;

    this.templateDir = path.resolve(__dirname, "../../templates");

    this.aliases = [];
    this.args = [];
    this.description = "Default description";
    this.options = [];
  }

  execute(options) {
    if (options.help) {
      this.runHelp();

      process.exit(0);
    }
  }

  runHelp() {
    this.cli.log(`No help for command '${this.name}'`);
  }
}

module.exports = Command;
