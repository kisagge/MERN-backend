require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// routes
const postsRoutes = require("./routes/posts");
const userRoutes = require("./routes/user");
const commentsRoutes = require("./routes/comments");

const PORT = process.env.PORT || 4000;

// express app
const app = express();

// middleware
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,PATCH,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type, Authorization"
  );
  next();
});

// routes
app.use("/api/posts", postsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/comments", commentsRoutes);

// connect to db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(PORT, () => {
      console.log("connect to db && listening on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
