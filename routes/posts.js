const express = require("express");
const {
  createPost,
  getPosts,
  getPost,
  deletePost,
  updatePost,
  getUserIdForPost,
  getPostMiddle,
} = require("../controllers/postController");

const router = express.Router();

// GET all posts
router.get("/", getPosts);

// GET a single post
router.get("/:id", getPostMiddle, getPost);

// POST a new post
router.post("/", getUserIdForPost, createPost);

// DELETE a new post
router.delete("/:id", getUserIdForPost, deletePost);

// UPDATE a new post
router.patch("/:id", getUserIdForPost, updatePost);

module.exports = router;
