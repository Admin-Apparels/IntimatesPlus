const Post = require("../models/postModal");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const privateEmailPass = process.env.privateEmailPass;
const privateEmail = "intimates_plus@fuckmate.boo";

const postComment = async (req, res) => {
  const { content, author } = req.body;
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({ content, author });
    await post.save();

    // Populate the author and comments' author fields
    await post.populate([
      { path: "author", select: "name pic" },
      { path: "comments.author", select: "name pic" },
    ]);

    res.status(200).json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createPost = async (req, res) => {
  const { content, author, media, mediaType } = req.body;
  const email = req.user.email;
  try {
    let post = new Post({
      content,
      author,
      media,
      mediaType,
      comments: [],
    });
    post = await post.save();

    if (email === privateEmail) {
      // Fetch users excluding the private email and only if they are verified
      const users = await User.find({
        email: { $ne: privateEmail },
        verified: true,
      });
      const userEmails = users.map((user) => user.email);

      let transporter = nodemailer.createTransport({
        host: "mail.privateemail.com",
        port: 465, // or 587 if using STARTTLS
        secure: true, // if using SSL/TLS
        auth: {
          user: privateEmail, // your email address
          pass: privateEmailPass, // your email password
        },
      });

      // URL to your company logo or static image
      const companyLogoUrl =
        "https://res.cloudinary.com/dvc7i8g1a/image/upload/v1720787425/Intimates_o.jpg"; // Replace with your actual logo URL
      const maxLength = 100; // Maximum length of content to display
      const trimmedContent =
        content.length > maxLength
          ? content.substring(0, maxLength) + "..."
          : content;

      const mailOptions = {
        from: `Fuckmate Boo <${privateEmail}>`,
        bcc: userEmails,
        subject: "Trending Post",
        html: `
          <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #333;">Engage with Others and Let Your Soulmate Find You</h2>
            <img src="${companyLogoUrl}" loading="eager" alt="Company Logo" style="width: 100%; margin-bottom: 20px;">
            <p>Hello,</p>
            <p>Be part of the trending topics out there and show your soulmate where you stand.</p>
            <p>THE POST: <strong style="color: #7e8fab;">${trimmedContent}</strong></p>
            <li style="margin-bottom: 6px;"><a href="https://fuckmate.boo/chats" target="_blank" style="color: #007bff; text-decoration: none;">Engage Now</a></li>
            <p>Fuckmate Boo is a hookup-free, porn-free platform designed to channel sexual arousal from fleeting pleasures and self-comforts into intimacy-driven, long-term relationships. By reducing isolation, depression, and anxiety, IntiMates+ aims to improve users' mental health and overall well-being. Find someone who shares your passions and desires, turning fleeting moments into lasting connections.</p>
            <p>Stay connected and follow us on social media:</p>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 10px;"><a href="https://twitter.com/IntiMates_Plus" target="_blank" style="color: #007bff; text-decoration: none;">Twitter</a></li>
              <li style="margin-bottom: 10px;"><a href="https://web.facebook.com/profile.php?id=61554735039262" target="_blank" style="color: #007bff; text-decoration: none;">Facebook</a></li>
            </ul>
            <p>Fuckmate Boo, The Ultimate Adult Escape!</p>
            <p>Thank you for being a part of our community.</p> 
          </div>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }

    // Populate the author field
    post = await post.populate("author", "name pic");

    res.status(201).json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name pic") // Populate author with fields name and pic
      .populate("comments.author", "name pic") // Populate comments' author with fields name and pic
      .sort({ updatedAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    // Find and delete the post by its ID
    const post = await Post.findById(req.params.postId);

    // Check if the post exists
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the logged-in user is the author of the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    // Delete the post
    await Post.findByIdAndDelete(req.params.postId);

    // Optionally: Return the updated list of posts sorted by `updatedAt`
    const posts = await Post.find()
      .populate("author", "name pic")
      .sort({ updatedAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { postComment, createPost, getPosts, deletePost };
