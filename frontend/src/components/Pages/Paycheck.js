import React from "react";
import {
  Box,
  Text,
  Stack,
  List,
  ListItem,
  ListIcon,
  useColorModeValue,
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
  IconButton,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { ChatState } from "../Context/ChatProvider";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  handleApprove,
  makePaymentMpesa,
  useConnectSocket,
} from "../config/ChatLogics";
import { MdNewReleases } from "react-icons/md";
import { FaBackward } from "react-icons/fa";
import SideDrawer from "../miscellanious/SideDrawer";

export default function Paycheck() {
  const toast = useToast();
  const { user, setUser, setChats } = ChatState();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [subscription, setSubscription] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const socket = useConnectSocket(user.token);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const currentDate = new Date().getTime();
    if (!userInfo) {
      navigate("/");
    }

    try {
      if (
        (user.accountType === "Platnum" || user.accountType === "Gold") &&
        parseInt(currentDate) < parseInt(user.subscription)
      ) {
        navigate("/chats");
      }
    } catch (error) {
      console.log(error);
    }
  }, [navigate, user]);

  useEffect(() => {
    if (!socket) return;
    socket.on("noPayment", (nothing) => {
      toast({
        title: nothing,
        status: "info",
        duration: 5000,
        position: "bottom",
      });
      navigate("/chats");
    });
    socket.on("userUpdated", async (updatedUser, Chats) => {
      // Populate sender names for each chat
      const chatsWithSenderNames = await Promise.all(
        Chats.map(async (chat) => {
          const resolvedUsers = await Promise.all(chat.users);

          const senderName =
            resolvedUsers.length === 2
              ? resolvedUsers[0]._id === user?._id
                ? resolvedUsers[1].name
                : resolvedUsers[0].name
              : resolvedUsers[0].name;

          return { ...chat, senderName };
        })
      );

      // Set the chats with sender names in the state
      setChats(chatsWithSenderNames);

      // Update local storage with the user's updated data
      const userData = await {
        ...user,
        accountType: updatedUser.accountType,
        subscription: updatedUser.subscription,
        day: updatedUser.day,
      };
      localStorage.setItem("userInfo", JSON.stringify(userData));

      // Update the user state
      await setUser(userData);

      // Navigate to the chats page
      navigate("/chats");

      // Show a success toast
      toast({
        title: "Successfully subscribed",
        description: `${user?.accountType} subscriber`,
        status: "info",
        duration: 5000,
        position: "bottom",
      });
    });
    return () => {
      socket.disconnect();
    };
  }, [user, setUser, navigate, toast, socket, setChats]);
  return (
    <Box
      display={"flex"}
      flexDirection={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      width={"100%"}
      background={"whitesmoke"}
    >
      <SideDrawer/>
      <Box p={"2"} pt={0} bg={useColorModeValue("gray.50", "gray.800")} display={"flex"} flexDirection={"column"} width={"100%"}>
        <Text textAlign={"center"} >Paying to <strong>Admin Apparels</strong></Text>
        <Text textAlign={"center"} fontSize={"small"}>Fuckmate Boo, From Fleeting to Lasting</Text>
        <IconButton width={"90px"} bg={useColorModeValue("gray.50", "gray.800")} onClick={() => navigate('/chats')} icon={<FaBackward />}/>
        <Divider colorScheme="green"/>
        </Box>
      <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
      <ModalOverlay
      bg="blackAlpha.300"
      backdropFilter="blur(10px) hue-rotate(90deg)"
      />
        <ModalContent padding={5} width={"calc(100% - 20px)"}>
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            display="flex"
            flexDirection={"column"}
            justifyContent="center"
          >
            <Box
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              p={0}
              m={0}
            >
              <Text
                fontSize={"sm"}
                fontWeight={500}
                bg={useColorModeValue("green.100", "green.900")}
                p={2}
                px={3}
                color={"green.500"}
                rounded={"full"}
              >
                *23% off
              </Text>
            </Box>

            <Text
              textAlign={"center"}
              justifyContent={"center"}
              fontSize={"2xl"}
            >
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
              fontSize={"small"}
              color={"green.400"}
              fontWeight={"bold"}
              placeholder="i.e 0710334455"
              textAlign={"center"}
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
                makePaymentMpesa(subscription, phoneNumber, user, toast);
                onClose();
                toast({
                  title: "Wait as message is sent",
                  status: "loading",
                  isClosable: true,
                  position: "bottom",
                  duration: 5000,
                });
              }}
              isDisabled={phoneNumber.length !== parseInt(10)}
              colorScheme="green"
            >
              Proceed
            </Button>
          </ModalBody>
          <ModalFooter display="flex">
            <Text textAlign={"center"} justifyContent={"center"}>
              You'll be sent a Message
            </Text>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box  
      display={"flex"}
      flexDir={{ base: "row", md: "column" }}
      justifyContent={"space-around"}
      alignItems={"center"}
      width={"100%"}
      overflow={"auto"}
      flexWrap={"wrap"}
      padding={5}
      background={"whitesmoke"}>

      <Box
        maxW={"330px"}
        w={"full"}
        bg={useColorModeValue("white", "gray.800")}
        boxShadow={"2xl"}
        rounded={"md"}
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
            Premium
          </Text>
          <Stack direction={"row"} align={"center"} justify={"center"}>
            <Text fontSize={"3xl"}>$</Text>
            <Text fontSize={"6xl"} fontWeight={800}>
              5.99
            </Text>
            <Text color={"gray.500"}>/week</Text>
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
              Unflag all chats
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.400" />
              Unlimited chats
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.400" />
              Chat without flags
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
                const amount = 2.99;

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
                const type = "Platnum";
                await handleApprove(type, user, setUser);
                return actions.order.capture().then(function (details) {
                  navigate("/chats");
                  toast({
                    title: "Success",
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
              loading="lazy"
              alt={""}
            />{" "}
            Pay via Mpesa
          </Button>
        </Box>
      </Box>

      <Box
        maxW={"330px"}
        w={"full"}
        bg={useColorModeValue("white", "gray.800")}
        boxShadow={"2xl"}
        rounded={"md"}
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
            Premium+ (*best)
          </Text>
          <Stack direction={"row"} align={"center"} justify={"center"}>
            <Text fontSize={"3xl"}>$</Text>
            <Text fontSize={"6xl"} fontWeight={800}>
              20
            </Text>
            <Text color={"gray.500"}>/month</Text>
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
              Unflag all chats
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.400" />
              Unlimited chats
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.400" />
              Chat without flags
            </ListItem>
            <ListItem display={"flex"}>
              <ListIcon as={CheckIcon} color="green.400" />
              Video and Voice Calls <strong style={{paddingLeft: 3}}>new</strong><MdNewReleases style={{color: "green"}} />
            </ListItem>
            <ListItem>
              <ListIcon as={CheckIcon} color="green.400" />
              Access to new features
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
                const amount = 10.0;
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
                const type = "Gold";
                await handleApprove(type, user, setUser);

                return actions.order.capture().then(function (details) {
                  navigate("/chats");
                  toast({
                    title: "Success",
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
              loading="lazy"
            />{" "}
            Pay via Mpesa
          </Button>
        </Box>
       </Box>
       
      </Box>
      <Text 
              variant="body2"
              textAlign="center"
              userSelect={"none"}
              fontSize={"xs"}

              >
               <strong style={{color: "#F44336"}}>Fuckmate Boo</strong> is an adult hookup-free platform.
              </Text>
    </Box>
  );
}
