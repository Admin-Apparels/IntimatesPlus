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
  useToast,
  ModalOverlay,
  Button,
  FormControl,
  Checkbox,
  Link,
  Textarea,
} from "@chakra-ui/react";
import "../components/styles.css";
import PageIndicator from "./miscellanious/PageIndicator";
import Lottie from "react-lottie";
import {
  getSenderFull,
  getUserById,
  getSenderId,
  useConnectSocket,
  formatMessageTime,
} from "./config/ChatLogics";
import { CiVideoOn } from "react-icons/ci";
import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "../components/miscellanious/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import { ChatState } from "./Context/ChatProvider";
import animation from "../animations/typing.json";
import sendingMessage from "../animations/Sending.json";
import Inbox from "../animations/Inbox.json";
import { useNavigate } from "react-router-dom";
import Notifier from "./miscellanious/Notifier";
import { HiStatusOffline, HiStatusOnline } from "react-icons/hi";
import { TbPhoneCalling } from "react-icons/tb";
import { IoSend } from "react-icons/io5";
import background from "../chatBackground.jpg";

var selectedChatCompare;

const SingleChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const { onOpen, onClose } = useDisclosure();

  const [istyping, setIstyping] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [sending, setSending] = useState(false);
  const [modal, setModal] = useState(false);
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Limit the height to 200px
    }
  }, [newMessage]);

  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const InboxdefaultOptions = {
    loop: true,
    autoplay: true,
    animationData: Inbox,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const sendingDefaultOptions = {
    loop: true,
    autoplay: true,
    animationData: sendingMessage,
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
    "Scammers and Unverified Profiles:",
    "Maintaining a Safe Environment:",
    "Prohibited Content:",
    "IntimatesPlus Impact:",
    "Privacy and Data Usage Agreement:",
    "",
  ];

  const quotes = [
    "-Be vigilant: Recognize and protect yourself from scammers and unverified profiles.- Report: If you encounter suspicious accounts, please report them to our team at intimates_plus@fuckmate.boo.",
    "-Respect Others: Treat all users with kindness, respect, and consideration. - No Harassment: Harassment, hate speech, or any form of abuse will not be tolerated. - Privacy: Protect your personal information and respect the privacy of others.",
    "-No Prostitution: IntimatesPlus strictly prohibits any form of prostitution or solicitation. Such activities will result in immediate account suspension. - Adult Content: We do not encourage or link to adult content sites.",
    "IntimatesPlus addresses the growing issue of social isolation and the detrimental effects of excessive consumption of adult content. Our platform offers a safe, supportive space where users can connect with like-minded individuals, fostering meaningful relationships that go beyond superficial interactions. By promoting genuine connections, IntimatesPlus helps reduce feelings of loneliness, depression, and anxiety, ultimately improving users' mental health and overall well-being",
    "Data Protection and Non-Sale: We are committed to protecting your data and will not sell your personal information to third parties or advertisers. Matchmaking: In the future, you may be asked to provide location and other data. This data will be used solely for the purpose of finding you a suitable match within the app.   Privacy of User Identities: We respect your privacy, and we will keep the identities of other users confidential in relation to this app. Your identity will also be kept private in a similar manner.",
    "By using IntimatesPlus, you agree to abide by these safety guidelines and terms of use. Violation of these terms may result in account suspension or termination. Thank you for being part of IntimatesPlus. If you have any questions or concerns, please contact our team at intimates_plus@fuckmate.boo. Your safety and well-being are important to us.",
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
        setSending(true);
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
          setSending(false);

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
          setSending(false);

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
          setSending(false);
          return;
        }

        // Check if the message contains sensitive information
        const flaggedKeywords = [
          "social",
          "socials",
          "nipee",
          "time",
          "nipe",
          "nikupigie",
          "reach",
          "phone",
          "meet",
          "contact",
          "email",
          "give",
          "handle",
          "show",
          "number",
          "mobile",
          "cellphone",
          "details",
          "whatsapp",
          "telegram",
          "signal",
          "instagram",
          "ig",
          "facebook",
          "fb",
          "linkedin",
          "li",
          "twitter",
          "tw",
          "x",
          "snapchat",
          "snap",
          "link",
          "sc",
          "send",
          "skype",
          "sk",
          "discord",
          "dc",
          "date",
          "account",
          "call",
          "chat",
          "wapi",
          "tumeet",
          "tuchat",
          "watsapp",
          "whatsup",
          "on",
          "share",
        ];

        const daysOfWeek = [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ];

        const patterns = [
          ...flaggedKeywords.map(
            (keyword) => new RegExp(`\\b${keyword}\\b`, "i")
          ), // 'i' flag makes it case-insensitive
          ...daysOfWeek.map((day) => new RegExp(`\\b${day}\\b`, "i")),
          /\b\d{8,10}\b/,
        ];

        const isFlaggedMessage = patterns.some((pattern) =>
          pattern.test(newMessage)
        );

        // If the message is flagged and the user's subscription status requires flagging, flag the chat
        if (isFlaggedMessage && selectedChat.chatName !== "Admin") {
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
            setSending(false);
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
              chat: selectedChat,
              sender: user,
            },
            config
          );

          socket.emit("new message", data);
          setMessages((prevMessages) => [...prevMessages, data]);
          setSending(false);
        } catch (error) {
          setSending(false);
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
    socket.on("typing", () => setIstyping(true)); // Set istyping state to true when other user starts typing
    socket.on("stop typing", () => setIstyping(false)); // Set istyping state to false when other user stops typing
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
      socket.off("New User Registered");
      socket.off("onlineUsers");
      socket.off("typing"); // Clean up socket listeners
      socket.off("stop typing");
      socket.disconnect();
    };
  }, [user, toast, setOnlineUsersCount, socket]);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
  }, [selectedChat, fetchMessages, toast, user.token]);

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        } else {
          toast({
            title:
              "Please allow message notifications to stay updated with new messages.",
            status: "warning",
            duration: 5000,
            isClosable: true,
          });
        }
      });
    }
  }, [toast]);

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
  }, [notification, setNotification, socket]);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    const senderId = getSenderId(user, selectedChat.users);

    if (!typing) {
      setTyping(true); // Set istyping state to true when the user starts typing
      socket.emit("typing", senderId); // Notify the other user about typing
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;

    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;

      if (timeDiff >= timerLength && typing) {
        setTyping(false); // Set istyping state to false after 3000ms if user is still typing
        socket.emit("stop typing", senderId); // Notify the other user about stopping typing
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

  const senderFullInfo = getSenderFull(user, selectedChat?.users);
  const senderStatusTime = senderFullInfo?.status
    ? new Date(senderFullInfo.status)
    : null;
  const lastSeenTime = senderStatusTime
    ? formatMessageTime(senderStatusTime)
    : "Unknown";

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
          <ModalOverlay
            bg="blackAlpha.300"
            backdropFilter="blur(10px) hue-rotate(90deg)"
          />
          <ModalContent>
            <ModalHeader
              fontSize="100%"
              fontFamily="Arial, sans-serif"
              display="flex"
              justifyContent="center"
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
                setStep={false}
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
                    target="blank"
                    textDecoration={"underline"}
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
          <Box
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Arial, sans-serif"
            display="flex"
            justifyContent={"space-between"}
            alignItems="center"
          >
            <IconButton
              display="flex"
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />

            <Box
              textAlign={"center"}
              textColor={"white"}
              userSelect={"none"}
              fontFamily="Arial, sans-serif"
            >
              {" "}
              {senderFullInfo?.name}
              <Text
                display={"flex"}
                textAlign={"center"}
                textColor={"white"}
                fontSize={"x-small"}
              >
                {onlineUsersCount?.includes(senderFullInfo?._id)
                  ? "Online"
                  : `last seen: ${lastSeenTime}`}
              </Text>
            </Box>
            <Box
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              {isOnline ? (
                <HiStatusOnline style={{ color: "green" }} />
              ) : (
                <HiStatusOffline />
              )}{" "}
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
          </Box>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="space-between" // This ensures space is distributed between the chat and input
            bgImage={background}
            alignItems="center"
            width="100%"
            height="100%"
            borderRadius="lg"
            overflowY="hidden" // Hide any overflow except for scrollable chat
          >
            {loading ? (
              <Lottie
                options={InboxdefaultOptions}
                height="100%"
                width="100%"
                speed={0.5}
              />
            ) : (
              <Box
                flex="1" // This makes the chat take up the remaining space
                width="100%"
                overflowY="auto" // Ensure chat is scrollable
              >
                <ScrollableChat messages={messages} />
              </Box>
            )}

            {/* Typing indicator and input box at the bottom */}
            <FormControl id="typing" width="100%">
              {istyping && (
                <Box bg="transparent" mb={3}>
                  <Lottie
                    options={defaultOptions}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </Box>
              )}

              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                paddingLeft="2"
                paddingBottom="2"
                width="100%"
              >
                <Textarea
                  ref={textareaRef}
                  variant="filled"
                  bg="whitesmoke"
                  placeholder="Enter a message..."
                  value={newMessage}
                  onChange={typingHandler}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  resize="none" // Prevent manual resizing
                  rows={1} // Initial rows for textarea
                  autoComplete="on"
                  overflowY="auto" // Enable vertical scroll for textarea if needed
                  maxLength={250}
                  width="100%" // Ensure textarea takes full width
                />
                {sending ? (
                  <Lottie options={sendingDefaultOptions} width={50} />
                ) : (
                  <IoSend
                    onClick={() => sendMessage()}
                    style={{
                      color: "#0077b6",
                      fontSize: "2.5rem",
                      padding: "4",
                    }}
                  />
                )}
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
            textColor={"white"}
            fontWeight="extrabold"
            fontSize="3xl"
            fontFamily="Arial, sans-serif"
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
