const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Schema = mongoose.Schema;
const saltRounds = 10;

const userSchema = new Schema({
  userId: {
    type: String,
    required: true,
    maxlength: 20,
    unique: 1,
  },
  email: {
    type: String,
    trim: true,
    unique: 1,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: Number,
    default: 0,
  },
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
});

userSchema.pre("save", function (next) {
  const user = this;

  // model 안에 password 가 변환될 때만 암호화
  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

userSchema.methods.comparePassword = async function (plainPassword) {
  //plainPassword를 암호화해서 현재 비밀번호화 비교
  try {
    const isMatch = await bcrypt.compare(plainPassword, this.password);
    return isMatch;
  } catch (err) {
    return err;
  }
};

userSchema.methods.generateToken = function () {
  const token = jwt.sign(this._id.toHexString(), "accessToken");
  this.token = token;
  return this.save()
    .then((user) => user)
    .catch((err) => err);
};

module.exports = mongoose.model("User", userSchema);
