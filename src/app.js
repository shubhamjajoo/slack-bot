const express = require("express");
const axios = require("axios");

const cookieParser = require("cookie-parser");
const logger = require("morgan");
require("dotenv").config();

const routes = require("./routes");
const errorHandlers = require("./helper/errorHandlers");
const { SLACK_API_URL } = require("./helper/constants");

const app = express();

axios.defaults.baseURL = SLACK_API_URL;
axios.defaults.headers.post["Content-Type"] =
  "application/x-www-form-urlencoded";

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());

app.use("/", routes);

// If that above routes didn't work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// Otherwise this was a really bad error we didn't expect!
if (app.get("env") === "development") {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);

module.exports = app;
