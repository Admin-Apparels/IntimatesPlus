import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
} from "@chakra-ui/react";
import { PiProhibitInset } from "react-icons/pi";

const Notifier = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(10px) hue-rotate(90deg)"
      />
      <ModalContent>
        <ModalHeader
          background={"red.500"}
          textColor={"white"}
          textAlign={"center"}
        >
          Chat Flagged
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <PiProhibitInset color="red" fontSize={"2rem"} />
          <Text
            alignItems="center"
            fontSize={"larger"}
            fontWeight={"bold"}
            mb={2}
          >
            Attempt to share contact information or set a date was detected.
          </Text>
          <Text textAlign="center" mb={2}>
            Since you are not subscribed, your chats will remain open with the
            other user, but you will not be able to view or respond to them.
          </Text>
          <Text textAlign="center" mb={4}>
            To subscribe and enjoy a seamless experience, click the button
            below.
          </Text>
        </ModalBody>

        <ModalFooter
          display={"flex"}
          flexDir={"column"}
          justifyContent="center"
        >
          <Button
            colorScheme="blue"
            mr={3}
            onClick={() => {
              onClose();
              navigate("/paycheck");
            }}
          >
            Subscribe
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Notifier;
