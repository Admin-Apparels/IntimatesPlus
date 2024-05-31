// src/components/Loading.js
import React, { useState, useEffect } from "react";
import { Flex, Progress, Text } from "@chakra-ui/react";

const Loading = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
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

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      height="100vh"
      backgroundColor="gray.50"
      px={4}
    >
      <Text mb={4} fontSize="lg" color="gray.700">
        Loading, please wait...
      </Text>
      <Progress width="80%" value={progress} size="lg" colorScheme="blue" />
      <Text mt={2} fontSize="md" color="gray.600">
        {Math.round(progress)}%
      </Text>
    </Flex>
  );
};

export default Loading;
