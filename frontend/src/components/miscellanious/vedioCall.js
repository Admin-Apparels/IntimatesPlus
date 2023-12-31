import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import { Box, Button, useToast } from '@chakra-ui/react';
import { ChatState } from '../Context/ChatProvider'; // Import ChatState

const VideoCall = ({ userId, otherUserId }) => {
    const { socket } = ChatState(); // Use socket from ChatState
    const userVideo = useRef();
    const otherUserVideo = useRef();
    const peerRef = useRef();
    const [isCallStarted, setIsCallStarted] = useState(false);
    const toast = useToast();

    useEffect(() => {
        const roomId = createRoomId(userId, otherUserId);

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;
            socket.emit('join room', roomId);

            socket.on('other user', otherUserId => {
                const peer = createPeer(otherUserId, socket.id, stream);
                peerRef.current = peer;
                setIsCallStarted(true);
            });

            socket.on('user joined', payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peerRef.current = peer;
                setIsCallStarted(true);
            });

            socket.on('signal', payload => {
                peerRef.current.signal(payload.signal);
            });

            peerRef.current?.on('stream', otherStream => {
                otherUserVideo.current.srcObject = otherStream;
            });
        });
        socket.emit('call initiated', roomId);
        socket.on('call ended', () => {
          console.log("The other user has hung up");
          toast({
              title: "Call Ended",
              description: "The other user has hung up.",
              status: "info",
              duration: 5000,
              isClosable: true,
          });
         
      });
  
   
      socket.on('ringing', () => {
          toast({
              title: "Ringing",
              description: "Waiting for the other user to pick up...",
              status: "info",
              duration: null, 
              isClosable: true,
          });
      });
  
  
      socket.on('connecting', () => {
          toast({
              title: "Connecting",
              description: "Establishing connection with the other user...",
              status: "info",
              duration: null,
              isClosable: true,
          });
      });

        function createRoomId(userId1, userId2) {
            return [userId1, userId2].sort().join('_');
        }

        function createPeer(otherUserId, myId, stream) {
            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream,
            });

            peer.on('signal', signal => {
                socket.emit('signal', { to: otherUserId, from: myId, signal, room: roomId });
            });

            return peer;
        }

        function addPeer(incomingSignal, callerId, stream) {
            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream,
            });

            peer.on('signal', signal => {
                socket.emit('signal', { to: callerId, from: socket.id, signal, room: roomId });
            });

            peer.signal(incomingSignal);

            return peer;
        }

        return () => {
          socket.emit('leave room', roomId);
          socket.off('call ended');
          socket.off('ringing');
          socket.off('connecting');
          peerRef.current?.destroy();
        };
    }, [userId, otherUserId, socket, toast]);

    const endCall = () => {
        peerRef.current?.destroy();
        socket.emit('endCall');
        setIsCallStarted(false);
    };
    const videoStyle = {
      display: "flex",
      maxWidth: '100vw',     
      maxHeight: '100vh',   
      objectFit: 'contain',
      left: "-120px"
     
  };
  
  

    return (
      <Box display={"flex"} justifyContent={"center"} alignItems={"center"} position={"relative"} width={"100vw"} overflow={"hidden"}>
      <video ref={userVideo} autoPlay playsInline muted style={videoStyle} />
      <video ref={otherUserVideo} autoPlay playsInline style={videoStyle} />
    
      <Button position={"absolute"} backgroundColor={"red"} bottom={1} marginRight={"-100px"} onClick={endCall}>Hang Up</Button>
  </Box>
  
  
    );
};

export default VideoCall;
