import React, { createContext, useContext, useState, useEffect } from "react";
import io from 'socket.io-client';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [verify, setVerify] = useState(undefined);
  const [selectedChat, setSelectedChat] = useState();
  const [user, setUser] = useState();
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);
  const [onlineUsersCount, setOnlineUsersCount] = useState(0);
  const [userId, setUserId] = useState(undefined);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pic, setPic] = useState("");
  const [recoverEmail, setRecoverEmail] = useState();
  const [ads, setAds] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isCallStarted, setIsCallStarted] = useState(false);

  useEffect(() => {
 
    const newSocket = io('https://fuckmate.boo');
    setSocket(newSocket);

    return () => newSocket.close();
}, []);

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
        socket,
        isCallStarted,
        setIsCallStarted
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
