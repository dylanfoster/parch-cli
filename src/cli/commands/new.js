"use strict";

import fs from "fs";
import path from "path";

import changeCase from "change-case";
import ejs from "ejs";
import inflect from "inflect";

import Command from "../command";
import { file } from "../../utils";

const MAX_ARGS_ALLOWED = 2;

class NewCommand extends Command {
  constructor(cli) {
    super(cli);

    this.projectName = process.cwd().match(/([^\/]*)\/*$/)[1];
  }

  execute(options) {
    return this.generateNewProject().catch(this.cli.log.bind(this.cli));
  }

  generateNewProject() {
    const templateDir = path.resolve(__dirname, "../../../templates");

    return this.getTemplateFiles(templateDir)
      .then(file.makeDirectories.bind(file))
      .then(file.makeDirectories.bind(file))
      .then(this.writeTemplateFiles.bind(this));
  }

  getTemplateFiles(templateDir) {
    return file.walk(templateDir)
      .then(file.addMetaData.bind(file))
  }

  writeTemplateFile(fileObject) {
    return file.readFile(fileObject.inPath).then(data => {
      const output = ejs.render(data.toString(), {
        name: "user",
        projectName: this.projectName,
        pluralName: inflect.pluralize("user"),
        upperCaseName: changeCase.pascalCase("user")
      });

      return file.writeFile(fileObject.outPath, output);
    });
  }

  writeTemplateFiles(files) {
    return Promise.all(files.map(this.writeTemplateFile.bind(this)));
  }
}

module.exports = NewCommand;
