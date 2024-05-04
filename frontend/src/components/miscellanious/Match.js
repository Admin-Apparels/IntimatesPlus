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
import { handleCreateChat } from "../config/ChatLogics";

const MatchModal = () => {
  const [loadingChat, setLoadingChat] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [users, setUsers] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);

  const { setSelectedChat, user, chats, setUserId, setUser, setChats } =
    ChatState();
  const toast = useToast();

  const accessChat = async (userId) => {
    const existingChat = chats.find(
      (chat) => chat.users[0]._id === userId || chat.users[1]._id === userId
    );

    if (existingChat) {
      setSelectedChat(existingChat);
      onClose();
      return;
    }

    try {
      setLoadingChat(true);
      await handleCreateChat(
        user.accountType,
        userId,
        toast,
        user,
        setChats,
        setUser,
        chats,
        setSelectedChat
      );

      setLoadingChat(false);
      onClose();
    } catch (error) {
      setLoadingChat(false);
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
      toast({
        title: "Error fetching next Matches",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
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
  const OverlayTwo = () => (
    <ModalOverlay
      bg="none"
      backdropFilter="auto"
      backdropInvert="80%"
      backdropBlur="2px"
    />
  );

  const overlay = React.useState(<OverlayTwo />);

  return (
    <>
      {loading ? (
        <Spinner
          thickness="4px"
          speed="0.6s"
          emptyColor="gray.200"
          color="green.100"
          size="md"
        />
      ) : (
        <IconButton
          borderRadius={20}
          padding={0}
          margin={0}
          _hover={{ backgroundColor: "transparent" }}
          backgroundColor={"transparent"}
          icon={
            <Image
              src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1702454939/icons8-love-circled_q6q3t5.gif"
              height={7}
            />
          }
          onClick={() => {
            setLoading(true);
            onOpen();
            fetchFemaleUsers();
          }}
        />
      )}

      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        {currentUser && (
          <>
            {" "}
            <ModalCloseButton />
            {overlay}
            <ModalContent>
              <ModalHeader
                fontSize="40px"
                fontFamily="Work sans"
                display="flex"
                justifyContent="center"
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
                zIndex="1" // Ensure the header is above the image
              >
                {currentUser.name}

                <Text fontSize={"small"} textColor={"red"}>
                  {!currentUser.verified ? "anonymous ⚠️" : "Verified"}
                </Text>
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
                  display={"flex"}
                  flexDir={"column"}
                  position="absolute" // Position the footer absolutely
                  bottom="0" // Align it to the bottom of the modal body
                  left="50%" // Center horizontally
                  transform="translateX(-50%)" // Move it left by half its width to center it horizontally
                  justifyContent="space-between"
                  background={"blackAlpha.400"}
                  width="100%"
                >
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
                    <Button
                      onClick={() => {
                        setUserId(currentUser._id);
                        accessChat(currentUser._id);
                      }}
                      bgGradient="linear(to-r, teal.500, green.500)"
                      _hover={{
                        bgGradient: "linear(to-r, red.500, yellow.500)",
                      }}
                    >
                      Start Chat
                    </Button>
                    {loadingChat ? (
                      <Spinner display="flex" />
                    ) : (
                      <Button
                        onClick={nextPage}
                        bgGradient="linear(to-r, teal.500, green.500)"
                        _hover={{
                          bgGradient: "linear(to-r, red.500, yellow.500)",
                        }}
                      >
                        Pass
                        <Image
                          src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1705591008/icons8-broken-heart-48_xlns32.png"
                          height={5}
                        />
                      </Button>
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
