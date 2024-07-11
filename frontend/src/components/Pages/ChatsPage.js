import { Box } from "@chakra-ui/layout";
import React, { useEffect, useState } from "react";
import Chatbox from "../Chatbox";
import MyChats from "../MyChats";
import SideDrawer from "../miscellanious/SideDrawer";
import ErrorBoundary from "./ErrorBoundary";
import { ChatState } from "../Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import Ads from "../miscellanious/ads";
import Feed from "../miscellanious/feed";
import { Button, Image, ModalCloseButton } from "@chakra-ui/react";
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
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import Poll from "../miscellanious/Poll";

const Chatpage = () => {
  const navigate = useNavigate();
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user, setUser, selectedChat, trend, setTrend } = ChatState();
  const [hasNewNotification, setHasNewNotification] = useState(true);
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

  const handleButtonClick = () => {
    onOpen();
    setHasNewNotification(false);
  };

  useEffect(()=> {
    if(trend){
      onOpen();
    }
  }, [trend, onOpen]);

  return (
    <Box width="100%">
      <ErrorBoundary fallback={<p>Something went wrong</p>} userSelect={"none"}>
        {user && <SideDrawer />}{" "}
        {/* {user &&
          ((user.accountType === "Gold" &&
            parseInt(new Date().getTime()) > parseInt(user.subscription)) ||
            parseInt(new Date().getTime()) >
              parseInt(user.adsSubscription)) && <Ads />} */}
        <Modal size="lg" onClose={() => {onClose(); setTrend(false)}} isOpen={isOpen} onOpen={onOpen}>
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
              fontSize="100%"
              fontFamily="Work sans"
              display="flex"
              flexDir={"column"}
              textAlign={"center"}
              position={"sticky"}
              bgGradient="linear(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)"
              bgClip="text"
              userSelect={"none"}
            >
              <LinkBox
                as="article"
                maxW="sm"
                p="3"
                borderWidth="1px"
                rounded="md"
                position="absolute"
                top="-50%"
                right="0"
                textColor={"white"}
                background={"#FFA500"}
              >
                <LinkOverlay
                  userSelect={"none"}
                  href="https://www.paypal.com/donate/?hosted_button_id=2L8HHGURQTED2"
                  target="blank"
                >
                  Donate
                </LinkOverlay>
              </LinkBox>
              <h1 style={{fontWeight: "bolder"}}>From Fleeting to Lasting Forum</h1>
              <ModalCloseButton/>
            </ModalHeader>
            <ModalBody
              display={"flex"}
              flexWrap={"wrap"}
              justifyContent={"center"}
              alignItems={"center"}
              width={"100%"}
              overflowY={"auto"}
              userSelect={"none"}
            >
              <Feed/>
            </ModalBody>
            <ModalFooter
              display={"flex"}
              flexDir={"column"}
              textAlign={"center"}
              textColor={"Background"}
              fontSize={"small"}
              backgroundColor={"grey"}
              p={0}
              m={1}
              borderRadius={2}
            >
              <Image
                src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1706012485/icons8-eye_g5kvhn.gif"
                height={3}
              />
              <Text fontSize={"smaller"} p={0} m={0}>
                15k
              </Text>
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
          {user && <MyChats fetchAgain={fetchAgain} />}
          {user && (
            <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          )}
          {!selectedChat && (
           <Poll/>
          )}
        </Box>
      </ErrorBoundary>
    </Box>
  );
};

export default Chatpage;
