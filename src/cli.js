"use strict";

import path from "path";

import include from "include-all";
import nopt from "nopt";
import ora from "ora";
import red from "ansi-red";

const MAX_LISTENER_COUNT = 1000;

process.title = "parch-cli";
process.setMaxListeners(MAX_LISTENER_COUNT);

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
    this.progress = ora({
      color: "green"
    });
    this._loadCommands();
  }

  error(message) {
    this.log(red(message));
  }

  log(message = "") {
    this.process.stdout.write(`${message}\n`);
  }

  lookupCommand(options) {
    const { argv: { remain }} = options;
    const [commandName] = remain;
    let command;

    if (remain.length) {
      command = this.commands.get(commandName);

      if (!command) {
        command = this.commands.get("unknown");
      }
    } else if (options.help) {
      command = this.commands.get("help");
    } else if (options.version) {
      command = this.commands.get("version");
    } else {
      command = this.commands.get("help");
    }

    return command;
  }

  run(args) {
    const options = nopt(this.knownOpts, this.shortOpts, args);
    const command = this.lookupCommand(options);

    command.execute(options);
  }

  _loadCommands() {
    const commands = include({
      dirname: path.resolve(__dirname, "cli", "commands"),
      filter: /(.+)\.js$/
    });

    Object.keys(commands).forEach(command => {
      this.commands.set(command, new commands[command](this));

      if (command !== "unknown") {
        this.commands.set(command.substring(0, 1), new commands[command](this));
      }
    });
  }
}

module.exports = CLI;
