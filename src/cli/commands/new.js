"use strict";

import fs from "fs";
import path from "path";

import changeCase from "change-case";
import ejs from "ejs";
import inflect from "inflect";
import mkdirp from "mkdirp";

import Command from "../command";

const DOTFILES = [
  "editorconfig",
  "eslintignore",
  "gitignore",
  "npmignore",
  "travis.yml"
];
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
      .then(this.writeFiles.bind(this));
  }

  getTemplateFiles(templateDir) {
    return this.readDir(templateDir).then(files => {
      return Promise.all(files.map(file => {
        const filePath = path.join(templateDir, file);
        const newFile = file.replace(/ejs/, 'js');

        console.log(file);
        return this.stat(filePath).then(stat => {
          const fileObject = {
            file,
            inPath: filePath,
            isDirectory: stat.isDirectory.bind(stat),
            isDotFile: DOTFILES.some(dot => file === dot),
            outPath: path.resolve(process.cwd(), newFile),
            stat: stat,
          }

          if (stat.isDirectory()) {
            const dirName = filePath.match(/([^\/]*)\/*$/)[1];

            fileObject.files = [];

            return this.readDir(filePath).then(nestedFiles => {
              return Promise.all(nestedFiles.map(nestedFile => {
                const nestedFilePath = path.join(filePath, nestedFile);
                const newFile = nestedFile.replace(/ejs/, 'js');

                return this.stat(nestedFilePath).then(stat => {
                  fileObject.files.push({
                    file: nestedFile,
                    inPath: nestedFilePath,
                    isDirectory: stat.isDirectory.bind(stat),
                    isDotFile: DOTFILES.some(dot => nestedFile === dot),
                    isTestFile: new RegExp(/test/i).test(dirName),
                    outPath: path.resolve(process.cwd(), dirName, newFile),
                    stat
                  });
                });
              }));
            }).then(() => fileObject);
          }

          return fileObject;
        });
      }));
    });
  }

  makeDirectories(directories) {
    return Promise.all(directories.map(this.makeDirectory.bind(this)));
  }

  makeDirectory(directory) {
    return new Promise((resolve, reject) => {
      mkdirp(directory, err => {
        if (err) { return reject(err); }

        resolve();
      });
    })
  }

  readDir(directory) {
    return new Promise((resolve, reject) => {
      fs.readdir(directory, (err, files) => {
        if (err) { return reject(err); }

        resolve(files);
      });
    });
  }

  stat(filePath) {
    return new Promise((resolve, reject) => {
      fs.stat(filePath, (err, stat) => {
        if (err) { return reject(err); }

        resolve(stat);
      })
    });
  }

  writeFile(file) {
    if (file.isDotFile) {
      file.outPath = file.outPath.replace(file.file, `.${file.file}`);
    }

    if (file.isTestFile) {
      const fileWithoutExtension = file.file.split(".")[0];
      const regex = new RegExp(fileWithoutExtension, "i");

      file.outPath = file.outPath.replace(regex, `${fileWithoutExtension}_tests`);
    }

    return new Promise((resolve, reject) => {
      fs.readFile(file.inPath, (err, data) => {
        if (err) { return reject(err); }

        const out = ejs.render(data.toString(), {
          name: "foo",
          pluralName: "foos",
          projectName: this.projectName,
          upperCaseName: "Foo"
        });

        return this._writeFile(file.outPath, out);
      });
    });
  }

  writeFiles(files) {
    const dirs = files
      .filter(file => file.isDirectory())
      .map(file => file.outPath.match(/([^\/]*)\/*$/)[1]);

    return this.makeDirectories(dirs).then(() => {
      return Promise.all(files.map(file => {
        if (file.isDirectory()) {
          return this.writeFiles(file.files);
        }

        return this.writeFile(file);
      }));
    });
  }

  _writeFile(filePath, data){
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, err => {
        if (err) { return reject(err); }

        resolve();
      });
    });
  }
}

module.exports = NewCommand;
