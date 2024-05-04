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

const Notifier = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const OverlayOne = () => (
    <ModalOverlay
      bg="blackAlpha.300"
      backdropFilter="blur(10px) hue-rotate(90deg)"
    />
  );
  const overlay = React.useState(<OverlayOne />);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {overlay}
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
          <Text textAlign="center" mb={4}>
            Since you are not subscribed, your chats will remain open with the
            other user but you will not be able to open them.
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
