const AppError = require("shared/error");
const Logger = require("shared/logger");

// Middleware
const authenticate = require("../middleware/authenticate.js");
const { body } = require("express-validator/check");

// Utilities
const { ValidateCheck } = require("shared/utilities");
const { Database } = require("shared/utilities");
const { Email } = require("shared/utilities");
const { Audit } = require("shared/utilities");

// Routes
const router = require("express").Router();

/*********************************************
 *
 * Database Management Page
 *
 *********************************************/

router.get("/database",
authenticate,
(request, response, next) => {
  return response.render("database");
});

/*********************************************
 *
 * Postgres
 *
 *********************************************/

router.post("/postgres-command",
[
  authenticate,
  body("command")
  .exists().withMessage("Missing Command."),
  ValidateCheck
],
(request, response, next) => {
  
  var command = request.values.command;
  
  // Notify Admin
  Email.sendAdminAlert("Postgres Query By " + request.user.email, command);
  
  // Write the Postgres query (not the response) to CloudWatch Log Group and AdminAudit S3
  return Audit.logToCloudWatch("PostgresQueries", command)
  .then( result => {
    return Audit.logToS3("PostgresQueries", command);
  })
  .then( result => {
    return Database.query( command, [])
  })
  .catch( error => {
    throw new AppError(400, 9999, "Error running Postgres query: " + error); 
  })
  // Show result to Admin (but don't log result to maintain privay)
  .then( result => {
    return response.status(200).json({
      message: JSON.stringify(result.rows, null, 2)
    });
  })
  .catch(error => {
    return next(error);
  });
});

module.exports = router;