const express = require("express");
const { registerUser, signInUser } = require("../controllers/userController");

const router = express.Router();

// Register
router.post("/register", registerUser);

router.post("/sign-in", signInUser);

module.exports = router;
