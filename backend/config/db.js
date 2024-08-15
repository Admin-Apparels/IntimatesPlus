require("dotenv").config({ path: "../secrets.env" });
const mongoose = require("mongoose"); 
const pollModel = require("../models/pollModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const connectDB = async () => {
  const URL = process.env.MONGO_URI;
  try {
    await mongoose.connect(URL);
    console.log('MongoDB connected');

    // Seed existing users with the `status` field if it doesn't exist
    await User.updateMany({ status: { $exists: false } }, { status: new Date() });
    await User.updateMany({ verified: { $exists: false } }, { verified: false});

    // Call seedPoll function to seed the poll data if it doesn't already exist
    await seedPoll();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1); // Correct exit code
  }
};

const seedPoll = async () => {
  const existingPoll = await pollModel.findOne();
  if (!existingPoll) {
    const poll = new pollModel({
      question: "After giving up porn or chasing fleeting attention, and adopting an intimacy-driven relationship, how do you feel when you think or see about it?",
      options: [
        { option: 'Disgusted' },
        { option: 'Disinterested' },
        { option: 'Relieved' },
        { option: 'Satisfied' },
        { option: 'Still struggling with addictive tendencies' },
        { option: 'I have no idea' },
      ],
    });
    
    await poll.save();
  }
};  

module.exports = connectDB;
