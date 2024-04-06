import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import {
  Button,
  Container,
  TextField,
  Grid,
  Typography,
  Paper,
  AppBar,
} from "@mui/material";
import { Textarea } from "@chakra-ui/react";

const socket = io("https://ad-video-call-app.herokuapp.com/");

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

  useEffect(() => {
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
  }, []);

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
      <AppBar position="static" color="inherit">
        <Typography variant="h2" align="center">
          Video Chat
        </Typography>
      </AppBar>

      <Grid container>
        <Grid item xs={12} md={6}>
          <Paper>
            <Typography variant="h5" gutterBottom>
              {Name || "Name"}
            </Typography>
            <video playsInline muted ref={myVideo} autoPlay />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper>
            <Typography variant="h5" gutterBottom>
              {call.name || "Name"}
            </Typography>
            <video playsInline ref={userVideo} autoPlay />
          </Paper>
        </Grid>
      </Grid>

      <Grid container>
        <Grid item xs={12} md={6}>
          <Textarea
            label="Name"
            value={otherUserId.name}
            onChange={(e) => setName(e.target.value)}
            isDisabled
            fullWidth
          />
          <Button variant="contained" color="primary" onClick={callUser}>
            Call
          </Button>
        </Grid>
        <Grid item xs={12} md={6}>
          {call.isReceivedCall && !callAccepted && (
            <div>
              <Typography>{call.name} is calling:</Typography>
              <Button variant="contained" color="primary" onClick={answerCall}>
                Answer
              </Button>
            </div>
          )}
          {callAccepted && !callEnded && (
            <Button variant="contained" color="secondary" onClick={leaveCall}>
              Hang Up
            </Button>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default VideoCall;
