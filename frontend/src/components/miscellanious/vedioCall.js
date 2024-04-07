import React, { useState, useRef, useEffect } from "react";
import Peer from "simple-peer";
import {
  Box,
  Button,
  Container,
  Grid,
  GridItem,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useConnectSocket } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";

const VideoCall = ({ userId, otherUserId }) => {
  const [stream, setStream] = useState(null);
  const [me, setMe] = useState("");
  const [call, setCall] = useState({});
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [Name, setName] = useState("");
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const { user } = ChatState();
  const socket = useConnectSocket(user?.token);

  useEffect(() => {
    if (!socket) {
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        myVideo.current.srcObject = currentStream;
      });

    socket.on("me", (id) => setMe(id));

    socket.on("calluser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivedCall: true, from, name: callerName, signal });
    });
  }, [socket, setCall, setStream]);

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream: stream });

    peer.on("signal", (data) => {
      socket.emit("answercall", { signal: data, to: call.from });
    });

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  const callUser = () => {
    const peer = new Peer({ initiator: true, trickle: false, stream: stream });

    peer.on("signal", (data) => {
      socket.emit("calluser", {
        userToCall: otherUserId._id,
        signalData: data,
        from: userId,
        name: Name,
      });
    });

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    socket.on("callaccepted", (signal) => {
      setCallAccepted(true);

      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);

    connectionRef.current.destroy();

    window.location.reload();
  };

  return (
    <Container>
      <Box>
        <Text fontSize="2xl" align="center">
          Video Chat
        </Text>
      </Box>

      <Grid container>
        <GridItem item xs={12} md={6}>
          <Box>
            <Text fontSize="xl" marginBottom={2}>
              Me
            </Text>
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              style={{ borderRadius: 20 }}
            />
          </Box>
        </GridItem>
        <GridItem item xs={12} md={6}>
          <Box>
            <Text fontSize="xl" marginBottom={2}>
              {otherUserId.name}
            </Text>
            <video playsInline ref={userVideo} autoPlay />
          </Box>
        </GridItem>
      </Grid>

      <Grid container>
        <Grid item xs={12} md={6}>
          <Button
            variant="contained"
            colorScheme="blue"
            onClick={callUser}
            background={"green"}
          >
            Call
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          {call.isReceivedCall && !callAccepted && (
            <Box>
              <Text>{call.name} is calling:</Text>
              <Button
                variant="contained"
                colorScheme="blue"
                onClick={answerCall}
                background={"green"}
              >
                Answer
              </Button>
            </Box>
          )}
          {callAccepted && !callEnded && (
            <Button
              variant="contained"
              colorScheme="red"
              onClick={leaveCall}
              background={"red"}
            >
              Hang Up
            </Button>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default VideoCall;
