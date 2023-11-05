import {
  Box,
  Text,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  useDisclosure,
  ModalHeader,
  IconButton,
  Spinner,
  useToast,
  ModalOverlay,
  Button,
  Input,
  FormControl,
} from "@chakra-ui/react";
import "../components/styles.css";
import PageIndicator from "./miscellanious/PageIndicator";
import Lottie from "react-lottie";
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
  const { onOpen, onClose } = useDisclosure();
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [wait, setWait] = useState(true);
  const [quoteIndex, setQuoteIndex] = useState(0);

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
    setAds,
  } = ChatState();

  const getNextQuote = () => {
    setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
  };
  const heading = [
    "Scammers and Fake Profiles:",
    "Maintaining a Safe Environment:",
    "Prohibited Content:",
    "Purpose of Admin:",
    "",
  ];

  const quotes = [
    " - Be vigilant: Recognize and protect yourself from scammers and fake profiles.- Report: If you encounter suspicious accounts, please report them to our team at admin@fuckmatepro.net.",
    "- Respect Others: Treat all users with kindness, respect, and consideration. - No Harassment: Harassment, hate speech, or any form of abuse will not be tolerated. - Privacy: Protect your personal information and respect the privacy of others.",
    " - No Prostitution: Admin strictly prohibits any form of prostitution or solicitation. Such activities will result in immediate account suspension. - Adult Content: We do not encourage or link to adult content sites.",
    "- This service is designed to assist individuals dealing with porn addiction and or masturbation in finding connections. - Our goal is to help individuals build healthy sexual relationships and encourage human social interations.",
    "By using Admin, you agree to abide by these safety guidelines and terms of use. Violation of these terms may result in account suspension or termination. Thank you for being part of Admin. If you have any questions or concerns, please contact our team at admin@fuckmatepro.net. Your safety and well-being are important to us.",
  ];

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
          const senderId = await message.sender._id;

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

        const unBlock1 = user.isBlocked.includes(selectedChat.users[1]._id);
        const unblock2 = user.isBlocked.includes(selectedChat.users[0]._id);
        const blocked1 =
          selectedChat.users[0].isBlocked &&
          selectedChat.users[0].isBlocked.includes(user._id);
        const blocked2 =
          selectedChat.users[1].isBlocked &&
          selectedChat.users[1].isBlocked.includes(user._id);
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
            title: "Failed to send the Message",
            description: "Please try again after some time",
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
    socket.on("newUserRegistered", (userName) => {
      setTimeout(() => {
        setWait(true);
      }, 25000);
      toast({
        title: "New User Registered",
        description: `${userName} joined`,
        status: "info",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      if (user.gender === "female") {
        setTimeout(() => {
          toast({
            title:
              "Your request is being processed by Admin, you'll be notified soon",
            description:
              "Your presence in our journey towards a porn-free world and a return to genuine human interaction fills our hearts with gratitude and hope",
            status: "info",
            isClosable: true,
            duration: 20000,
            position: "bottom",
          });
        }, 5000);
      } else {
        setTimeout(() => {
          toast({
            title:
              "Step into the authentic realm of the anti-simulation world, where real connections and experiences await!",
            description:
              "Your presence in our journey towards a porn-free world and a return to genuine human interaction fills our hearts with gratitude and hope",
            status: "info",
            isClosable: true,
            duration: 20000,
            position: "bottom",
          });
        }, 5000);
      }
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
        audio.addEventListener("error", (error) => {
          console.error("Audio playback error:", error);
        });

        audio.play().catch((error) => {
          console.error("Audio playback error:", error);
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, options);
            const audio = new Audio(
              "https://s3.amazonaws.com/freecodecamp/drums/Give_us_a_light.mp3"
            );
            audio.addEventListener("error", (error) => {
              console.error("Audio playback error:", error);
            });

            audio.play().catch((error) => {
              console.error("Audio playback error:", error);
            });
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
      {wait && (
        <Modal size="lg" isOpen={onOpen} isCentered closeOnOverlayClick={false}>
          <ModalOverlay />
          <ModalContent height="410px" width={"calc(100% - 20px)"}>
            <ModalHeader
              fontSize="100%"
              fontFamily="Work sans"
              display="flex"
              justifyContent="center"
              background={"transparent"}
              p={0}
              m={0}
            >
              *Safety and Terms of Use*
            </ModalHeader>

            <ModalBody
              display="flex"
              flexDir="column"
              alignItems="center"
              justifyContent="space-between"
              className="quote-container"
              overflowY={"scroll"}
            >
              <Text fontSize={"2xl"} textAlign={"center"}>
                {heading[quoteIndex]}
              </Text>
              <Text className="quote-current">{quotes[quoteIndex]}</Text>
            </ModalBody>
            <ModalFooter
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              {" "}
              <PageIndicator
                totalPages={quotes.length}
                currentPage={quoteIndex}
              />
              {quoteIndex === 4 ? (
                <Button
                  onClick={() => {
                    setWait(false);
                    setAds(true);
                    onClose();
                  }}
                  p={2}
                  m={0}
                  fontSize={"2xs"}
                  _hover={{ color: "green" }}
                >
                  I acceppt this Terms & Conditions
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    getNextQuote();
                  }}
                  display={"flex"}
                  bgGradient="linear(to-r, teal.500, green.500)"
                  _hover={{
                    bgGradient: "linear(to-r, red.200, yellow.200)",
                    color: "white",
                  }}
                  justifyContent={"center"}
                  alignItems={"center"}
                  fontSize={"2xl"}
                >
                  {">>>"}
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
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

            <Text
              p={0}
              m={0}
              textAlign={"center"}
              bgGradient="linear(to-r, red.700, yellow.300)"
              bgClip="text"
            >
              {" "}
              {getSenderName(user, selectedChat.users)}
            </Text>

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
