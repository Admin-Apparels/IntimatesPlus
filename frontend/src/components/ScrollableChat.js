import { Avatar } from "@chakra-ui/avatar";
import { Tooltip } from "@chakra-ui/tooltip";
import ScrollableFeed from "react-scrollable-feed";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "./config/ChatLogics";
import { Text, Box } from "@chakra-ui/react";
import { ChatState } from "./Context/ChatProvider";
import Message from "./Message";

const ScrollableChat = ({ messages }) => {
  const { user, selectedChat } = ChatState();

  const deleted =
    selectedChat.users[0].deleted || selectedChat.users[1].deleted;

  return (
    <Box width="100%" background="whitesmoke" overflowY="auto">
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
                {m &&
                  (isSameSender(messages, m, i, user?._id) ||
                    isLastMessage(messages, i, user?._id)) && (
                    <Tooltip
                      label={m.sender.name}
                      placement="bottom-start"
                      hasArrow
                    >
                      <Avatar
                        mt="7px"
                        mr={1}
                        size="sm"
                        cursor="pointer"
                        name={m.sender.name}
                        src={m.sender.pic}
                      />
                    </Tooltip>
                  )}

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
        {deleted && <Text color={"red"}>User Account deleted</Text>}
      </ScrollableFeed>
    </Box>
  );
};

export default ScrollableChat;
