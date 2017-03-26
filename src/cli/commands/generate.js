"use strict";

import path from "path";

import changeCase from "change-case";
import ejs from "ejs";
import inflect from "inflect";
import inquirer from "inquirer";

import Command from "../command";

import { File } from "../../utils";

const VALID_ARGS_LENGTH = 2;

export default class GenerateCommand extends Command {
  constructor(cli) {
    super(cli);

    this.templateTypes = {
      controller: {
        templateFile: "lib/controllers",
        testFile: "test/controllers"
      },
      model: {
        templateFile: "lib/models",
        testFile: "test/models"
      }
    };

    this.aliases = ["g"];
    this.args = ["<template>", "<name>"];
    this.description = "Generate a new file from a template";
    this.options = [];

    this.file = new File({
      cli: this.cli,
      prompt: inquirer
    });
  }

  execute(options) {
    super.execute(options);

    const { argv: { remain }} = options;

    remain.shift();
    const isValidArgs = remain.length === VALID_ARGS_LENGTH;

    if (isValidArgs) {
      const type = remain.shift();
      const name = remain.shift();

      this.cli.progress.text = `Generating templates for ${type}`;
      this.cli.progress.start();

      return this.getTemplateFiles(type, name)
        .then(this.file.makeDirectories.bind(this.file))
        .then(this.writeTemplateFiles.bind(this, name))
        .then(() => this.cli.progress.stop())
        .catch(err => console.log(err.stack));
    } else {
      const help = this.cli.commands.get("help");

      this.cli.error("Invalid number of arguments");
      this.cli.log();

      return help.execute(options);
    }
  }

  getTemplateFiles(type, name) {
    const templates = this.templateTypes[type];

    if (!templates) {
      return Promise.reject(new Error(`Invalid generator '${type}'`));
    }

    const { templateFile, testFile } = templates;

    return Promise.all([templateFile, testFile].map(
      dir => this.file.walk(path.join(this.templateDir, dir))
    ))
    .then(files => files.reduce((acc, current) => acc.concat(current), []))
    .then(files => {
      files.forEach(f => {
        const dirName = path.dirname(f.fullPath);

        f.parentDir = dirName.split("templates/")[1];
        f.parentDir = path.resolve(this.projectRootPath, f.parentDir);
      });

      return files;
    })
    .then(files => this.file.addMetaData(files, {
      fileNamePrefix: name,
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

  writeTemplateFile(name, fileObject) {
    return this.file.readFile(fileObject.inPath).then(data => {
      const output = ejs.render(data.toString(), {
        name,
        pluralName: inflect.pluralize(name),
        upperCaseName: changeCase.pascalCase(name)
      });

      return this.file.writeFile(fileObject.outPath, output);
    });
  }

  writeTemplateFiles(name, files) {
    let promise = Promise.resolve();

    files.forEach(f => {
      promise = promise.then(() => this.writeTemplateFile(name, f));
    });

    return promise;
  }
}
