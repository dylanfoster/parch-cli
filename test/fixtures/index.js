"use strict";

import sinon from "sinon";

import CLI from "../../src/cli";
import Command from "../../src/cli/command";

class FooCommand extends Command {
  execute(options) {
  }
}

export const mockProcess = {
  stdout: {
    write: sinon.spy()
  }
};

export default {
  Command: FooCommand,
  process: mockProcess
}
