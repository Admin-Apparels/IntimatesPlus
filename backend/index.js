const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRouter");
const chatRoutes = require("./routes/chatRouter");
const messageRoutes = require("./routes/messageRouter");
const payRoutes = require("./routes/payRouter");
const postsRoutes = require("./routes/postRouter");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
const bodyParser = require("body-parser");

const { initializeSocketIO } = require("./socket");
dotenv.config({ path: "./secrets.env" });
connectDB();
const app = express();

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
app.use("/api/posts", postsRoutes)
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
