import { Box, Tooltip } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { FaCircle } from "react-icons/fa";

const LoveIcon = () => {
  const { onlineUsersCount } = ChatState();

  function formatOnlineUsersCount(count) {
    if (count < 1000) {
      return count.toString();
    } else if (count < 10000) {
      return `${(count / 1000).toFixed(1)}k`;
    } else {
      return `${(count / 1000).toFixed(1)}k`;
    }
  }

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
          {formatOnlineUsersCount(onlineUsersCount.length)}
        </Box>
      </Tooltip>
    </Box>
  );
};

export default LoveIcon;
