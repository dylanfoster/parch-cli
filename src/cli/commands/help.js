"use strict";

import _ from "lodash";
import gray from "ansi-gray";
import yellow from "ansi-yellow";

import Command from "../command";

export default class HelpCommand extends Command {
  constructor(cli) {
    super(cli);

    this.aliases = ["-h", "--help", "h"];
    this.args = ["[command]"];
    this.description = "Output help for all commands or a specified command";
  }

  execute(options) {
    const { argv: { remain }} = options;
    const argsWithoutHelp = remain.slice(1);

    if (argsWithoutHelp.length) {
      const command = this.cli.commands.get(argsWithoutHelp[0]);

      if (command) {
        return command.runHelp();
      }
    }

    const commands = _.uniqBy(Array.from(this.cli.commands.values()), "name");
    const helpHeader = "Usage: parch <command>";
    const helpSubHeader = "Available Commands:";
    let helpBody = "";

    for (const command of commands) {
      if (command.name === "unknown") { continue; }

      helpBody += `  ${this.renderCommandBlock(command)}\r\n\r\n`;
    }

    const help = `${helpHeader}\r\n\r\n${helpSubHeader}\r\n\r\n${helpBody}`;

    this.cli.log(help);
  }

  renderCommandBlock(command) {
    let block = "";
    const blockHeader = `parch ${command.name} ${yellow(command.args.join(" "))}`;
    const blockDescription = `${command.description}`;
    let blockAliases;

    block += `${blockHeader}\n`;
    block += `    ${blockDescription}\n`;

    if (command.aliases && command.aliases.length) {
      blockAliases = `aliases: ${command.aliases.join(", ")}`;
      block += `    ${gray(blockAliases)}`;
    }

    return block;
  }
}
