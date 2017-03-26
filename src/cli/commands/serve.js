"use strict";

import execa from "execa";

import Command from "../command";

export default class ServeCommand extends Command {
  constructor(cli) {
    super(cli);

    this.aliases = ["s"];
    this.description = "Start your api server";
  }

  execute(options) {
    super.execute(options);

    return execa("npm", ["run", "start:dev"], {
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
