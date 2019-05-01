"use strict";

const app = require("./app.js");
const Logger = require("shared/logger");
const ENVIRONMENT = process.env.ENVIRONMENT;

var port = 3000;

if (ENVIRONMENT === "LOCAL") {
  port = 3001;
}

app.listen(port, function() {
  Logger.info("Listening on port " + port);
});