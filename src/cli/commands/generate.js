"use strict";

import path from "path";

import changeCase from "change-case";
import ejs from "ejs";
import inflect from "inflect";

import Command from "../command";

import { file } from "../../utils";

const VALID_ARGS_LENGTH = 2;

class GenerateCommand extends Command {
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
  }

  execute(options) {
    super.execute(options);

    const { argv: { remain }} = options;

    remain.shift();
    const isValidArgs = remain.length === VALID_ARGS_LENGTH;

    if (isValidArgs) {
      const type = remain.shift();
      const name = remain.shift();

      return this.getTemplateFiles(type, name)
        .then(file.makeDirectories.bind(file))
        .then(this.writeTemplateFiles.bind(this, name))
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
      dir => file.walk(path.join(this.templateDir, dir))
    ))
    .then(files => files.reduce((acc, current) => acc.concat(current), []))
    .then(files => {
      files.forEach(f => {
        const dirName = path.dirname(f.fullPath);

        f.parentDir = dirName.split("templates/")[1];
      });

      return files;
    })
    .then(files => file.addMetaData(files, {
      fileNamePrefix: name,
      prefixOnly: ["controller", "model"]
    }));
  }

  runHelp() {
    const helpCommand = this.cli.commands.get("help");
    const output = helpCommand.renderCommandBlock(this);

    this.cli.log();
    this.cli.log(output);
  }

  writeTemplateFile(name, fileObject) {
    return file.readFile(fileObject.inPath).then(data => {
      const output = ejs.render(data.toString(), {
        name,
        pluralName: inflect.pluralize(name),
        upperCaseName: changeCase.pascalCase(name)
      });

      return file.writeFile(fileObject.outPath, output);
    });
  }

  writeTemplateFiles(name, files) {
    return Promise.all(files.map(this.writeTemplateFile.bind(this, name)));
  }
}

module.exports = GenerateCommand;
