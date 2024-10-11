import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Text,
  Image,
  useToast,
  Spinner,
  Box,
} from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import React, { useState } from "react";
import axios from "axios";
import { formatMessageTime, handleCreateChat } from "../config/ChatLogics";
import { MdOutlineVerified } from "react-icons/md";
import { VscUnverified } from "react-icons/vsc";
import { HiStatusOnline } from "react-icons/hi";
import { FaHeart, FaHeartBroken } from "react-icons/fa";
import Lottie from "react-lottie";
import animation from "../../animations/love.json";

const MatchModal = () => {
  const [loadingChat, setLoadingChat] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [users, setUsers] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [clicked, setClicked] = useState(false);
  const [click, setClick] = useState(false);

  const {
    setSelectedChat,
    user,
    setChats,
    chats,
    setUserId,
    onlineUsersCount,
  } = ChatState();
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      await handleCreateChat(
        userId,
        user,
        setChats,
        chats,
        setSelectedChat,
        toast
      );

      setLoadingChat(false);
      onClose();
    } catch (error) {
      setLoadingChat(false);
      console.log(error);
      onClose();
      toast({
        title: "Error creating your chat, try again later",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  const fetchFemaleUsers = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/user/female/users", config);

      setUsers(data);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        toast({
          title: "Too many request:",
          description: "try again after sometime.",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
      } else {
        toast({
          title: "Error fetching next matches",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
      }
    }
  };

  const nextPage = () => {
    if (currentIndex < users.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      fetchFemaleUsers();
      setCurrentIndex(0);
    }
  };
  const currentUser = users[currentIndex];
  const lastSeenTime = currentUser
    ? formatMessageTime(currentUser.status)
    : "Unknown";
  return (
    <>
      <IconButton
        _hover={{ background: "transparent" }}
        _focus={{ background: "transparent" }} // Prevent focus styles from affecting size
        backgroundColor={"transparent"}
        height="50px" // Ensure the button height remains consistent
        width="50px" // Ensure the button width remains consistent
        icon={
          <Lottie
            options={defaultOptions}
            height={50} // Adjust height as needed
            width={50} // Adjust width as needed
          />
        }
        onClick={() => {
          onOpen();
          fetchFemaleUsers();
        }}
      />
      <Modal size="sm" onClose={onClose} isOpen={isOpen} isCentered>
        {currentUser && (
          <>
            <ModalOverlay
              bg="none"
              backdropFilter="auto"
              backdropInvert="80%"
              backdropBlur="2px"
            />
            <ModalContent
              position="relative"
              width={["100%", "80%", "40%"]}
              maxWidth="100vw"
              bg="none"
              backdropFilter="auto"
              backdropInvert="80%"
              backdropBlur="2px"
            >
              <ModalCloseButton zIndex="2" color={"white"} />
              <ModalHeader
                fontSize={["24px", "30px", "40px"]}
                fontFamily="Work sans"
                display="flex"
                justifyContent="center"
                alignItems={"center"}
                width={"100%"}
                background={"blackAlpha.400"}
                textColor={"whiteSmoke"}
                userSelect={"none"}
                position="absolute"
                top="0"
                left="50%"
                transform="translateX(-50%)"
                zIndex="1"
              >
                {currentUser.name}
                {currentUser.verified ? (
                  <MdOutlineVerified
                    style={{ paddingLeft: "6", color: "green" }}
                  />
                ) : (
                  <VscUnverified style={{ paddingLeft: "6", color: "red" }} />
                )}
              </ModalHeader>

              <ModalBody
                position="relative"
                display="flex"
                flexDir="column"
                alignItems="center"
                justifyContent="space-between"
                width={"100%"}
                p={4}
              >
                <Image
                  src={currentUser.pic}
                  alt={""}
                  width={"100%"} // Takes full width of the modal
                  height={"auto"} // Keeps the aspect ratio
                  objectFit={"cover"} // Adjust the image to contain inside the modal
                  loading="eager"
                  cursor="pointer"
                  userSelect="none"
                />

                <ModalFooter
                  display="flex"
                  flexDir="column"
                  position="absolute"
                  bottom="0"
                  left="50%"
                  transform="translateX(-50%)"
                  fontSize={"small"}
                  justifyContent="space-between"
                  bg="linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 1))"
                  width="100%"
                >
                  {onlineUsersCount.includes(currentUser._id) ? (
                    <Text
                      display={"flex"}
                      textAlign={"center"}
                      textColor={"white"}
                    >
                      <HiStatusOnline
                        style={{ color: "red", fontSize: "1.5rem" }}
                      />
                      Active
                    </Text>
                  ) : (
                    <Box
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      width={"100%"}
                    >
                      Last seen: &nbsp;
                      <Text fontSize={"x-small"} textColor="green.100">
                        {lastSeenTime}
                      </Text>
                    </Box>
                  )}

                  <Text
                    m={0.2}
                    bgGradient="linear(to-r, gray.300, yellow.400, pink.200)"
                    bgClip={"text"}
                  >
                    {currentUser.looking}
                  </Text>
                  <Text
                    width={"100%"}
                    fontFamily="Work sans"
                    textAlign="center"
                    userSelect="none"
                    textColor={"whitesmoke"}
                    m={1}
                  >
                    {currentUser.value}
                  </Text>
                  <Box
                    display={"flex"}
                    justifyContent={"space-between"}
                    width={"100%"}
                  >
                    <FaHeart
                      fontSize="2rem"
                      background="transparent"
                      _hover={{
                        background: "transparent",
                        transform: "scale(1.2)",
                        transition: "transform 0.2s",
                      }}
                      _active={{
                        transform: "scale(1.5)",
                        transition: "transform 0.2s",
                      }}
                      onClick={() => {
                        setUserId(currentUser._id);
                        accessChat(currentUser._id);
                        setClick(!clicked);
                      }}
                      color={click ? "#FF2400" : "#FF2400"}
                    />

                    {loadingChat ? (
                      <Spinner display="flex" />
                    ) : (
                      <FaHeartBroken
                        fontSize="2rem"
                        background="transparent"
                        _hover={{
                          background: "transparent",
                          transform: "scale(1.2)",
                          transition: "transform 0.2s",
                        }}
                        _active={{
                          transform: "scale(1.5)",
                          transition: "transform 0.2s",
                        }}
                        onClick={() => {
                          nextPage();
                          setClicked(!clicked);
                        }}
                        color="#7C0A02"
                      />
                    )}
                  </Box>
                </ModalFooter>
              </ModalBody>
            </ModalContent>
          </>
        )}
      </Modal>
    </>
  );
};

export default MatchModal;
