import { WebSocketServer, WebSocket } from "ws";

interface ChatPayload {
  type?: string;
  sender?: string;
  receiver?: string;
  text?: string;
  timestamp?: number;
  [key: string]: any;
}

// Map to store connected clients: userId -> WebSocket
const clients: Map<string, WebSocket> = new Map();

// Helper to broadcast online participants list to all connected clients
function broadcastOnlineUsers() {
  const users = Array.from(clients.keys());
  const payload = JSON.stringify({
    type: "users",
    users,
  });

  for (const client of clients.values()) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// Helper to safely send message to a specific user without double-stringifying
function sendToUser(userId: string, data: string | object): boolean {
  const ws = clients.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    ws.send(payload);
    return true;
  }
  return false;
}

const PORT = 8000;
const wss = new WebSocketServer({ port: PORT });
console.log(`[WS Server] Chat WebSocket server running on port ${PORT}`);

wss.on("connection", function (socket: WebSocket, req) {
  // Create a parsed URL to read query params
  const parsedUrl = new URL(req.url || "", `http://${req.headers.host || "localhost"}`);

  // Extract sender & receiver ID from query params
  const senderId = parsedUrl.searchParams.get("sender") || parsedUrl.searchParams.get("userId");
  const defaultReceiverId = parsedUrl.searchParams.get("receiver");

  console.log(`[WS Server] Incoming connection attempt. sender: ${senderId}, receiver: ${defaultReceiverId}`);

  if (!senderId) {
    socket.close(4004, "Missing sender or userId parameter");
    return;
  }

  // Register sender socket in active clients map
  clients.set(senderId, socket);
  console.log(`[WS Server] Connection established for user: ${senderId}`);

  // Send initial connection acknowledgment to client
  socket.send(
    JSON.stringify({
      type: "system",
      text: `Connected to chat server as ${senderId}`,
      currentUser: senderId,
      timestamp: Date.now(),
    })
  );

  // Broadcast updated online users list
  broadcastOnlineUsers();

  socket.on("message", (data: WebSocket.RawData) => {
    const rawString = data.toString();
    console.log(`[WS Server] Received message from ${senderId}:`, rawString);

    let targetReceiver = defaultReceiverId;
    let messagePayload: ChatPayload;

    // Parse incoming payload (supports both JSON objects and plain text)
    try {
      const parsed = JSON.parse(rawString);
      if (typeof parsed === "object" && parsed !== null) {
        messagePayload = parsed;
        if (parsed.receiver) targetReceiver = parsed.receiver;
      } else {
        messagePayload = {
          type: "chat",
          sender: senderId,
          receiver: targetReceiver || undefined,
          text: rawString,
          timestamp: Date.now(),
        };
      }
    } catch {
      messagePayload = {
        type: "chat",
        sender: senderId,
        receiver: targetReceiver || undefined,
        text: rawString,
        timestamp: Date.now(),
      };
    }

    // Ensure sender & timestamp are always populated
    messagePayload.sender = senderId;
    if (targetReceiver) {
      messagePayload.receiver = targetReceiver;
    }
    if (!messagePayload.timestamp) {
      messagePayload.timestamp = Date.now();
    }
    if (!messagePayload.type) {
      messagePayload.type = "chat";
    }

    if (!targetReceiver) {
      socket.send(
        JSON.stringify({
          type: "system",
          status: "error",
          text: "No receiver specified for the message.",
        })
      );
      return;
    }

    // Check if the receiver is connected to the server
    if (!clients.has(targetReceiver)) {
      console.warn(`[WS Server] Receiver "${targetReceiver}" is not currently connected.`);
      // Send notification back to sender instead of abruptly terminating the sender's socket
      socket.send(
        JSON.stringify({
          type: "system",
          status: "offline",
          text: `User "${targetReceiver}" is currently offline.`,
          receiver: targetReceiver,
        })
      );
      return;
    }

    // Forward message payload to receiver
    sendToUser(targetReceiver, messagePayload);

    // Send acknowledgment back to sender
    socket.send(
      JSON.stringify({
        type: "ack",
        status: "delivered",
        receiver: targetReceiver,
        timestamp: messagePayload.timestamp,
      })
    );
  });

  // Handle socket closure
  socket.on("close", (code, reason) => {
    clients.delete(senderId);
    console.log(`[WS Server] User disconnected: ${senderId} (code: ${code}, reason: ${reason?.toString() || "normal"})`);
    broadcastOnlineUsers();
  });

  socket.on("error", (error) => {
    console.error(`[WS Server] Socket error for user ${senderId}:`, error);
  });
});
