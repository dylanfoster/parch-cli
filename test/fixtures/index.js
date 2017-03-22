"use strict";

import path from "path";

import sinon from "sinon";

import CLI from "../../src/cli";
import Command from "../../src/cli/command";

class MockCLI extends CLI {
}

class FooCommand extends Command {
  execute(options) {
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
