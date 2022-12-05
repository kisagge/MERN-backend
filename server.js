require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

// routes
const postsRoutes = require("./routes/posts");
const userRoutes = require("./routes/user");

// whitelist
const whitelist = ["http://localhost:3002"];

// cors option
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not Allowed Origin!"));
    }
  },
};

// express app
const app = express();

// middleware
app.use(express.json());

app.use(cors(corsOptions));

app.use(cookieParser());

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// routes
app.use("/api/posts", postsRoutes);
app.use("/api/user", userRoutes);

// connect to db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, () => {
      console.log("connect to db && listening on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
