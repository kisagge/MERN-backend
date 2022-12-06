const Comment = require("../models/commentModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const { find } = require("../models/commentModel");

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

// comment paging
const paging = (page, totalComment) => {
  const maxComment = 10;
  const maxPage = 10;
  let currentPage = isNaN(parseInt(page)) ? 1 : parseInt(page);
  const hideComment = currentPage === 1 ? 0 : (currentPage - 1) * maxComment;
  const totalPage = Math.ceil(totalComment / maxComment);

  if (currentPage > totalPage) {
    currentPage = totalPage;
  }

  const startPage = Math.floor((currentPage - 1) / maxPage) * maxPage + 1;
  let endPage = startPage + maxPage - 1;

  if (endPage > totalPage) {
    endPage = totalPage;
  }

  return {
    startPage,
    endPage,
    hideComment,
    maxComment,
    totalPage,
    currentPage,
  };
};

// Get comment list
const getComments = async (req, res) => {
  const page = req.query.page ?? 1;
  const { postId } = req.params;
  const userId = req.userId;

  try {
    const totalComments = await Comment.find({ postId }).countDocuments({});

    if (!totalComments) {
      return res.status(200).json({
        result: true,
        data: {
          comments: [],
          startPage: 1,
          endPage: 1,
          totalPage: 1,
          currentPage: 1,
        },
        error: null,
      });
    }

    const {
      startPage,
      endPage,
      hideComment,
      maxComment,
      totalPage,
      currentPage,
    } = paging(page, totalComments);

    const comments = await Comment.find({
      postId,
    })
      .sort({ createdAt: -1 })
      .skip(hideComment)
      .limit(maxComment);

    const commentsByUser = comments.map((comment) => {
      return {
        ...comment._doc,
        isAbleModified: userId && comment.userId === userId,
      };
    });

    res.status(200).json({
      result: true,
      data: {
        comments: commentsByUser,
        startPage,
        endPage,
        totalPage,
        currentPage,
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
    await Comment.create({
      content: req.body.content,
      postId,
      userId,
    });
    res.status(200).json({ result: true, error: null });
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

module.exports = {
  getUserIdForComment,
  getComments,
  createComment,
  deleteComment,
};
