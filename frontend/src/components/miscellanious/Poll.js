import React, { useCallback, useEffect, useState } from 'react';
import { CiCircleQuestion } from "react-icons/ci";
import axios from 'axios';
import {
    Box, Text, Stack, Spinner,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
  } from '@chakra-ui/react'

export default function Poll() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [poll, setPoll] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [votes, setVotes] = useState([]);
    const [totalVotes, setTotalVotes] = useState(0);
  
    const fetchPoll = useCallback(async () => {
      try {
        const response = await axios.get('/api/poll');
        setPoll(response.data);
        setVotes(response.data.options.map(option => option.votes));
        setTotalVotes(response.data.options.reduce((acc, option) => acc + option.votes, 0));
      } catch (error) {
        console.log(error);
      }
    }, []);
  
    useEffect(() => {
      fetchPoll();
    }, [fetchPoll]);
  
    const handleVote = async (index) => {
      if (selectedOption !== null) return;
  
      try {
        await axios.post('/api/poll/vote', { option: poll.options[index].option });
        const newVotes = [...votes];
        newVotes[index] += 1;
        setVotes(newVotes);
        setTotalVotes(totalVotes + 1);
        setSelectedOption(index);
        alert('Vote recorded!');
      } catch (error) {
        if(error.response.status === 429){
          alert("You can only vote once per hour.");
          return;
        }
        alert(error.response.data.message);
      }
    };
  
    const calculatePercentage = (index) => {
      if (totalVotes === 0) return 0;
      return ((votes[index] / totalVotes) * 100).toFixed(1);
    };
  
    if (!poll) return <Text textAlign={"center"} p={"6"}>Loading poll...<Spinner size={"sm"}/></Text>;
  
    return (
      <>
        <Button
              onClick={onOpen}
              position="fixed"
              bottom="7%"
              right="7%"
              borderRadius="50%"
              fontSize="large"
              boxSize={"30px"}
              textColor="orange"
              p={6}
              _hover={{ backgroundColor: "red" }}>Poll</Button>
  
        <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay
          bg="blackAlpha.300"
          backdropFilter="blur(10px) hue-rotate(90deg)"
          />
          <ModalContent  backgroundColor="#934cce5e" textColor={"white"}>
            <ModalCloseButton />
            <ModalBody
            p={4} width={"100%"} boxShadow="base"
            borderColor="#934cce5e" borderRadius={20}>
            <CiCircleQuestion fontSize={"50px"} />
            <Text textAlign={"center"} fontWeight={"extrabold"}>2024 POLL</Text>
            <Text fontSize="large"  p={4} mb={'2'} textAlign="center">{poll.question}</Text>
            <Stack  display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}>
        {poll.options.map((opt, index) => (
          <Box
            display={"flex"}
            width={"100%"}
            key={index}
            p={2}
            borderRadius="md"
            cursor="pointer"
            onClick={() => handleVote(index)}
            position="relative"
            bg="gray.300"
          >
            <Text width={"100%"} textAlign={"start"} fontSize="lg" fontWeight="bold" textColor={"white"}>
              {opt.option}
            </Text>
            {selectedOption !== null && (
              <Box
                position="absolute"
                top="0"
                left="0"
                height="100%"
                width={`${calculatePercentage(index)}%`}
                bg="blackAlpha.400"
                borderRadius="md"
              />
            )}
            {selectedOption !== null && (
              <Text width={"100%"} textAlign={"end"} fontSize="sm" m={0} p={0}>
                {calculatePercentage(index)}%
              </Text>
            )}
          </Box>
        ))}
      </Stack>
            </ModalBody>
            <ModalFooter>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }