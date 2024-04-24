import axios from "axios";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { ChatState } from "../Context/ChatProvider";

let socketInstance;

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
export async function handleApprove(accountType, type, user, setUser) {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
    const { data } = await axios.put(
      `/api/paycheck/${user._id}/${type}/${accountType}`,
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
  url,
  userId,
  toast,
  user,
  setChats,
  setUser,
  chats,
  setSelectedChat
) {
  try {
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };

    const { data } = await axios.post(`/api/chat/${url}`, { userId }, config);
    if (data.day) {
      const userData = { ...user, day: data.day };
      localStorage.setItem("userInfo", JSON.stringify(userData));
      setUser(userData);
    } else {
      console.log("setting chats");
      setChats([data, ...chats]);
      setSelectedChat(data);
    }
  } catch (error) {
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

    const newSocket = io("http://localhost:8080", {
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
export function connectWebSocket(url, onMessageCallback) {
  const ws = new WebSocket(url);

  ws.addEventListener("open", () => {
    console.log("WebSocket connection established.");
  });

  ws.addEventListener("message", (event) => {
    console.log("Received message:", event.data);
    if (onMessageCallback) {
      onMessageCallback(event.data);
    }
  });

  ws.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.addEventListener("close", () => {
    console.log("WebSocket connection closed.");
  });

  function sendMessage(message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
      console.log("Message sent:", message);
    } else {
      console.error("WebSocket connection is not open.");
    }
  }

  return {
    ws,
    sendMessage,
  };
}
