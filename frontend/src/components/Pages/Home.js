import {
  Box,
  Button,
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
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../Authentication/Login";
import Signup from "../Authentication/Signup";
import ErrorBoundary from "./ErrorBoundary";
import AnimatedTyping from "../miscellanious/animatedText";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

function Homepage() {
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(true);
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container) => {}, []);

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
        bg="black"
        w="100%"
        m="20px 0 15px 0"
        textColor={"background"}
        borderRadius={3}
        p={"3"}
        background="transparent"
      >
        {" "}
        <Image
          src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1717067451/IMG-20240530-WA0001_1_kluate.jpg"
          userSelect={"none"}
          boxSize={"200px"}
          border={"5px solid red"}
          borderRadius={"full"}
        />
        <Text>Privacy First 🔒</Text>
        <Text userSelect={"none"}>
          Dive in effortlessly! Chat anonymously. Keep identities private.
          Please confirm that you are an{" "}
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
          background={"black"}
          textColor={"white"}
        >
          I Agree
        </Button>
      </Box>
    );
  };

  return (
    <ErrorBoundary fallback={<p>Something went wrong</p>}>
      <Container maxW="xl" centerContent minH={"xl"}>
        <Particles
          id="tsparticles"
          init={particlesInit}
          loaded={particlesLoaded}
          style={{ zIndex: 0 }}
          options={{
            background: {
              color: {
                value: "transparent",
              },
            },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: {
                  enable: false,
                  mode: "push",
                },
                onHover: {
                  enable: true,
                  mode: "repulse",
                },
                resize: true,
              },
              modes: {
                push: {
                  quantity: 4,
                },
                repulse: {
                  distance: 200,
                  duration: 0.4,
                },
              },
            },
            particles: {
              color: {
                value: "#ffffff",
              },
              links: {
                color: "#ffffff",
                distance: 150,
                enable: true,
                opacity: 0.5,
                width: 1,
              },
              move: {
                direction: "none",
                enable: true,
                outModes: {
                  default: "bounce",
                },
                random: false,
                speed: 2,
                straight: false,
              },
              number: {
                density: {
                  enable: true,
                  area: 800,
                },
                value: 15,
              },
              opacity: {
                value: 0.5,
              },
              shape: {
                type: "circle",
              },
              size: {
                value: { min: 1, max: 5 },
              },
            },
            detectRetina: true,
          }}
        />
        <Box
          display="flex"
          justifyContent="center"
          p={1}
          bg="black"
          w="100%"
          m="40px 0 15px 0"
          borderRadius="lg"
          borderWidth="1px"
          background="blackAlpha.800"
        >
          <Image
            src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1717058118/icons8-messages_vvzafy.gif"
            height={6}
            mt={3}
            userSelect={"none"}
            borderRadius={5}
          />
          <AnimatedTyping />

          <Image
            src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1701779357/icons8-sex-64_a1hki1.png"
            height={12}
            userSelect={"none"}
            borderRadius={5}
          />
        </Box>
        <Box
          background="blackAlpha.800"
          width="100%"
          p={"1"}
          borderRadius="lg"
          borderWidth="1px"
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
            >
              <TabList p={"3"} pb={0}>
                <Tab color={"lightblue"} background={"blackAlpha.600"} mx={"2"}>
                  Login
                </Tab>
                <Tab color={"lightblue"} background={"blackAlpha.600"}>
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
          background="blackAlpha.800"
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
              >
                IntiMates+ is where intimacy meets your perfect match. When a
                mutual spark ignites, both accounts transcend to new heights.
                Find someone who shares your passions and desires, turning
                fleeting moments into lasting connections.
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
                  color="blue.100"
                  userSelect={"none"}
                  fontSize={"small"}
                  target="blank"
                >
                  Terms of Use
                </Link>
                <Link
                  href="https://www.privacypolicygenerator.info/live.php?token=XoLCzcvHWA3NIQ1iBqO8IVaTRxQMVbff"
                  color="blue.100"
                  userSelect={"none"}
                  fontSize={"small"}
                  target="blank"
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
                fontSize={{ base: "medium", md: "bold" }}
                width={"100%"}
                p={0}
                m={0}
                userSelect={"none"}
                textColor={"red.500"}
                textAlign={"center"}
              >
                IntiMates+
              </Text>
              <Text
                textAlign={"center"}
                userSelect={"none"}
                fontFamily={"mono"}
                fontSize={"small"}
              >
                Welcome! We all connect here. Say goodbye to fleeting comfort
                and discover meaningful connections. Meet your Intimate,
                Friend-With-Benefits, Sponsor, Sugar Daddy, or Sugar Mommy. Join
                our premier dating platform where companionship, romance, and
                genuine connections await.
              </Text>
              <Text color="blue.100" display={"flex"} fontSize={"small"}>
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
              <Link href="https://twitter.com/fuckmateboo" m={0} isExternal>
                <Image
                  src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1701357033/icons8-twitter-50_3_vz8pfu.png"
                  height={6}
                />
              </Link>
              <Link href="#" m={1} isExternal>
                <Image
                  src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1699869638/icons8-instagram-48_wfs0ek.png"
                  height={7}
                />
              </Link>
              <Link
                href="https://web.facebook.com/profile.php?id=61554735039262"
                m={1}
                isExternal
              >
                <Image
                  src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1699869920/icons8-facebook-48_vcxsai.png"
                  height={7}
                />
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
