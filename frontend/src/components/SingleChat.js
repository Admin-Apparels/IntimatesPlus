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
  Checkbox,
  Link,
} from "@chakra-ui/react";
import "../components/styles.css";
import PageIndicator from "./miscellanious/PageIndicator";
import Lottie from "react-lottie";
import {
  getSenderName,
  getSenderFull,
  getUserById,
  getSenderId,
  useConnectSocket,
} from "./config/ChatLogics";
import { CiVideoOn } from "react-icons/ci";
import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "../components/miscellanious/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import { ChatState } from "./Context/ChatProvider";
import animation from "../animations/typing.json";
import { useNavigate } from "react-router-dom";
import Notifier from "./miscellanious/Notifier";
import { HiStatusOffline, HiStatusOnline } from "react-icons/hi";
import { TbPhoneCalling } from "react-icons/tb";

var selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const { onOpen, onClose } = useDisclosure();
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [modal, setModal] = useState(false);
  const navigate = useNavigate();
  const OverlayOne = () => (
    <ModalOverlay
      bg="blackAlpha.300"
      backdropFilter="blur(10px) hue-rotate(90deg)"
    />
  );
  const overlay = React.useState(<OverlayOne />);

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
    setUser,
    notification,
    setNotification,
    onlineUsersCount,
    setOnlineUsersCount,
    setChats,
    setAds,
    isCallStarted,
    setIsCallStarted,
  } = ChatState();

  const socket = useConnectSocket(user.token);

  const startCall = async () => {
    const otherUser = await getSenderFull(user, selectedChat.users);
    navigate(
      `/videocalls/${JSON.stringify({
        _id: otherUser._id,
        name: otherUser.name,
      })}`
    );
    setIsCallStarted(true);
  };

  const getNextQuote = () => {
    setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
  };
  const heading = [
    "Scammers and Fake Profiles:",
    "Maintaining a Safe Environment:",
    "Prohibited Content:",
    "Purpose of fuckmate.boo",
    "Privacy and Data Usage Agreement:",
    "",
  ];

  const quotes = [
    "-Be vigilant: Recognize and protect yourself from scammers and fake profiles.- Report: If you encounter suspicious accounts, please report them to our team at admin@fuckmate.boo.",
    "-Respect Others: Treat all users with kindness, respect, and consideration. - No Harassment: Harassment, hate speech, or any form of abuse will not be tolerated. - Privacy: Protect your personal information and respect the privacy of others.",
    "-No Prostitution: FMB strictly prohibits any form of prostitution or solicitation. Such activities will result in immediate account suspension. - Adult Content: We do not encourage or link to adult content sites.",
    "-This platform is an escape from the shadows of porn addiction, solo sessions and isolation. It's crafted to guide you into a world where connections spark passion. Our mission? To ignite flames of genuine, satisfying relationships, fostering a playground for human social interactions that go beyond the ordinary. Welcome to fuckmate.boo – where arousal meets meaningful connections. 🔥💑 #RealConnections",
    "Data Protection and Non-Sale: We are committed to protecting your data and will not sell your personal information to third parties or advertisers.   Matchmaking: In the future, you may be asked to provide location and other data. This data will be used solely for the purpose of finding you a suitable match within the app.   Privacy of User Identities: We respect your privacy, and we will keep the identities of other users confidential in relation to this app. Your identity will also be kept private in a similar manner.",
    "By using FMB, you agree to abide by these safety guidelines and terms of use. Violation of these terms may result in account suspension or termination. Thank you for being part of FMB. If you have any questions or concerns, please contact our team at admin@fuckmate.boo. Your safety and well-being are important to us.",
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

      const userDataCache = new Map();

      const resolvedMessages = await Promise.allSettled(
        data.map(async (message) => {
          const senderId = message.sender._id;

          let sender = userDataCache.get(senderId);

          if (!sender) {
            try {
              sender = await getUserById(senderId, user.token);

              userDataCache.set(senderId, sender);
            } catch (error) {
              console.error(error);
            }
          }

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
      if (error.status === 429) {
        toast({
          title: "Too many requests!",
          status: "warning",
        });
      } else {
        toast({
          title: "Failed to Load Messages!",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  }, [selectedChat, toast, user.token, socket]);

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
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });

          return;
        }
        if (deleted) {
          toast({
            title: "User Account Deleted.",
            status: "info",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });

          return;
        }

        // Check if the message contains sensitive information
        const isFlaggedMessage =
          newMessage.includes("social") ||
          newMessage.includes("reach") ||
          newMessage.includes("phone") ||
          newMessage.includes("meet") ||
          newMessage.includes("contact") ||
          newMessage.includes("email") ||
          newMessage.includes("give") ||
          newMessage.includes("handle") ||
          newMessage.includes("show up") ||
          newMessage.includes("number") ||
          newMessage.includes("mobile") ||
          newMessage.includes("cellphone") ||
          newMessage.includes("details") ||
          newMessage.includes("whatsapp") ||
          newMessage.includes("telegram") ||
          newMessage.includes("signal") ||
          newMessage.includes("instagram") ||
          newMessage.includes("ig") ||
          newMessage.includes("facebook") ||
          newMessage.includes("fb") ||
          newMessage.includes("linkedin") ||
          newMessage.includes("li") ||
          newMessage.includes("twitter") ||
          newMessage.includes("tw") ||
          newMessage.includes("x") ||
          newMessage.includes("snapchat") ||
          newMessage.includes("snap") ||
          newMessage.includes("sc") ||
          newMessage.includes("skype") ||
          newMessage.includes("sk") ||
          newMessage.includes("discord") ||
          newMessage.includes("dc") ||
          newMessage.includes("your") ||
          newMessage.includes("account") ||
          newMessage.includes("call") ||
          newMessage.includes("chat") ||
          newMessage.includes("on") ||
          newMessage.includes("share") ||
          /\b\d{8,10}\b/.test(newMessage) ||
          newMessage.includes("no:");

        // If the message is flagged and the user's subscription status requires flagging, flag the chat
        if (isFlaggedMessage) {
          const currentDate = new Date().getTime();

          if (currentDate > parseInt(user.subscription)) {
            try {
              const config = {
                headers: {
                  "Content-type": "application/json",
                  Authorization: `Bearer ${user.token}`,
                },
              };
              const { data } = await axios.put(
                `/api/chat/flag/${selectedChat._id}`,
                {},
                config
              );
              const chatsWithSenderNames = await Promise.all(
                data.map(async (chat) => {
                  const resolvedUsers = await Promise.all(chat.users);

                  const senderName =
                    resolvedUsers.length === 2
                      ? resolvedUsers[0]._id === user._id
                        ? resolvedUsers[1].name
                        : resolvedUsers[0].name
                      : resolvedUsers[0].name;

                  return { ...chat, senderName };
                })
              );

              setChats(chatsWithSenderNames);

              setSelectedChat("");
              setModal(true);
            } catch (error) {
              console.log(error);
            }

            return;
          }
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
    if (!socket) return;
    socket.emit("setup", user);
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    socket.on("newUserRegistered", (userData) => {
      toast({
        title: "New User Registered",
        description: `${userData.name} joined`,
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
  }, [user, toast, setOnlineUsersCount, socket]);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat, fetchMessages, toast, user.token]);

  useEffect(() => {
    if (!socket) return;
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
  }, [notification, setNotification, setFetchAgain, socket]);

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
  const handleDotClick = (index) => {
    setQuoteIndex(index);
  };
  useEffect(() => {
    const checkUserOnline = () => {
      if (!selectedChat || !Array.isArray(onlineUsersCount)) return false;
      return onlineUsersCount.includes(getSenderId(user, selectedChat.users));
    };
    setIsOnline(checkUserOnline());

    return () => {};
  }, [onlineUsersCount, selectedChat, user]);

  const deleteNewUser = () => {
    const userData = JSON.parse(localStorage.getItem("userInfo"));
    delete userData.isNewUser;
    localStorage.setItem("userInfo", JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <>
      {user.isNewUser && (
        <Modal
          size="lg"
          isOpen={() => {
            onOpen();
          }}
          isCentered
          closeOnOverlayClick={false}
        >
          {overlay}
          <ModalContent width={"calc(100% - 20px)"}>
            <ModalHeader
              fontSize="100%"
              fontFamily="Work sans"
              display="flex"
              justifyContent="center"
              background={"transparent"}
              userSelect={"none"}
            >
              *Safety and Terms of Use*
            </ModalHeader>

            <ModalBody
              display="flex"
              flexDir="column"
              alignItems="center"
              justifyContent="center"
              className="quote-container"
              overflowY={"scroll"}
            >
              <Text
                fontSize={"larger"}
                textAlign={"center"}
                userSelect={"none"}
                textColor={"blue.400"}
                p={3}
              >
                {heading[quoteIndex]}
              </Text>
              <Text
                className="quote-current"
                fontSize={"sm"}
                userSelect={"none"}
                textAlign={"center"}
                width={"100%"}
              >
                {quotes[quoteIndex]}
              </Text>
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
                handleDotClick={handleDotClick}
              />
              {quoteIndex === 5 ? (
                <Checkbox
                  onChange={() => {
                    setAds(true);
                    onClose();
                    deleteNewUser();
                  }}
                  p={2}
                  m={0}
                  fontSize={"2xs"}
                >
                  I'm 18+ and have agreed to{" "}
                  <Link
                    href="https://www.termsandconditionsgenerator.com/live.php?token=iuJtB9N5PKNTX5iM90p7B8cd8h6vCCdJ"
                    textColor={"blue"}
                    target="blank"
                  >
                    Terms of Use
                  </Link>{" "}
                </Checkbox>
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
      {modal && <Notifier isOpen={modal} onClose={() => setModal(false)} />}
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
              bgGradient="linear(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)"
              bgClip="text"
              userSelect={"none"}
              fontFamily={"cursive"}
            >
              {" "}
              {getSenderName(user, selectedChat.users)}
            </Text>
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              {isOnline ? <HiStatusOnline /> : <HiStatusOffline />}{" "}
              {!isCallStarted ? (
                <IconButton
                  borderRadius={20}
                  padding={0}
                  margin={0}
                  _hover={{ backgroundColor: "transparent" }}
                  backgroundColor={"transparent"}
                  isDisabled={!isOnline}
                  icon={<CiVideoOn style={{ fontSize: "2rem" }} />}
                  onClick={() => {
                    startCall();
                  }}
                />
              ) : (
                <TbPhoneCalling />
              )}
              <ProfileModal
                userInfo={getSenderFull(user, selectedChat.users)}
              />
            </Box>
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
              <ScrollableChat messages={messages} />
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
          <Text
            bgGradient="linear(to-l, #7928CA, #FF0080)"
            bgClip="text"
            fontWeight="extrabold"
            fontSize="3xl"
            pb={3}
            fontFamily="Work sans"
            userSelect="none"
          >
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
