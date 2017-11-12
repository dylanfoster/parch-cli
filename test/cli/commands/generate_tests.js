"use strict";

import path from "path";

import del from "del";
import { expect } from "chai";

import GenerateCommand from "../../../src/cli/commands/generate";
import fixtures from "../../fixtures";

const PROJECT_PATH = path.resolve(__dirname, "../../fixtures/project");
const TEMPLATE_PATH = path.resolve(__dirname, "../../../templates");
const {
  CLI
} = fixtures;

describe("Command | Generate", function () {
  let cli, command, file;

  beforeEach(function () {
    cli = new CLI(fixtures.process);
    command = new GenerateCommand(cli);
    file = command.file;
  });

  afterEach(function () {
    return del([
      `${PROJECT_PATH}/**/*`,
      `${PROJECT_PATH}/**/.*`,
      `!${PROJECT_PATH}`,
      `!${PROJECT_PATH}/.gitignore`
    ]);
  });

  describe("#execute", function () {
    it("generates a class and test file", function () {
      return command.execute({
        argv: {
          cooked: [],
          original: ["g", "controller", "foo"],
          remain: ["g", "controller", "foo"],
        }
      })
        .then(() => file.walk(PROJECT_PATH))
        .then(files => {
          const hasControllerFile = files.some(f => f.name === "foo.js");
          const hasTestFile = files.some(f => f.name === "foo_tests.js");

          expect(hasControllerFile).to.be.true;
          expect(hasTestFile).to.be.true;
        });
    });
  });

  describe("#getTemplateFiles", function () {
    it("returns an array of template file pairs", function () {
      return command.getTemplateFiles("controller", "foo").then(files => {
        expect(files[0].fullPath).to.eql(
          path.join(TEMPLATE_PATH, "lib/controllers/controller.ejs")
        );
      });
    });

    it("returns an error if no templates exist", function (done) {
      command.getTemplateFiles("foo", "bar").catch(err => {
        expect(err.message).to.eql("Invalid generator 'foo'");

        done();
      });
    });
  });

  describe("#runHelp", function () {
    it("outputs generate help text");
  });

  describe("#writeTemplateFiles", function () {
    it("writes a pair of templates", function () {
      return command.getTemplateFiles("controller", "foo")
        .then(file.makeDirectories.bind(file))
        .then(files => command.writeTemplateFiles("foo", files))
        .then(() => file.walk(PROJECT_PATH))
        .then(files => {
          const hasControllerFile = files.some(f => f.name === "foo.js");
          const hasTestFile = files.some(f => f.name === "foo_tests.js");

          expect(hasControllerFile).to.be.true;
          expect(hasTestFile).to.be.true;
        });
    });
  });

  describe("#writeTemplateFile", function () {
    it("writes a template file", function () {
      return command.getTemplateFiles("controller", "foo")
        .then(file.makeDirectories.bind(file))
        .then(files => command.writeTemplateFile("foo", files[0]))
        .then(() => file.walk(PROJECT_PATH))
        .then(files => {
          const [expected] = files.filter(f => f.name !== ".gitignore");

          expect(expected.name).to.eql("foo.js");
        });
    });
  });
});
