import {
  Box,
  Button,
  Container,
  Flex,
  Image,
  Link,
  LinkBox,
  LinkOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import Login from "../Authentication/Login";
import Signup from "../Authentication/Signup";
import ErrorBoundary from "./ErrorBoundary";
import { MdNoAdultContent } from "react-icons/md";
import Type from "../miscellanious/animatedText";
import { CiFacebook } from "react-icons/ci";
import { FaInstagram, FaXTwitter } from "react-icons/fa6";

function Homepage() {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) navigate("/chats");
  }, [navigate]);

  const handleAgreeClick = () => {
    setShowWelcome(false);
  };

  const WelcomeComponent = ({ onAgreeClick }) => {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        w="100%"
        m="20px 0 15px 0"
        borderRadius={3}
        p={"3"}
        minH={"300px"}
        position={"relative"}
      >
      <Text position={"absolute"} width={"100%"} top={'-15%'} left={0} transform="rotate(-25deg)" style={{ alignItems: 'start', justifyContent: "start" }}>
            <MdNoAdultContent style={{ color: 'red', fontSize: "2rem", marginRight: '8px' }} />
            The only Adult Escape!
        </Text>
        {" "}
        <Image
          src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1722070627/cutted2_1_myprbg.jpg"
          userSelect={"none"}
          boxSize={"200px"}
          border={"5px solid red"}
          borderRadius={"full"}
        />
        <Text textAlign={"center"} mb={6} fontWeight="bold" fontSize="lg">
        "Why watch corn when we can get the real experience 🤷‍♀️" - Mike and Ana
        </Text>
        <Text>Privacy First 🔒</Text>
        <Text userSelect={"none"}>
          Dive in effortlessly! Chat anonymously. Please confirm that you are an{" "}
          <span
            style={{ color: "red", paddingRight: ".3rem", fontWeight: "bold" }}
          >
            adult
          </span>
          to proceed...
        </Text>
        <Button
          m={4}
          onClick={onAgreeClick}
          border={"1px solid #d142f5"}
        >
          I Agree
        </Button>
      </Box>
    );
  };

  return (
    <ErrorBoundary fallback={<p>Something went wrong</p>}>
      <Container maxW="xl" centerContent minH={"xl"}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems={"center"}
          p={'4'}
          w="100%"
          m="15px 0 15px 0"
        >
          <Type/>
        </Box>
        <Box
          width="100%"
          p={"1"}
          borderRadius="lg"
          borderWidth="1px"
          background={"whitesmoke"}
        >
          {showWelcome ? (
            <WelcomeComponent onAgreeClick={handleAgreeClick} />
          ) : (
            <Tabs
              isFitted
              variant="soft-rounded"
              backgroundPosition="center"
              borderRadius={3}
              defaultIndex={1}
              background={"whitesmoke"}
            >
              <TabList p={"3"} pb={0}>
                <Tab color={"lightblue"} mx={"2"}>
                  Login
                </Tab>
                <Tab color={"lightblue"}>
                  Let's Go
                </Tab>
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
          )}
        </Box>{" "}
        <Box
          display="flex"
          width="100vw"
          background="whitesmoke"
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
            p={0}
            m={0}
          >
            <Box
              display={"flex"}
              flexDir={"column"}
              justifyContent={"center"}
              alignItems={"center"}
              width={{ base: "100%", md: "30%" }}
              marginBottom={{ base: 4, md: 0 }}
            >
              <Text
                variant="body2"
                textAlign="center"
                userSelect={"none"}
                fontSize={"small"}
                p={"4"}
              >
               <strong style={{color: "#F44336"}}>Fuckmate Boo</strong> is a hookup-free, adult content-free platform designed to channel sexual arousal from fleeting pleasures and self-comforts into intimacy-driven, long-term relationships. Find someone who shares your passions and desires, turning fleeting moments into lasting connections.
              </Text>
              <Text
                display="flex"
                justifyContent={"space-around"}
                width={"100%"}
                p={0}
                m={0}
              >
                {" "}
                <Link
                  href="https://www.termsandconditionsgenerator.com/live.php?token=iuJtB9N5PKNTX5iM90p7B8cd8h6vCCdJ"
                  userSelect={"none"}
                  fontSize={"small"}
                  target="blank"
                  textDecoration={"underline"}
                >
                  Terms of Use
                </Link>
                <Link
                  href="https://www.privacypolicygenerator.info/live.php?token=XoLCzcvHWA3NIQ1iBqO8IVaTRxQMVbff"
                  userSelect={"none"}
                  fontSize={"small"}
                  target="blank"
                  textDecoration={"underline"}
                >
                  Privacy Policy
                </Link>
              </Text>
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
                textAlign={"center"}
                userSelect={"none"}
                fontFamily={"mono"}
                p={"3"}
                fontSize={"small"}
              >
                Welcome! We all connect here. Say goodbye to fleeting comfort
                and discover meaningful connections. Meet your intimate. Join our premier dating
                platform where companionship, openness, romance, and genuine connections
                await.
              </Text>
              <LinkBox
                as="article"
                maxW="sm"
                p="1"
                borderWidth="1px"
                rounded="md"
                width={"100%"}
                background={"#FFA500"}
                textAlign={"center"}
              >
                <LinkOverlay
                  userSelect={"none"}
                  href="https://www.paypal.com/donate/?hosted_button_id=2L8HHGURQTED2"
                  target="blank"
                >
                  Donate
                </LinkOverlay>
              </LinkBox>
              <Text display={"flex"} fontSize={"small"}>
                {" "}
                <Image
                  src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1701515284/icons8-18-plus-48_jf2fci.png"
                  height={6}
                />
                {`Copyright © 2023-${new Date().getFullYear()}`}
              </Text>
            </Box>

            <Box
              display={"flex"}
              flexDir={{ base: "row", md: "column" }}
              justifyContent={"space-between"}
              alignItems={"center"}
              width={{ base: "90%", md: "30%" }}
              p={0}
              m={0}
            >
              <Link href="https://twitter.com/IntiMates_Plus" m={0} isExternal>
              <FaXTwitter/>
              </Link>
              <Link href="#" m={1} isExternal>
              <FaInstagram />
              </Link>
              <Link
                href="https://web.facebook.com/profile.php?id=61554735039262"
                m={1}
                isExternal
              >
                <CiFacebook />
              </Link>
              <Link href="https://www.fuckmate.boo" m={1} isExternal>
                <Image
                  src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1700415178/APP_LOGO_2_pforwh.png"
                  height={5}
                  borderRadius={4}
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
