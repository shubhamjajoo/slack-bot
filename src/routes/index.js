const express = require("express");
const router = express.Router();

const authRouter = require("./auth");
const usersRouter = require("./users");

router.get("/", function (_req, res) {
  res.send("hello");
});

router.use("/users", usersRouter);

router.use("/auth", authRouter);

module.exports = router;
