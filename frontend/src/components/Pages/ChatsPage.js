import { Box } from "@chakra-ui/layout";
import {useEffect, useState } from "react";
import Chatbox from "../Chatbox";
import MyChats from "../MyChats";
import SideDrawer from "../miscellanious/SideDrawer";
import ErrorBoundary from "./ErrorBoundary";
import { ChatState } from "../Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import Ads from "../miscellanious/ads";
import { Button, Image } from "@chakra-ui/react";
import {Text, Link, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, useDisclosure } from "@chakra-ui/react";


const Chatpage = () => {
  const navigate = useNavigate();
  const [fetchAgain, setFetchAgain] = useState(false);
  const { user, setUser, selectedChat } = ChatState();
   const [hasNewNotification, setHasNewNotification] = useState(true);
   const {onClose, isOpen, onOpen } = useDisclosure();
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
    "I want to express my gratitude for this incredible platform. Initially,
     I was unsure about what to write in my profile. I had just watched some adult content and was
      feeling quite aroused when I stumbled upon the ad that led me here.
       After a painful breakup due to infidelity, I had been living independently, often preferring my sex toy to the complications of relationships.
       But in that moment, I thought, why not look for someone nearby just for the night? That's when Luke, now my boyfriend, messaged me.
        We agreed to meet, although I was initially apprehensive about being scammed or worse. However, the connection was immediate and undeniable.
        We spent an amazing night together and discovered we had much in common. From that day on,
         we've been exclusively bonded emotionally. He's a self-sufficient man with a small social circle,
          which suits me perfectly. Since being together, we've both stopped watching porn – there's simply no need anymore as our needs are fulfilled in each other's company.
         Thank you for helping me find not just a partner, but a true companion." -Emily`

  const handleButtonClick = () => {
    onOpen();
    setHasNewNotification(false);
  };

  return (
    <Box width="100%">
      <ErrorBoundary fallback={<p>Something went wrong</p>} userSelect={"none"}>
        {user && <SideDrawer />}{" "}
        {user &&
          user.accountType !== "Gold" &&
          parseInt(new Date().getTime()) > parseInt(user.adsSubscription) && (
            <Ads />
          )}
     <Modal size="lg" onClose={onClose} isOpen={isOpen} onOpen={onOpen}>
    <ModalOverlay />
    <ModalContent display={"flex"} flexDir={"column"} width={"calc(100% - 20px)"} height={"75%"}>
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
      <Text textAlign={"center"} fontSize={"small"}>Share your story today!</Text>
      💬 Dec 23, 2023
    </ModalHeader>
    <ModalBody
      display={"flex"}
      flexWrap={"wrap"}
      textAlign={"center"}
      className="quote-container"
       overflowY={"auto"}
      height={"calc(75% - 20px)"}
      top={"calc(100% - 50%)"}
      userSelect={"none"}>

        {Story}
      
    </ModalBody>
    <ModalFooter display={"flex"} flexDir={"column"} textAlign={"center"} textColor={"Background"} fontSize={"small"} backgroundColor={"grey"} p={0} m={1} borderRadius={2}>
      <Image src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1706012485/icons8-eye_g5kvhn.gif" height={3}/>
        <Text fontSize={"smaller"} p={0} m={0}>11k</Text>
        For more stories and inspiration, follow us on Twitter: <Link href="https://twitter.com/fuckmateboo" textColor={"blue.200"}>@fuckmateboo</Link>
    </ModalFooter>
    </ModalContent>
    </Modal>
        <Box
          display="flex"
          justifyContent="space-between"
          w="100%"
          h="91.5vh"
          p="0.2rem"
        >
          {" "}
          {user && <MyChats fetchAgain={fetchAgain} />}
          {user && (
            <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
          )}
 {!selectedChat && <Button
  position="fixed"
  bottom="7%"
  right="7%"
  borderRadius="50%"
  fontSize="large"
  textColor="orange"
  _hover={{ backgroundColor: "red" }}
  onClick={() => { handleButtonClick(); }}
>
  S
  {hasNewNotification && (
    <Box
      position="absolute"
      bottom="80%"
      right="80%"
      transform="translate(50%, 0)"
      bg="red.500"
      borderRadius="50%"
      width="12px"
      height="12px"
    ></Box>
  )}
</Button>}
        </Box>
      </ErrorBoundary>
    </Box>
  );
};

export default Chatpage;
