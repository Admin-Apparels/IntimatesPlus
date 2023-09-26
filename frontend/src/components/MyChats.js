import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axiosInstance from "./miscellanious/axios";

import { useCallback, useEffect, useState } from "react";
import ChatLoading from "./ChatLoading";

import { ChatState } from "./Context/ChatProvider";
import { useNavigate } from "react-router-dom";

const MyChat = (fetchAgain) => {
  const [loggedUser, setLoggedUser] = useState();
  const [array, setArray] = useState(undefined);

  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();

  const toast = useToast();
  const navigate = useNavigate();

  const fetchChats = useCallback(async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      axiosInstance
        .get("/api/chat", config)
        .then((response) => {
          console.log(response.data);

          if (response.data.message) {
          } else {
            setArray(response.data);
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            console.log("token expired");
            toast({
              title: "Your session has expired",
              description: "Logging out in less than 8 seconds",
              duration: 8000,
              status: "loading",
              position: "bottom",
            });
            localStorage.removeItem("userInfo");
            setTimeout(() => {
              localStorage.removeItem("userInfo");
              navigate("/");
            }, 8000);
          } else {
            console.error("An error occurred:", error);
          }
        });
    } catch (error) {
      if (error.response && error.response.status === 429) {
        toast({
          title: "Too many request",
          description: "Try again after some time",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
      }
      toast({
        title: "Error occured trying to retrieve Chats",
        description: "Try again after some time",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
    if (array) {
      console.log(array);
      const chatsWithSenderNames = await Promise.all(
        array.map(async (chat) => {
          const resolvedUsers = await Promise.all(chat.users);

          if (resolvedUsers && resolvedUsers.length === 2) {
            const senderName =
              resolvedUsers[0]._id === loggedUser._id
                ? resolvedUsers[1].name
                : resolvedUsers[0].name;
            return { ...chat, senderName };
          } else {
            console.error("Unexpected resolvedUsers array:", resolvedUsers);
            return { ...chat, senderName: "Unknown" };
          }
        })
      );

      setChats(chatsWithSenderNames);
    }
  }, [toast, user, loggedUser, setChats, navigate, array]);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setLoggedUser(userInfo);
  }, []);
  useEffect(() => {
    if (loggedUser) {
      console.log(loggedUser);
      fetchChats();
    }
  }, [fetchChats, loggedUser]);

  const renderChatItems = () => {
    return chats.map((chat) => (
      <Box
        onClick={() => {
          setSelectedChat(chat);
          const otherNotifications = notification.filter(
            (n) => n.chat._id !== chat._id
          );
          setNotification(otherNotifications);
        }}
        cursor="pointer"
        bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
        color={selectedChat === chat ? "white" : "black"}
        px={3}
        py={2}
        borderRadius="lg"
        key={chat._id}
      >
        <Text>{chat.senderName}</Text>
        {chat.latestMessage && (
          <Text fontSize="xs">
            <b>
              {chat.latestMessage.sender.name === user.name
                ? "You"
                : chat.latestMessage.sender.name}
              {":"}{" "}
            </b>
            {chat.latestMessage.content.length > 50
              ? chat.latestMessage.content.substring(0, 51) + "..."
              : chat.latestMessage.content}
          </Text>
        )}
      </Box>
    ));
  };

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={2}
      bg="white"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        display="flex"
        p={2}
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text fontFamily={"fantasy"} fontWeight={"medium"}>
          My Chats:{" "}
        </Text>
        <Text fontWeight={"bold"}>
          {Array.isArray(chats) &&
            chats.length === 0 &&
            user.gender === "female" &&
            "Wait from Admin"}
        </Text>
        <Text fontWeight={"bold"}>
          {Array.isArray(chats) &&
            chats.length === 0 &&
            user.gender === "male" &&
            "Create Chats Above"}
        </Text>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {" "}
        {chats && Array.isArray(chats) ? (
          <Stack overflowY="scroll">{renderChatItems()}</Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};
export default MyChat;
