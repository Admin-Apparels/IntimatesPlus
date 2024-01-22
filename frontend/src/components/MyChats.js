import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axiosInstance from "./miscellanious/axios";

import { useCallback, useEffect, useState } from "react";
import ChatLoading from "./ChatLoading";
// import { handleApprove, makePaymentMpesa  } from "./config/ChatLogics";
import { ChatState } from "./Context/ChatProvider";
import { useNavigate } from "react-router-dom";
import { Image } from "@chakra-ui/react";
// import { Image, useColorModeValue } from "@chakra-ui/react";
// import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  // Modal,
  // ModalOverlay,
  // ModalContent,
  // ModalHeader,
  // ModalFooter,
  // useDisclosure,
  // ModalBody,
  // ModalCloseButton,
  // Button,
  // Input,
  
} from "@chakra-ui/react";

const MyChat = (fetchAgain) => {
  const [loggedUser, setLoggedUser] = useState();
  // const { isOpen, onOpen, onClose } = useDisclosure();
  // const [clicked, setClicked] = useState(false);
  // const [phoneNumber, setPhoneNumber] = useState("");
  // const colorModeValue = useColorModeValue("green.50", "green.900");
  const {
    selectedChat,
    setSelectedChat,
    user,
    // setUser,
    chats,
    setChats,
    notification,
    setNotification,
  } = ChatState();

  const toast = useToast();
  const navigate = useNavigate();

  const fetchChats = useCallback(async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      axiosInstance
        .get("/api/chat", config)
        .then(async (response) => {
          if (response.data.message) {
          } else {
            const chatsWithSenderNames = await Promise.all(
              response.data.map(async (chat) => {
                const resolvedUsers = await Promise.all(chat.users);

                const senderName =
                  resolvedUsers.length === 2
                    ? resolvedUsers[0]._id === loggedUser._id
                      ? resolvedUsers[1].name
                      : resolvedUsers[0].name
                    : resolvedUsers[0].name;

                return { ...chat, senderName };
              })
            );

            setChats(chatsWithSenderNames);
          }
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            toast({
              title: "Your session has expired",
              description: "Logging out in less than 8 seconds",
              duration: 8000,
              status: "loading",
              position: "bottom",
            });

            setTimeout(() => {
              localStorage.removeItem("userInfo");
              navigate("/");
            }, 8000);
          }
          if (error.response && error.response.status === 429) {
            toast({
              title: "Too many request",
              description: "Try again after some time",
              status: "error",
              duration: 5000,
              isClosable: true,
              position: "bottom-left",
            });
          }
        });
    } catch (error) {
      toast({
        title: "Error occured trying to retrieve Chats",
        description: "Try again after some time",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  }, [toast, user, loggedUser, setChats, navigate]);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setLoggedUser(userInfo);
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      if (loggedUser) {
        await fetchChats();
        setTimeout(async () => {
          await fetchChats();
        }, 2000);
      }
    };

    fetchData();
  }, [fetchChats, loggedUser]);
  

  const renderChatItems = () => {
    return chats.map((chat) => {
  
      return (
        <Box
          key={chat._id}
          onClick={() => {
          
              setSelectedChat(chat);
              const otherNotifications = notification.filter(
                (n) => n.chat._id !== chat._id
              );
              setNotification(otherNotifications);
           
          }}
          cursor="pointer"
          bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
          color={selectedChat === chat ? "white" : "black"}
          px={3}
          py={2}
          borderRadius="lg"
          position={"relative"}
        >
          <Text display={"flex"} textAlign={"center"}>
            {chat.senderName}{" "}
            {chat.chatName === "Admin" ? (
              <Image
                src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1699615402/icons8-verified-account-64_1_amfufo.png"
                height={4}
                m={1}
              />
            ) : (
              ""
            )}
          </Text>
          {chat.latestMessage && chat.latestMessage.sender && (
            <Text fontSize="xs">
              <b>
                {chat.latestMessage.sender.name === user.name
                  ? "You"
                  : chat.latestMessage.sender.name}
                {":"}{" "}
              </b>
              {chat.latestMessage.content.length > 50
                ? chat.latestMessage.content.substring(0, 51) + "..."
                : chat.latestMessage.content}
            </Text>
          )}
       
        </Box>
      );
    });
  };
  
  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={2}
      bgGradient="linear(43deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)"
      bgClip="border-box"
      w={{ base: "100%", md: "31%" }}
      borderRadius="lg"
      borderWidth="1px"
      >
{/* // <Modal size="lg" onClose={() => { onClose();
//   setClicked(false);
// }} isOpen={isOpen} isCentered>
       
//           <>
//             <ModalOverlay />
//             <ModalContent width={"calc(90%)"} p={10}>
//               <ModalHeader
//                 fontSize="40px"
//                 fontFamily="Work sans"
//                 display="flex"
//                 flexDir={"column"}
//                 justifyContent="center"
//                 alignItems={"center"}
//                 bgGradient="linear(to-r, red.700, yellow.300)"
//                 bgClip="text"
//                 userSelect={"none"}
//                 p={0}
//                 m={0}
//               >
//                 Premium
                
//                  <Stack direction={"row"} align={"center"} justify={"center"}>
//             <Text fontSize={"2xl"}>$</Text>
//             <Text fontSize={"2xl"} fontWeight={800}>
//               3.99
//             </Text>
//             <Text color={"gray.500"} fontSize={"2xl"}>/month</Text>
//           </Stack>
//                 <Text fontSize={"small"}>-Open all chats -Get instant Admin replies -Boost following</Text>
//               </ModalHeader>
//               <ModalCloseButton />
//               <ModalBody
//                 display="flex"
//                 flexDir="column"
//                 alignItems="center"
//                 justifyContent="space-between"
//               >
//                 {!clicked ? (
//                 <>
//                   <PayPalScriptProvider
//                     options={{
//                       clientId:
//                         "ASgI4T_UWqJJpTSaNkqcXbQ9H8ub0f_DAMR8SJByA19N4HtPK0XRgTv4xJjj4Mpx_KxenyLzBDapnJ82",
//                     }}
//                   >
//                     <PayPalButtons
//                       createOrder={(data, actions) => {
//                         const amount = 3.0;

//                         return actions.order.create({
//                           purchase_units: [
//                             {
//                               amount: {
//                                 currency_code: "USD",
//                                 value: amount.toFixed(2),
//                               },
//                             },
//                           ],
//                         });
//                       }}
//                       onApprove={async (data, actions) => {
//                         const amount = "Bronze";
//                         const ads = "femaleSub";
//                         await handleApprove(amount, ads, user, setUser);
//                         return actions.order.capture().then(function (details) {
                         
//                         });
//                       }}
//                       onCancel={() => {
//                         toast({
//                           title: "Cancelled",
//                           description: "Subscription Unsuccessfull",
//                           status: "info",
//                           isClosable: true,
//                           position: "bottom",
//                         });
//                       }}
//                     />
//                   </PayPalScriptProvider>
//                   <Button
//                     display={"flex"}
//                     justifyContent={"center"}
//                     alignItems={"center"}
//                     width={"12.5rem"}
//                     borderRadius={2}
//                     backgroundColor={"green.400"}
//                     color={"white"}
//                     onClick={() => {
//                       setClicked(true);
//                     }}
//                   >
//                     <Image
//                       height={5}
//                       width={"auto"}
//                       src={
//                         "https://res.cloudinary.com/dvc7i8g1a/image/upload/v1694007922/mpesa_ppfs6p.png"
//                       }
//                       loading="lazy"
//                       alt={""}
//                     />{" "}
//                     Pay via Mpesa
//                   </Button>{" "}
//                 </>
//               ) : (
//                 <> <Text
//             fontSize={"sm"}
//             fontWeight={500}
//             bg={colorModeValue}
//             p={2}
//             px={3}
//             color={"green.500"}
//             rounded={"full"}
//           >
//             *20% off
//           </Text>
//                   <Input
//                     fontSize={"sm"}
//                     color={"green.400"}
//                     fontWeight={"bold"}
//                     placeholder="i.e 0710334455..."
//                     type="text"
//                     onChange={(e) => setPhoneNumber(e.target.value)}
//                     value={phoneNumber}
//                     textAlign={"center"}
//                     minLength={10}
//                     maxLength={10}
//                   />
//                   <Button
//                     width={"100%"}
//                     onClick={() => {
//                       makePaymentMpesa("premium", phoneNumber, user, toast);
//                       onClose();
//                       toast({
//                         title: "Wait as message is sent",
//                         status: "loading",
//                         isClosable: true,
//                         position: "bottom",
//                         duration: 5000,
//                       });
//                     }}
//                     isDisabled={phoneNumber.length !== parseInt(10)}
//                     colorScheme="green"
//                   >
//                     Proceed
//                   </Button>
//                 </>
//               )}
              
//               </ModalBody>
//               <ModalFooter
//               >
//               </ModalFooter>
//             </ModalContent>
//           </>
//       </Modal> */}
      <Box
        display="flex"
        p={2}
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text
          fontFamily="cursive"
          fontWeight={"medium"}
          bgGradient="linear(to-r, black, grey)"
          bgClip="text"
          userSelect={"none"}
        >
          My Chats:{" "}
        </Text>

        <Text
          display={"flex"}
          justifyContent={"space-between"}
          userSelect={"none"}
          fontSize={"small"}
          p={2}
        >
          {chats !== undefined ? chats.length : 0}
          <Image src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1703952426/icons8-chat-100_x8ue9d.png" height={6} mt={-1} />
        </Text>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
        position={"relative"}
      >
        {chats.length === 0 && (
          <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            alignItems={"center"}
            position={"absolute"}
            width={"96%"}
            p={0}
            m={0}
            height={"76%"}
            userSelect={"none"}
          >
            <Image src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1701516427/icons8-not-found-48_sfynmt.png" />
            <Text>You have no chats available, create one above</Text>
          </Box>
        )}

        {chats && Array.isArray(chats) ? (
          <Stack overflowY="scroll">{renderChatItems()}</Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};
export default MyChat;
