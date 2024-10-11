import React, { useState } from "react";
import { ChatState } from "./Context/ChatProvider";
import { Box, Button, Text } from "@chakra-ui/react";
import axios from "axios";
import { formatMessageTime } from "./config/ChatLogics";
import { TiTick } from "react-icons/ti";
import { CgUnavailable } from "react-icons/cg";

function Message({ m }) {
  const [showDeleteText, setShowDeleteText] = useState(false);

  const [deleted, setDeleted] = useState(false);

  const { user } = ChatState();

  const onDeleteMessage = async (messageId) => {
    if (!messageId) {
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/message/${messageId}`, config);
      setDeleted(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {deleted ? (
        <Text
          display={"flex"}
          justifyContent={"space-between"}
          fontFamily={"cursive"}
          textDecoration={"underline"}
          colorScheme="grey"
        >
          <CgUnavailable />
          deleted
        </Text>
      ) : (
        <Box
          display={deleted ? "none" : "flex"}
          flexDir={"column"}
          position={"relative"}
          onClick={() => setShowDeleteText(true)}
          onMouseLeave={() => setShowDeleteText(false)}
          fontSize={"small"}
        >
          {showDeleteText && m.sender._id === user._id && (
            <Button
              onClick={() => {
                onDeleteMessage(m._id);
                setDeleted(true);
              }}
              position={"absolute"}
              left={-10}
              top={-5}
              borderRadius={10}
            >
              delete
            </Button>
          )}
          {m.content}

          <Text
            display={"flex"}
            textAlign="start"
            fontSize={"x-small"}
            width={"100%"}
            textColor={"teal"}
          >
            {formatMessageTime(m.createdAt)}
            {m.sender._id === user._id ? <TiTick /> : ""}
          </Text>
        </Box>
      )}
    </>
  );
}

export default Message;
