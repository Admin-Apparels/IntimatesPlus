import {
  Box,
  Stack,
  Text,
  useToast,
  Avatar,
  useBreakpointValue,
} from "@chakra-ui/react";

import axiosInstance from "./miscellanious/axios";

import { useCallback, useEffect, useState } from "react";
import ChatLoading from "./ChatLoading";
import { ChatState } from "./Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import Notifier from "./miscellanious/Notifier";
import { FaFireAlt, FaFlag } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import {
  formatMessageLongTime,
  getSenderName,
  getSenderPic,
} from "./config/ChatLogics";
import { OrderForm } from "./miscellanious/Order";

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
              title: "Please log back in",
              duration: 8000,
              status: "warning",
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
          background={selectedChat === chat ? "#38B2AC" : "whitesmoke"}
          color={selectedChat === chat ? "white" : "black"}
          px={3}
          py={2}
          borderRadius="lg"
          position="relative"
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

          {/* Time at the top-right corner */}
          <Text
            position="absolute"
            top={2}
            right={2}
            fontSize="xs"
            color={selectedChat === chat ? "white" : "black"}
          >
            {formatMessageLongTime(chat.latestMessage?.createdAt)}
          </Text>

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

  const navbarHeight = useBreakpointValue({ base: "60px", md: "80px" });

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDirection="column"
      alignItems="center"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      minH={"100%"} // This ensures it fills most of the screen height
      bg="whitesmoke"
      p={2} // Adding some padding for spacing
      height={`calc(100vh - ${navbarHeight})`} // Subtracting navbar height from 100vh
    >
      {/* Notifier modal for updates */}
      {modal && <Notifier isOpen={modal} onClose={() => setModal(false)} />}

      {/* Chat list container */}
      <Box
        display="flex"
        flexDirection="column"
        bg="whitesmoke"
        w="100%"
        height="100%" // Ensures the container takes the full height
        borderRadius="lg"
        overflowY="hidden" // Prevents overflow when chats are many
      >
        {chats && chats.length > 0 ? (
          <Stack overflowY="scroll" spacing={2} p={2}>
            {/* Trending Button */}
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              background="#E8E8E8"
              borderRadius="lg"
              width="100%"
              mb={2}
              p={4} // Increased padding for a larger clickable area
              cursor="pointer"
              userSelect="none"
              onClick={() => setTrend(true)}
              _hover={{ background: "#D0D0D0" }} // Hover effect for better UX
            >
              <FaFireAlt style={{ color: "red" }} />
              <Text pl={2} fontWeight="bold">
                What's trending
              </Text>
            </Box>
            {/* Chats list */}
            {renderChatItems()}{" "}
            {/* Replace with your actual chat items rendering function */}
          </Stack>
        ) : (
          <ChatLoading /> // Show loading spinner or placeholder when no chats
        )}
      </Box>
    </Box>
  );
};

export default MyChat;
