const express = require("express");
const router = express.Router();

const { catchErrors } = require("../helper/errorHandlers");

import userController from "../controllers/userController";

router.get("/", catchErrors(userController.getUsers));

module.exports = router;
