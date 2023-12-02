import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axiosInstance from "./miscellanious/axios";

import { useCallback, useEffect, useState } from "react";
import ChatLoading from "./ChatLoading";

import { ChatState } from "./Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import { Image } from "@chakra-ui/react";

const MyChat = (fetchAgain) => {
  const [loggedUser, setLoggedUser] = useState();

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
        .then(async (response) => {
          if (response.data.message) {
          } else {
            const chatsWithSenderNames = await Promise.all(
              response.data.map(async (chat) => {
                const resolvedUsers = await Promise.all(chat.users);

                const senderName =
                  resolvedUsers.length === 2
                    ? resolvedUsers[0]._id === loggedUser._id
                      ? resolvedUsers[1].name
                      : resolvedUsers[0].name
                    : resolvedUsers[0].name;

                return { ...chat, senderName };
              })
            );

            setChats(chatsWithSenderNames);
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            toast({
              title: "Your session has expired",
              description: "Logging out in less than 8 seconds",
              duration: 8000,
              status: "loading",
              position: "bottom",
            });

            setTimeout(() => {
              localStorage.removeItem("userInfo");
              navigate("/");
            }, 8000);
          }
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
        });
    } catch (error) {
      toast({
        title: "Error occured trying to retrieve Chats",
        description: "Try again after some time",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  }, [toast, user, loggedUser, setChats, navigate]);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setLoggedUser(userInfo);
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      if (loggedUser) {
        await fetchChats();
        setTimeout(async () => {
          await fetchChats();
        }, 2000);
      }
    };

    fetchData();
  }, [fetchChats, loggedUser]);

  const renderChatItems = () => {
    return chats.map((chat) => (
      <Box
        key={chat._id}
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
      >
        <Text display={"flex"} textAlign={"center"}>
          {chat.senderName}{" "}
          {chat.chatName === "Admin" ? (
            <Image
              src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1699615402/icons8-verified-account-64_1_amfufo.png"
              height={4}
              m={1}
            />
          ) : (
            ""
          )}
        </Text>
        {chat.latestMessage && chat.latestMessage.sender && (
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
        <Text
          fontFamily="cursive"
          fontWeight={"medium"}
          bgGradient="linear(to-r, black, grey)"
          bgClip="text"
          userSelect={"none"}
        >
          My Chats:{" "}
        </Text>

        <Text
          display={"flex"}
          justifyContent={"space-between"}
          fontWeight={"bold"}
          fontFamily={"cursive"}
          userSelect={"none"}
        >
          {chats !== undefined ? chats.length : 0}
          <Text color={"red.500"} paddingLeft={2}>
            :Boo
          </Text>
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
        position={"relative"}
      >
        {chats.length === 0 && (
          <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            alignItems={"center"}
            position={"absolute"}
            width={"100%"}
            height={"100%"}
            bgGradient="linear(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)"
            bgClip={"text"}
            userSelect={"none"}
          >
            <Image src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1701516427/icons8-not-found-48_sfynmt.png" />
            <Text>You have no chats available, create one above</Text>
          </Box>
        )}

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
