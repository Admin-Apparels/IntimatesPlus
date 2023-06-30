import {
  Box,
  Container,
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

function Homepage() {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) navigate("/chats");
  }, [navigate]);

  return (
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
          alignItems={"center"}
          fontSize="4xl"
          fontFamily="Work sans"
        >
          RocketChat
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
        justifyContent={"space-between"}
        alignItems={"center"}
        width={"42%"}
        mt={5}
      >
        <Link
          display={"flex"}
          justifyContent={"center"}
          href="https://jdportfolio-2ba993e38582.herokuapp.com/"
        >
          @jdtheefirst
        </Link>
        {"   "}
        <Text variant="body2" color="white" align="center">
          {"Copyright © "} {new Date().getFullYear()}
          {"."}
        </Text>
      </Box>
    </Container>
  );
}

export default Homepage;
