"use strict";

import path from "path";

import include from "include-all";
import nopt from "nopt";

import pkg from "../package";

process.title = "parch-cli";

class CLI {
  constructor(process) {
    this.knownOpts = {
      help: Boolean,
      verbose: Boolean,
      version: Boolean
    };

    this.shortOpts = {
      h: ["--help"],
      v: ["--version"]
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

  run() {
    const options = nopt(this.knownOpts, this.shortOpts, this.args, 0);
    const { argv: { remain }} = options;

    if (remain.length) {
      // assume first item is the command we want
      const [commandName] = remain;
      const command = this.commands.get(commandName);

      if (!command) {
        throw new Error("Unknown command");
      }

      // TODO: validate command first
      command.execute(options);
    } else if (options.help) {
      const command = this.commands.get("help");

      command.execute(options);
    } else if (options.version) {
      this.log(`parch-cli: ${pkg.version}`);
    } else {
      throw new Error("Unknown command");
      // unknown option
    }
  }

  _loadCommands() {
    const commands = include({
      dirname: path.resolve(__dirname, "cli", "commands"),
      filter: /(.+)\.js$/
    });

    Object.keys(commands).forEach(command => {
      this.commands.set(command, new commands[command](this));
      this.commands.set(command.substring(0, 1),  new commands[command](this));
    });
  }
}

module.exports = CLI;
