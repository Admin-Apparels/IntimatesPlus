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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [users, setUsers] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const { user } = ChatState();
  const toast = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        params: {
          limit: 10,
        },
      };

      const { data } = await axios.get("/api/user", config);

      setUsers(data);
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
  console.log(users);
  const toggleFocus = () => {
    setIsFocused((prevState) => !prevState);
  };
  const nextPage = () => {
    if (currentIndex < users.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      fetchUsers();
      setCurrentIndex(0);
    }
  };

  const currentUser = users[currentIndex];

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<FaHeart color="red" />}
        onClick={() => {
          onOpen(); // Call the first function
          fetchUsers(); // Call the second function
        }}
      />

      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        {loading && <Spinner ml="auto" display="flex" />}
        {currentUser ? (
          <>
            <ModalOverlay />
            <ModalContent height="450px" width={"auto"}>
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
                  borderRadius="10%"
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
              <ModalFooter display={isFocused ? "none" : "flex"}>
                <Button onClick={nextPage}>Next</Button>
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
