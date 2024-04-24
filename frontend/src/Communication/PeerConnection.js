import Peer from "simple-peer";

class PeerConnection {
  constructor(receiverId, localStream, setRemoteStream) {
    this.receiverId = receiverId;
    this.localStream = localStream;
    this.setRemoteStream = setRemoteStream;
    this.peer = null;
  }

  startCall() {
    if (!this.receiverId || !this.localStream) {
      console.error("Receiver ID or local stream not provided.");
      return;
    }

    this.peer = new Peer({
      initiator: true,
      stream: this.localStream,
    });

    this.peer.on("signal", (data) => {
      // Send call request to the receiver
      // You may need to implement your signaling mechanism here
      console.log("Sending call request to", this.receiverId);
    });

    this.peer.on("stream", (remoteStream) => {
      // Handle incoming stream from the receiver
      this.setRemoteStream(remoteStream);
    });
  }

  answerCall(callerId, signalData) {
    if (callerId !== this.receiverId) {
      console.error("Received call from unexpected caller.");
      return;
    }

    this.peer = new Peer({
      initiator: false,
      stream: this.localStream,
    });

    this.peer.on("signal", (data) => {
      // Send signal to the caller
      // You may need to implement your signaling mechanism here
      console.log("Sending signal to", callerId);
    });

    this.peer.on("stream", (remoteStream) => {
      // Handle incoming stream from the caller
      this.setRemoteStream(remoteStream);
    });

    // Signal the peer with the received signal data
    this.peer.signal(signalData);
  }

  endCall() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }
}

export default PeerConnection;
