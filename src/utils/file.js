"use strict";

import fs from "fs";
import path from "path";

import { createPatch } from "diff";
import cyan from "ansi-cyan";
import green from "ansi-green";
import inquirer from "inquirer";
import mkdirp from "mkdirp";
import readdirp from "readdirp";
import red from "ansi-red";

const DOTFILES = [
  "editorconfig",
  "eslintignore",
  "gitignore",
  "gitkeep",
  "npmignore",
  "sequelizerc",
  "travis.yml"
];

class File {
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
      default: false,
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

  diffHighlight(line) {
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

  displayDiff(filePath, existingData, newData) {
    const patch = createPatch(filePath, existingData, newData);
    const lines = patch.split("\n");
    let output = "";

    for (const line of lines) {
      output += this.diffHighlight(line);
      output += "\n";
    }

    this.cli.log(output);

    return Promise.resolve();
  }

  exists(filePath) {
    return new Promise((resolve, reject) => {
      fs.access(filePath, err => {
        if (err) { return reject(err); }

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
        .on("data", data => {
          files.push(data);
        })
      .on("error", reject.bind(reject))
        .on("end", resolve.bind(resolve, files));
    });
  }

  writeFile(filePath, data) {
    return this.checkIfExists(filePath).then(existing => {
      let promise;

      if (existing) {
        promise = this.askForResolution(filePath, existing, data).then(answer => {
          switch (answer) {
            case "diff":
              return this.displayDiff(filePath, existing, data).then(() => this.writeFile(filePath, data));
            case "overwrite":
              return this._writeFile(filePath, data);
            case "skip":
              return;
            default:
              return this._writeFile(filePath, data);
          }
        });
      } else {
        promise = this._writeFile(filePath, data);
      }

      return promise;
    });
  }

  _writeFile(filePath, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, err => {
        if (err) { return reject(err); }

        resolve();
      });
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
      path.dirname(file.parentDir) === "test";

    if (isTestFile) { file.isTestFile = true; }

    return file;
  }

  _checkIfShouldPrefix(file, options) {
    options.prefixOnly = options.prefixOnly || ["controller", "model"];

    const namedFile = `${options.fileNamePrefix}_${path.basename(file.outPath)}`;
    const shouldPrefix = options.prefixOnly.some(
      t => path.dirname(file.fullPath).match(new RegExp(t, "i"))
    );

    if (shouldPrefix) {
      file.outPath = file.outPath.replace(
        path.basename(file.outPath),
        namedFile
      );
    }

    return file;
  }
}

module.exports = File;
