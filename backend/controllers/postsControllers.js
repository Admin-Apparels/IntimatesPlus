const Post = require("../models/postModal");

const postComment = async (req, res) => {
  const { content, author } = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.comments.push({ content, author });
    await post.save();

    // Populate the author and comments' author fields
    await post.populate([
      { path: 'author', select: 'name pic' },
      { path: 'comments.author', select: 'name pic' }
    ]);

    res.status(200).json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createPost = async (req, res) => {
  const { content, author } = req.body;
  try {
    let post = new Post({
      content,
      author,
      comments: []
    });
    post = await post.save();

    // Populate the author field
    post = await post.populate('author', 'name pic');

    res.status(201).json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name pic')  // Populate author with fields name and pic
      .populate('comments.author', 'name pic')  // Populate comments' author with fields name and pic
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

  module.exports = { postComment, createPost, getPosts }