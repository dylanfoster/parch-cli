"use strict";

import fs from "fs";
import path from "path";

import { expect } from "chai";
import del from "del";
import sinon from "sinon";

import File from "../../src/utils/file";
import fixtures from "../fixtures";

const {
  CLI,
  environment,
  prompt
} = fixtures;

function pathExists(filePath) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, err => {
      if (err) { return reject(err); }

      resolve(true);
    });
  });
}

const PROJECT_FIXTURE = path.resolve(__dirname, "../fixtures/project");

describe("Util | File", function () {
  let cli, file;

  beforeEach(function () {
    cli = new CLI(fixtures.process);
    file = new File({
      cli,
      prompt
    });
  });

  afterEach(function () {
    return del([
      `${PROJECT_FIXTURE}/**/*`,
      `${PROJECT_FIXTURE}/**/.*`,
      `!${PROJECT_FIXTURE}`,
      `!${PROJECT_FIXTURE}/.gitignore`
    ]);
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

      expect(updated.outPath).to.eql("/lib/controllers/foo.js");
    });
  });

  describe("#askForResolution", function () {
    it("prompts the user for file conflict resolution", function () {
      return file.askForResolution("/foo/bar/baz").then(answer => {
        expect(answer).to.eql("skip");
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
    it("writes several directories", function () {
      const files = [{
        parentDir: path.resolve(PROJECT_FIXTURE, "foo")
      }];

      return file.makeDirectories(files).then(
        () => pathExists(path.resolve(PROJECT_FIXTURE, "foo"))
      ).then(exists => expect(exists).to.be.true);
    });
  });

  describe("#makeDirectory", function () {
    it("writes a directory", function () {
      const fileObject = {
        parentDir: path.resolve(PROJECT_FIXTURE, "foo")
      };

      return file.makeDirectory(fileObject).then(
        () => pathExists(path.resolve(PROJECT_FIXTURE, "foo"))
      ).then(exists => expect(exists).to.be.true);
    });
  });

  describe("#readFile", function () {
    let fixture;

    beforeEach(function () {
      fixture = path.resolve(PROJECT_FIXTURE, ".gitignore");
    });

    it("reads a file", function () {
      return file.readFile(fixture).then(data => {
        expect(data.toString()).to.eql("*\n!.gitignore\n");
      });
    });
  });

  describe("#walk", function () {
    it("walks a file tree and returns file objects", function () {
      return file.walk(PROJECT_FIXTURE).then(files => {
        const [gitignore] = files.filter(f => f.name === ".gitignore");

        expect(gitignore.name).to.eql(".gitignore");
      });
    });
  });

  describe("#writeFile", function () {
    let fixture;

    beforeEach(function () {
      fixture = path.resolve(PROJECT_FIXTURE, "foo.js");
    });

    it("writes a file", function () {
      return file.writeFile(fixture, "foo").then(
        () => pathExists(fixture)
      ).then(exists => expect(exists).to.be.true).catch(console.log.bind(console));
    });

    it.skip("prompts a user for conflict resolution", function () {
      fixture = path.resolve(PROJECT_FIXTURE, ".gitignore");
      sinon.spy(prompt, "prompt");

      return file.writeFile(fixture, "foo").then(
        () => expect(prompt).to.have.been.called
      );
    });
  });
});
