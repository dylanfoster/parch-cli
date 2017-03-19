"use strict";

import path from "path";

import include from "include-all";
import nopt from "nopt";

process.title = "parch";

class CLI {
  constructor(process) {
    this.knownOpts = {
      help: Boolean,
      test: Boolean
    };

    this.shortOpts = {
      h: ["--help"],
      t: ["--test"]
    };

    this.args = process.argv.slice(2);
    this.commands = new Map();
    this.process = process;
    this._loadCommands();
  }

  log(message = "") {
    if (message) {
      this.process.stdout.write(`${message}\n`);
    }
  }

  run(){
    const options = nopt(this.knownOpts, this.shortOpts, this.args, 0);
    const { argv: { remain }} = options;

    if (remain.length) {
      // assume first item is the command we want
      const [commandName] = remain;
      const command = this.commands.get(commandName);

      command.execute(options);
    }
  }

  _loadCommands() {
    const commands = include({
      dirname: path.resolve(__dirname, "cli", "commands"),
      filter: /(.+)\.js$/
    });

    Object.keys(commands).forEach(command => {
      this.commands.set(command, new commands[command](this));
    });
  }
}

module.exports = CLI;
