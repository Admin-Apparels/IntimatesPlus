import {
  Box,
  Container,
  Image,
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
        <Text
          padding={3}
          variant="body2"
          color="white"
          textAlign="center"
          justifyContent={"space-evenly"}
        >
          Resist Slave Mind | Resist Porn | Be The Best Version of Yourself |{" "}
          {`Copyright © ${new Date().getFullYear()}`}
        </Text>
      </Container>
    </ErrorBoundary>
  );
}

export default Homepage;
