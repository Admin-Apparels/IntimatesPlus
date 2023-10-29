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
  Link,
  Box,
} from "@chakra-ui/react";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";
import { useState } from "react";

const ProfileModal = ({ userInfo }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isFocused, setIsFocused] = useState(false);
  const { user, setUser, selectedChat } = ChatState();
  const [showReportLinks, setShowReportLinks] = useState(false);

  const toggleReportLinks = () => {
    setShowReportLinks(!showReportLinks);
  };

  const toast = useToast();

  const toggleFocus = () => {
    setIsFocused((prevState) => !prevState);
  };
  const handleBlock = async (userId, user) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(`/api/user/block/${userId}`, {}, config);
      setUser((prev) => ({ ...prev, isBlocked: data.isBlocked }));
      onClose();
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
  const handleUnBlock = async (userId, user) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        `/api/user/unblock/${userId}`,
        {},
        config
      );
      setUser((prev) => ({ ...prev, isBlocked: data.isBlocked }));
      onClose();
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
  const blocked =
    user.isBlocked.includes(selectedChat.users[0]._id) ||
    user.isBlocked.includes(selectedChat.users[1]._id);
  const userId =
    selectedChat.users[1]._id === user._id
      ? selectedChat.users[0]._id
      : selectedChat.users[1]._id;
  const deleted =
    selectedChat.users[0].deleted || selectedChat.users[1].deleted;
  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={onOpen}
      />

      <Modal
        size="lg"
        onClose={() => {
          setShowReportLinks();
          onClose();
        }}
        isOpen={isOpen}
        isCentered
      >
        <ModalOverlay />
        <ModalContent height="410px" width={"calc(100% - 20px)"}>
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
            bgGradient="linear(to-r, red.700, yellow.300)"
            bgClip="text"
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
              loading="lazy"
              cursor="pointer"
              onClick={toggleFocus}
              transition="box-size 0.3s ease-in-out"
            />

            <Text
              fontSize={{ base: "18px", md: "20px" }}
              fontFamily="Work sans"
              textAlign={"center"}
              display={isFocused ? "none" : "flex"}
            >
              {userInfo.value}
            </Text>
          </ModalBody>
          <ModalFooter
            display={isFocused ? "none" : "flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            {showReportLinks ? (
              <Box
                display={"flex"}
                flexDir={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
                width={"33%"}
              >
                <Link
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=jngatia045@gmail.com&su=Reporting%20${userInfo.name}%20${userInfo._id}&body=Please%20describe%20the%20issue%20you%20encountered`}
                  target="_blank"
                  colorScheme="blue"
                >
                  Gmail
                </Link>
                <Link
                  href={`https://compose.mail.yahoo.com/?to=jngatia045@gmail.com&subject=Reporting%20${userInfo.name}%20${userInfo._id}&body=Please%20describe%20the%20issue%20you%20encountered`}
                  target="
                  _blank"
                  colorScheme="blue"
                >
                  Yahoo
                </Link>
                <Link
                  href={`https://outlook.live.com/owa/?path=/mail/action/compose&to=jngatia045@gmail.com&subject=${userInfo.name}%20${userInfo._id}&body=Please%20describe%20the%20issue%20you%20encountered`}
                  target="_blank"
                  colorScheme="blue"
                >
                  Outlook
                </Link>
              </Box>
            ) : (
              <Button color="blue" onClick={toggleReportLinks}>
                Report
              </Button>
            )}
            {!deleted &&
              (blocked ? (
                <Button
                  color={"green.400"}
                  onClick={() => handleUnBlock(userId, user)}
                >
                  Unblock
                </Button>
              ) : (
                <Button
                  color={"red.400"}
                  onClick={() => handleBlock(userId, user)}
                >
                  Block
                </Button>
              ))}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
