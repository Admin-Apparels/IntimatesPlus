import React, { useEffect, useState} from "react";
import { Box, Image, Text, Tooltip, calc } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";

const LoveIcon = () => {
  const { onlineUsersCount } = ChatState();

  const [randomNum, setRandomNum] = useState(generateRandomNumber);

  function generateRandomNumber() {
    return Math.floor(Math.random() * (900 - 100 + 1)) + 100;
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
     
      const change = Math.floor(Math.random() * 11);

     
      const sign = Math.random() < 0.5 ? 1 : -1;

      setRandomNum((prevNum) => prevNum + sign * change);
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
      <Image alt="" src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1702563265/icons8-community-50_oyasvg.png" height={5}
      top={7}/>
        
      <Tooltip
        label="Users Online"
        color={"green"}
        backgroundColor={"transparent"}
        
      >
      <Text display={"flex"} flexDir={"column"} m={-1} fontSize={"x-small"} fontFamily={"cursive"}>{formatOnlineUsersCount(calc(onlineUsersCount + randomNum))}</Text>
        
     
      </Tooltip>
    </Box>
  );
};



export default LoveIcon;
