const AppError = require("shared/error");
const Logger = require("shared/logger");

// Middleware
const authenticate = require("../middleware/authenticate.js");
const { body } = require("express-validator/check");

// Utilities
const { ValidateCheck } = require("shared/utilities");
const { Email } = require("shared/utilities");

// Routes
const router = require("express").Router();

/*********************************************
 *
 * Admin Page
 *
 *********************************************/

router.get("/admin",
authenticate,
(request, response, next) => {
  return response.render("admin");
});

/*********************************************
 *
 * Change Password
 *
 *********************************************/

router.get("/change-password",
authenticate,
(request, response, next) => {
  response.render("change-password");
});

router.post("/change-password",
[
  authenticate,
  body("currentPassword")
    .exists().withMessage("Missing current password.")
    .not().isEmpty().withMessage("Missing current password.")
    .custom((value, {req, location, path}) => {
      return req.user.assertPassword(value);
    }).withMessage("Current password is incorrect."),
  body("newPassword")
    .exists().withMessage("Missing new password.")
    .not().isEmpty().withMessage("Missing new password.")
    .isLength({ min: 8, max: 50 }).withMessage("New password must be at least 8 characters long."),
  ValidateCheck
],
(request, response, next) => {
  const currentPassword = request.values.currentPassword;
  const newPassword = request.values.newPassword;
  return request.user.changePassword(currentPassword, newPassword)
    .then( success => {
      Email.sendAdminAlert("Admin Password Changed",
      `IP: ${request.ip}
      Time: ${new Date()}
      Email: ${request.user.email}`);
      request.flashRedirect("success", "Password changed successfully.", "/admin");
    })
    .catch(error => { next(error); });
});

module.exports = router;