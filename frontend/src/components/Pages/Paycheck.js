import React, { useState } from "react";
import {
  Box,
  Text,
  Stack,
  List,
  ListItem,
  ListIcon,
  Button,
  useColorModeValue,
  VStack,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom";

export default function Paycheck() {
  const toast = useToast();
  const {
    selectedChat,
    setSelectedChat,
    user,
    setUser,
    chats,
    setChats,
    matchId,
  } = ChatState();
  const navigate = useNavigate();
  const [loadingChat, setLoadingChat] = useState(false);
  console.log(selectedChat);
  console.log(matchId);
  const handleApprove = async (accountType) => {
    console.log(accountType);

    try {
      const config = {
        headers: {
          Authentication: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/paycheck/${user.id}?account=n${accountType}`,
        config
      );
      setUser(data);
      console.log(user);
    } catch (error) {
      console.log(error);
      throw new Error("Error occurred", error);
    }
  };
  const handleCreateChat = async () => {
    setLoadingChat(true);
    try {
      const existingChat = chats.find(
        (chat) => chat.users[0]._id === matchId || chat.users[1]._id === matchId
      );

      if (existingChat) {
        setSelectedChat(existingChat);
      } else {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        const { data } = await axios.post(
          "/api/chat",
          { matchId, user },
          config
        );

        setChats([data, ...chats]);

        setSelectedChat(data);
      }

      setLoadingChat(false);
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };
  return (
    <VStack
      backgroundColor={"grey"}
      w={"100%"}
      justifyContent={"space-between"}
      alignItems={"center"}
      flexWrap={"wrap"}
      padding={5}
    >
      <Box
        maxW={"330px"}
        w={"full"}
        bg={useColorModeValue("white", "gray.800")}
        boxShadow={"2xl"}
        rounded={"md"}
        overflow={"hidden"}
        paddingBottom={5}
      >
        <Stack
          textAlign={"center"}
          p={2}
          color={useColorModeValue("gray.800", "white")}
          align={"center"}
        >
          <Text
            fontSize={"sm"}
            fontWeight={500}
            bg={useColorModeValue("green.50", "green.900")}
            p={2}
            px={3}
            color={"green.500"}
            rounded={"full"}
          >
            Bronze
          </Text>
          <Stack direction={"row"} align={"center"} justify={"center"}>
            <Text fontSize={"3xl"}>$</Text>
            <Text fontSize={"6xl"} fontWeight={800}>
              1
            </Text>
            <Text color={"gray.500"}>/chat</Text>
          </Stack>
        </Stack>

        <Box bg={useColorModeValue("gray.50", "gray.900")} px={6} py={10}>
          <List spacing={3} paddingBottom={2}>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.400" />
              Ads
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.400" />
              One Chat Only
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.400" />
              No new features
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.400" />
              Limited
            </ListItem>
          </List>

          <PayPalScriptProvider
            options={{
              clientId:
                "ASgI4T_UWqJJpTSaNkqcXbQ9H8ub0f_DAMR8SJByA19N4HtPK0XRgTv4xJjj4Mpx_KxenyLzBDapnJ82",
            }}
          >
            <PayPalButtons
              createOrder={(data, actions) => {
                const amount = 1.0;

                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        currency_code: "USD",
                        value: amount.toFixed(2),
                      },
                    },
                  ],
                });
              }}
              onApprove={(data, actions) => {
                console.log(data);
                const amount = "Bronze";
                handleCreateChat();
                handleApprove(amount);
                return actions.order.capture().then(function (details) {
                  navigate("/chats");
                  toast({
                    title: "Success",
                    description: data.subscriptionID,
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom",
                  });
                });
              }}
              onCancel={() => {
                navigate("/chats");
              }}
            />
          </PayPalScriptProvider>
        </Box>
      </Box>

      <Box
        maxW={"330px"}
        w={"full"}
        bg={useColorModeValue("white", "gray.800")}
        boxShadow={"2xl"}
        rounded={"md"}
        overflow={"hidden"}
        paddingBottom={5}
      >
        <Stack
          textAlign={"center"}
          p={2}
          color={useColorModeValue("gray.800", "white")}
          align={"center"}
        >
          <Text
            fontSize={"sm"}
            fontWeight={500}
            bg={useColorModeValue("green.50", "green.900")}
            p={2}
            px={3}
            color={"green.500"}
            rounded={"full"}
          >
            Platnum
          </Text>
          <Stack direction={"row"} align={"center"} justify={"center"}>
            <Text fontSize={"3xl"}>$</Text>
            <Text fontSize={"6xl"} fontWeight={800}>
              25
            </Text>
            <Text color={"gray.500"}>/month</Text>
          </Stack>
        </Stack>

        <Box bg={useColorModeValue("gray.50", "gray.900")} px={6} py={10}>
          <List spacing={3} paddingBottom={2}>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.400" />
              Ads
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.400" />
              Two chats a day Max
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.400" />
              New features
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.400" />
              Limited
            </ListItem>
          </List>

          <PayPalScriptProvider
            options={{
              clientId:
                "ASgI4T_UWqJJpTSaNkqcXbQ9H8ub0f_DAMR8SJByA19N4HtPK0XRgTv4xJjj4Mpx_KxenyLzBDapnJ82",
            }}
          >
            <PayPalButtons
              createOrder={(data, actions) => {
                const amount = 25.0;

                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        currency_code: "USD",
                        value: amount.toFixed(2),
                      },
                    },
                  ],
                });
              }}
              onApprove={(data, actions) => {
                console.log(data);
                const amount = "Platnum";
                handleApprove(amount);
                return actions.order.capture().then(function (details) {
                  toast({
                    title: "Success",
                    description: data.subscriptionID,
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom",
                  });
                });
              }}
              onCancel={() => {
                navigate("/chats");
              }}
            />
          </PayPalScriptProvider>
        </Box>
      </Box>

      <Box
        maxW={"330px"}
        w={"full"}
        bg={useColorModeValue("white", "gray.800")}
        boxShadow={"2xl"}
        rounded={"md"}
        overflow={"hidden"}
        paddingBottom={5}
      >
        <Stack
          textAlign={"center"}
          p={2}
          color={useColorModeValue("gray.800", "white")}
          align={"center"}
        >
          <Text
            fontSize={"sm"}
            fontWeight={500}
            bg={useColorModeValue("green.50", "green.900")}
            p={2}
            px={3}
            color={"green.500"}
            rounded={"full"}
          >
            Gold (*best)
          </Text>
          <Stack direction={"row"} align={"center"} justify={"center"}>
            <Text fontSize={"3xl"}>$</Text>
            <Text fontSize={"6xl"} fontWeight={800}>
              300
            </Text>
            <Text color={"gray.500"}>/annually</Text>
          </Stack>
        </Stack>

        <Box bg={useColorModeValue("gray.50", "gray.900")} px={6} py={10}>
          <List spacing={3} paddingBottom={2}>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.400" />
              No Ads
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.400" />
              No limit to chats
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.400" />
              New features
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.400" />
              Unlimited
            </ListItem>
          </List>

          <PayPalScriptProvider
            options={{
              clientId:
                "ASgI4T_UWqJJpTSaNkqcXbQ9H8ub0f_DAMR8SJByA19N4HtPK0XRgTv4xJjj4Mpx_KxenyLzBDapnJ82",
            }}
          >
            <PayPalButtons
              createOrder={(data, actions) => {
                const amount = 300.0;

                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        currency_code: "USD",
                        value: amount.toFixed(2),
                      },
                    },
                  ],
                });
              }}
              onApprove={(data, actions) => {
                console.log(data);
                const amount = "Gold";
                handleApprove(amount);
                return actions.order.capture().then(function (details) {
                  toast({
                    title: "Success",
                    description: data.subscriptionID,
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom",
                  });
                });
              }}
              onCancel={() => {
                navigate("/chats");
              }}
            />
          </PayPalScriptProvider>
        </Box>
      </Box>
    </VStack>
  );
}
