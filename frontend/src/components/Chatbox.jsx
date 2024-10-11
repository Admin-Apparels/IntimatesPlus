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
      width={{ base: "100%", md: "68%" }}
      borderRadius="lg"
      height={"85vh"}
    >
      <SingleChat />
    </Box>
  );
};

export default Chatbox;
