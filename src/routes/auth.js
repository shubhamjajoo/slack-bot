const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { catchErrors } = require("../helper/errorHandlers");

/* GET users listing. */

router.get(
  "/slack/callback",
  authController.validatePayload,
  catchErrors(authController.setupBot),
  catchErrors(authController.setAuthorization),
  authController.slackInstalledSuccess
);

module.exports = router;
