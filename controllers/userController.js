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
    let errorMessage = "";
    if (error.message.includes("E11000")) {
      if (error.message.includes("userId")) {
        errorMessage = "User id is duplicated";
      } else if (error.message.includes("email")) {
        errorMessage = "Email is duplicated";
      }
    } else {
      errorMessage = error.message;
    }

    res.status(400).json({ result: false, error: errorMessage });
  }
};

// signIn User
const signInUser = async (req, res) => {
  try {
    const user = await User.findOne({
      userId: req.body.userId,
    });
    if (!user) {
      return res.status(401).json({ result: false, error: "Not exist user" });
    }

    const isMatched = await user.comparePassword(req.body.password);

    if (!isMatched) {
      return res
        .status(401)
        .json({ result: false, error: "Password is not matched" });
    }

    // 비밀번호 일치시 jwt 토큰 생성
    const genToken = await user.generateToken();
    console.log(genToken);
    if (genToken) {
      return res
        .cookie("accessToken", genToken.token)
        .status(200)
        .json({ result: true, token: genToken.token });
    } else {
      res.status(401).json({ result: false, error: "Sign in failed" });
    }
  } catch (err) {
    res.status(401).json({ result: false, error: "Sign in failed" });
  }
};

function ensureAuthorized(req, res, next) {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    next();
  } else {
    res.send(403);
  }
}
// Get User Info
const getMyInfo = async (req, res) => {
  try {
    const user = await User.findOne({
      token: req.token,
    });
    res.status(200).json({
      result: true,
      data: user,
    });
  } catch (err) {
    res.status(401).json({
      result: false,
      error: err,
    });
  }
};

module.exports = {
  registerUser,
  signInUser,
  ensureAuthorized,
  getMyInfo,
};
