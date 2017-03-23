"use strict";

import { expect } from "chai";

import HelpCommand from "../../../src/cli/commands/help";
import fixtures from "../../fixtures";

const {
  CLI,
  Command
} = fixtures;

describe("Command | Help", function () {
  let cli, command, help, options;

  beforeEach(function () {
    cli = new CLI(fixtures.process);
    command = new Command(cli);
    cli.commands.set("foo", command);
    help = cli.commands.get("help");
  });

  describe("#execute", function () {
    beforeEach(function () {
      options = {
        argv: {
          cooked: [],
          original: ["help"],
          remain: ["help"]
        }
      };
    });

    it("outputs help", function () {
      help.execute(options);

      expect(cli.process.stdout.write.args[0][0]).to.match(/Usage: parch <command>/);
    });

    it("outputs command help if a command is passed", function () {
      options.argv.remain.push("foo");
      help.execute(options);

      expect(cli.process.stdout.write).to.have.been.calledWith(`parch foo \u001b[33m<foo> <bar>\u001b[39m
    foo
    \u001b[90maliases: f, -f, --foo\u001b[39m
`);
    });
  });

  describe("#renderCommandBlock", function () {
    it("formats a command help block", function () {
      const out = help.renderCommandBlock(command);

      expect(out).to.eql(`parch foo \u001b[33m<foo> <bar>\u001b[39m
    foo
    \u001b[90maliases: f, -f, --foo\u001b[39m`);
    });
  });
});
