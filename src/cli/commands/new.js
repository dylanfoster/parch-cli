"use strict";

import fs from "fs";
import path from "path";

import changeCase from "change-case";
import ejs from "ejs";
import inflect from "inflect";

import Command from "../command";
import { file } from "../../utils";

class NewCommand extends Command {
  constructor(cli) {
    super(cli);
  }

  execute(options) {
    super.execute(options);

    return this.generateNewProject().catch(this.cli.log.bind(this.cli));
  }

  generateNewProject() {
    const templateDir = path.resolve(__dirname, "../../../templates");

    return this.getTemplateFiles(templateDir)
      .then(file.makeDirectories.bind(file))
      .then(this.writeTemplateFiles.bind(this));
  }

  getTemplateFiles(templateDir) {
    return file.walk(templateDir)
      .then(files => file.addMetaData(files, {
        fileNamePrefix: "foo",
        prefixOnly: ["controller", "model"]
      }));
  }

  runHelp() {
    const help = `
parch new  generate a new parch project
  alias: n
    `;

    this.cli.log(help);
  }

  writeTemplateFile(fileObject) {
    return file.readFile(fileObject.inPath).then(data => {
      const output = ejs.render(data.toString(), {
        name: "foo",
        projectName: this.projectName,
        pluralName: inflect.pluralize("foo"),
        upperCaseName: changeCase.pascalCase("foo")
      });

      return file.writeFile(fileObject.outPath, output);
    });
  }

  writeTemplateFiles(files) {
    return Promise.all(files.map(this.writeTemplateFile.bind(this)));
  }
}

module.exports = NewCommand;
