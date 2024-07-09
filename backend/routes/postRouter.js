const { protect } = require("../middleware/authMiddleware");
const { limiter } = require("../middleware/limiter");
const express = require("express");
const { getPosts, createPost, postComment } = require("../controllers/postsControllers");
const router = express.Router();

router.get("/", protect, limiter, getPosts);

router.post("/", protect, limiter, createPost);

router.post("/:postId/comments", protect, limiter, postComment);
module.exports = router;
