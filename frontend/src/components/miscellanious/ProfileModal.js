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
} from "@chakra-ui/react";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";
import { useState } from "react";

const ProfileModal = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isFocused, setIsFocused] = useState(false);
  const { selectedChat } = ChatState();

  const toggleFocus = () => {
    setIsFocused((prevState) => !prevState);
  };
  const handleBlockUser = async (userId, authToken) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      };

      const response = await axios.put(`/api/user/block/${userId}`, {}, config);
      return response.data;
    } catch (error) {
      throw error.response.data.message || "Error blocking user";
    }
  };
  const handleUnblock = () => {};

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          display={{ base: "flex" }}
          icon={<ViewIcon />}
          onClick={onOpen}
        />
      )}
      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent height="410px">
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            {user.name}
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
              src={user.pic}
              alt={user.name}
              cursor="pointer"
              onClick={toggleFocus}
              transition="box-size 0.3s ease-in-out"
            />
            <Text
              fontSize={{ base: "28px", md: "30px" }}
              fontFamily="Work sans"
              display={isFocused ? "none" : "flex"}
            >
              Email: {user.email}
            </Text>
          </ModalBody>
          <ModalFooter display={isFocused ? "none" : "flex"}>
            {selectedChat.isBlocked === true ? (
              <Button color={"green.400"} onClick={handleUnblock}>
                Blocked
              </Button>
            ) : (
              <Button
                color={"red.400"}
                onClick={() =>
                  handleBlockUser(selectedChat.users[1]._id, user.token)
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
