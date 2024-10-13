import { Box, useBreakpointValue } from "@chakra-ui/react";
import "./styles.css";
import SingleChat from "./SingleChat";
import { ChatState } from "./Context/ChatProvider";

const Chatbox = () => {
  const { selectedChat } = ChatState();
  const navbarHeight = useBreakpointValue({ base: "60px", md: "80px" });

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      width={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      height={`calc(100vh - ${navbarHeight})`} // Subtracting navbar height from 100vh
    >
      <SingleChat />
    </Box>
  );
};

export default Chatbox;
