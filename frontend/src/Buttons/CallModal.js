import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@chakra-ui/react";
import { faPhone, faVideo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ActionButton from "./ActionButton";

function CallModal({
  isOpen,
  onClose,
  status,
  callFrom,
  startCall,
  rejectCall,
}) {
  const acceptWithVideo = (video) => {
    const config = { audio: true, video };
    return () => startCall(false, callFrom, config);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xs">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{`${callFrom} is calling`}</ModalHeader>
        <ModalBody>
          <ActionButton icon={faVideo} onClick={acceptWithVideo(true)} />
          <ActionButton icon={faPhone} onClick={acceptWithVideo(false)} />
          <Button variant="outline" colorScheme="red" onClick={rejectCall}>
            <FontAwesomeIcon icon={faPhone} /> Reject Call
          </Button>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default CallModal;
