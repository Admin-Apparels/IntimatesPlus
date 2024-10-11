import ScrollableFeed from "react-scrollable-feed";
import { isSameSenderMargin, isSameUser } from "./config/ChatLogics";
import { Box, Button } from "@chakra-ui/react";
import { ChatState } from "./Context/ChatProvider";
import Message from "./Message";

const ScrollableChat = ({ messages }) => {
  const { user, selectedChat } = ChatState();

  const deleted =
    selectedChat.users[0].deleted || selectedChat.users[1].deleted;

  return (
    <Box
      width="100%"
      bg="transparent"
      overflowY="auto"
      padding=".2rem"
      paddingBottom="3rem"
    >
      {" "}
      {/* Ensure the parent Box takes full width */}
      <ScrollableFeed>
        {messages &&
          messages.map((m, i) => {
            if (!m) {
              return null;
            }

            return (
              <div
                style={{
                  display: "flex",
                  width: "100%", // Ensure the message container takes full width
                  justifyContent:
                    m.sender._id === user._id ? "flex-end" : "flex-start", // Align messages based on sender
                  alignItems: "center",
                }}
                key={m._id}
              >
                <span
                  style={{
                    backgroundColor: `${
                      m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                    }`,
                    marginLeft: isSameSenderMargin(messages, m, i, user._id),
                    marginTop: isSameUser(messages, m, i, user._id) ? 3 : 10,
                    borderRadius: "20px",
                    padding: "5px 15px",
                    maxWidth: "75%",
                    wordBreak: "break-word", // Ensure long messages break correctly
                  }}
                >
                  <Message key={m._id} m={m} />
                </span>
              </div>
            );
          })}
        {deleted && (
          <Button borderRadius={"full"} fontSize="md" color={"red"}>
            User Account deleted
          </Button>
        )}
      </ScrollableFeed>
    </Box>
  );
};

export default ScrollableChat;
