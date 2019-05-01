const AppError = require("shared/error");
const Logger = require("shared/logger");

// Middleware
const authenticate = require("../middleware/authenticate.js");
const { body, query } = require("express-validator/check");

// Models
const { CmsFile } = require("shared/models");

// Utilities
const { ValidateCheck } = require("shared/utilities");
const multer = require("multer");
const upload = multer({ dest : "../uploads" });

// Routes
const router = require("express").Router();

/*********************************************
 *
 * CMS Management Page
 *
 *********************************************/

router.get("/cms-files",
[
  authenticate,
  ValidateCheck
],
(request, response, next) => {
  return CmsFile.list()
    .then(cmsFiles => {
      return response.render("cms-files", {
        cmsFiles: cmsFiles
      });
    })
    .catch(error => { next(error); });
});

router.post("/upload-cms-file",
[
  authenticate,
  upload.single("file"),
  body("filename")
    .exists().withMessage("Missing filename.")
    .not().isEmpty().withMessage("Missing filename."),
  ValidateCheck
],
(request, response, next) => {
  const filename = request.values.filename;
  return CmsFile.uploadToS3(request.file, filename)
  .then( result => {
    request.flashRedirect("success", "Upload Successful", "/cms-files");
  })
  .catch(error => { next(error); });
});

module.exports = router;