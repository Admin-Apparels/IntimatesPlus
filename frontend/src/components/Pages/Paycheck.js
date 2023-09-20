import React from "react";
import {
  Box,
  Text,
  Stack,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
  VStack,
  useToast,
  Button,
  Image,
  Input,
  ModalContent,
  ModalOverlay,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Modal,
  useDisclosure,
  Divider,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import axios from "axios";
import { ChatState } from "../Context/ChatProvider";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Paycheck() {
  const toast = useToast();
  const { setSelectedChat, user, setUser, chats, setChats, userId } =
    ChatState();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [subscription, setSubscription] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (!userInfo) navigate("/");
  }, [navigate]);

  const handleApprove = async (accountType) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/paycheck/${user._id}?account=${accountType}`,
        {},
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
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post("/api/chat", { userId, user }, config);

      setChats([data, ...chats]);

      setSelectedChat(data);
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
  const makePaymentMpesa = async () => {
    //COMING SOON
    if (!phoneNumber) return;
    console.log(phoneNumber, subscription, user._id);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/paycheck/makepaymentmpesa/${user._id}`,
        { subscription, phoneNumber },
        config
      );
      console.log(data);
    } catch (error) {}
  };
  console.log(phoneNumber);

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
              onApprove={async (data, actions) => {
                const amount = "Bronze";
                await handleApprove(amount);
                await handleCreateChat();
                return actions.order.capture().then(function (details) {
                  navigate("/chats");
                  toast({
                    title: "Success",
                    description: "Subcription Successfull",
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom",
                  });
                });
              }}
              onCancel={() => {
                toast({
                  title: "Cancelled",
                  description: "Subscription Unsuccessfull",
                  status: "info",
                  isClosable: true,
                  position: "bottom",
                });
              }}
            />
          </PayPalScriptProvider>
          <Button
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            width={"100%"}
            backgroundColor={"green.400"}
            color={"white"}
            onClick={() => {
              setSubscription("Gold");
              onOpen();
            }}
          >
            <Image
              height={5}
              width={"auto"}
              src={
                "https://res.cloudinary.com/dvc7i8g1a/image/upload/v1694007922/mpesa_ppfs6p.png"
              }
              alt={""}
            />{" "}
            Pay with Mpesa
          </Button>
          <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
            <ModalOverlay />
            <ModalContent padding={5}>
              <ModalHeader
                fontSize="40px"
                fontFamily="Work sans"
                display="flex"
                justifyContent="center"
              >
                <Text textAlign={"center"} justifyContent={"center"}>
                  Enter Your Mpesa Phone Number
                </Text>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="space-between"
              >
                <Input
                  fontSize={"2xl"}
                  placeholder="Example 0710334455"
                  type="text"
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  value={phoneNumber}
                  minLength={10}
                  maxLength={10}
                />
                <Divider p={2} />
                <Button
                  width={"100%"}
                  onClick={() => {
                    makePaymentMpesa();
                    onClose();
                    toast({
                      title: "wait as message is sent",
                      status: "loading",
                      isClosable: true,
                      position: "bottom",
                      duration: 5000,
                    });
                  }}
                  // phoneNumber.length !== parseInt(10)
                  isDisabled={true}
                  colorScheme="green"
                >
                  Comming soon
                </Button>
              </ModalBody>
              <ModalFooter display="flex">
                <Text textAlign={"center"} justifyContent={"center"}>
                  You'll be sent a Message
                </Text>
              </ModalFooter>
            </ModalContent>
          </Modal>
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
              onApprove={async (data, actions) => {
                console.log(data);
                const amount = "Platnum";
                await handleApprove(amount);
                await handleCreateChat();
                return actions.order.capture().then(function (details) {
                  navigate("/chats");
                  toast({
                    title: "Success",
                    description: "Subcription Successfull",
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom",
                  });
                });
              }}
              onCancel={() => {
                toast({
                  title: "Cancelled",
                  description: "Subscription Unsuccessfull",
                  status: "info",
                  isClosable: true,
                  position: "bottom",
                });
              }}
            />
          </PayPalScriptProvider>
          <Button
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            width={"100%"}
            backgroundColor={"green.400"}
            color={"white"}
            onClick={() => {
              setSubscription("Platnum");
              onOpen();
            }}
          >
            <Image
              height={5}
              width={"auto"}
              src={
                "https://res.cloudinary.com/dvc7i8g1a/image/upload/v1694007922/mpesa_ppfs6p.png"
              }
              alt={""}
            />{" "}
            Pay with Mpesa
          </Button>
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
              onApprove={async (data, actions) => {
                console.log(data);
                const amount = "Gold";
                await handleCreateChat();
                await handleApprove(amount);
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
                toast({
                  title: "Cancelled",
                  description: "Subscription Unsuccessfull",
                  status: "info",
                  isClosable: true,
                  position: "bottom",
                });
              }}
            />
          </PayPalScriptProvider>
          <Button
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            width={"100%"}
            backgroundColor={"green.400"}
            color={"white"}
            onClick={() => {
              setSubscription("Gold");
              onOpen();
            }}
          >
            <Image
              height={5}
              width={"auto"}
              src={
                "https://res.cloudinary.com/dvc7i8g1a/image/upload/v1694007922/mpesa_ppfs6p.png"
              }
              alt={""}
            />{" "}
            Pay with Mpesa
          </Button>
        </Box>
      </Box>
    </VStack>
  );
}
