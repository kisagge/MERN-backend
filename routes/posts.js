const express = require("express");
const {
  createPost,
  getPosts,
  getPost,
  deletePost,
  updatePost,
} = require("../controllers/postController");

const router = express.Router();

// GET all posts
router.get("/", getPosts);

// GET a single post
router.get("/:id", getPost);

// POST a new post
router.post("/", createPost);

// DELETE a new post
router.delete("/:id", deletePost);

// UPDATE a new post
router.patch("/:id", updatePost);

module.exports = router;
