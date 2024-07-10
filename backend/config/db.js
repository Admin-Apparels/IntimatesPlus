require("dotenv").config({ path: "../secrets.env" });
const mongoose = require("mongoose"); 
const pollModel = require("../models/pollModel");

const connectDB = async () => {
  const URL = process.env.MONGO_URI;
  try {
  
    mongoose.connect(URL)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

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

    // Call seedPoll function to seed the poll data if it doesn't already exist
    await seedPoll();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1); // Correct exit code
  }
};

module.exports = connectDB;
