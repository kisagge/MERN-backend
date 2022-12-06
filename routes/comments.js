const express = require("express");
const {
  getUserIdForComment,
  getComments,
  createComment,
  deleteComment,
} = require("../controllers/commentController");

const router = express.Router();

// Get comments by post
router.post("/:postId", getUserIdForComment, getComments);

router.post("/create/:postId", getUserIdForComment, createComment);

router.delete("/:id", getUserIdForComment, deleteComment);

module.exports = router;
