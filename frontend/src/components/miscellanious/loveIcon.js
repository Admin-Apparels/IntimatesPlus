import React from "react";
import { Box, Image, Text, Tooltip } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";

const IconWithText = ({ iconSize }) => {
  const { onlineUsersCount } = ChatState();
  const loveIcon =
    "https://res.cloudinary.com/dvc7i8g1a/image/upload/v1701504387/icons8-love-96_g8sqwd.png";
  function formatOnlineUsersCount(onlineUsersCount) {
    if (onlineUsersCount < 1000) {
      return onlineUsersCount.toString();
    } else if (onlineUsersCount < 10000) {
      return `${(onlineUsersCount / 1000).toFixed(1)}k`;
    } else {
      return `${(onlineUsersCount / 1000).toFixed(1)}k`;
    }
  }
  return (
    <Box
      display="flex"
      justifyContent={"center"}
      alignItems={"center"}
      position="relative"
      p={0}
      m={0}
    >
      <Image src={loveIcon} alt="Love Icon" boxSize={iconSize} height={10} />
      <Tooltip
        label="Users Online"
        color={"green"}
        backgroundColor={"transparent"}
      >
        <Text
          position="absolute"
          fontSize="2xs"
          fontFamily={"cursive"}
          userSelect={"none"}
        >
          {formatOnlineUsersCount(onlineUsersCount)}
        </Text>
      </Tooltip>
    </Box>
  );
};

function LoveIcon() {
  return <IconWithText text="4245" iconSize={10} />;
}

export default LoveIcon;
