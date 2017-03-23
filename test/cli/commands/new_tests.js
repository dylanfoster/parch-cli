"use strict";

import path from "path";

import del from "del";
import { expect } from "chai";

import NewCommand from "../../../src/cli/commands/new";
import { file } from "../../../src/utils";
import fixtures from "../../fixtures";

const PROJECT_PATH = path.resolve(__dirname, "../../fixtures/project");
const TEMPLATE_PATH = path.resolve(__dirname, "../../../templates");
const {
  CLI
} = fixtures;

describe("Command | New", function () {
  let cli, command;

  beforeEach(function () {
    cli = new CLI(fixtures.process);
    command = new NewCommand(cli);
  });

  describe("#execute", function () {
    afterEach(function () {
      return del([
        `${PROJECT_PATH}/**/*`,
        `${PROJECT_PATH}/**/.*`,
        `!${PROJECT_PATH}`
      ]);
    });

    it("generates a new parch project");
  });

  describe("#getTemplateFiles", function () {
    it("returns an array of template file pairs", function () {
      return command.getTemplateFiles().then(files => {
        expect(files).to.have.length.gt(0);
      });
    });
  });

  describe("#writeTemplateFiles", function () {
    afterEach(function () {
      return del([
        `${PROJECT_PATH}/**/*`,
        `${PROJECT_PATH}/**/.*`,
        `!${PROJECT_PATH}`
      ]);
    });

    it.skip("writes project files", function () {
      return command.getTemplateFiles()
        .then(file.makeDirectories.bind(file))
        .then(command.writeTemplateFiles.bind(command))
        .then(() => file.walk(PROJECT_PATH))
        .then(files => {
          const [expected] = files.filter(f => f.name !== ".gitignore");

          expect(expected.name).to.eql(".babelrc");
        });
    });
  });

  describe("#writeTemplateFile", function () {
    afterEach(function () {
      return del([
        `${PROJECT_PATH}/**/*`,
        `${PROJECT_PATH}/**/.*`,
        `!${PROJECT_PATH}`
      ]);
    });

    it("writes a template file", function () {
      return command.getTemplateFiles()
        .then(file.makeDirectories.bind(file))
        .then(files => files.filter(f => f.name === ".travis.yml"))
        .then(files => command.writeTemplateFile(files[0]))
        .then(() => file.walk(PROJECT_PATH))
        .then(files => {
          const [expected] = files.filter(f => f.name !== ".gitignore");

          expect(expected.name).to.eql(".travis.yml");
        });
    });
  });
});
