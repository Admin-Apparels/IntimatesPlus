const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const nodemailer = require("nodemailer");
const Fuse = require("fuse.js");

const generateToken = require("../config/generateToken");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const crypto = require("crypto");
const axios = require("axios");
const { DOMParser } = require("@xmldom/xmldom");
const { onlineUsersMatch, extractLocations } = require("../config/socketUtils");

dotenv.config({ path: "./secrets.env" });
const privateEmailPass = process.env.privateEmailPass;
const privateEmail = "intimates_plus@fuckmate.boo";

const registerUsers = asyncHandler(async (req, res) => {
  const { name, email, password, gender, pic, value, looking } = req.body;

  if (!email || !name || !password || !gender) {
    res.status(400);
    throw new Error("Please enter all fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists, login");
  }

  const userData = { name, email, password, gender, pic, value, looking };

  const user = await User.create(userData);

  if (user) {
    const responseData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      value: user.value,
      pic: user.pic,
      isBlocked: [],
      token: generateToken(user._id),
      accountType: user.accountType,
      subscription: user.subscription,
      looking: user.looking,
      adsSubscription: user.adsSubscription,
      day: user.day,
      verified: user.verified,
    };

    res.status(201).json(responseData);
  } else {
    res.status(400);
    throw new Error("Failed to create the account, try again after some time.");
  }
});
const forgotEmail = async (req, res) => {
  const { email } = req.params;

  let userInfo = await User.findOne({ email });

  if (userInfo) {
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

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

    const mailOptions = {
      from: `IntiMates+ <${privateEmail}>`,
      to: email,
      subject: "Recover Your Email",
      html: `
        <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333;">Recover Your Email</h2>
          <img src="${companyLogoUrl}" loading="eager" alt="Company Logo" style="width: 100%; margin-bottom: 20px;">
          <p>Hello,</p>
          <p>You have requested to recover your email associated with our service.</p>
          <p>Your recovery code is: <strong style="color: #00FF00;">${verificationCode}</strong></p>
          <p>If you did not request this change, please contact support immediately.</p>
          <p>IntiMates+ is a hookup-free, porn-free platform designed to channel sexual arousal from fleeting pleasures and self-comforts into intimacy-driven, long-term relationships. By reducing isolation, depression, and anxiety, IntiMates+ aims to improve users' mental health and overall well-being. Find someone who shares your passions and desires, turning fleeting moments into lasting connections.</p>
          <p>Stay connected and follow us on social media:</p>
          <ul style="list-style: none; padding: 0;">
            <li style="margin-bottom: 10px;"><a href="https://twitter.com/IntiMates_Plus" target="_blank" style="color: #007bff; text-decoration: none;">Twitter</a></li>
            <li style="margin-bottom: 10px;"><a href="https://web.facebook.com/profile.php?id=61554735039262" target="_blank" style="color: #007bff; text-decoration: none;">Facebook</a></li>
          </ul>
          <p>IntiMates+, the only Adult Escape!</p>
          <p>Thank you for being a part of our community.</p> 
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.status(400).json({ message: "Email Sending Failed" });
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).json(verificationCode);
      }
    });
  } else {
    res.json(false);
    throw new Error({ message: "Email not Found in the database" });
  }
};

const searchUser = async (req, res) => {
  const { email } = req.params;

  const userExists = await User.findOne({ email });
  if (!userExists) {
    res.status(201).json("Unfound");
  } else {
    const responseData = {
      _id: userExists._id,
      name: userExists.name,
      email: userExists.email,
      gender: userExists.gender,
      value: userExists.value,
      pic: userExists.pic,
      isBlocked: userExists.isBlocked,
      token: generateToken(userExists._id),
      accountType: userExists.accountType,
      subscription: userExists.subscription,
      looking: userExists.looking,
      adsSubscription: userExists.adsSubscription,
      day: userExists.day,
      verified: userExists.verified,
    };
    res.status(201).json(responseData);
  }
};
const recoverEmail = async (req, res) => {
  const { email } = req.params;
  const { password } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const userData = await User.findOneAndUpdate(
    { email: email },
    { password: hashedPassword },
    { new: true }
  );
  try {
    if (userData) {
      const responseData = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        gender: userData.gender,
        value: userData.value,
        pic: userData.pic,
        isBlocked: userData.isBlocked,
        token: generateToken(userData._id),
        accountType: userData.accountType,
        subscription: userData.subscription,
        adsSubscription: userData.adsSubscription,
        looking: userData.looking,
        day: userData.day,
        verified: userData.verified,
      };
      res.status(201).json(responseData);
    }
  } catch (error) {
    throw new Error(error, "this is recover email error");
  }
};

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user.deleted) {
    res.status(401);
    throw new Error("Sign Up please...");
  }

  if (user && (await user.comparePassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      value: user.value,
      pic: user.pic,
      isBlocked: user.isBlocked,
      token: generateToken(user._id),
      accountType: user.accountType,
      subscription: user.subscription,
      adsSubscription: user.adsSubscription,
      looking: user.looking,
      day: user.day,
      verified: user.verified,
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

const getUserById = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve user" });
  }
};

const getUsers = async (req, res) => {
  const gender = req.user.gender;
  const description = req.user.value;

  try {
    let matchGender;
    if (gender === "female") {
      matchGender = "male";
    } else if (gender === "male") {
      matchGender = "female";
    } else {
      return res.status(400).json({ error: "Invalid gender" });
    }

    const userLocations = extractLocations(description);

    const options = {
      includeScore: true,
      keys: ["description"],
      threshold: 0.4,
    };
    const onlineUsersArray = Array.from(onlineUsersMatch);

    const onlineUsersByGender = onlineUsersArray.filter(
      (user) => user.gender === matchGender
    );

    const fuse = new Fuse(onlineUsersByGender, options);

    const result = fuse.search(description);

    let matchingOnlineUsers = result.map((res) => res.item);

    matchingOnlineUsers = matchingOnlineUsers.filter((user) => {
      const userDescription = user.description;
      const userDescLocations = extractLocations(userDescription);
      return userLocations.some((loc) => userDescLocations.includes(loc));
    });

    const sampleSize = 6;

    if (matchingOnlineUsers.length < sampleSize) {
      const additionalUsers = await User.aggregate([
        { $match: { gender: matchGender, deleted: { $ne: true } } },
        { $sample: { size: sampleSize - matchingOnlineUsers.length } },
      ]);
      matchingOnlineUsers.push(...additionalUsers);
    }

    res.json(matchingOnlineUsers);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const block = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = req.user;
  try {
    await User.updateOne(
      { _id: user._id },
      { $addToSet: { isBlocked: userId } }
    );
    const updatedUser = await User.findById(user._id).select("isBlocked");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to Block!" });
  }
});

const Unblock = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = req.user;

  try {
    await User.updateOne({ _id: user._id }, { $pull: { isBlocked: userId } });

    const updatedUser = await User.findById(user._id).select("isBlocked");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Unable to Unblock" });
  }
});

const getMail = async (req, res) => {
  const email = req.params.email;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.json(Boolean(true));
    } else {
      res.json(Boolean(false));
    }
  } catch (error) {
    res.status(500).json({ error: "Trouble establishing uniqueness" });
  }
};

const updateUser = async (req, res) => {
  const userId = req.user._id;
  const { email, pic } = req.body;

  try {
    let updatedUser;

    if (email) {
      // Update email if provided in the request body
      updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { email: email, verified: true }, // Update verified to true along with email
        { new: true }
      ).select("verified email");
    } else if (pic) {
      // Update pic if provided in the request body
      updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { pic: pic },
        { new: true }
      ).select("pic");
    } else {
      // Handle error if neither email nor pic is provided
      return res.status(400).json({ error: "No fields provided for update" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const deletedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          name: "Deleted Account",
          value: "",
          deleted: true,
          password: "",
          pic: "https://res.cloudinary.com/dvc7i8g1a/image/upload/v1692259839/xqm81bw94x7h6velrwha.png",
          isBlocked: [],
        },
      },
      { new: true }
    );
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteImage = async (req, res, next) => {
  const publicId = req.query.publicId;

  if (!publicId || publicId === "xqm81bw94x7h6velrwha") {
    // Skip deletion if publicId is not provided or is a placeholder
    return next();
  }

  const timestamp = new Date().getTime();
  const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
  const signature = crypto
    .createHash("sha1")
    .update(stringToSign)
    .digest("hex");

  try {
    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("signature", signature);
    formData.append("api_key", process.env.CLOUDINARY_API_KEY);
    formData.append("timestamp", timestamp);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
      formData
    );

    if (response.data.result === "ok") {
      console.log("Image deleted successfully");
    } else {
      console.warn("Image deletion response:", response.data);
    }

    next(); // Proceed to the next middleware (updateUser)
  } catch (error) {
    console.error("Error deleting image:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the image" });
  }
};

const authorizeUser = async (req, res) => {
  const { email } = req.query;

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    // Email does not exist, return error
    return res.status(404).json({ message: "Email not found" });
  }

  // Step 2: Check if the user is already verified
  if (existingUser.verified) {
    // User is already verified, no need to send verification email
    return res.status(400).json({ message: "User is already verified" });
  }

  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  const transporter = nodemailer.createTransport({
    host: "mail.privateemail.com",
    port: 465,
    secure: true,
    auth: {
      user: privateEmail,
      pass: privateEmailPass,
    },
  });

  const companyLogoUrl =
    "https://res.cloudinary.com/dvc7i8g1a/image/upload/v1720787425/Intimates_o.jpg";

  const mailOptions = {
    from: `IntimatesPlus <${privateEmail}>`,
    to: email,
    subject: "Verify Your Email",
    html: `
      <div style="background-color: #f2f2f2; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333;"> Verify Your Email</h2>
        <img src="${companyLogoUrl}" loading="eager" alt="Company Logo" style="width: 100%; margin-bottom: 20px;">
        <p>Hello,</p>
        <p>You have requested to verify your email associated with our service.</p>
        <p>Your recovery code is: <strong style="color: #7e8fab;">${verificationCode}</strong></p>
        <p>If you did not request this change, please contact support immediately.</p>
        <p><strong style={{color: "#F44336"}}>IntimatesPlus</strong> is a hookup-free, porn-free platform designed to channel sexual arousal from fleeting pleasures and self-comforts into intimacy-driven, long-term relationships.</p>
        <p>Stay connected and follow us on social media:</p>
        <ul style="list-style: none; padding: 0;">
          <li style="margin-bottom: 10px;"><a href="https://twitter.com/IntiMates_Plus" target="_blank" style="color: #007bff; text-decoration: none;">X</a></li>
          <li style="margin-bottom: 10px;"><a href="https://web.facebook.com/profile.php?id=61554735039262" target="_blank" style="color: #007bff; text-decoration: none;">Facebook</a></li>
        </ul>
        <p>IntimatesPlus, the only Adult Escape!</p>
        <p>Thank you for being a part of our community.</p> 
      </div>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      res.status(400).json({ message: "Email Sending Failed" });
      console.log("This is the error", error);
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).json(verificationCode);
    }
  });
};

const getAdsInfo = async (req, res) => {
  const acceptLanguage = req.headers["accept-language"] || "en-US";
  const referrer = req.headers.referer || "unknown";
  const userIP = req.ip || req.connection.remoteAddress;
  const userAgent = req.headers["user-agent"] || "Unknown";

  try {
    const response = await fetch(
      `http://1482.digitaldsp.com/api/bid_request?feed=1482&auth=JbYI1mfvqR&ip=${userIP}&ua=${encodeURIComponent(
        userAgent
      )}&lang=${encodeURIComponent(acceptLanguage)}&ref=${encodeURIComponent(
        referrer
      )}&sid=${6644177}`
    );
    if (response.status === 204) {
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "application/xml");

    res.json(xmlDoc);
  } catch (error) {
    console.error("Error fetching/displaying ads:", error);
  }
};

const allUsers = asyncHandler(async (req, res) => {
  try {
    const { search } = req.query;
    const { _id: currentUserId, gender: currentUserGender } = req.user;

    // Construct search keyword for name
    const keyword = search
      ? {
          name: { $regex: search, $options: "i" },
        }
      : {};

    // Define gender filter based on the current user's gender
    const genderFilter = {};
    if (currentUserGender === "male") {
      genderFilter.gender = "female";
    } else if (currentUserGender === "female") {
      genderFilter.gender = "male";
    }

    // Fetch all users matching the search query and gender filter
    const users = await User.find({
      ...keyword,
      ...genderFilter,
      _id: { $ne: currentUserId },
    }).select("-password");

    // Fetch the current user's chats
    const currentUserChats = await Chat.find({ users: currentUserId }).select(
      "users"
    );

    // Create a list of other user IDs from the current user's chats
    const currentChatUserIds = currentUserChats
      .map((chat) =>
        chat.users.find(
          (userId) => userId.toString() !== currentUserId.toString()
        )
      )
      .filter(Boolean); // Ensure that only valid user IDs are included

    const onlineUsersArray = Array.from(onlineUsersMatch);

    // Filter out users who are already in the current user's chats
    const newUsers = users.filter(
      (user) => !currentChatUserIds.includes(user._id.toString())
    );

    // Separate the new users into online and offline users
    const sortedNewUsers = newUsers.sort((a, b) => {
      const aIsOnline = onlineUsersArray.some(
        (onlineUser) => onlineUser._id.toString() === a._id.toString()
      );
      const bIsOnline = onlineUsersArray.some(
        (onlineUser) => onlineUser._id.toString() === b._id.toString()
      );
      return bIsOnline - aIsOnline; // online users first
    });

    res.send(sortedNewUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = {
  authorizeUser,
  registerUsers,
  forgotEmail,
  recoverEmail,
  searchUser,
  authUser,
  getUserById,
  getUsers,
  block,
  Unblock,
  updateUser,
  deleteUser,
  deleteImage,
  getAdsInfo,
  getMail,
  allUsers,
};
