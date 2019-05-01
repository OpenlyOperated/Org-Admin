const AppError = require("shared/error");
const Logger = require("shared/logger");

// Middleware
const authenticate = require("../middleware/authenticate.js");
const { body } = require("express-validator/check");

// Models
const { NewsletterSubscriber } = require("shared/models");

// Utilities
const { ValidateCheck } = require("shared/utilities");

// Routes
const router = require("express").Router();

/*********************************************
 *
 * Newsletter Management Page
 *
 *********************************************/

router.get("/newsletter",
authenticate,
(request, response, next) => {
  var numberConfirmed = 0;
  var numberUnconfirmed = 0;
  return NewsletterSubscriber.getNumberConfirmed()
    .then(result => {
      numberConfirmed = result;
      return NewsletterSubscriber.getNumberUnconfirmed();
    })
    .then(result => {
      numberUnconfirmed = result;
      return NewsletterSubscriber.getNumberDoNotEmail();
    })
    .then(result => {
      return response.render("newsletter", {
        numberConfirmed: numberConfirmed,
        numberUnconfirmed: numberUnconfirmed,
        numberDoNotEmail: result
      });
    })
    .catch(error => { next(error); });
});

module.exports = router;