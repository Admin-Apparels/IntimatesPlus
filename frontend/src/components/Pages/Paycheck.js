import React from "react";
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
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function Paycheck() {
  const toast = useToast();
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
              onApprove={(actions) => {
                return actions.order.capture().then(function (details) {
                  toast({
                    title: "Success",
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom",
                  });
                });
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
                return actions.order.capture().then(function (details) {
                  toast({
                    title: "Success",
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom",
                  });
                });
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
                return actions.order.capture().then(function (details) {
                  console.log(details);
                  toast({
                    title: "Successfull payment",
                    status: "info",
                    duration: 3000,
                    isClosable: true,
                    position: "bottom",
                  });
                });
              }}
            />
          </PayPalScriptProvider>
        </Box>
      </Box>
    </VStack>
  );
}
