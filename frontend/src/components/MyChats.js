import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axiosInstance from "./miscellanious/axios";

import { useCallback, useEffect, useState } from "react";
import ChatLoading from "./ChatLoading";
import { ChatState } from "./Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import Notifier from "./miscellanious/Notifier";
import { FaFireAlt, FaFlag } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { PiChatsCircleThin } from "react-icons/pi";
import { Avatar } from "@chakra-ui/react";
import { getSenderName, getSenderPic } from "./config/ChatLogics";

const MyChat = () => {
  const [loggedUser, setLoggedUser] = useState();
  const [modal, setModal] = useState(false);
  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    notification,
    setNotification,
    setTrend,
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
            // Handle message case if needed
          } else {
            // Assuming users are already resolved in the response
            const chatsWithSenderNames = response.data.map((chat) => {
              // Assuming users are already resolved
              const resolvedUsers = chat.users;

              // Determine the sender's name based on the logged-in user
              const senderName =
                resolvedUsers.length === 2
                  ? resolvedUsers[0]._id === loggedUser._id
                    ? resolvedUsers[1].name
                    : resolvedUsers[0].name
                  : resolvedUsers[0].name;

              return { ...chat, senderName };
            });

            setChats(chatsWithSenderNames);
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            toast({
              title: "Your session has expired",
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
              title: "Too many request:",
              description: "please try again after sometime.",
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
    return chats.map((chat) => {
      const isFlagged = chat.flagged.includes(user._id);

      return (
        <Box
          key={chat._id}
          onClick={() => {
            if (isFlagged) {
              setModal(true); // Show the modal
            } else {
              setSelectedChat(chat);
              const otherNotifications = notification.filter(
                (n) => n.chat._id !== chat._id
              );
              setNotification(otherNotifications);
            }
          }}
          background={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
          color={selectedChat === chat ? "white" : "black"}
          px={3}
          py={2}
          borderRadius="lg"
          position="relative"
          p={"2"}
          cursor={"pointer"}
        >
          <Box display={"flex"}>
            <Avatar
              size="sm"
              cursor="pointer"
              name={getSenderName(user, chat.users)}
              src={getSenderPic(user, chat.users)}
            />
            <Box
              display="flex"
              flexDir={"column"}
              justifyContent={"center"}
              alignItems={"start"}
              pl={"4"}
            >
              <Text display="flex">
                {chat.senderName} {chat.chatName === "Admin" && <MdVerified />}
              </Text>
              {chat.latestMessage && chat.latestMessage.sender && (
                <Text fontSize="xs">
                  <b>
                    {chat.latestMessage.sender?.name === user.name
                      ? "You"
                      : chat.latestMessage.sender?.name}
                    {":"}{" "}
                  </b>
                  {chat.latestMessage.content.length > 50
                    ? chat.latestMessage.content.substring(0, 30) + "..."
                    : chat.latestMessage.content}
                </Text>
              )}
            </Box>
          </Box>

          {isFlagged && (
            <FaFlag
              style={{
                color: "red",
                position: "absolute",
                bottom: 5,
                right: 5,
              }}
            />
          )}
        </Box>
      );
    });
  };

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={2}
      bgGradient="linear(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)"
      bgClip="border-box"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
      height={"88vh"}
    >
      {modal && <Notifier isOpen={modal} onClose={() => setModal(false)} />}
      <Box
        display="flex"
        p={2}
        width="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text
          fontFamily="Arial, sans-serif"
          fontWeight={"medium"}
          textColor={"white"}
          userSelect={"none"}
        >
          My Chats:{" "}
        </Text>

        <Text
          display={"flex"}
          justifyContent={"space-between"}
          userSelect={"none"}
          fontSize={"small"}
          textColor={"white"}
          p={2}
        >
          {chats !== undefined ? chats.length : 0}
          <PiChatsCircleThin style={{ fontSize: "1.5rem" }} />
        </Text>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="blackAlpha.400"
        w="100%"
        height={{ base: "100%", md: "97%" }}
        borderRadius="lg"
        overflowY="hidden"
        position={"relative"}
      >
        <Box
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          background={"blackAlpha.400"}
          textColor={"white"}
          borderRadius="lg"
          position={"sticky"}
          top={-2}
          width={"100%"}
          mb={2}
          onClick={() => {
            setTrend(true);
          }}
          cursor={"pointer"}
          p={"6"}
          bottom={5}
          userSelect={"none"}
        >
          <FaFireAlt style={{ color: "red" }} />
          <Text pl={"2"}>What's trending</Text>
        </Box>
        {chats && chats.length > 0 ? (
          <Stack overflowY="scroll">{renderChatItems()}</Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};
export default MyChat;
