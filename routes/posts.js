const express = require("express");
const Post = require("../models/PostModel");

const router = express.Router();

// GET all posts
router.get("/", (req, res) => {
  res.json({ message: "GET all posts" });
});

// GET a single post
router.get("/:id", (req, res) => {
  res.json({ message: `GET a single post` });
});

// POST a new post
router.post("/", async (req, res) => {
  const { name, description } = req.body;

  try {
    const post = await Post.create({
      name,
      description,
    });
    res.status(200).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE a new post
router.delete("/:id", (req, res) => {
  res.json({ message: "DELETE a post" });
});

// UPDATE a new post
router.patch("/:id", (req, res) => {
  res.json({ message: "UPDATE a post" });
});

module.exports = router;
