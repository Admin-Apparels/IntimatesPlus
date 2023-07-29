import { ViewIcon } from "@chakra-ui/icons";
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
} from "@chakra-ui/react";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";
import { useState } from "react";

const ProfileModal = ({ userInfo }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isFocused, setIsFocused] = useState(false);
  const { user, setUser, selectedChat } = ChatState();
  console.log(user);
  const toast = useToast();

  const toggleFocus = () => {
    setIsFocused((prevState) => !prevState);
  };
  const handleBlockUnBlock = async (userId, user) => {
    console.log(user.token);
    console.log(userId);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(`/api/user/block/${userId}`, {}, config);
      setUser(data);
      console.log(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Process Request.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />

      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent height="410px">
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            {userInfo.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <Image
              borderRadius="full"
              boxSize={isFocused ? "300px" : "150px"}
              src={userInfo.pic}
              alt={userInfo.name}
              cursor="pointer"
              onClick={toggleFocus}
              transition="box-size 0.3s ease-in-out"
            />
            <Text
              fontSize={{ base: "28px", md: "30px" }}
              fontFamily="Work sans"
              display={isFocused ? "none" : "flex"}
            >
              Email: {userInfo.email}
            </Text>
          </ModalBody>
          <ModalFooter display={isFocused ? "none" : "flex"}>
            {selectedChat.users[1].isBlocked === true ? (
              <Button
                color={"green.400"}
                onClick={() =>
                  handleBlockUnBlock(selectedChat.users[1]._id, user)
                }
              >
                Unblock
              </Button>
            ) : (
              <Button
                color={"red.400"}
                onClick={() =>
                  handleBlockUnBlock(selectedChat.users[1]._id, user)
                }
              >
                Block
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
