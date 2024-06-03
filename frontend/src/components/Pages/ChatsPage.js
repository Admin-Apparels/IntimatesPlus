import { Box } from "@chakra-ui/layout";
import React, { useEffect, useState } from "react";
import Chatbox from "../Chatbox";
import MyChats from "../MyChats";
import SideDrawer from "../miscellanious/SideDrawer";
import ErrorBoundary from "./ErrorBoundary";
import { ChatState } from "../Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import Ads from "../miscellanious/ads";
import { Button, Image } from "@chakra-ui/react";
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

const Chatpage = () => {
  const navigate = useNavigate();
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user, setUser, selectedChat } = ChatState();
  const [hasNewNotification, setHasNewNotification] = useState(true);
  const { onClose, isOpen, onOpen } = useDisclosure();
  const OverlayOne = () => (
    <ModalOverlay
      bg="blackAlpha.300"
      backdropFilter="blur(10px) hue-rotate(90deg)"
    />
  );
  const overlay = React.useState(<OverlayOne />);
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

  const Story = `
    Hi there, I'm Evelyn, 24 years old, and I work as an accountant. I handle all my bills, and after a deployment to a new location, I was looking to catch a good time. Frustrated with the usual online options, I recalled seeing an ad for this site on Facebook. After some Googling, here I am.
    I've been DM'd by two charming guys, one local and another from a different state. Oh, and there's one from Kenya 😂. It's a fantastic platform where I not only find sexual relief but also encounter men with genuine intentions, invested in establishing both a physical and emotional connection.
     It's a relief because, after spending almost an hour on Pornhub without satisfaction, I was quite frustrated. Wanted to share my story—thanks!" -anonymous`;

  const handleButtonClick = () => {
    onOpen();
    setHasNewNotification(false);
  };

  return (
    <Box width="100%">
      <ErrorBoundary fallback={<p>Something went wrong</p>} userSelect={"none"}>
        {user && <SideDrawer />}{" "}
        {user &&
          ((user.accountType === "Gold" &&
            parseInt(new Date().getTime()) > parseInt(user.subscription)) ||
            parseInt(new Date().getTime()) >
              parseInt(user.adsSubscription)) && <Ads />}
        <Modal size="lg" onClose={onClose} isOpen={isOpen} onOpen={onOpen}>
          {overlay}
          <ModalContent
            display={"flex"}
            flexDir={"column"}
            width={"calc(100% - 20px)"}
            height={"75%"}
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
              zIndex={1}
            >
              Love Shared, Love Grows
              <Text textAlign={"center"} fontSize={"small"}>
                Share your story today!
              </Text>
              💬 Dec 23, 2023
              <LinkBox
                as="article"
                maxW="sm"
                p="3"
                borderWidth="1px"
                rounded="md"
                position="fixed"
                top="2%"
                right="2%"
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
            </ModalHeader>
            <ModalBody
              display={"flex"}
              flexWrap={"wrap"}
              textAlign={"center"}
              className="quote-container"
              overflowY={"auto"}
              height={"calc(75% - 20px)"}
              top={"calc(100% - 50%)"}
              userSelect={"none"}
            >
              {Story}
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
            <Button
              position="fixed"
              bottom="7%"
              right="7%"
              borderRadius="50%"
              fontSize="large"
              boxSize={"30px"}
              textColor="orange"
              p={6}
              _hover={{ backgroundColor: "red" }}
              onClick={() => {
                handleButtonClick();
              }}
            >
              S
              {hasNewNotification && (
                <Box
                  position="absolute"
                  bottom="80%"
                  right="80%"
                  transform="translate(50%, 0)"
                  background="red.500"
                  borderRadius="50%"
                  width="12px"
                  height="12px"
                  p={1}
                ></Box>
              )}
            </Button>
          )}
        </Box>
      </ErrorBoundary>
    </Box>
  );
};

export default Chatpage;
