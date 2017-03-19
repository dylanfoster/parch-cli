"use strict";

import fs from "fs";
import path from "path";

import changeCase from "change-case";
import ejs from "ejs";
import inflect from "inflect";
import mkdirp from "mkdirp";

import Command from "../command";

const MAX_ARGS_ALLOWED = 2;

class NewCommand extends Command {
  constructor(cli) {
    super(cli);
  }

  deriveFileName(file) {
    return file.replace(/\.ejs/, "");
  }

  deriveFileType(file) {
    const typeMap = {
      app: "./",
      controller: "controllers",
      model: "models"
    };
    const types = ["app", "controller", "model"];
    const type = file.replace(/\.ejs/, "");

    return {
      path: typeMap[type],
      type
    };
  }

  execute(options) {
    const { argv: { remain }} = options;
    const afterThisCommand = remain.slice(1);
    const argLength = afterThisCommand.length;

    switch (argLength) {
      case 0:
        this.runNewProjectSetup({}).catch(this.cli.log.bind(this.cli));
        break; case 1:
        throw new Error("Invalid number of args passed to 'new'");
        break;
      case 2:
        const [type, name] = afterThisCommand;

        this.runBlueprint({ name, type }).catch(this.cli.log.bind(this.cli));
        break;
      default:
        throw new Error("Invalid number of args passed to 'new'");
    }
  }

  getTemplateFiles(options = {}) {
    const templateDir = path.resolve(__dirname, "../../../templates");
    let { name, type } = options;

    return new Promise((resolve, reject) => {
      fs.readdir(templateDir, (err, files) => {
        if (err) { return reject(err); }

        if (name && type) {
          files = files.filter(file => path.basename(file).match(type));
        }

        resolve(files.map(file => {
          let fileString;

          try {
            fileString = fs.readFileSync(path.join(templateDir, file)).toString();
          } catch (err) {
            return reject(err);
          }

          if (!file.name) {
            name = "foo";
            type = this.deriveFileType(file).type;
          }

          return {
            data: fileString,
            template: file,
            name,
            type,
          };
        }));
      });
    });
  }

  runBlueprint(options) {
    return this.getTemplateFiles(options)
      .then(files => this.writeFiles(files))
  }

  runNewProjectSetup() {
    return this.getTemplateFiles({}).then(files => this.writeFiles(files, {}));
  }

  writeFiles(files) {
    console.log(files);
    return Promise.all(files.map(file => {
      const fileName = `${file.name}_${file.type}.js`;
      const outputDir = `lib/${inflect.pluralize(file.type)}`;
      const template = ejs.compile(file.data);
      const outputString = template({
        name: file.name,
        pluralName: inflect.pluralize(file.name),
        upperCaseName: changeCase.pascalCase(file.name)
      });

      return new Promise((resolve, reject) => {
        mkdirp(outputDir, err => {
          if (err) { return reject(err); }

          fs.writeFile(path.join(outputDir, fileName), outputString, err => {
            if (err) { return reject(err); }

            resolve();
          });
        });
      });
    }));
  }
}

module.exports = NewCommand;
