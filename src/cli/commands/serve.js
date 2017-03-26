"use strict";

import Command from "../command";

export default class ServeCommand extends Command {
  constructor(cli) {
    super(cli);

    this.aliases = ["s"];
    this.description = "Start your api server";
  }

  execute(options) {
    super.execute(options);
    this.cli.log("Not yet implemented");
  }
}
