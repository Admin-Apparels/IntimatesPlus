const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRouter");
const chatRoutes = require("./routes/chatRouter");
const messageRoutes = require("./routes/messageRouter");
const payRoutes = require("./routes/payRouter");
const voteRouter = require("./routes/voteRouter");
const postsRoutes = require("./routes/postRouter");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const bodyParser = require("body-parser");
const cloudinary = require("cloudinary").v2;

const { initializeSocketIO } = require("./socket");
const { protect } = require("./middleware/authMiddleware");
dotenv.config({ path: "./secrets.env" });
connectDB();
const app = express();

app.set("trust proxy", 1);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = process.env.PORT;
const server = app.listen(
  PORT,
  console.log(`Server running on PORT ${PORT}...`)
);

initializeSocketIO(server);

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/paycheck", payRoutes);
app.use("/api/posts", postsRoutes);
app.use("/api/poll", voteRouter);

cloudinary.config({
  cloud_name: "dvc7i8g1a",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.get("/generate-upload-url", (req, res) => {
  console.log(
    req.query,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET
  );
  const { resource_type } = req.query;
  const timestamp = Math.floor(Date.now() / 1000);
  const upload_preset = "RocketChat"; // Replace with your upload preset

  if (!resource_type || !["image", "video"].includes(resource_type)) {
    return res.status(400).json({ error: "Invalid resource type" });
  }

  // Generate signature
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      upload_preset,
      resource_type,
    },
    cloudinary.config().api_secret
  );

  const uploadUrl = `https://api.cloudinary.com/v1_1/${
    cloudinary.config().cloud_name
  }/${resource_type}/upload`;

  res.json({
    uploadUrl,
    signature,
    timestamp,
  });
});

const __dirname1 = path.resolve();

//Render folder structure
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "../frontend/build")));

  // Serve index.html for all other routes
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "../frontend/build", "index.html"));
  });
} else {
  // Fallback for development or other environments
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

//Heroku folder structure
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname1, "./frontend/build")));

//   app.get("*", (req, res) => {
//     res.sendFile(
//       path.resolve(__dirname1, ".", "frontend", "build", "index.html")
//     );
//   });
// } else {
//   app.get("/", (req, res) => {
//     res.send("API is running..");
//   });
// }

app.use(notFound);
app.use(errorHandler);
