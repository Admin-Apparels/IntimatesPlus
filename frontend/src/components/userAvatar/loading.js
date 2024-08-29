import React, { useState, useEffect } from "react";
import { Flex, Progress, Text } from "@chakra-ui/react";

const Loading = () => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("A world of connection awaits you!");

  useEffect(() => {
    const messages = [
      "Get ready for an amazing experience!",
      "Hold tight, IntimatesPlus is almost here!",
      "Your adventure is about to begin...",
      "Prepare yourself for something special!",
      "Hold on, we're almost there!",
    ];

    const interval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(interval);
          return 100;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 100);
      });
    }, 250);

    const messageInterval = setInterval(() => {
      const randomMessage =
        messages[Math.floor(Math.random() * messages.length)];
      setMessage(randomMessage);
    }, 1000); // Change message every 3 seconds

    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      height="100vh"
      background="linear-gradient(135deg, #f5f7fa, #c3cfe2)"
      px={4}
      width="100%"
    >
      <Text
        mb={4}
        textAlign={"center"}
        fontSize="2xl"
        fontWeight="bold"
        color="gray.700"
        width={"100%"}
      >
        Loading to <span style={{ color: "#F44336" }}>IntimatesPlus💑</span>,
        please wait...
      </Text>
      <Progress
        width="80%"
        value={progress}
        size="lg"
        colorScheme="blue"
        hasStripe
        isAnimated
        borderRadius="md"
      />
      <Text mt={2} fontSize="lg" fontWeight="medium" color="gray.600">
        {Math.round(progress)}%
      </Text>
      <Text
        mt={4}
        fontSize="lg"
        fontWeight="medium"
        color="gray.700"
        textAlign="center"
      >
        {message}
      </Text>
    </Flex>
  );
};

export default Loading;
