const Post = require("../models/postModal");

const postComment = async (req, res) => {
    console.log(req.params.postId);

    const { content, author } = req.body;
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      post.comments.push({ content, author });
      await post.save();
      res.status(200).json(post);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  const createPost = async (req, res) => {
    const { content, author } = req.body;
    try {
      const post = new Post({
        content,
        author,
        comments: []
      });
      await post.save();
      console.log(post);

      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  const getPosts = async (req, res) => {
    try {
      const posts = await Post.find()
        .populate('author', 'name pic')  // Populate author with fields name and pic
        .populate('comments.author', 'name pic');  // Populate comments' author with fields name and pic
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  module.exports = { postComment, createPost, getPosts }