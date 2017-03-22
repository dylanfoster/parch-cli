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

    this.aliases = ["n"],
    this.args = ["[name]"];
    this.description = "Generate a new Parch project";
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
        prefixOnly: ["controller", "model"],
        projectRoot: this.projectRootPath
      }));
  }

  runHelp() {
    const helpCommand = this.cli.commands.get("help");
    const output = helpCommand.renderCommandBlock(this);

    this.cli.log();
    this.cli.log(output);
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
