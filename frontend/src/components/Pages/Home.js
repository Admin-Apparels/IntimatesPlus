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
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Login from "../Authentication/Login";
import Signup from "../Authentication/Signup";
import ErrorBoundary from "./ErrorBoundary";
import AnimatedTyping from "../miscellanious/animatedText";
import { SiCoffeescript } from "react-icons/si";
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
        m="40px 0 15px 0"
        textColor={"background"}
        borderRadius={3}
        p={1}
        background="transparent"
      >
        <Text>🔒#PrivacyFirst</Text>
        <Text userSelect={"none"}>
          💋 Dive in effortlessly! 💬 Chat anonymously. <br />
          🤫 Keep identities private <br />
          🌡️ Play safe, protect against STDs in your encounters.
          <br />
          💑 Respect desires; our members are real, not porn actors. Ready for
          genuine connections? Let's get started...
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
      <Container maxW="xl" centerContent>
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
                  enable: true,
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
        <LinkBox
          as="article"
          maxW="sm"
          p="3"
          borderWidth="1px"
          rounded="md"
          position="fixed"
          top="2%"
          right="2%"
          textColor={"white"}
          background={"#FFA500"}
        >
          <SiCoffeescript style={{ color: "white", fontSize: "3rem" }} />
          <LinkOverlay
            userSelect={"none"}
            href="https://www.paypal.com/donate/?hosted_button_id=2L8HHGURQTED2"
            target="blank"
          >
            Donate
          </LinkOverlay>
        </LinkBox>
        <Box
          display="flex"
          justifyContent="center"
          p={1}
          bg="black"
          w="100%"
          m="40px 0 15px 0"
          borderRadius="lg"
          borderWidth="1px"
          background="blackAlpha.400"
        >
          <AnimatedTyping />

          <Image
            src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1701779357/icons8-sex-64_a1hki1.png"
            height={12}
            userSelect={"none"}
            borderRadius={5}
          />
        </Box>
        <Box
          background="blackAlpha.400"
          width="100%"
          p={4}
          borderRadius="lg"
          borderWidth="1px"
        >
          {showWelcome ? (
            <WelcomeComponent onAgreeClick={handleAgreeClick} />
          ) : (
            <Tabs
              isFitted
              variant="soft-rounded"
              backgroundImage={
                "https://res.cloudinary.com/dvc7i8g1a/image/upload/v1707305979/coupless_brk1gk.jpg"
              }
              backgroundPosition="center"
              borderRadius={3}
              defaultIndex={1}
            >
              <TabList mb="1em" p={"3"}>
                <Tab color={"lightblue"} background={"blackAlpha.600"} mx={"2"}>
                  Login
                </Tab>
                <Tab color={"lightblue"} background={"blackAlpha.600"}>
                  Sign Up
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
                Fuckmate boo is a realm where connections evolve beyond fleeting
                moments. Once a mutual spark is ignited, both accounts shall
                transcend to new heights. Deactivation becomes a symphony of
                shared passion, a crescendo of genuine connection.
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
                Fuckmate Boo
              </Text>
              <Text
                textAlign={"center"}
                userSelect={"none"}
                fontFamily={"mono"}
                fontSize={"small"}
              >
                🌟 Welcome, meet your Fuckmate Boo, Friend-With-Benefit,
                Sponser, Suggar Daddy or Sugar Mammy here, where connection
                transcends self-pleasure! 🌟 Discover meaningful connections on
                our premier dating platform. We bring together individuals
                seeking companionship, romance, and genuine connections.
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
              <Link href="https://twitter.com/fuckmateboo" m={0} target="blank">
                <Image
                  src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1701357033/icons8-twitter-50_3_vz8pfu.png"
                  height={6}
                />
              </Link>
              <Link href="#" m={1} target="blank">
                <Image
                  src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1699869638/icons8-instagram-48_wfs0ek.png"
                  height={7}
                />
              </Link>
              <Link
                href="https://web.facebook.com/profile.php?id=61554735039262"
                m={1}
                target="blank"
              >
                <Image
                  src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1699869920/icons8-facebook-48_vcxsai.png"
                  height={7}
                />
              </Link>
              <Link href="https://www.fuckmate.boo" m={1} target="blank">
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
