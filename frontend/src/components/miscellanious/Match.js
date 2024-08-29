import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
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
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/user/female/users", config);

      setUsers(data);

      setLoading(false);
    } catch (error) {
      setLoading(false);
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
      {loading ? (
        <Lottie
          options={defaultOptions}
          width={70}
          style={{
            margin: 0,
            padding: 0,
          }}
        />
      ) : (
        <IconButton
          borderRadius={20}
          padding={0}
          margin={0}
          _hover={{ backgroundColor: "transparent" }}
          backgroundColor={"transparent"}
          icon={
            <Lottie
              options={defaultOptions}
              height={50} // Adjust height as needed
              width={50} // Adjust width as needed
            />
          }
          onClick={() => {
            setLoading(true);
            onOpen();
            fetchFemaleUsers();
          }}
        />
      )}

      <Modal
        size="lg"
        onClose={() => {
          onClose();
          setLoading(false);
        }}
        isOpen={isOpen}
        isCentered
      >
        {currentUser && (
          <>
            <ModalOverlay
              bg="none"
              backdropFilter="auto"
              backdropInvert="80%"
              backdropBlur="2px"
            />
            <ModalContent position="relative">
              <ModalCloseButton zIndex="2" color={"white"} />
              <ModalHeader
                fontSize="40px"
                fontFamily="Work sans"
                display="flex"
                justifyContent="center"
                alignItems={"center"}
                width={"100%"}
                background={"blackAlpha.400"}
                textColor={"whiteSmoke"}
                userSelect={"none"}
                p={0}
                m={0}
                position="absolute" // Position the header absolutely
                top="0" // Align it to the top of the modal content
                left="50%" // Center horizontally
                transform="translateX(-50%)" // Move it left by half its width to center it horizontally
                zIndex="1"
                // Ensure the header is above the image
              >
                {currentUser.name}

                {currentUser.verified ? (
                  <MdOutlineVerified
                    style={{ paddingLeft: "6", color: "#878ae8" }}
                  />
                ) : (
                  <VscUnverified
                    style={{ paddingLeft: "6", color: "#878ae8" }}
                  />
                )}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody
                position="relative" // Ensure the body is relatively positioned
                display="flex"
                flexDir="column"
                alignItems="center"
                justifyContent="space-between"
                p={1}
              >
                <Image
                  src={currentUser.pic}
                  alt={""}
                  height={"100%"}
                  width={"100%"}
                  loading="eager"
                  cursor="pointer"
                  transition="box-size 0.3s ease-in-out"
                  boxShadow="dark-lg"
                  rounded="md"
                  bg="white"
                  borderRadius={20}
                  userSelect="none"
                />

                <ModalFooter
                  display="flex"
                  flexDir="column"
                  position="absolute" // Positions the footer absolutely
                  bottom="0" // Aligns it to the bottom of the modal body
                  left="50%" // Centers it horizontally
                  transform="translateX(-50%)" // Moves it left by half its width to center it horizontally
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
                      Online
                    </Text>
                  ) : (
                    <Box
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                      width={"100%"}
                    >
                      Last seen: &nbsp;
                      <Text fontSize={"small"} textColor="green.100">
                        {lastSeenTime}
                      </Text>
                    </Box>
                  )}

                  <Button
                    m={0.5}
                    bgGradient="linear(to-r, gray.300, yellow.400, pink.200)"
                    borderRadius={20}
                  >
                    {currentUser.looking}
                  </Button>
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
                    <IconButton
                      aria-label="Heart"
                      background="transparent"
                      _hover={{
                        background: "transparent",
                        transform: "scale(1.2)", // Increase size on hover
                        transition: "transform 0.2s", // Smooth transition
                      }}
                      _active={{
                        transform: "scale(1.5)", // Increase size on click
                        transition: "transform 0.2s", // Smooth transition
                      }}
                      icon={
                        <FaHeart
                          fontSize="3rem"
                          color={click ? "#FF2400" : "#FF2400"} // Change color if clicked
                        />
                      }
                      onClick={() => {
                        setUserId(currentUser._id);
                        accessChat(currentUser._id);
                        setClick(!clicked); // Toggle clicked state
                      }}
                    />
                    {loadingChat ? (
                      <Spinner display="flex" />
                    ) : (
                      <IconButton
                        aria-label="Heart Broken"
                        background="transparent"
                        _hover={{
                          background: "transparent",
                          transform: "scale(1.2)", // Increase size on hover
                          transition: "transform 0.2s", // Smooth transition
                        }}
                        _active={{
                          transform: "scale(1.5)", // Increase size on click
                          transition: "transform 0.2s", // Smooth transition
                        }}
                        icon={
                          <FaHeartBroken
                            fontSize="3rem"
                            color="#7C0A02" // Dark red color
                          />
                        }
                        onClick={() => {
                          nextPage();
                          setClicked(!clicked); // Toggle clicked state
                        }}
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
