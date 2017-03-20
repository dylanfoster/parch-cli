"use strict";

import fs from "fs";
import path from "path";

import mkdirp from "mkdirp";
import readdirp from "readdirp";

const DOTFILES = [
  "editorconfig",
  "eslintignore",
  "gitignore",
  "gitkeep",
  "npmignore",
  "sequelizerc",
  "travis.yml"
];

export function addMetaData(files, options) {
  return files.map(file => {
    const isDotFile = DOTFILES.some(dot => file.name === dot);
    const isTestFile = path.dirname(file.parentDir) &&
      path.dirname(file.parentDir) === "test";
    const shouldPrefix = options.prefixOnly &&
      options.prefixOnly.length &&
      options.prefixOnly.some(t => {
        return path.dirname(file.fullPath).match(new RegExp(t, "i"))
      });

    if (isDotFile) {
      file.isDotFile = isDotFile;
      file.name = `.${file.name}`;
    }

    if (file.parentDir) {
      file.outPath = path.join(file.parentDir, file.name.replace(/ejs/, "js"));
    } else {
      file.outPath = file.name.replace(/ejs/, "js");
    }

    if (isTestFile) { file.isTestFile = true; }

    file.inPath = file.fullPath;

    const namedFile = `${options.fileNamePrefix}_${path.basename(file.outPath)}`;

    if (shouldPrefix) {
      file.outPath = file.outPath.replace(
        path.basename(file.outPath),
        namedFile
      );
    }

    return file;
  });
}

export function makeDirectories(files) {
  const directories = Object.keys(files).filter(file => {
    return !!files[file].parentDir;
  }).map(dir => files[dir]);

  return Promise.all(directories.map(makeDirectory))
    .then(() => files);
}

export function makeDirectory(directory) {
  return new Promise((resolve, reject) => {
    mkdirp(directory.parentDir, err => {
      if (err) { return reject(err); }

      resolve();
    });
  });
}

export function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) { return reject(err); }

      resolve(data);
    });
  });
}

export function walk(directory) {
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

export function writeFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, err => {
      if (err) { return reject(err); }

      resolve();
    });
  });
}

export default {
  addMetaData,
  makeDirectories,
  makeDirectory,
  readFile,
  walk,
  writeFile
}
