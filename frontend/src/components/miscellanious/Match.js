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
  calc,
} from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MatchModal = () => {
  const [loadingChat, setLoadingChat] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [users, setUsers] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const { setSelectedChat, user, chats, setChats, setUserId } = ChatState();
  const toast = useToast();

  const accessChat = async (userId) => {
    const existingChat = chats.find(
      (chat) => chat.users[0]._id === userId || chat.users[1]._id === userId
    );
    const currentDate = new Date();

    if (existingChat) {
      setSelectedChat(existingChat);
      onClose();
      return;
    }
    if (user.accountType === "platnum" && currentDate > user.day) {
      let timeRemaining = calc(user.day - currentDate);
      toast({
        title: "You are all caught up!",
        description: `wait after ${timeRemaining}`,
        status: "info",
        isClosable: true,
        duration: 5000,
        position: "bottom",
      });
      return;
    }
    if (user.accountType === "new " || user.accountType === "Bronze") {
      navigate("/paycheck");
      onClose();
    } else {
      const subscriptionExpiry = new Date(user.subscription);

      if (currentDate < subscriptionExpiry) {
        try {
          setLoadingChat(true);
          const config = {
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          };

          const { data } = await axios.post(
            `/api/chat/${user.accountType}`,
            { userId, user },
            config
          );

          setChats([data, ...chats]);

          setSelectedChat(data);
          setLoadingChat(false);
          onClose();
        } catch (error) {
          toast({
            title: "Error fetching the chat",
            description: error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom-left",
          });
        }
      } else {
        navigate("/paycheck");
      }
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
      console.log(data);
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

  const toggleFocus = () => {
    setIsFocused((prevState) => !prevState);
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

  return (
    <>
      {loading ? (
        <Spinner
          thickness="4px"
          speed="0.4s"
          emptyColor="gray.200"
          color="blue.500"
          size="md"
        />
      ) : (
        <IconButton
          icon={
            <Box
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Text
                p={1}
                fontStyle={"italic"}
                display={"flex"}
                color={"red.700"}
              >
                Match
                <Image
                  src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1694448680/pngwing.com_jzzs7q.png"
                  p={0}
                  m={0}
                  h={3}
                />{" "}
              </Text>
            </Box>
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
            <ModalOverlay />
            <ModalContent height="80vh" width={"calc(100% - 20px)"}>
              <ModalHeader
                fontSize="40px"
                fontFamily="Work sans"
                display="flex"
                justifyContent="center"
              >
                {currentUser.name}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody
                display="flex"
                flexDir="column"
                alignItems="center"
                justifyContent="space-between"
              >
                <Image
                  borderRadius="5%"
                  boxSize={isFocused ? "20rem" : "10rem"}
                  src={currentUser.pic}
                  alt={currentUser.name}
                  cursor="pointer"
                  onClick={toggleFocus}
                  transition="box-size 0.3s ease-in-out"
                />{" "}
                <Text
                  fontSize={{ base: "15px", md: "15px" }}
                  fontFamily="Work sans"
                  display={isFocused ? "none" : "flex"}
                  textAlign={"center"}
                >
                  {currentUser.value}
                </Text>
              </ModalBody>
              <ModalFooter
                display={isFocused ? "none" : "flex"}
                justifyContent={"space-between"}
              >
                <Button
                  onClick={() => {
                    setUserId(currentUser._id);
                    accessChat(currentUser._id);
                  }}
                >
                  Start Chat
                </Button>
                {loadingChat ? (
                  <Spinner ml="auto" display="flex" />
                ) : (
                  <Button onClick={nextPage}>Next</Button>
                )}
              </ModalFooter>
            </ModalContent>
          </>
        )}
      </Modal>
    </>
  );
};

export default MatchModal;
