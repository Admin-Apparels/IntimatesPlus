import React from "react";
import { IconButton } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ActionButton = ({ icon, onClick, disabled }) => {
  return (
    <IconButton
      aria-label="Action Button"
      icon={<FontAwesomeIcon icon={icon} />}
      onClick={onClick}
      disabled={disabled}
      colorScheme="blue"
      isDisabled
    />
  );
};

export default ActionButton;
