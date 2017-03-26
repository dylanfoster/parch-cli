"use strict";

import execa from "execa";
import green from "ansi-green";

import Command from "../command";

export default class InstallCommand extends Command {
  constructor(cli) {
    super(cli);

    this.aliases = ["i"];
    this.description = "Install project dependencies";
  }

  execute() {
    super.execute(...arguments);

    this.cli.log();
    this.cli.log(green("Installing dependencies"));
    this.cli.log();

    return execa("npm", ["install"], {
      cwd: this.projectRootPath,
      stdio: "inherit"
    });
  }

  runHelp() {
    const helpCommand = this.cli.commands.get("help");
    const output = helpCommand.renderCommandBlock(this);

    this.cli.log();
    this.cli.log(output);
  }
}
