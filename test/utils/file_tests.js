"use strict";

import path from "path";

import { expect } from "chai";

import File from "../../src/utils/file";
import fixtures from "../fixtures";

const {
  CLI,
  environment,
  prompt
} = fixtures;

describe.only("Util | File", function () {
  let cli, file;

  beforeEach(function () {
    cli = new CLI(fixtures.process);
    file = new File({
      cli,
      prompt
    });
  });

  describe("#addMetaData", function () {
    it("adds extra data to a list of file objects", function () {
      const files = [{
        fullPath: "/templates/lib/controllers/controller.ejs",
        name: "controller.ejs",
        path: "controller.ejs",
        parentDir: "/lib/controllers"
      }];
      const [updated] = file.addMetaData(files, {
        fileNamePrefix: "foo",
        projectRoot: "/foo"
      });

      expect(updated.outPath).to.eql("/lib/controllers/foo_controller.js");
    });
  });

  describe("#askForResolution", function () {
    it("prompts the user for file conflict resolution", function () {
      return file.askForResolution("/foo/bar/baz").then(answer => {
        expect(answer).to.eql("overwrite");
      });
    });
  });

  describe("#checkIfExists", function () {
    it("returns file data if file exists", function () {
      return file.checkIfExists(path.resolve(__dirname, "../../templates/gitignore")).then(data => expect(data).to.be.ok);
    });
  });

  describe("#displayDiff", function () {
    it("outputs a file diff", function () {
      return file.displayDiff("foo.js", "foo", "bar").then(() => {
        const lines = cli.process.stdout.write.args[0][0]
          .split("\n")
          .filter(line => line.length)
          .map(line => line.trim());
        const plus = lines.filter(line => line.match(/\+bar/));
        const minus = lines.filter(line => line.match(/-foo/));

        expect(plus).to.be.ok;
        expect(minus).to.be.ok;
      });
    });
  });

  describe("#exists", function () {
    it("checks if a file exists", function () {
      return file.exists(path.resolve(__dirname, "../../templates/gitignore"))
        .then(exists => expect(exists).to.be.true);
    });
  });

  describe("#makeDirectories", function () {
    it("writes several directories");
  });

  describe("#makeDirectory", function () {
    it("writes a directory");
  });

  describe("#readFile", function () {
    it("reads a file");
  });

  describe("#walk", function () {
    it("walks a file tree and returns file objects");
  });

  describe("#writeFile", function () {
    it("writes a file");

    it("prompts a user for conflict resolution");
  });
});
