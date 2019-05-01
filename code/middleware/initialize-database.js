const AppError = require("shared/error");
const Logger = require("shared/logger");

// Utilities
const { Database } = require("shared/utilities");
const { Schema } = require("shared/utilities");

// Constants
const PG_MAIN_PASSWORD = process.env.PG_MAIN_PASSWORD;
const PG_DEBUG_PASSWORD = process.env.PG_DEBUG_PASSWORD;

module.exports = (request, response, next) => {
  if (request.query.initialize == "true" && !request.originalUrl.includes("/notification")) {
    var templatedSchema = Schema.getTemplated(
      PG_MAIN_PASSWORD,
      PG_DEBUG_PASSWORD
    );
    return Database.query(templatedSchema)
      .then( result => {
        Logger.info("Schema applied. Continuing..."); 
        next();
      })
      .catch( error => {
        Logger.error(error);
        next(new AppError(500, 99, "Error initializing database: ", error));
      });
  }
  else {
    next();
  }
};
