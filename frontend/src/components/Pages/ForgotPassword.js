import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import { ChatState } from "../Context/ChatProvider";

export default function forgotPassword() {
  const { verify } = ChatState();
  console.log(verify);
  return (
    <Flex>
      <Box>This is Forgot email page</Box>
    </Flex>
  );
}
