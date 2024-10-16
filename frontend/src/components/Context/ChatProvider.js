import React, { createContext, useContext, useState } from "react";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [verify, setVerify] = useState(undefined);
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [trend, setTrend] = useState(false);
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);
  const [onlineUsersCount, setOnlineUsersCount] = useState([]);
  const [userId, setUserId] = useState(undefined);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pic, setPic] = useState("");
  const [recoverEmail, setRecoverEmail] = useState();
  const [ads, setAds] = useState(false);
  const [isCallStarted, setIsCallStarted] = useState(false);
  

  return (
    <ChatContext.Provider
      value={{
        ads,
        setAds,
        recoverEmail,
        setRecoverEmail,
        verify,
        setVerify,
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
        isCallStarted,
        setIsCallStarted,
        trend,
        setTrend,
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
