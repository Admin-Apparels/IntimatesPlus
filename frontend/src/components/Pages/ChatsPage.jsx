import React, { useEffect } from "react";
import Chatbox from "../Chatbox";
import MyChats from "../MyChats";
import SideDrawer from "../miscellanious/SideDrawer";
import ErrorBoundary from "./ErrorBoundary";
import { ChatState } from "../Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import Ads from "../miscellanious/ads";
import Feed from "../miscellanious/feed";
import {
  Text,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  Box,
  ModalCloseButton,
} from "@chakra-ui/react";
import Poll from "../miscellanious/Poll";
import FooterAchieves from "../miscellanious/FooterAchieves";
import { IoLibrary } from "react-icons/io5";

const Chatpage = () => {
  const navigate = useNavigate();
  const { user, setUser, selectedChat, trend, setTrend } = ChatState();
  const { onClose, isOpen, onOpen } = useDisclosure();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) {
      navigate("/");
    }
    const handleStorageChange = (e) => {
      if (e.key === "userInfo") {
        const updatedUserInfo = JSON.parse(e.newValue);
        setUser(updatedUserInfo);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [navigate, setUser]);

  useEffect(() => {
    if (trend) {
      onOpen();
    }
  }, [trend, onOpen]);

  return (
    <Box
      width="100%"
      height={"100vh"}
      display={"flex"}
      flexDir={"column"}
      overflow={"scroll"}
      p={"2"}
      background={"whitesmoke"}
    >
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        {user && <SideDrawer />}{" "}
        {user &&
          ((user.accountType === "Gold" &&
            parseInt(new Date().getTime()) > parseInt(user.subscription)) ||
            parseInt(new Date().getTime()) >
              parseInt(user.adsSubscription)) && <Ads />}
        <Modal
          size="lg"
          onClose={() => {
            onClose();
            setTrend(false);
          }}
          isOpen={isOpen}
          onOpen={onOpen}
        >
          <ModalOverlay
            bg="blackAlpha.300"
            backdropFilter="blur(10px) hue-rotate(90deg)"
          />
          <ModalContent
            display={"flex"}
            flexDirection={"column"}
            height={"100%"}
          >
            <ModalHeader
              fontFamily="Arial, sans-serif"
              fontSize={"xl"}
              textAlign={"center"}
              bgGradient="linear(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)"
              bgClip="text"
              userSelect={"none"}
            >
              <ModalCloseButton
                textColor={"black"}
                background={"transparent"}
                mr={-3}
                border={"none"}
              />
              IntimatesPlus Confesional
            </ModalHeader>
            <ModalBody
              display={"flex"}
              flexWrap={"wrap"}
              justifyContent={"center"}
              alignItems={"center"}
              width={"100%"}
              overflowY={"auto"}
              userSelect={"none"}
              p={"2"}
            >
              <Feed />
            </ModalBody>
            <ModalFooter
              display={"flex"}
              flexDir={"column"}
              textAlign={"center"}
              fontSize={"small"}
            >
              For more stories and inspiration, follow us on
              <Link
                href="https://twitter.com/IntiMates_Plus"
                textColor={"blue.200"}
                fontSize={"larger"}
                fontWeight={"bold"}
                isExternal
              >
                X
              </Link>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <Box
          display="flex"
          justifyContent="space-evenly"
          width="100%"
          height={"100%"}
          p="0.2rem"
        >
          {" "}
          {user && <MyChats />}
          {user && <Chatbox />}
          {!selectedChat && <Poll />}
        </Box>
        {user && (
          <Box width={"100%"}>
            <Box
              display={"flex"}
              width={"100%"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <IoLibrary style={{ color: "red" }} />{" "}
              <Text p={"3"} fontWeight={"bold"}>
                Achieves
              </Text>
            </Box>
            <FooterAchieves />
          </Box>
        )}
      </ErrorBoundary>
    </Box>
  );
};

export default Chatpage;