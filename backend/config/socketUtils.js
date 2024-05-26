// onlineUsers.js
const userSockets = new Map();
const onlineUsersMatch = new Set();

const setUserSocket = (userId, socketId) => {
  userSockets.set(userId, socketId);
};

const getUserSocket = (userId) => {
  return userSockets.get(userId);
};

const extractLocations = (description) => {
  const flaggedKeywords = [
    "from",
    "live",
    "I'm",
    "Hi",
    "Hello",
    "there",
    "around",
    "in",
    "and",
    "looking",
    "searching",
    "find",
    "Hey",
    "hey",
    "I",
    "am",
    "my",
    "name",
    "is",
  ];

  const regexPatterns = flaggedKeywords.map(
    (keyword) => new RegExp(`\\b${keyword}\\b`, "i")
  );

  const words = description.split(" ");
  const locations = words.filter((word) => {
    const lowerCaseWord = word.toLowerCase();
    return !regexPatterns.some((pattern) => pattern.test(lowerCaseWord));
  });

  return locations;
};

module.exports = {
  extractLocations,
  setUserSocket,
  userSockets,
  getUserSocket,
  onlineUsersMatch,
};
