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
  Text,
} from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";

const Ads = () => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  const { ads, setAds } = ChatState();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (ads) {
      setTimeout(() => {
        onOpen();
        setAds(false);
      }, 3000);
    }
    const interval = setInterval(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1);
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [ads, onOpen, countdown]);
  const handleClose = () => {
    setTimeout(() => {
      setAds(true);
      setCountdown(10);
    }, 3000);
  };

  return (
    <>
      <Modal size="lg" isOpen={isOpen} isCentered closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent height="410px" width={"calc(100% - 20px)"}>
          <ModalHeader
            fontSize="40px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            {countdown === 0 ? (
              <Button
                onClick={() => {
                  handleClose();
                  onClose();
                }}
                backgroundColor={"Background"}
                borderRadius={10}
                p={0}
                m={0}
                _hover={{ bg: "transparent", color: "green" }}
              >
                <Text fontSize={"2xl"}>Skip </Text>
              </Button>
            ) : (
              <Text fontSize={"2xl"}>Skip in {countdown}</Text>
            )}
          </ModalHeader>
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <Text
              fontSize={{ base: "18px", md: "20px" }}
              fontFamily="Work sans"
              textAlign={"center"}
            >
              Ads
            </Text>
          </ModalBody>
          <ModalFooter display={"flex"}></ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
export default Ads;
