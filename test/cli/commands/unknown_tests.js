"use strict";

import { expect } from "chai";

import fixtures from "../../fixtures";

const {
  CLI
} = fixtures;

describe("Command | Unknown", function () {
  let cli, command;

  beforeEach(function () {
    cli = new CLI(fixtures.process);
    command = cli.commands.get("unknown");
  });

  describe("#execute", function () {
    it("logs an error to stdout", function () {
      command.execute({
        argv: {
          cooked: [],
          original: ["foo"],
          remain: ["foo"]
        }
      });

      expect(cli.process.stdout.write).to.have.been.calledWith("\u001b[31mUnknown command: 'foo'\u001b[39m\n");
    });
  });
});
