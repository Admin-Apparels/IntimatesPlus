import React, { useState } from "react";
import { ChatState } from "./Context/ChatProvider";
import { Box, Button, Image, Text } from "@chakra-ui/react";
import axios from "axios";

function Message({ m }) {
  const [showDeleteText, setShowDeleteText] = useState(false);

  const [deleted, setDeleted] = useState(false);

  const { user } = ChatState();

  const formatMessageTime = (timestamp) => {
    const messageTime = new Date(timestamp);
    const hours = messageTime.getHours();
    const minutes = messageTime.getMinutes();

    const amOrPm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;

    const formattedTime = `${formattedHours}:${
      minutes < 10 ? "0" : ""
    }${minutes} ${amOrPm}`;

    return formattedTime;
  };
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
          <Image
            src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1699434297/icons8-unavailable-40_xh1ham.png"
            height={7}
            p={1}
          />
          deleted
        </Text>
      ) : (
        <Box
          display={deleted ? "none" : "flex"}
          flexDir={"column"}
          position={"relative"}
          onMouseEnter={() => setShowDeleteText(true)}
          onMouseLeave={() => setShowDeleteText(false)}
        >
          {showDeleteText && m.sender._id === user._id && (
            <Button
              onClick={() => {
                onDeleteMessage(m._id);
                setDeleted(true);
              }}
              position={"absolute"}
              left={-10}
              p={3}
              top={-5}
              borderRadius={10}
            >
              delete
            </Button>
          )}
          {m.content}
          <Text display={"flex"} textAlign="right" m={0} p={0} fontSize={"2xs"}>
            {m.sender._id === user._id ? (
              <Image
                src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1699355257/icons8-sent-64_e9vrai.png"
                height={5}
                p={0}
                loading="lazy"
                m={0}
              />
            ) : (
              ""
            )}
            {formatMessageTime(m.createdAt)}
          </Text>
        </Box>
      )}
    </>
  );
}

export default Message;
