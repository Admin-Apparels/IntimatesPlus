// import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Input, Box, Heading } from "@chakra-ui/react";
import { faPhone, faVideo } from "@fortawesome/free-solid-svg-icons";
import ActionButton from "./ActionButton";
// import { socket } from "../Communication";
import { useParams } from "react-router-dom";
import { ChatState } from "../components/Context/ChatProvider";

// function useClientID() {
//   const [clientID, setClientID] = useState("");

//   useEffect(() => {
//     socket.on("init", ({ id }) => {
//       document.title = `${id} - VideoCall`;
//       setClientID(id);
//     });
//   }, []);

//   return clientID;
// }

function MainWindow({ startCall }) {
  // const clientID = useClientID();
  const { user } = ChatState();
  const { receiver } = useParams();

  /**
   * Start the call with or without video
   * @param {Boolean} video
   */
  const callWithVideo = (video) => {
    const config = { audio: true, video };
    return () => {
      if (receiver) {
        startCall(true, receiver, config);
      }
    };
  };

  return (
    <Box className="container main-window">
      <Box>
        <Heading as="h3" fontSize="xl" mb="4">
          Hi, your ID is
          <Input
            type="text"
            className="txt-clientId"
            defaultValue={user?._id}
            readOnly
          />
        </Heading>
        <Heading as="h4" fontSize="md" mb="4">
          Get started by calling a friend below
        </Heading>
      </Box>
      <Box>
        <Input
          type="text"
          className="txt-clientId"
          placeholder="Your friend ID"
          defaultValue={receiver}
          readOnly
        />
        <Box
          display={"flex"}
          justifyContent={"space-evenly"}
          alignItems={"center"}
          width={"100%"}
          p={"3"}
        >
          <ActionButton icon={faVideo} onClick={callWithVideo(true)}>
            Video Call
          </ActionButton>
          <ActionButton icon={faPhone} onClick={callWithVideo(false)}>
            Voice Call
          </ActionButton>
        </Box>
      </Box>
    </Box>
  );
}

MainWindow.propTypes = {
  startCall: PropTypes.func.isRequired,
};

export default MainWindow;
