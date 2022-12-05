const express = require("express");
const {
  registerUser,
  signInUser,
  ensureAuthorized,
  getMyInfo,
} = require("../controllers/userController");

const router = express.Router();

// Register
router.post("/register", registerUser);

// Sign-in
router.post("/sign-in", signInUser);

// Get User Info
router.post("/me", ensureAuthorized, getMyInfo);

module.exports = router;
