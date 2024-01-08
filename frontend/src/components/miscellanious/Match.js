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
import { ChatState } from "../Context/ChatProvider";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { handleCreateChat } from "../config/ChatLogics";

const MatchModal = () => {
  const [loadingChat, setLoadingChat] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [users, setUsers] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const { setSelectedChat, user, chats, setUserId, setUser, setChats } =
  ChatState();
  const toast = useToast();

  const accessChat = async (userId) => {
    const existingChat = chats.find(
      (chat) => chat.users[0]._id === userId || chat.users[1]._id === userId
    );
    const currentDate = new Date().getTime();

    if (existingChat) {
      setSelectedChat(existingChat);
      onClose();
      return;
    }
    if (
      user.accountType === "Platnum" &&
      parseInt(currentDate) < parseInt(user.day)
    ) {
      let timeRemaining = (
        (parseInt(user.day) - parseInt(currentDate)) /
        3600000
      ).toFixed(2);
      toast({
        title: "You are all caught up!",
        description: `wait after ${timeRemaining}hrs`,
        status: "info",
        isClosable: true,
        duration: 5000,
        position: "bottom",
      });
      onClose();
      return;
    }
    if (
      (user.accountType === "new" && chats.length >= 1) ||
      user.accountType === "Bronze"
    ) {
      navigate("/paycheck");
      onClose();
    } else {
      if (
        parseInt(currentDate) < parseInt(user.subscription) ||
        user.accountType === "new"
      ) {
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
      } else {
        toast({
          title: "You are not subscribed",
          description: `Subscription expired on ${new Date(
            parseInt(user.subscription)
          )}`,
          status: "info",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
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
          _hover={{backgroundColor: "transparent"}}
          backgroundColor={"transparent"}
          icon={
            <Image src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1702454939/icons8-love-circled_q6q3t5.gif" height={7}/>
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
            <ModalContent width={"calc(90%)"}>
              <ModalHeader
                fontSize="40px"
                fontFamily="Work sans"
                display="flex"
                justifyContent="center"
                bgGradient="linear(to-r, red.700, yellow.300)"
                bgClip="text"
                userSelect={"none"}
                p={0}
                m={0}
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
                  borderRadius={isFocused ? "50%" : "5%"}
                  boxSize={isFocused ? "20rem" : "10rem"}
                  src={currentUser.pic}
                  alt={currentUser.name}
                  height={"50vh"}
                  width={"auto"}
                  loading="eager"
                  cursor="pointer"
                  onClick={toggleFocus}
                  transition="box-size 0.3s ease-in-out"
                  userSelect={"none"}
                />{" "}
                <Text
                  fontSize={{ base: "15px", md: "15px" }}
                  fontFamily="Work sans"
                  display={isFocused ? "none" : "flex"}
                  textAlign={"center"}
                  userSelect={"none"}
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
                  bgGradient="linear(to-r, teal.500, green.500)"
                  _hover={{
                    bgGradient: "linear(to-r, red.500, yellow.500)",
                  }}
                >
                  Start Chat
                </Button>
                {loadingChat ? (
                  <Spinner ml="auto" display="flex" />
                ) : (
                  <Button
                    onClick={nextPage}
                    bgGradient="linear(to-r, teal.500, green.500)"
                    _hover={{
                      bgGradient: "linear(to-r, red.500, yellow.500)",
                    }}
                  >
                    Next
                  </Button>
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
