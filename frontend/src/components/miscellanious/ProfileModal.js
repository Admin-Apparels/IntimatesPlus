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
import React, { useState } from "react";
import { MdVerified, MdOutlineVerified } from "react-icons/md";
import { VscUnverified } from "react-icons/vsc";

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
  const ADMIN_EMAIL = "admin@fuckmate.boo";

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

  const OverlayOne = () => (
    <ModalOverlay
      bg="blackAlpha.300"
      backdropFilter="blur(10px) hue-rotate(90deg)"
    />
  );
  const overlay = React.useState(<OverlayOne />);

  return (
    <>
      <IconButton
        display={{ base: "flex" }}
        icon={<ViewIcon />}
        onClick={() => {
          onOpen();
        }}
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
        {overlay}
        <ModalContent width={"calc(90%)"}>
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            display="flex"
            alignItems={"center"}
            justifyContent="center"
            userSelect={"none"}
          >
            <Text
              bgGradient="linear(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)"
              bgClip="text"
              userSelect={"none"}
              px={"4"}
            >
              {userInfo.name}
            </Text>

            {userInfo.email === ADMIN_EMAIL && <MdVerified />}

            {userInfo.verified ? <MdOutlineVerified /> : <VscUnverified />}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="center"
            position={"relative"}
          >
            <Image
              borderRadius={isFocused ? "50%" : "5%"}
              boxSize={isFocused ? "15rem" : "5rem"}
              src={userInfo.pic}
              alt={userInfo.name}
              height={"40vh"}
              width={"auto"}
              loading="eager"
              cursor="pointer"
              onClick={toggleFocus}
              transition="box-size 0.3s ease-in-out"
              userSelect={"none"}
            />

            <Text
              fontSize={{ base: "13px", md: "17px" }}
              fontFamily="Work sans"
              textAlign={"center"}
              display={isFocused ? "none" : "flex"}
              userSelect={"none"}
            >
              {userInfo.value}
            </Text>
          </ModalBody>
          <ModalFooter
            display={isFocused ? "none" : "flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            {userInfo.email !== ADMIN_EMAIL &&
              (showReportLinks ? (
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
                    userSelect={"none"}
                  >
                    Gmail
                  </Link>
                  <Link
                    href={`https://compose.mail.yahoo.com/?to=jngatia045@gmail.com&subject=Reporting%20${userInfo.name}%20${userInfo._id}&body=Please%20describe%20the%20issue%20you%20encountered`}
                    target="
                  _blank"
                    colorScheme="blue"
                    userSelect={"none"}
                  >
                    Yahoo
                  </Link>
                  <Link
                    href={`https://outlook.live.com/owa/?path=/mail/action/compose&to=jngatia045@gmail.com&subject=${userInfo.name}%20${userInfo._id}&body=Please%20describe%20the%20issue%20you%20encountered`}
                    target="_blank"
                    colorScheme="blue"
                    userSelect={"none"}
                  >
                    Outlook
                  </Link>
                </Box>
              ) : (
                <Button
                  color="blue"
                  onClick={toggleReportLinks}
                  userSelect={"none"}
                >
                  Report
                </Button>
              ))}
            {!deleted &&
              userInfo.email !== ADMIN_EMAIL &&
              (blocked ? (
                <Button
                  color={"green.400"}
                  onClick={() => handleUnBlock(userId, user)}
                  userSelect={"none"}
                >
                  Unblock
                </Button>
              ) : (
                <Button
                  color={"red.400"}
                  onClick={() => handleBlock(userId, user)}
                  userSelect={"none"}
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
