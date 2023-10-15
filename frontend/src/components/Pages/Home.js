import {
  Box,
  Container,
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
            fontFamily="Work sans"
          >
            Admin
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
          display={"flex"}
          flexDirection={"column"}
          bgGradient="linear(to-r, #79cbca, #b4aea9, #e284ae)"
          marginTop={2}
          borderRadius={5}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Text variant="body2" textAlign="center">
            {" "}
            This site strictly prohibits any form of prostitution. After the
            case of mutual connection, both accounts should be deactivated
          </Text>

          <Link href="https://twitter.com/jdtheefirst">
            <Image
              src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1697382400/icons8-twitterx-250_tulfw8.png"
              height={5}
            />
          </Link>
          <Text>{`Copyright © ${new Date().getFullYear()}`}</Text>
        </Box>
      </Container>
    </ErrorBoundary>
  );
}

export default Homepage;
