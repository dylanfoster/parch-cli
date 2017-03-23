"use strict";

import path from "path";

import sinon from "sinon";

import CLI from "../../src/cli";
import Command from "../../src/cli/command";

class MockCLI extends CLI {
}

class FooCommand extends Command {
  constructor(cli) {
    super(cli);

    this.aliases = ["f", "-f", "--foo"];
    this.args = ["<foo>", "<bar>"];
    this.description = "foo";
  }

  execute(options) {
  }

  runHelp() {
    const helpCommand = this.cli.commands.get("help");
    const output = helpCommand.renderCommandBlock(this);

    this.cli.log(output);
  }
}

export const mockProcess = {
  cwd() {
    return path.resolve(__dirname, "project");
  },

  stdout: {
    write: sinon.spy()
  }
};

export default {
  CLI: MockCLI,
  Command: FooCommand,
  cli: new MockCLI(mockProcess),
  process: mockProcess
};
