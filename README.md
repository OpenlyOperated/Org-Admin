# Admin Server

This is a private Node.js Express server that hosts the Admin dashboard at `https://admin.[domain]`. It initializes the database, contains the Content Management System for the pages served on `Main` server, manages the newsletter functionality, and has other admin actions. Its Security Group restricts its access to one whitelisted IP CIDR range. Most actions are logged and many actions, such as signin or signup, send email alerts to the administrator.

- [Prerequisites](#prerequisites)
- [Database Initialization](#database-initialization)
- [Sign In](#sign-in)
  * [Sign In - Web](#sign-in---web)
  * [Sign In](#sign-in-1)
  * [Log Out (Delete Session)](#log-out--delete-session-)
- [Create Admin User](#create-admin-user)
  * [Create Admin User With Email - Web](#create-admin-user-with-email---web)
  * [Create Admin User With Email](#create-admin-user-with-email)
  * [Confirm Admin Email to Complete Email Signup](#confirm-admin-email-to-complete-email-signup)
  * [Resend Confirmation Email - Web](#resend-confirmation-email---web)
  * [Resend Confirmation Email](#resend-confirmation-email)
- [Admin](#admin)
  * [Admin Dashboard Home - Web](#admin-dashboard-home---web)
  * [Change Admin User Password - Web](#change-admin-user-password---web)
  * [Change Admin User Password](#change-admin-user-password)
- [Content Management System](#content-management-system)
  * [CMS Dashboard - Web](#cms-dashboard---web)
  * [New Post - Web](#new-post---web)
  * [Edit Post - Web](#edit-post---web)
  * [Save Post](#save-post)
  * [Delete Post](#delete-post)
- [Content Management System - Files](#content-management-system---files)
  * [Content Management System - File Uploads - Web](#content-management-system---file-uploads---web)
  * [Upload File](#upload-file)
- [Newsletter Management](#newsletter-management)
  * [View Anonymized Newsletter Statistics](#view-anonymized-newsletter-statistics)
  * [Send Post To Newsletter](#send-post-to-newsletter)
- [Database - Postgres Command](#database---postgres-command)
  * [Admin Dashboard Database Management - Web](#admin-dashboard-database-management---web)
  * [Run Logged Postgres Command](#run-logged-postgres-command)
- [Other APIs](#other-apis)
  * [Test Error Logging](#test-error-logging)
  * [Health Check](#health-check)
- [Feedback](#feedback)
- [License](#license)
- [Contact](#contact)


## Prerequisites

* Run the Admin [CloudFormation](https://github.com/OpenlyOperated/Org-CloudFormation) and all its prerequisites

## Database Initialization
Before running anything, you must initialize the database:
```
GET /?initialize=true
```

## Sign In

The `POST /signin` API returns a session cookie. Use the cookie on requests that require authentication. Usually, your HTTP request framework will automatically save this cookie. If the cookie expires or server returns 401, request a new cookie.

### Sign In - Web
__Request__

```
GET /signin
```

### Sign In
__Request__

```
POST /signin
```

Name | Type | Description
--- | --- | ---
`email` | `string` | __Required__ User email.
`password` | `string` | __Required__ User password.

__Response__

```
Set-Cookie: <Cookie with Expiration Time>
```

### Log Out (Delete Session)
__Request__
```
GET /logout
```

__Response__

```
Redirects to /signin
```

## Create Admin User

### Create Admin User With Email - Web
__Request__

```
GET /signup
```

### Create Admin User With Email
__Request__

```
POST /signup
```

Name | Type | Description
--- | --- | ---
`email` | `string` | __Required__ Email to use to create the user.
`password` | `string` | __Required__ User password.

__Response__

```
Redirect to /signup-success
```

### Confirm Admin Email to Complete Email Signup
__Request__

```
GET /confirm-email
```

Name | Type | Description
--- | --- | ---
`code` | `string` | __Required__ Code that confirms a user is the owner of an email address to complete email signup.

__Response__

```
Redirect to /signin
```

### Resend Confirmation Email - Web
__Request__

```
GET /resend-confirm-code
```

### Resend Confirmation Email
__Request__

```
POST /resend-confirm-code
```

Name | Type | Description
--- | --- | ---
`email` | `string` | __Required__ Email to resend confirmation code to.

__Response__

```
Redirect to /signin
```

## Admin

### Admin Dashboard Home - Web
__Request__

`Authentication Required`

```
GET /admin
```

### Change Admin User Password - Web
__Request__

`Authentication Required`

```
GET /change-password
```

### Change Admin User Password
__Request__

`Authentication Required`

```
POST /change-password
```

Name | Type | Description
--- | --- | ---
`currentPassword` | `string` | __Required__ User's current password.
`newPassword` | `string` | __Required__ User's new password.

__Response__

```
Redirect to /admin
```

## Content Management System

### CMS Dashboard - Web
__Request__

`Authentication Required`

```
GET /cms
```

### New Post - Web
__Request__

`Authentication Required`

```
GET /new-post
```

### Edit Post - Web
__Request__

`Authentication Required`

```
GET /edit-post?id=[POST_ID]
```

Name | Type | Description
--- | --- | ---
`id` | `string` | __Required__ ID of post you're editing

### Save Post
__Request__

`Authentication Required`

```
POST /save-post
```

Name | Type | Description
--- | --- | ---
`id` | `string` | Required if you're editing a post. The ID of post you're saving edits to.
`title` | `string` | __Required__ Title of the post
`author` | `string` | __Required__ Author name of the post
`alias` | `string` | __Required__ A URI alias for viewing the post, used in this format: `https://[domain]/post/[alias]`. Only alphanumerics, dashes, and underscores.
`body` | `string` | __Required__ Body of the post, in Markdown format.
`tags` | `string` | Comma separated tags for the post.
`published` | `boolean` | Whether or not the post is published, meaning it's publicly viewable. Defaults to `false`.

__Response__

```
{
	message: "Saved successfully",
	id: [ID of the post]
}
```

### Delete Post
__Request__

`Authentication Required`

```
POST /delete-post
```

Name | Type | Description
--- | --- | ---
`id` | `string` | __Required__ The ID of post you're deleting.

__Response__

```
{
	message: "Deleted successfully"
}
```


## Content Management System - Files

### Content Management System - File Uploads - Web
__Request__

`Authentication Required`

```
GET /cms-files
```

### Upload File
__Request__

`Authentication Required`

```
POST /upload-cms-file
```

Name | Type | Description
--- | --- | ---
`filename` | `string` | __Required__ The name you want the uploaded file to have.
`file` | `binary` | __Required__ The file data to upload.

__Response__

Redirect to `/cms-files` with "Upload Successful" message.


## Newsletter Management

### View Anonymized Newsletter Statistics
__Request__

`Authentication Required`

```
GET /newsletter
```

__Response__

Shows number of confirmed emails, unconfirmed emails, and unsubscribed do not emails.


### Send Post To Newsletter
__Request__

`Authentication Required`

```
POST /send-post
```

Name | Type | Description
--- | --- | ---
`id` | `string` | __Required__ The ID of post you're sending to the newsletter.
`target` | `string` | __Required__ The target you're sending to. Can be either `admin` or `newsletter`. `admin` is for testing a send of the newsletter &mdash; it sends to just `admin@[domain]`. `newsletter` sends to the entire newsletter.

__Response__

```
{
	message: "Sent successfully."
}
```

## Database - Postgres Command

### Admin Dashboard Database Management - Web
__Request__

`Authentication Required`

```
GET /database
```

### Run Logged Postgres Command
The query itself will be logged to a CloudWatch Log Group called PostgresQueries. The result is not logged.
 
__Request__

`Authentication Required`

```
POST /postgres-command
```

Name | Type | Description
--- | --- | ---
`command` | `string` | __Required__ Postgres query to run.

__Response__

```
Displays the query result onscreen.
```

## Other APIs

### Test Error Logging
__Request__

```
GET /error-test
```

### Health Check
__Request__

```
GET /health
```

__Response__

```
Status 200
{
	message: "OK from admin." + DOMAIN
}
```

## Feedback
If you have any questions, concerns, or other feedback, please let us know any feedback in Github issues or by e-mail.

## License

This project is licensed under the GPL License - see the [LICENSE.md](LICENSE.md) file for details

## Contact

<engineering@openlyoperated.org>