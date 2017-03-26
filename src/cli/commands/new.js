"use strict";

import changeCase from "change-case";
import ejs from "ejs";
import inflect from "inflect";
import inquirer from "inquirer";

import Command from "../command";
import { File } from "../../utils";

export default class NewCommand extends Command {
  constructor(cli) {
    super(cli);

    this.aliases = ["n"];
    this.args = ["[name]"];
    this.description = "Generate a new Parch project";
    this.file = new File({
      cli: this.cli,
      prompt: inquirer
    });
  }

  execute(options) {
    super.execute(options);

    return this.generateNewProject().catch(this.cli.log.bind(this.cli));
  }

  generateNewProject() {
    return this.getTemplateFiles()
      .then(this.file.makeDirectories.bind(this.file))
      .then(this.writeTemplateFiles.bind(this));
  }

  getTemplateFiles() {
    return this.file.walk(this.templateDir)
      .then(files => this.file.addMetaData(files, {
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
    return this.file.readFile(fileObject.inPath).then(data => {
      const output = ejs.render(data.toString(), {
        name: "foo",
        projectName: this.projectName,
        pluralName: inflect.pluralize("foo"),
        upperCaseName: changeCase.pascalCase("foo")
      });

      return this.file.writeFile(fileObject.outPath, output);
    });
  }

  writeTemplateFiles(files) {
    let promise = Promise.resolve();

    files.forEach(f => {
      promise = promise.then(() => this.writeTemplateFile(f));
    });

    return promise;
  }
}
