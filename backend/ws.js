const WebSocket = require("ws");

// Create a WebSocket server
const wss = new WebSocket.Server({ port: 3000 });

// Event listener for when a client connects
wss.on("connection", function connection(ws) {
  console.log("Client connected");

  // Event listener for when a client sends a message
  ws.on("message", function incoming(message) {
    console.log("Received message:", message);

    // Broadcast the received message to all connected clients
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Event listener for when a client disconnects
  ws.on("close", function close() {
    console.log("Client disconnected");
  });
});
