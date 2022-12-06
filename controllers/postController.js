const Post = require("../models/postModel");
const mongoose = require("mongoose");
const User = require("../models/userModel");

// Post Paging
const paging = (page, totalPost) => {
  const maxPost = 5;
  const maxPage = 10;
  let currentPage = page ? parseInt(page) : 1;
  const hidePost = page === 1 ? 0 : (page - 1) * maxPost;
  const totalPage = Math.ceil(totalPost / maxPost);

  if (currentPage > totalPage) {
    currentPage = totalPage;
  }

  const startPage = Math.floor((currentPage - 1) / maxPage) * maxPage + 1;
  let endPage = startPage + maxPage - 1;

  if (endPage > totalPage) {
    endPage = totalPage;
  }

  return { startPage, endPage, hidePost, maxPost, totalPage, currentPage };
};

// Get user id middle function
const getUserIdForPost = async (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];

    const user = await User.findOne({
      token: bearerToken,
    });

    if (!user) {
      return res.status(403).json({ result: false, error: "No such user" });
    }

    req.userId = user.userId;
    next();
  } else {
    res.send(403);
  }
};

// Get all posts
const getPosts = async (req, res) => {
  const keyword = req.query.keyword ?? "";
  const page = req.query.page ?? 1;

  const regex = (pattern) => new RegExp(`.*${pattern}.*`);
  const keywordRegex = regex(keyword);

  try {
    const totalPost = await Post.find({
      $or: [
        { name: { $regex: keywordRegex, $options: "i" } },
        { description: { $regex: keywordRegex, $options: "i" } },
      ],
    }).countDocuments({});

    if (!totalPost) {
      throw Error();
    }

    let { startPage, endPage, hidePost, maxPost, totalPage, currentPage } =
      paging(page, totalPost);

    const posts = await Post.find({
      $or: [
        { name: { $regex: keywordRegex, $options: "i" } },
        { description: { $regex: keywordRegex, $options: "i" } },
      ],
    })
      .sort({
        createdAt: -1,
      })
      .skip(hidePost)
      .limit(maxPost);

    const result = {
      posts,
      startPage,
      endPage,
      totalPage,
      currentPage,
    };
    res.status(200).json(result);
  } catch (error) {
    res.status(200).json({
      posts: [],
      startPage: 1,
      endPage: 1,
      totalPage: 1,
      currentPage: 1,
    });
  }
};

// Get a single post
const getPost = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such post" });
  }

  const post = await Post.findById(id);

  if (!post) {
    return res.status(404).json({ error: "No such post" });
  }

  res.status(200).json({
    result: true,
    data: {
      ...post._doc,
      isAbleModified: userId && userId === post.userId,
    },
  });
};

// Get a single post middle function
const getPostMiddle = async (req, res, next) => {
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
    return res.status(403).json({ result: false });
  }
};

// Create a new post
const createPost = async (req, res) => {
  const userId = req.userId;
  const { name, description } = req.body;

  // Validation
  if (!req.body.name) {
    return res.status(409).json({ error: "Please enter a name" });
  }

  if (!req.body.description) {
    return res.status(409).json({ error: "Please enter a description" });
  }

  // add post to db
  try {
    const post = await Post.create({
      name,
      description,
      userId,
    });
    res.status(200).json({ result: true, data: post });
  } catch (error) {
    res.status(400).json({ result: false, error: error.message });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such post" });
  }

  const isAbleDeleted = (await Post.findById(id)).userId === req.userId;

  if (!isAbleDeleted) {
    return res.status(403).json({ result: false, error: "Invalid user id" });
  }

  const post = await Post.findOneAndDelete({ _id: id });

  if (!post) {
    return res.status(404).json({ error: "No such post" });
  }

  res.status(200).json(post);
};

// Update a post
const updatePost = async (req, res) => {
  const { id } = req.params;

  // Validation
  if (!mongoose.Types.ObjectId.isValid(id) || !req.body._id) {
    return res.status(404).json({ error: "No such post" });
  }

  if (!req.body.name) {
    return res.status(409).json({ error: "Please enter a name" });
  }

  if (!req.body.description) {
    return res.status(409).json({ error: "Please enter a description" });
  }

  const isAbleUpdated = (await Post.findById(id)).userId === req.userId;

  if (!isAbleUpdated) {
    return res.status(403).json({ result: false, error: "Invalid user id" });
  }

  const post = await Post.findOneAndUpdate({ _id: id }, { ...req.body });

  if (!post) {
    return res.status(404).json({ error: "No such post" });
  }
  res.status(200).json(post);
};

module.exports = {
  getPosts,
  getPost,
  getPostMiddle,
  createPost,
  deletePost,
  updatePost,
  getUserIdForPost,
};
