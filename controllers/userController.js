const User = require("../models/userModel");
const mongoose = require("mongoose");

// Register User
const registerUser = async (req, res) => {
  const { userId, email, password } = req.body;

  try {
    const user = await User.create({
      userId,
      email,
      password,
    });
    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
};
