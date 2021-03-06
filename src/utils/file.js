"use strict";

import fs from "fs";
import path from "path";

import { createPatch, diffChars } from "diff";
import cyan from "ansi-cyan";
import green from "ansi-green";
import inquirer from "inquirer";
import mkdirp from "mkdirp";
import readdirp from "readdirp";
import red from "ansi-red";
import yellow from "ansi-yellow";

const DOTFILES = [
  "editorconfig",
  "eslintignore",
  "gitignore",
  "gitkeep",
  "npmignore",
  "sequelizerc",
  "travis.yml"
];

export default class File {
  constructor(options) {
    this.cli = options.cli;
    this.prompt = options.prompt.prompt || inquirer.prompt;
  }

  addMetaData(files, options) {
    return files.map(this._addMetaData.bind(this, options));
  }

  askForResolution(file) {
    const questions = {
      type: "expand",
      name: "answer",
      default: 0,
      message: `Overwrite file ${file}`,
      choices: [
        { key: "y", name: "Yes, Overwrite", value: "overwrite" },
        { key: "n", name: "No, skip", value: "skip" },
        { key: "d", name: "Diff", value: "diff" }
      ]
    };

    return this.prompt(questions).then(response => response.answer);
  }

  checkIfExists(filePath) {
    return this.exists(filePath).then(exists => {
      if (exists) {
        return this.readFile(filePath).then(data => data.toString());
      }
    });
  }

  displayDiff(filePath, existingData, newData) {
    const patch = createPatch(filePath, existingData, newData);
    const lines = patch.split("\n");
    let output = "";

    for (const line of lines) {
      output += this._diffHighlight(line);
      output += "\n";
    }

    this.cli.log(output);

    return Promise.resolve();
  }

  exists(filePath) {
    return new Promise((resolve, reject) => {
      fs.access(filePath, err => {
        if (err && err.code === "ENOENT") {
          return resolve(false);
        } else if (err) {
          return reject(err);
        }

        resolve(true);
      });
    });
  }

  makeDirectories(files) {
    const directories = Object.keys(files).filter(
      file => !!files[file].parentDir
    ).map(dir => files[dir]);

    return Promise.all(directories.map(this.makeDirectory.bind(this)))
      .then(() => files);
  }

  makeDirectory(directory) {
    return new Promise((resolve, reject) => {
      mkdirp(directory.parentDir, err => {
        if (err) { return reject(err); }

        resolve();
      });
    });
  }

  readFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) { return reject(err); }

        resolve(data);
      });
    });
  }

  walk(directory) {
    return new Promise((resolve, reject) => {
      const files = [];

      readdirp({ root: directory })
        .on("data", data => files.push(data))
        .on("error", reject.bind(reject))
        .on("end", resolve.bind(resolve, files));
    });
  }

  writeFile(filePath, data) {
    return this.checkIfExists(filePath).then(existing => {
      let promise;

      if (existing) {
        const shouldDiff = diffChars(existing, data).length > 1;

        if (shouldDiff) {
          promise = this.askForResolution(filePath, existing, data).then(answer => {
            switch (answer) {
              case "diff":
                return this.displayDiff(filePath, existing, data).then(() => this.writeFile(filePath, data));
              case "overwrite":
                return this._writeFile(filePath, data, "overwrite");
              case "skip":
                return;
              default:
                return this._writeFile(filePath, data, "skip");
            }
          });
        } else {
          promise = this._writeFile(filePath, data, "identical");
        }
      } else {
        promise = this._writeFile(filePath, data, "create");
      }

      return promise;
    });
  }

  _addMetaData(options, file) {
    file.inPath = file.fullPath;
    file = this._checkIfIsDotfile(file);

    if (file.parentDir) {
      file.outPath = path.join(file.parentDir, file.name.replace(/ejs/, "js"));
    } else {
      file.outPath = file.name.replace(/ejs/, "js");
    }

    file = this._checkIfIsTestFile(file);
    file = this._checkIfShouldPrefix(file, options);
    file.outPath = path.resolve(options.projectRoot, file.outPath);
    return file;
  }

  _checkIfIsDotfile(file) {
    const isDotFile = DOTFILES.some(dot => file.name === dot);

    if (isDotFile) {
      file.isDotFile = isDotFile;
      file.name = `.${file.name}`;
    }

    return file;
  }

  _checkIfIsTestFile(file) {
    const isTestFile = path.dirname(file.parentDir) &&
      path.dirname(file.parentDir).split(path.sep).pop() === "test";

    if (isTestFile) { file.isTestFile = true; }

    return file;
  }

  _checkIfShouldPrefix(file, options) {
    options.prefixOnly = options.prefixOnly || ["controller", "model"];

    let namedFile = `${options.fileNamePrefix}.js`;
    const shouldPrefix = options.prefixOnly.some(
      t => path.dirname(file.fullPath).match(new RegExp(t, "i"))
    );

    if (file.isTestFile) {
      namedFile = `${options.fileNamePrefix}_tests.js`;
    }

    if (shouldPrefix) {
      file.outPath = file.outPath.replace(
        path.basename(file.outPath),
        namedFile
      );
    }

    return file;
  }

  _diffHighlight(line) {
    if (line[0] === "+") {
      return green(line);
    } else if (line[0] === "-") {
      return red(line);
    } else if (line.match(/^@@/)) {
      return cyan(line);
    } else {
      return line;
    }
  }

  _getWriteActionColor(action) {
    let string;

    switch (action) {
      case "create":
        string = green(action);
        break;
      case "identical":
        string = yellow(action);
        break;
      case "overwrite":
        string = red(action);
        break;
      default:
        string = action;
    }

    return string;
  }

  _writeFile(filePath, data, action) {
    const coloredAction = this._getWriteActionColor(action);

    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, err => {
        if (err) { return reject(err); }

        this.cli.log(`${coloredAction}: ${filePath}`);

        resolve();
      });
    });
  }
}
