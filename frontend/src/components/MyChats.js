import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import ChatLoading from "./ChatLoading";

import { ChatState } from "./Context/ChatProvider";

const MyChat = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  console.log(user);

  const toast = useToast();

  const fetchChats = useCallback(async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);
      console.log(data);
      if (data.message) {
        if (user.gender === "male") {
          toast({
            title: "Chat with One Girl that You Like!",
            description: "Lucky Hour!",
            status: "success",
            duration: 10000,
            isClosable: true,
            position: "top-left",
          });
        }
      } else {
        const chatsWithSenderNames = await Promise.all(
          data.map(async (chat) => {
            const resolvedUsers = await Promise.all(chat.users);
            const senderName =
              resolvedUsers[0]._id === loggedUser._id
                ? resolvedUsers[1].name
                : resolvedUsers[0].name;
            return { ...chat, senderName };
          })
        );

        setChats(chatsWithSenderNames);
      }
    } catch (error) {
      toast({
        title: "Error Occured Retrieving Chats!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  }, [toast, user, loggedUser, setChats]);

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
  console.log(selectedChat);

  const renderChatItems = () => {
    return chats.map((chat) => (
      <Box
        onClick={() => setSelectedChat(chat)}
        cursor="pointer"
        bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
        color={selectedChat === chat ? "white" : "black"}
        px={3}
        py={2}
        borderRadius="lg"
        key={chat._id}
      >
        <Text>{!chat.isGroupChat ? chat.senderName : chat.chatName}</Text>
        {chat.latestMessage && (
          <Text fontSize="xs">
            <b>{chat.latestMessage.sender.name} : </b>
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
