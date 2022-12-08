const Comment = require("../models/commentModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");

// get user id middle function
const getUserIdForComment = async (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];

    const user = await User.findOne({
      token: bearerToken,
    });

    if (!user) {
      req.userId = null;
    } else {
      req.userId = user.userId;
    }
    next();
  } else {
    return res.status(403).json({ result: false, error: "Invalid user id" });
  }
};

// Get comment list
const getComments = async (req, res) => {
  const { postId } = req.params;
  const userId = req.userId;

  try {
    const comments = await Comment.find({
      postId,
    });

    const commentsByUser = comments.map((comment) => {
      return {
        ...comment._doc,
        like: comment._doc.like.length,
        isAbleModified: userId && comment.userId === userId,
      };
    });

    res.status(200).json({
      result: true,
      data: {
        comments: commentsByUser,
      },
      error: null,
    });
  } catch (error) {
    res.status(400).json({
      result: false,
      error: error.message,
      data: {
        comments: [],
        startPage: 1,
        endPage: 1,
        totalPage: 1,
        currentPage: 1,
      },
    });
  }
};

const createComment = async (req, res) => {
  const userId = req.userId;
  const { postId } = req.params;

  // Validation
  if (!req.body.content) {
    return res.status(409).json({
      result: false,
      error: "Please enter content",
    });
  }

  try {
    const comment = await Comment.create({
      content: req.body.content,
      postId,
      userId,
    });
    res.status(200).json({
      result: true,
      error: null,
      data: {
        comment: {
          ...comment._doc,
          like: comment._doc.like.length,
          isAbleModified: true,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      result: false,
      error: error.message,
    });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ result: false, error: "No such comment" });
  }

  const isAbleDeleted = (await Comment.findById(id)).userId === req.userId;

  if (!isAbleDeleted) {
    return res.status(403).json({ result: false, error: "Invalid user id" });
  }

  const comment = await Comment.findOneAndDelete({ _id: id });

  if (!comment) {
    return res.status(400).json({ result: false, error: "No such comment" });
  }

  res.status(200).json({ result: true, error: null });
};

const likeComment = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ result: false, error: "No such comment" });
  }

  let likeList = (await Comment.findById(id)).like;

  // 좋아요 되어있으면
  if (likeList.includes(userId)) {
    likeList = likeList.filter((like) => like !== userId);
  } else {
    likeList.push(userId);
  }

  await Comment.findOneAndUpdate({ _id: id }, { like: likeList });

  const comment = await Comment.findById(id);

  res.status(200).json({
    result: true,
    error: null,
    data: {
      like: comment.like.length,
    },
  });
};

module.exports = {
  getUserIdForComment,
  getComments,
  createComment,
  deleteComment,
  likeComment,
};
