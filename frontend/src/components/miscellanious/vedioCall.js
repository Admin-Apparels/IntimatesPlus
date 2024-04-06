import React, { useCallback, useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { Box, Button, useToast } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import { useConnectSocket } from "../config/ChatLogics";

const VideoCall = ({ userId, otherUserId }) => {
  const { setIsCallStarted, IsCallStarted, selectedChat, user } = ChatState();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const userVideoRef = useRef();
  const otherUserVideoRef = useRef();
  const peerRef = useRef();
  const toast = useToast();
  const socket = useConnectSocket(user?.token);
  console.log(socket);

  const endCall = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    socket.emit("endCall", roomId); // Emit endCall event with roomId
    setIsCallStarted(false);
  }, [socket, setIsCallStarted, localStream, remoteStream, roomId]);

  useEffect(() => {
    if (!socket) {
      console.log("Not connected yet");
      return;
    }

    if (IsCallStarted && !selectedChat) {
      endCall();
    }

    let isMounted = true;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (isMounted) {
          setLocalStream(stream);
          userVideoRef.current.srcObject = stream;
        }

        socket.emit("initiate call", {
          callerId: userId,
          recipientId: otherUserId._id,
        });
        socket.on("user busy", (recipientId) => {
          toast({
            title: "User Busy!",
            description: `${recipientId}`,
            status: "info",
          });
        });

        socket.on("call initiated", (roomId) => {
          setRoomId(roomId);
          socket.emit("join room", roomId);
          toast({
            title: "Ringing",
            status: "info",
            duration: 2000,
            isClosable: true,
          });
        });

        socket.on("other user", (data) => {
          const { otherUserId, roomId } = data;
          const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
          });
          peerRef.current = peer;
          peer.on("signal", (signal) => {
            socket.emit("signal", {
              to: otherUserId,
              from: userId,
              signal,
              room: roomId,
            });
          });
          setIsCallStarted(true);
        });

        socket.on("signal", (payload) => {
          const { signal, callerID, room } = payload;
          const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: localStream,
          });
          peerRef.current = peer;
          peer.on("signal", (signal) => {
            socket.emit("signal", {
              to: callerID,
              from: userId,
              signal,
              room: roomId,
            });
          });
          peer.signal(signal);
          setIsCallStarted(true);
        });

        peerRef.current?.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
          otherUserVideoRef.current.srcObject = remoteStream;
        });
      })
      .catch((error) => {
        console.error("Media Device access error:", error);
        toast({
          title: "Media Device access error",
          duration: 2000,
          status: "error",
          position: "bottom",
          isClosable: true,
        });
      });

    socket.on("call ended", () => {
      endCall();
      toast({
        title: "Call Ended",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
    });

    return () => {
      socket.emit("leave room", roomId);
      socket.off("call ended");
      socket.off("initiate call");
      socket.off("user busy");
      socket.off("user joined");
      socket.off("signal");
      socket.off("other user");
      isMounted = false;
      peerRef.current?.destroy();
    };
  }, [
    userId,
    otherUserId,
    socket,
    toast,
    setIsCallStarted,
    endCall,
    localStream,
    roomId,
    IsCallStarted,
    selectedChat,
  ]);

  const videoContainerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    width: "100vw",
    height: "100vh",
    overflow: "hidden",
  };

  const videoStyle = {
    objectFit: "contain",
    width: "50%",
    height: "50%",
  };

  const buttonStyle = {
    position: "absolute",
    bottom: "10px",
    right: "10px",
  };

  return (
    <Box style={videoContainerStyle}>
      <video ref={userVideoRef} autoPlay playsInline muted style={videoStyle} />
      <video ref={otherUserVideoRef} autoPlay playsInline style={videoStyle} />
      <Button onClick={endCall} style={buttonStyle}>
        Hang Up
      </Button>
    </Box>
  );
};

export default VideoCall;
