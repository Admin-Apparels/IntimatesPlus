import React, { useEffect, useState } from "react";
import { Box, Tooltip } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { FaCircle } from "react-icons/fa";

const LoveIcon = () => {
  const { onlineUsersCount } = ChatState() || {};

  const [randomNum, setRandomNum] = useState(
    generateRandomNumber(onlineUsersCount)
  );

  function generateRandomNumber(onlineUsersCount) {
    const maxRandom = Math.max(0, 1000 - onlineUsersCount); // Maximum random number is between 0 and 1000
    return Math.floor(Math.random() * (maxRandom + 1)); // Generate a random number between 0 and maxRandom
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRandomNum((prevNum) => {
        const change = Math.floor(Math.random() * 21);
        const sign = Math.random() < 0.5 ? -1 : 1;
        const newNum = prevNum + sign * change;
        return Math.max(100, newNum);
      });
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

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
      flexDir={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      p={0}
      m={0}
    >
      <Tooltip
        label="Users Online"
        color={"green"}
        backgroundColor={"transparent"}
      >
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          m={-1}
          fontSize={"x-small"}
          fontFamily={"cursive"}
        >
          {" "}
          <FaCircle color="green" size={10} />
          {formatOnlineUsersCount(onlineUsersCount.length + randomNum)}
        </Box>
      </Tooltip>
    </Box>
  );
};

export default LoveIcon;
