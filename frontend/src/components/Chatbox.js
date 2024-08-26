import { Box } from "@chakra-ui/layout";
import "./styles.css";
import SingleChat from "./SingleChat";
import { ChatState } from "./Context/ChatProvider";

const Chatbox = () => {
  const { selectedChat } = ChatState();

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
      alignItems="center"
      flexDir="column"
      p={3}
      bgGradient="linear(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)"
      bgClip="border-box"
      width={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      borderWidth="1px"
      height={"88vh"}
    >
      <SingleChat />
    </Box>
  );
};

export default Chatbox;
