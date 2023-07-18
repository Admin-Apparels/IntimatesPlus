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
} from "@chakra-ui/react";
import { FaHeart } from "react-icons/fa";
import { ChatState } from "../Context/ChatProvider";
import { useState } from "react";
import axios from "axios";

const MatchModal = () => {
  const [loadingChat, setLoadingChat] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [users, setUsers] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const { setSelectedChat, user, chats, setChats } = ChatState();
  const toast = useToast();
  console.log(chats);

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const existingChat = chats.find(
        (chat) => chat.users[0]._id === userId || chat.users[1]._id === userId
      );

      if (existingChat) {
        setSelectedChat(existingChat);
      } else {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.post(`/api/chat`, { userId }, config);

        setChats([data, ...chats]);
        setSelectedChat(data);
      }

      setLoadingChat(false);
      onClose();
    } catch (error) {
      setLoadingChat(false);
      toast({
        title: "Error fetching the chat",
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

      const { data } = await axios.get("/api/user", config);

      setUsers(data.allUsers);
      setLoading(false);
    } catch (error) {
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
        <Spinner xs="auto" display="flex" />
      ) : (
        <IconButton
          display={{ base: "flex" }}
          icon={<FaHeart color="red.500" />}
          onClick={() => {
            setLoading(true);
            onOpen();
            fetchFemaleUsers();
          }}
        />
      )}

      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        {currentUser ? (
          <>
            <ModalOverlay />
            <ModalContent height="450px">
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
                  boxSize={isFocused ? "300px" : "150px"}
                  src={currentUser.pic}
                  alt={currentUser.name}
                  cursor="pointer"
                  onClick={toggleFocus}
                  transition="box-size 0.3s ease-in-out"
                />
                <Text
                  fontSize={{ base: "28px", md: "30px" }}
                  fontFamily="Work sans"
                  display={isFocused ? "none" : "flex"}
                >
                  Email: {currentUser.email}
                </Text>
              </ModalBody>
              <ModalFooter
                display={isFocused ? "none" : "flex"}
                justifyContent={"space-between"}
              >
                <Button onClick={() => accessChat(currentUser._id)}>
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
        ) : (
          <Text
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            No more Matches
          </Text>
        )}
      </Modal>
    </>
  );
};

export default MatchModal;
