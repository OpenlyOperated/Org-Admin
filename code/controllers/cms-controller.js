const AppError = require("shared/error");
const Logger = require("shared/logger");

// Middleware
const authenticate = require("../middleware/authenticate.js");
const { body, query } = require("express-validator/check");

// Models
const { Post } = require("shared/models");
const { NewsletterSubscriber } = require("shared/models");

// Utilities
const { ValidateCheck } = require("shared/utilities");
const { Email } = require("shared/utilities");

// Constants
const DOMAIN = process.env.DOMAIN;

// Routes
const router = require("express").Router();

/*********************************************
 *
 * CMS Management Page
 *
 *********************************************/

router.get("/cms",
[
  authenticate,
  query("tagTitle"),
  ValidateCheck
],
(request, response, next) => {
  const tagTitle = request.values.tagTitle;
  
  return Post.list(tagTitle, true)
    .then(posts => {
      return response.render("cms", {
        posts: posts,
        tagTitle: tagTitle
      });
    })
    .catch(error => { next(error); });
});

router.get("/new-post",
authenticate,
(request, response, next) => {
  return response.render("cms-newpost");
});

router.get("/edit-post",
[
  authenticate,
  query("id")
    .exists().withMessage("Missing id.")
    .not().isEmpty().withMessage("Missing id."),
  ValidateCheck
],
(request, response, next) => {
  
  const id = request.values.id;
  
  return Post.getById(id, true)
    .then(post => {
      return response.render("cms-editpost", {
        post: post
      });
    })
    .catch(error => { next(error); });
});

router.post("/save-post",
[
  authenticate,
  body("id"),
  body("title")
    .exists().withMessage("Missing title.")
    .not().isEmpty().withMessage("Missing title."),
  body("author")
    .exists().withMessage("Missing author.")
    .not().isEmpty().withMessage("Missing author."),
  body("alias")
    .matches(Post.aliasPattern).withMessage("Alias must only contain alphanumerics, dashes, and underscores."),
  body("body")
    .exists().withMessage("Missing body.")
    .not().isEmpty().withMessage("Missing body."),
  body("tags"),
  body("published"),
  ValidateCheck
],
(request, response, next) => {
  
  const title = request.values.title;
  const author = request.values.author;
  const alias = request.values.alias || null;
  const body = request.values.body;
  const tags = request.values.tags ? request.values.tags.split(",").map(function(item) {
    return item.toLowerCase().trim();
  }) : [];
  const published = request.values.published ? request.values.published : false;
  var id = request.values.id ? request.values.id : false;
  
  var p = Promise.resolve();
  
  // check if we're creating new post, or updating existing post
  if (id == false) {
    p = p.then( result => {
      return Post.create(title, author, alias, body, tags, published);
    })
    .then( post => {
      id = post.id;
      return post;
    });
  }
  else {
    p = p.then( result => {
      return Post.update(id, title, author, alias, body, tags, published);
    });
  }
  
  return p.then( result => {
    return response.status(200).json({
      message: "Saved successfully",
      id: id
    });
  })
  .catch(error => { next(error); });
});

router.post("/send-post",
[
  authenticate,
  body("id")
    .exists().withMessage("Missing id.")
    .not().isEmpty().withMessage("Missing id."),
  body("target")
    .exists().withMessage("Missing target.")
    .not().isEmpty().withMessage("Missing target."),
  ValidateCheck
],
(request, response, next) => {
  
  const id = request.values.id;
  const target = request.values.target;
  
  Logger.info(`Sending post ID ${id} to target '${target}'.`);
  
  var post;
  var templateName;
  
  // Make a template from the post
  var p = Post.getById(id, true)
  .then(result => {
    post = result;
    return Email.createNewsletterTemplate(post);
  });
  
  // Send the email
  if (target === "admin") {
    p = p.then( result => {
      templateName = result;
      return Email.sendNewsletterTemplate(templateName, [
        {
          emailDecrypted: `admin@${DOMAIN}`,
          doNotEmailCode: "admin"
        }
      ]);
    });
  }
  else if (target === "newsletter") {
    p = p.then( result => {
      templateName = result;
      return NewsletterSubscriber.sendTemplateToAllSubscribers(templateName);
    });
  }
  
  // Delete the template
  p = p.then( result => {
    return Email.deleteNewsletterTemplate(templateName);
  });
  
  return p.then( result => {
    return response.status(200).json({
      message: "Sent successfully."
    });
  })
  .catch(error => { next(error); });
  
});

router.post("/delete-post",
[
  authenticate,
  body("id")
    .exists().withMessage("Missing id.")
    .not().isEmpty().withMessage("Missing id."),
  ValidateCheck
],
(request, response, next) => {
  
  const id = request.values.id;
  
  return Post.deleteById(id)
    .then(post => {
      return response.status(200).json({
        message: "Deleted successfully"
      });
    })
    .catch(error => { next(error); });
});

module.exports = router;