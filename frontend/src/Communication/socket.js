import io from "socket.io-client";

const socket = io({ path: "/" });

export default socket;
