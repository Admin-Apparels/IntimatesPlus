import React, { useState, useEffect, useCallback } from "react";
import { socket, PeerConnection } from "../Communication";
import MainWindow from "../Buttons/MainWindow";
import CallWindow from "../Buttons/CallWindow";
import CallModal from "../Buttons/CallModal";
import { Box, Text } from "@chakra-ui/react";

function VideoCall() {
  const [callWindow, setCallWindow] = useState("");
  const [callModal, setCallModal] = useState("");
  const [callFrom, setCallFrom] = useState("");
  const [localSrc, setLocalSrc] = useState(null);
  const [peerSrc, setPeerSrc] = useState(null);
  const [pc, setPc] = useState({});
  const [config, setConfig] = useState(null);

  const endCall = useCallback(
    (isStarter) => {
      if (pc && pc.stop) {
        pc.stop(isStarter);
      }
      setPc({});
      setConfig(null);
      setCallWindow("");
      setCallModal("");
      setLocalSrc(null);
      setPeerSrc(null);
    },
    [pc, setPc, setConfig, setCallWindow, setCallModal, setLocalSrc, setPeerSrc]
  );

  useEffect(() => {
    socket
      .on("request", ({ from: callFrom }) => {
        setCallModal("active");
        setCallFrom(callFrom);
      })
      .on("call", (data) => {
        if (data.sdp) {
          pc.setRemoteDescription(data.sdp);
          if (data.sdp.type === "offer") pc.createAnswer();
        } else pc.addIceCandidate(data.candidate);
      })
      .on("end", () => endCall(false))
      .emit("init");

    return () => {
      if (pc && pc.stop) {
        pc.stop(false);
      }
    };
  }, [pc, endCall]);

  const startCall = (isCaller, friendID, newConfig) => {
    setConfig(newConfig);
    const newPc = new PeerConnection(friendID)
      .on("localStream", (src) => {
        const newState = { callWindow: "active", localSrc: src };
        if (!isCaller) newState.callModal = "";
        setCallWindow(newState.callWindow);
        setLocalSrc(newState.localSrc);
        if (!isCaller) setCallModal(newState.callModal);
      })
      .on("peerStream", (src) => setPeerSrc(src))
      .start(isCaller);

    setPc(newPc);
  };

  const rejectCall = () => {
    socket.emit("end", { to: callFrom });
    setCallModal("");
  };

  return (
    <Box
      display={"flex"}
      flexDir={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      width={"100%"}
      background={"wheat"}
    >
      <Text textAlign={"center"} p={1} width={"70%"}>
        We're making improvements! Stay tuned for updates on this feature. Thank
        you for your understanding.
      </Text>
      <Box
        border={"1px solid purple"}
        p={"6"}
        overflow={"auto"}
        borderRadius={20}
      >
        <MainWindow startCall={startCall} />
        {config && (
          <CallWindow
            status={callWindow}
            localSrc={localSrc}
            peerSrc={peerSrc}
            config={config}
            mediaDevice={pc.mediaDevice}
            endCall={endCall}
          />
        )}
        <CallModal
          status={callModal}
          startCall={startCall}
          rejectCall={rejectCall}
          callFrom={callFrom}
        />
      </Box>
    </Box>
  );
}

export default VideoCall;
