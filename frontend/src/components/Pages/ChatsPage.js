import { Box } from "@chakra-ui/layout";
import React, { useEffect } from "react";
import Chatbox from "../Chatbox";
import MyChats from "../MyChats";
import SideDrawer from "../miscellanious/SideDrawer";
import ErrorBoundary from "./ErrorBoundary";
import { ChatState } from "../Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import Ads from "../miscellanious/ads";
import Feed from "../miscellanious/feed";
import { ModalCloseButton } from "@chakra-ui/react";
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
import  FooterAchieves from "../miscellanious/FooterAchieves";
import { IoLibrary } from "react-icons/io5";
import { TiEyeOutline } from "react-icons/ti";

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

  useEffect(()=> {
    if(trend){
      onOpen();
    }
  }, [trend, onOpen]);

  return (
    <Box width="100%" display={"flex"} flexDir={"column"} overflow={"scroll"} background={"whitesmoke"}>
      <ErrorBoundary fallback={<p>Something went wrong</p>}>
        {user && <SideDrawer />}{" "}
        {user &&
          ((user.accountType === "Gold" &&
            parseInt(new Date().getTime()) > parseInt(user.subscription)) ||
            parseInt(new Date().getTime()) >
              parseInt(user.adsSubscription)) && <Ads />}
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
              <ModalCloseButton textColor={"black"}/>
              <LinkBox
                as="article"
                maxW="sm"
                p="2"
                borderWidth="1px"
                rounded="md"
                position="absolute"
                top="-50%"
                left="0"
                textColor={"white"}
                background={"#FFA500"}
              >
                <LinkOverlay
                  userSelect={"none"}
                  href="https://www.paypal.com/donate/?hosted_button_id=2L8HHGURQTED2"
                  target="_blank" rel="noopener noreferrer"
                >
                  Donate
                </LinkOverlay>
              </LinkBox>
              <h1 style={{fontWeight: "bolder"}}>From Fleeting to Lasting Open Space</h1>
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
              fontSize={"small"}
              p={'4'}
              borderRadius={2}
            >
              <TiEyeOutline />

              <Text fontSize={"smaller"}>
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
          {user && <MyChats />}
          {user && (
            <Chatbox />
          )}
          {!selectedChat && (
           <Poll/>
          )}
        </Box>
        {user && <Box width={"100%"}>
         <Box display={"flex"} width={"100%"} justifyContent={"center"} alignItems={"center"}>
          <IoLibrary style={{color: "red"}} /> <Text p={"3"} fontWeight={"bold"}>Achieves</Text></Box>
         <FooterAchieves />
          </Box>}
      </ErrorBoundary>
    </Box>
  );
};

export default Chatpage;
