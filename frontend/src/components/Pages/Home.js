import {
  Box,
  Container,
  Flex,
  Image,
  Link,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../Authentication/Login";
import Signup from "../Authentication/Signup";
import ErrorBoundary from "./ErrorBoundary";

function Homepage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) navigate("/chats");
  }, [navigate]);

  return (
    <ErrorBoundary fallback={<p>Something went wrong</p>}>
      <Container maxW="xl" centerContent>
        <Box
          display="flex"
          justifyContent="center"
          p={3}
          bg="white"
          w="100%"
          m="40px 0 15px 0"
          borderRadius="lg"
          borderWidth="1px"
        >
          <Text
            display={"flex"}
            justifyContent={"center"}
            alignItems={"space-between"}
            fontSize="4xl"
            fontWeight={"bold"}
            userSelect={"none"}
            textColor={"blue.500"}
          >
            fuckmate.boo
            <Image
              height={10}
              src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1695820899/icons8-no-one-under-eighteen-emoji-48_cznua5.png"
              loading="lazy"
              alt=""
            />
          </Text>
        </Box>
        <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
          <Tabs isFitted variant="soft-rounded">
            <TabList mb="1em">
              <Tab>Login</Tab>
              <Tab>Sign Up</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Login />
              </TabPanel>
              <TabPanel>
                <Signup />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>{" "}
        <Box
          display="flex"
          width="100vw"
          background="blackAlpha.600"
          color={"white"}
          marginTop={2}
          p={2}
          borderRadius={5}
          flex={1}
        >
          <Flex
            flexDirection={{ base: "column", md: "row" }}
            justifyContent={{ base: "center", md: "space-between" }}
            alignItems={{ base: "center", md: "flex-start" }}
            marginTop={4}
          >
            <Box
              display={"flex"}
              flexDir={"column"}
              justifyContent={"center"}
              alignItems={"center"}
              width={{ base: "100%", md: "30%" }}
              marginBottom={{ base: 4, md: 0 }}
            >
              <Text variant="body2" textAlign="center" userSelect={"none"}>
                This site strictly prohibits any form of prostitution. After the
                case of mutual connection, both accounts should be deactivated
                or deleted.
              </Text>
              <Link
                href="#"
                textDecoration={"underline"}
                color="blue.100"
                userSelect={"none"}
              >
                Terms and Conditions
              </Link>
            </Box>

            <Box
              display={"flex"}
              flexDir={"column"}
              justifyContent={"center"}
              alignItems={"center"}
              width={{ base: "100%", md: "30%" }}
              p={0}
              m={0}
            >
              <Text
                fontWeight="bold"
                p={0}
                m={0}
                userSelect={"none"}
                textColor={"blue.800"}
                textDecoration={"underline"}
              >
                FUCKMATE.BOO{" "}
              </Text>
              <Text textAlign={"center"} userSelect={"none"}>
                Discover meaningful connections on our premier dating platform.
                We bring together individuals seeking companionship, romance,
                and genuine connections.
              </Text>
              <Text color="blue.100">{`Copyright © ${new Date().getFullYear()}`}</Text>
            </Box>

            <Box
              display={"flex"}
              flexDir={{ base: "row", md: "column" }}
              justifyContent={"space-between"}
              alignItems={"center"}
              width={{ base: "90%", md: "30%" }}
            >
              <Link href="#">
                <Image
                  src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1697382400/icons8-twitterx-250_tulfw8.png"
                  height={7}
                />
              </Link>
              <Link href="#">
                <Image
                  src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1699869638/icons8-instagram-48_wfs0ek.png"
                  height={7}
                />
              </Link>
              <Link href="#">
                <Image
                  src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1699869920/icons8-facebook-48_vcxsai.png"
                  height={7}
                />
              </Link>
              <Link href="https://www.fuckmate.boo">
                <Image
                  src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1699960322/APP_LOGO_lcbdbj.png"
                  height={5}
                  borderRadius={5}
                />
              </Link>
            </Box>
          </Flex>
        </Box>
      </Container>
    </ErrorBoundary>
  );
}

export default Homepage;
