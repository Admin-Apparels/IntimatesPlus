import React, { useEffect, useState } from "react";
import { Box, Tooltip } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { FaCircle } from "react-icons/fa";

const LoveIcon = () => {
  const { onlineUsersCount } = ChatState() || {};

  const [randomNum, setRandomNum] = useState(0);

  useEffect(() => {
    if (Array.isArray(onlineUsersCount)) {
      setRandomNum(generateRandomNumber(onlineUsersCount.length));
    }
  }, [onlineUsersCount]);

  function generateRandomNumber(onlineUsersCountLength) {
    const maxRandom = Math.max(0, 1000 - onlineUsersCountLength); // Maximum random number is between 0 and 1000
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

  function formatOnlineUsersCount(count) {
    if (count < 1000) {
      return count.toString();
    } else if (count < 10000) {
      return `${(count / 1000).toFixed(1)}k`;
    } else {
      return `${(count / 1000).toFixed(1)}k`;
    }
  }

  const displayedCount = onlineUsersCount
    ? onlineUsersCount.length + randomNum
    : randomNum;

  return (
    <Box
      display="flex"
      flexDir={"column"}
      justifyContent={"center"}
      alignItems={"center"}
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
          fontFamily="Arial, sans-serif"
        >
          {" "}
          <FaCircle color="green" size={10} />
          {formatOnlineUsersCount(displayedCount)}
        </Box>
      </Tooltip>
    </Box>
  );
};

export default LoveIcon;
