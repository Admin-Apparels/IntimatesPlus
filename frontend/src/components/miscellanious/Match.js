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
import FavoriteIcon from "@mui/icons-material/Favorite";
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

  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const toast = useToast();
  console.log(chats);
  console.log(user);

  const accessChat = async (userId) => {
    console.log(userId);
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

        const { data } = await axios.post(
          "/api/chat",
          { userId, user },
          config
        );

        setChats([data, ...chats]);
        console.log(data);
        setSelectedChat(data);
      }

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
  };
  console.log(selectedChat);
  console.log(chats);
  const fetchFemaleUsers = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user`, config);

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
          justifyContent={"center"}
          alignItems={"center"}
          color={"red.400"}
          icon={
            <>
              <FavoriteIcon fontSize="medium" />
              <Text p={0} m={0} mt={3} fontStyle={"italic"}>
                Find Women:{")"}
              </Text>
            </>
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
        )}
      </Modal>
    </>
  );
};

export default MatchModal;
