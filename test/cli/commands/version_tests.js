"use strict";

import { expect } from "chai";

import fixtures from "../../fixtures";
import pkg from "../../../package";

const {
  CLI
} = fixtures;

describe("Command | Version", function () {
  let cli, command;

  beforeEach(function () {
    cli = new CLI(fixtures.process);
    command = cli.commands.get("version");
  });

  describe("#execute", function () {
    it("outputs the tool's version", function () {
      command.execute();

      expect(cli.process.stdout.write).to.have.been.calledWith(`${pkg.version}\n`);
    });
  });
});
