import React, { useCallback, useEffect, useRef } from 'react';
import Peer from 'simple-peer';
import { Box, Button, useToast } from '@chakra-ui/react';
import { ChatState } from '../Context/ChatProvider';

const VideoCall = ({ userId, otherUserId}) => {
    const { socket, setIsCallStarted } = ChatState();
    const userVideo = useRef();
    const otherUserVideo = useRef();
    const peerRef = useRef();
    const toast = useToast();

    const endCall = useCallback(() => {
        if (userVideo.current && userVideo.current.srcObject) {
            userVideo.current.srcObject.getTracks().forEach(track => track.stop());
            userVideo.current.srcObject = null;
        }

        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }

        if (otherUserVideo.current) {
            otherUserVideo.current.srcObject = null;
        }

        socket.emit('endCall');
        setIsCallStarted(false);
    }, [socket, setIsCallStarted]);

    useEffect(() => {
        const roomId = createRoomId(userId, otherUserId);
      

        function createPeer(otherUserId, myId, stream, roomId) {
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
    
        function addPeer(incomingSignal, callerId, stream, roomId) {
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
    
        const handleStreamObtained = stream => {
            userVideo.current.srcObject = stream;
            socket.emit('join room', roomId);
    
            socket.on('other user', otherUserId => {
                const peer = createPeer(otherUserId, socket.id, stream, roomId);
                peerRef.current = peer;
                setIsCallStarted(true);
            });
        
            socket.on('user joined', payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream, roomId);
                peerRef.current = peer;
                setIsCallStarted(true);
            });
    
            socket.on('signal', payload => {
                peerRef.current.signal(payload.signal);
            });
    
            peerRef.current?.on('stream', otherStream => {
                otherUserVideo.current.srcObject = otherStream;
            });
    
            socket.emit('call initiated', roomId);
        };
    
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(handleStreamObtained)
            .catch(error => {
                console.error("Media Device access error:", error);
               toast({
                title: "Media Device access error",
                duration: 2000,
                position: "bottom",
                isClosable: true
               })
            });
            socket.on('call ended', () => {
                endCall();
                toast({
                    title: "Call Ended",
                    status: "info",
                    duration: 2000,
                    isClosable: true,
                });
            });
    
        socket.on('ringing', () => {
            toast({
                title: "Ringing",
                status: "info",
                duration: 2000,
                isClosable: true,
            });
        });
    
        socket.on('connecting', () => {
            toast({
                title: "Connecting",
                status: "info",
                duration: 2000,
                isClosable: true,
            });
        });
    
        function createRoomId(userId1, userId2) {
            return [userId1, userId2].sort().join('_');
        }
    
    
        return () => {
            socket.emit('leave room', roomId);
            socket.off('call ended');
            socket.off('ringing');
            socket.off('connecting');
            socket.off("user joined");
            socket.off('signal');
            socket.off('other user');
            peerRef.current?.destroy();
        };
    }, [userId, otherUserId, socket, toast, setIsCallStarted,endCall]);
    


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
