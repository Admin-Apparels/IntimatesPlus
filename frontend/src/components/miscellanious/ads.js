import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  useDisclosure,
  ModalHeader,
  ModalOverlay,
  Button,
  Input,
  Text,
  Image,
  useToast,
} from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { handleApprove } from "../config/ChatLogics";
import axios from "axios";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom";
import socketIOClient from "socket.io-client";

const Ads = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [disable, setDisable] = useState(false);
  const { ads, setAds, user, setUser } = ChatState();
  const [countdown, setCountdown] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");

  const [count, setCount] = useState(10);
  const [watchedAd, setWatchedAd] = useState(true);

  const [clicked, setClicked] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (ads || (user.isNewUser === undefined && !ads)) {
      const openModalTimeout = setTimeout(() => {
        setCountdown(15);
        onOpen();
      }, 180000);

      const countdownInterval = setInterval(() => {
        if (countdown > 0) {
          setCountdown(countdown - 1);
        } else {
          clearInterval(countdownInterval);
        }
      }, 1000);

      return () => {
        clearTimeout(openModalTimeout);
        clearInterval(countdownInterval);
      };
    }
  }, [ads, onOpen, countdown, user.adsSubscription, user.isNewUser]);

  const handleClose = () => {
    setCountdown(15);
    setAds(true);
  };

  const handleModels = () => {
    setDisable((prev) => !prev);
  };
  useEffect(() => {
    const socket = socketIOClient("https://fuckmate.boo");
    socket.on("noPayment", (nothing) => {
      toast({
        title: nothing,
        description: "Subscription unsuccessful",
        status: "info",
        duration: 5000,
        position: "bottom",
      });
    });
    socket.on("noMoreAds", async (updatedUser) => {
      const userData = await {
        ...user,
        adsSubscription: updatedUser.adsSubscription,
      };
      localStorage.setItem("userInfo", JSON.stringify(userData));
      await setUser(userData);
      toast({
        title: "Successfully subscribed",
        description: `You will receive no ads for the next one month`,
        status: "info",
        duration: 5000,
        position: "bottom",
      });
    });
    return () => {
      socket.disconnect();
    };
  }, [user, setUser, toast]);
  const makePaymentMpesa = async () => {
    if (!phoneNumber) {
      return;
    }
    const subscription = "Ads";
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        `/api/paycheck/makepaymentmpesa/${user._id}`,
        { phoneNumber, subscription },
        config
      );

      if (data) {
        toast({
          title: "You have been prompt to finish your subscription process",
          status: "info",
          duration: 1000,
          position: "bottom",
        });
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (count > 0 && watchedAd === false) {
      const interval = setInterval(() => {
        setCount((prev) => (prev > 0 ? prev - 1 : prev));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [count, watchedAd]);

  const handleButtonClick = () => {
    if (watchedAd) {
      setWatchedAd(false);
      setCount(10);
      window.open("//abmismagiusom.com/4/6644159", "_blank");
    } else {
      if (count === 0) {
        setWatchedAd(true);
        setCount(10);
        setMessage("");
        onClose();
      } else {
        setMessage("You didn't let the ad load fully");
        setWatchedAd(true);
      }
    }
  };

  return (
    <>
      <Modal size="lg" isOpen={isOpen} isCentered closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent width={"calc(100% - 20px)"}>
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            <Text display={"flex"} color={"blue.400"} userSelect={"none"}>
              <Image src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1698738202/icons8-info_kvegkg.gif" />
              ad break
            </Text>
          </ModalHeader>
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="center"
          >
            {disable ? (
              !clicked ? (
                <>
                  <PayPalScriptProvider
                    options={{
                      clientId:
                        "ASgI4T_UWqJJpTSaNkqcXbQ9H8ub0f_DAMR8SJByA19N4HtPK0XRgTv4xJjj4Mpx_KxenyLzBDapnJ82",
                    }}
                  >
                    <PayPalButtons
                      createOrder={(data, actions) => {
                        const amount = 3.0;

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
                        const amount = "Bronze";
                        const ads = "Ads";
                        await handleApprove(amount, ads, user, setUser);
                        return actions.order.capture().then(function (details) {
                          navigate("/chats");
                          toast({
                            title: "Success",
                            description: "No ads breaks interruptions",
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
                          description: "Subscription Unsuccessfull",
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
                    width={"12.5rem"}
                    borderRadius={2}
                    backgroundColor={"green.400"}
                    color={"white"}
                    onClick={() => {
                      setClicked(true);
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
                  </Button>{" "}
                </>
              ) : (
                <>
                  <Input
                    fontSize={"1.2rem"}
                    color={"green.400"}
                    fontWeight={"bold"}
                    placeholder="i.e 0710334455"
                    type="text"
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    value={phoneNumber}
                    minLength={10}
                    maxLength={10}
                  />
                  <Button
                    width={"100%"}
                    onClick={() => {
                      makePaymentMpesa();
                      handleClose();
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
                </>
              )
            ) : (
              <Text textAlign={"center"}>
                👋 Hey there! <br />
                We're a small team working hard to bring you the best
                experience. Your support means the world to us! 🌍✨ Consider
                upgrading to our no-ads package—it not only enhances your
                experience but also supports our growth. 🚀 <br /> Thanks for
                being a part of our community! 🙌
              </Text>
            )}
          </ModalBody>
          <ModalFooter display={"flex"} justifyContent={"space-evenly"}>
            <Button
              onClick={() => {
                handleButtonClick();
                setDisable(false);
                setClicked(false);
              }}
              _hover={{ bg: "green.400", color: "white" }}
              p={5}
            >
              <Text
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"center"}
                userSelect={"none"}
                p={5}
              >
                {count === 0 ? "Close" : "WATCH AD"}
                <Text
                  textAlign={"center"}
                  fontSize={"2xs"}
                  color={"red"}
                  _hover={{ color: "red" }}
                >
                  {message}
                </Text>
              </Text>
            </Button>

            <Button margin={0} padding={2} onClick={() => handleModels()}>
              <Image src="https://res.cloudinary.com/dvc7i8g1a/image/upload/v1698738794/icons8-speaker-48_gfxa1m.png" />
              No ads
              <Text
                fontSize={"2xs"}
                margin={"6px"}
                marginBottom={0}
                marginRight={0}
                marginTop={"15px"}
                userSelect={"none"}
              >
                $3/month
              </Text>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default Ads;
