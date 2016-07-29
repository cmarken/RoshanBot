"use strict";

const path = require("path");
const fs = require("fs");
const Log = require("log");
const config = require("exp-config");

function getLoggerStream() {
  switch (config.log) {
    case "file":
      return fs.createWriteStream(path.join(__dirname, "..", "logs", `${config.envName}.log`));
    case "stdout":
      return process.stdout;
    default:
      throw new Error(`Invalid logger: ${config.log}`);
  }
}

module.exports = new Log(config.logLevel || "info", getLoggerStream());