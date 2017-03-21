"use strict";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

chai.use(sinonChai);

import CLI from "../src/cli";
import fixtures from "./fixtures";

const {
  Command
} = fixtures;

function args() {
  return ["node", "/usr/local/bin/parch-cli"].concat(...arguments);
}

describe("CLI", function () {
  let cli;

  beforeEach(function () {
    cli = new CLI(fixtures.process);
  });

  describe("#error", function () {
    it("logs an error message to stdout", function () {
      cli.error("foo");

      expect(cli.process.stdout.write).to.have.been.calledWith("\u001b[31mfoo\u001b[39m\n");
    });
  });

  describe("#log", function () {
    it("logs a message to stdout", function () {
      cli.log("foo");

      expect(cli.process.stdout.write).to.have.been.calledWith("foo\n");
    });

    it("logs a newline if no message is passed", function () {
      cli.log();

      expect(cli.process.stdout.write).to.have.been.calledWith("\n");
    });
  });

  describe("#run", function () {
    describe("-h, --help", function () {
      let command;

      beforeEach(function () {
        command = cli.commands.get("help");
        sinon.spy(command, "execute");
      });

      it("executes help with the -h flag", function () {
        cli.run(args(["-h"]));

        expect(command.execute).to.have.been.calledWith({
          help: true,
          argv: {
            cooked: ["--help"],
            original: ["-h"],
            remain: []
          }
        });
      });

      it("executes help with the --help flag", function () {
        cli.run(args(["--help"]));

        expect(command.execute).to.have.been.calledWith({
          help: true,
          argv: {
            cooked: ["--help"],
            original: ["--help"],
            remain: []
          }
        });
      });
    });

    describe("-v, --version", function () {
      let command;

      beforeEach(function () {
        command = cli.commands.get("version");
        sinon.spy(command, "execute");
      });

      it("executes version with the -v flag", function () {
        cli.run(args(["-v"]));

        expect(command.execute).to.have.been.calledWith({
          version: true,
          argv: {
            cooked: ["--version"],
            original: ["-v"],
            remain: []
          }
        });
      });

      it("executes version with the -version flag", function () {
        cli.run(args(["--version"]));

        expect(command.execute).to.have.been.calledWith({
          version: true,
          argv: {
            cooked: ["--version"],
            original: ["--version"],
            remain: []
          }
        });
      });
    });

    it("executes a command by name", function () {
      const command = cli.commands.get("new");

      sinon.stub(command, "execute");
      cli.run(args(["new"]));

      expect(command.execute).to.have.been.calledWith({
        argv: {
          cooked: ["new"],
          original: ["new"],
          remain: ["new"]
        }
      });
    });

    it("logs an error if command isn't found", function () {
      cli.run(args(["foo"]));

      expect(cli.process.stdout.write).to.have.been.calledWith("\u001b[31mUnknown command 'foo'\u001b[39m\n");
    });
  });
});
