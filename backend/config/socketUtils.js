const userSockets = new Map();

const setUserSocket = (userId, socketId) => {
  userSockets.set(userId, socketId);
};

const getUserSocket = (userId) => {
  return userSockets.get(userId);
};

function createRoomId(userId1, userId2) {
  const sortedUserIds = [userId1, userId2].sort();
  return sortedUserIds.join("_");
}

module.exports = {
  userSockets,
  setUserSocket,
  getUserSocket,
  createRoomId,
};
