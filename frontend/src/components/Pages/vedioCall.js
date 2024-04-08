import React, { useState, useRef, useEffect } from "react";
import Peer from "simple-peer";
import { Box, Button, Container, Grid, GridItem, Text } from "@chakra-ui/react";
import { useConnectSocket } from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import { useParams } from "react-router-dom";

const VideoCall = () => {
  const [stream, setStream] = useState(null);
  const [call, setCall] = useState({});
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [Name, setName] = useState("");
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const { receiver } = useParams();

  const otherUser = JSON.parse(receiver);

  const { user } = ChatState();

  const socket = useConnectSocket(user?.token);

  console.log(user.token, socket);

  useEffect(() => {
    if (!socket) {
      return;
    }
    console.log(socket);

    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      });

    socket.on("callusering", ({ from, name: callerName, signal }) => {
      console.log("we have something!");
      setCall({ isReceivedCall: true, from, name: callerName, signal });
    });
    socket.on("call initiated", () => {
      console.log("WE ahave emit here ");
    });
    return () => {
      socket.off("callusering");
    };
  }, [socket]);

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
        userToCall: otherUser._id,
        signalData: data,
        from: user._id,
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
    <Container
      background={"white"}
      overflow={"scroll"}
      border={"2px solid purple"}
      borderRadius={20}
    >
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
              {otherUser.name}
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
        <Box display={"flex"}>
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
        </Box>
      </Grid>
    </Container>
  );
};

export default VideoCall;
