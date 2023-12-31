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
  Image,
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
import { ChatState } from "./Context/ChatProvider";
import animation from "../animations/typing.json";
import VideoCallComponent from "./miscellanious/vedioCall";


var selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const { onOpen, onClose } = useDisclosure();
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [wait, setWait] = useState(false);
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
    socket,
    isCallStarted,
    setIsCallStarted
  } = ChatState();

 const startCall = () => {
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
    " - Be vigilant: Recognize and protect yourself from scammers and fake profiles.- Report: If you encounter suspicious accounts, please report them to our team at admin@fuckmate.boo.",
    "- Respect Others: Treat all users with kindness, respect, and consideration. - No Harassment: Harassment, hate speech, or any form of abuse will not be tolerated. - Privacy: Protect your personal information and respect the privacy of others.",
    " - No Prostitution: Admin strictly prohibits any form of prostitution or solicitation. Such activities will result in immediate account suspension. - Adult Content: We do not encourage or link to adult content sites.",
    "- This service is designed to assist individuals dealing with porn addiction and or masturbation in finding connections. - Our goal is to help individuals build healthy sexual relationships and encourage human social interations.",
    "Data Protection and Non-Sale:   We are committed to protecting your data and will not sell your personal information to third parties or advertisers.   Matchmaking: In the future, you may be asked to provide location and other data. This data will be used solely for the purpose of finding you a suitable match within the app.   Privacy of User Identities: We respect your privacy, and we will keep the identities of other users confidential in relation to this app. Your identity will also be kept private in a similar manner.",
    "By using fuckmate.boo, you agree to abide by these safety guidelines and terms of use. Violation of these terms may result in account suspension or termination. Thank you for being part of Admin. If you have any questions or concerns, please contact our team at admin@fuckmate.boo. Your safety and well-being are important to us.",
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
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
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
    if(!socket) return;
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
      if (userData._id === user._id && user.gender === "female") {
        setTimeout(() => {
          setWait(true);
        }, 25000);
        setTimeout(() => {
          toast({
            title:
              "Your request is being processed by Admin, you'll be notified soon",
            status: "info",
            isClosable: true,
            duration: 20000,
            position: "bottom",
          });
        }, 5000);
      } else if (userData._id === user._id && user.gender === "male") {
        setTimeout(() => {
          setWait(true);
        }, 25000);
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
  }, [user, toast, setOnlineUsersCount, socket]);

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
              userSelect={"none"}
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
              <Text fontSize={"2xl"} textAlign={"center"} userSelect={"none"}>
                {heading[quoteIndex]}
              </Text>
              <Text className="quote-current" userSelect={"none"}>
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
                    setWait(false);
                    setAds(true);
                    onClose();
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
            <Box display={"flex"} justifyContent={"space-between"} alignItems={"center"}> {!isCallStarted ? (
                         <IconButton
                         borderRadius={20}
                         padding={0}
                         margin={0}
                         _hover={{backgroundColor: "transparent"}}
                         backgroundColor={"transparent"}
                         icon={
                           <Image src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1704001228/icons8-video-call-48_qzxzxs.png" m={3} height={7}/>
                         }
                         onClick={() => {
                          startCall();
                         }}
                       />
                    ) : (
                        <Image src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1704000962/icons8-ongoing-call-24_erbgdy.png" m={3}/>
                    )}<ProfileModal userInfo={getSenderFull(user, selectedChat.users)} /></Box>
           

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
              <div className="messages" style={{overflowX: "hidden"}}>
                {!isCallStarted ? (
                       <ScrollableChat messages={messages} />
                    ) : (
                      <VideoCallComponent 
                      userId={user._id} 
                      otherUserId={getSenderFull(user, selectedChat.users)}
                      isCallStarted={isCallStarted}
                      setIsCallStarted={setIsCallStarted}
                    />
                    )}
                
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
          position="relative"
          h="100%"
        >
          <Text
            fontSize="3xl"
            pb={3}
            fontFamily="Work sans"
            userSelect="none"
            zIndex={1} // Ensure the text is above the image
          >
            Click on a user to start chatting
          </Text>
          <Image
            src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1702457056/icons8-love_srfnyx.gif"
            display="flex"
            position="absolute"
            justifyContent="center"
            alignItems="center"
            zIndex={0} // Set a lower z-index to place the image behind the text
          />
        </Box>
      )}
    </>
  );
};

export default SingleChat;
