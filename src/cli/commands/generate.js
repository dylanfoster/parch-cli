"use strict";

import path from "path";

import changeCase from "change-case";
import ejs from "ejs";
import inflect from "inflect";

import Command from "../command";

import { file } from "../../utils";

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
  }

  execute(options) {
    super.execute(options);

    const { argv: { remain }} = options;
    const first = remain.shift();
    const isValidArgs = remain.length === 2;

    if (isValidArgs) {
      const type = remain.shift();
      const name = remain.shift();

      return this.getTemplateFiles(type, name)
        .then(file.makeDirectories.bind(file))
        .then(this.writeTemplateFiles.bind(this, name))
        .catch(err => console.log(err.stack));
    } else {
      throw new Error("Not enough args");
    }
  }

  getTemplateFiles(type, name) {
    const templates = this.templateTypes[type];

    if (!templates) {
      return Promise.reject(new Error(`Invalid generator '${type}'`));
    }

    const { templateFile, testFile } = templates;

    return Promise.all([templateFile, testFile].map(dir => {
      return file.walk(path.join(this.templateDir, dir));
    }))
    .then(files => {
      return files.reduce((acc, current) => {
        return acc.concat(current);
      }, []);
    })
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
