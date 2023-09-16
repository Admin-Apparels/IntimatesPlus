import React, { createContext, useContext, useState } from "react";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);
  const [userId, setUserId] = useState(undefined);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pic, setPic] = useState("");

  return (
    <ChatContext.Provider
      value={{
        pic,
        setPic,
        email,
        setEmail,
        name,
        setName,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        user,
        setUser,
        notification,
        setNotification,
        onlineUsersCount,
        setOnlineUsersCount,
        userId,
        setUserId,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
export var ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
