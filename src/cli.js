"use strict";

import path from "path";

import include from "include-all";
import nopt from "nopt";
import red from "ansi-red";

import pkg from "../package";

process.title = "parch-cli";

class CLI {
  constructor(process) {
    this.knownOpts = {
      help: Boolean,
      version: Boolean
    };

    this.shortOpts = {
      h: ["--help"],
      v: ["--version"]
    };

    this.commands = new Map();
    this.process = process;
    this._loadCommands();
  }

  error(message) {
    this.log(red(message));
  }

  log(message = "") {
    this.process.stdout.write(`${message}\n`);
  }

  run(args) {
    const options = nopt(this.knownOpts, this.shortOpts, args, 2);
    const { argv: { remain }} = options;

    if (remain.length) {
      // assume first item is the command we want
      const [commandName] = remain;
      const command = this.commands.get(commandName);

      if (!command) {
        return this.error(`Unknown command '${commandName}'`);
      }

      // TODO: validate command first
      command.execute(options);
    } else if (options.help) {
      const command = this.commands.get("help");

      command.execute(options);
    } else if (options.version) {
      const command = this.commands.get("version");

      command.execute(options);
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
