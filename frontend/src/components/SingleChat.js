import { Button, FormControl } from "@chakra-ui/react";
import { Input } from "@chakra-ui/react";
import { Box, Text } from "@chakra-ui/react";
import "./styles.css";
import Lottie from "react-lottie";
import { IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSenderName, getSenderFull, getUserById } from "./config/ChatLogics";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "../components/miscellanious/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import io from "socket.io-client";
import { ChatState } from "./Context/ChatProvider";
import animation from "../animations/typing.json";

const ENDPOINT = "http://localhost:8080";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);

  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
    setOnlineUsersCount,
  } = ChatState();

  const fetchMessages = useCallback(async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      const resolvedMessages = await Promise.allSettled(
        data.map(async (message) => {
          const senderId = message.sender._id;
          const sender = await getUserById(senderId, user.token);
          return {
            ...message,
            sender,
          };
        })
      );

      const resolvedValues = resolvedMessages
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      setMessages(resolvedValues);

      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  }, [selectedChat, toast, user.token]);

  const sendMessage = async (event) => {
    if ((event && event.key === "Enter") || !event) {
      if (newMessage && selectedChat) {
        socket.emit("stop typing", selectedChat._id);
        const unBlock1 = user.isBlocked.includes(selectedChat.users[1]._id); //you blocked this user in 1 index;
        const unblock2 = user.isBlocked.includes(selectedChat.users[0]._id); // you blocked this user in 0 index;
        const blocked1 = selectedChat.users[0].isBlocked.includes(user._id); //can be in both users due to populate
        const blocked2 = selectedChat.users[1].isBlocked.includes(user._id);
        const deleted =
          selectedChat.users[0].deleted || selectedChat.users[1].deleted;
        if (blocked1 || blocked2) {
          toast({
            title: "Blocked!",
            description: "Can't send Message",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });

          return;
        }
        if (unBlock1 || unblock2) {
          toast({
            title: "Unblock user to send Message",
            description: "Failed to send the Message",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });

          return;
        }
        if (deleted) {
          toast({
            title: "User Account Deleted.",
            description: "User deleted their Account",
            status: "info",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });

          return;
        }

        try {
          const config = {
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          };

          setNewMessage("");
          const { data } = await axios.post(
            "/api/message",
            {
              content: newMessage,
              chatId: selectedChat,
              user,
            },
            config
          );

          socket.emit("new message", data);
          setMessages((prevMessages) => [...prevMessages, data]);
        } catch (error) {
          toast({
            title: "Error Occurred!",
            description: "Failed to send the Message",
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
        }
      }
    }
  };

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    socket.on("newUserRegistered", () => {
      toast({
        title: "New User Registered",
        description: `${user.name} joined`,
        status: "info",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    });
    socket.on("onlineUsers", (count) => {
      setOnlineUsersCount(count);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, toast, setOnlineUsersCount]);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat, fetchMessages, toast, user.token]);

  useEffect(() => {
    const showNotification = (title, options) => {
      if (Notification.permission === "granted") {
        new Notification(title, options);
        const audio = new Audio(
          "https://s3.amazonaws.com/freecodecamp/drums/Give_us_a_light.mp3"
        );
        audio.play();
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, options);
            const audio = new Audio(
              "https://s3.amazonaws.com/freecodecamp/drums/Give_us_a_light.mp3"
            );
            audio.play();
          }
        });
      }
    };
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
        if (!notification.includes(newMessageReceived)) {
          setNotification([newMessageReceived, ...notification]);
          setFetchAgain((prevValue) => !prevValue);
          showNotification("New Message", {
            body: `New message from ${newMessageReceived.sender.name}`,
            icon: `${newMessageReceived.sender.pic}`,
          });
        }
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    });

    return () => {
      socket.off("message received");
    };
  }, [notification, setNotification, setFetchAgain]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;

    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent={"space-between"}
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />

            {getSenderName(user, selectedChat.users)}

            <ProfileModal userInfo={getSenderFull(user, selectedChat.users)} />
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="space-between"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="auto"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl id="first-name" isRequired mt={3}>
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Box
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                {" "}
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Enter a message.."
                  value={newMessage}
                  onChange={typingHandler}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  colorScheme="blue"
                  size="sm"
                  ml={2}
                  display={{ base: "block", md: "none" }} // Show only on mobile devices
                  onClick={() => sendMessage()}
                >
                  Send
                </Button>
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
