import axios from "axios";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { ChatState } from "../Context/ChatProvider";

let socketInstance;

export const formatMessageTime = (timestamp) => {
  const messageTime = new Date(timestamp);
  const currentTime = new Date();

  const timeDifference = currentTime - messageTime;
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
      return 'Just now';
  } else if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  } else if (hours < 24) {
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  } else if (days === 1) {
      return 'Yesterday';
  } else if (days < 7) {
      return `${days} day${days === 1 ? '' : 's'} ago`;
  } else {
      const options = {
          hour: 'numeric',
          minute: 'numeric',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
      };
      return messageTime.toLocaleDateString('en-US', options);
  }
};

export const isSameSenderMargin = (messages, m, i, userId) => {
  if (
    i < messages.length - 1 &&
    messages[i + 1].sender._id === m.sender._id &&
    messages[i].sender._id !== userId
  )
    return 33;
  else if (
    (i < messages.length - 1 &&
      messages[i + 1].sender._id !== m.sender._id &&
      messages[i].sender._id !== userId) ||
    (i === messages.length - 1 && messages[i].sender._id !== userId)
  )
    return 0;
  else return "auto";
};

export const isSameSender = (messages, m, i, userId) => {
  return (
    i < messages.length - 1 &&
    (messages[i + 1]?.sender?._id !== m.sender?._id ||
      messages[i + 1]?.sender?._id === undefined) &&
    messages[i]?.sender?._id !== userId
  );
};

export const isLastMessage = (messages, i, userId) => {
  return (
    i === messages.length - 1 &&
    messages[messages.length - 1].sender._id !== userId &&
    messages[messages.length - 1].sender._id
  );
};

export const isSameUser = (messages, m, i) => {
  return i > 0 && messages[i - 1].sender._id === m.sender._id;
};

export const getSenderName = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1].name : users[0].name;
};
export const getSenderId = (loggedUser, users) => {
  return users[0]._id === loggedUser._id ? users[1]._id : users[0]._id;
};

export const getSenderFull = (loggedUser, user) => {
  return user[0]._id === loggedUser._id ? user[1] : user[0];
};
export async function getUserById(userId, token) {
  if (!userId && !token) {
    return;
  }
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const { data } = await axios.get(`/api/user/getuserid/${userId}`, config);
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
export async function makePaymentMpesa(subscription, phoneNumber, user, toast) {
  if (!phoneNumber) {
    return;
  }
  try {
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.post(
      `/api/paycheck/makepaymentmpesa/${user._id}`,
      { phoneNumber, subscription },
      config
    );

    if (data) {
      toast({
        title: "You have been prompt to finish your subscription process",
        status: "info",
        duration: 1000,
        position: "bottom",
      });
    }
  } catch (error) {}
}
export async function handleApprove(type, user, setUser) {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.put(
      `/api/paycheck/${user._id}/${type}`,
      {},
      config
    );

    const userData = await {
      ...user,
      accountType: data.accountType,
      subscription: data.subscription,
      day: data.day,
    };
    localStorage.setItem("userInfo", JSON.stringify(userData));
    setUser(userData);
  } catch (error) {
    console.log(error);
    throw new Error("Error occurred", error);
  }
}
export async function handleCreateChat(
  userId,
  user,
  setChats,
  chats,
  setSelectedChat,
  toast
) {
  try {
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };

    const { data } = await axios.post(`/api/chat`, { userId }, config);

    if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);

    setChats([data, ...chats]);
    setSelectedChat(data);
  } catch (error) {
    console.log(error);
    toast({
      title: "Error fetching the chat",
      description: error.message,
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "bottom-left",
    });
  }
}

export function useConnectSocket(token) {
  const [socket, setSocket] = useState(null);
  const { user } = ChatState();

  useEffect(() => {
    if (!user) {
      return;
    }
    if (socketInstance) {
      setSocket(socketInstance);
      return;
    }
    const userId = user._id;

    const newSocket = io("/", {
      query: { token, userId },
    });

    newSocket.on("connect", () => {
      newSocket.emit("newConnection", user);
      console.log("connected");
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    setSocket(newSocket);
    socketInstance = newSocket;

    return () => {
      newSocket.disconnect();
      socketInstance = null;
    };
  }, [token, user]);

  return socket;
}
