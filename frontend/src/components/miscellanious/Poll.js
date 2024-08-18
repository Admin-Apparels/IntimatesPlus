import React, { useCallback, useEffect, useState } from 'react';
import { CiCircleQuestion } from "react-icons/ci";
import axios from 'axios';
import {
    Box, Text, Stack,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
  } from '@chakra-ui/react'
import ChatLoading from '../ChatLoading';

export default function Poll() {
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [poll, setPoll] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [votes, setVotes] = useState([]);
    const [totalVotes, setTotalVotes] = useState(0);
    const [fetching, setFetching] = useState(false);
  
    const fetchPoll = useCallback(async () => {
      setFetching(true);
      try {
        const response = await axios.get('/api/poll');
        setPoll(response.data);
        setVotes(response.data.options.map(option => option.votes));
        setTotalVotes(response.data.options.reduce((acc, option) => acc + option.votes, 0));
        setFetching(false);
      } catch (error) {
        setFetching(false);
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
  
    return (
      <>
        <Button
              onClick={onOpen}
              position="fixed"
              bottom="7%"
              right="7%"
              borderRadius="full"
              fontSize="large"
              boxSize={"60px"}
              textColor="white"
              bg={"green"}
              p={6}
              _hover={{ backgroundColor: "red" }}>Poll</Button>
  
        <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay
          bg="blackAlpha.300"
          backdropFilter="blur(10px) hue-rotate(90deg)"
          />
          <ModalContent>
            <ModalCloseButton />
            <ModalBody
            p={4} width={"100%"}
            borderColor="#934cce5e">
            <CiCircleQuestion fontSize={"50px"} />
            <Text textAlign={"center"} fontWeight={"extrabold"}>2024 POLL</Text>
            {fetching ? <ChatLoading/> : <>
             <Text fontSize="large"  p={4} mb={'2'} textAlign="center">{poll?.question}</Text>
            <Stack  display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}>
        {poll?.options.map((opt, index) => (
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
            <Text width={"100%"} textAlign={"start"} fontSize="sm" fontWeight="bold">
              {opt.option}
            </Text>
            {selectedOption !== null && (
              <Box
                position="absolute"
                top="0"
                left="0"
                p={0}
                m={0}
                height="100%"
                width={`${calculatePercentage(index)}%`}
                bg="blackAlpha.400"
                borderRadius="md"
              />
            )}
            {selectedOption !== null && (
              <Text width={"10%"} textAlign={"end"} fontSize="sm" m={0} p={0}>
                {calculatePercentage(index)}%
              </Text>
            )}
          </Box>
        ))}
      </Stack>
      </>}
            </ModalBody>
            <ModalFooter>
              <Text textAlign={'center'} width={"100%"} p={'4'}>Message us on the next poll, you'll be quoted.</Text>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }