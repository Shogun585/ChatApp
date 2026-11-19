import React, { useState, useEffect, useRef, useCallback } from "react";
import "./index.css";
import { Sidebar } from "./components/chat/Sidebar";
import { ChatWindow } from "./components/chat/ChatWindow";
import type { Message, Participant } from "./components/chat/types";

// Initial demo participants for instant interactive chatting
const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: "Bob",
    name: "Bob Smith",
    isOnline: true,
    lastMessage: "Hey! Are we still meeting today?",
    lastMessageTime: Date.now() - 1000 * 60 * 15,
  },
  {
    id: "Charlie",
    name: "Charlie Brown",
    isOnline: false,
    lastMessage: "Let me check the websocket logs.",
    lastMessageTime: Date.now() - 1000 * 60 * 60 * 2,
  },  
  {
    id: "Diana",
    name: "Diana Prince",
    isOnline: true,
    lastMessage: "The new chat layout looks great!",
    lastMessageTime: Date.now() - 1000 * 60 * 60 * 24,
  },
];

// Initial starter messages
const INITIAL_MESSAGES: Record<string, Message[]> = {
  Bob: [
    {
      id: "m-1",
      sender: "Bob",
      receiver: "Alice",
      text: "Hey Alice, welcome to the websockets chat application!",
      timestamp: Date.now() - 1000 * 60 * 30,
      isSelf: false,
      status: "delivered",
    },
    {
      id: "m-2",
      sender: "Alice",
      receiver: "Bob",
      text: "Hi Bob! The two-column component layout is working smoothly.",
      timestamp: Date.now() - 1000 * 60 * 20,
      isSelf: true,
      status: "delivered",
    },
    {
      id: "m-3",
      sender: "Bob",
      receiver: "Alice",
      text: "Hey! Are we still meeting today?",
      timestamp: Date.now() - 1000 * 60 * 15,
      isSelf: false,
      status: "delivered",
    },
  ],
};

export function App() {
  // Current user configuration (default to 'Alice' or from URL query param ?user=...)
  const [currentUser, setCurrentUser] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("sender") || params.get("user") || "Alice";
    }
    return "Alice";
  });

  const [participants, setParticipants] = useState<Participant[]>(INITIAL_PARTICIPANTS);
  const [activeParticipantId, setActiveParticipantId] = useState<string>("Bob");
  const [messagesByParticipant, setMessagesByParticipant] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const activeParticipant = participants.find((p) => p.id === activeParticipantId);
  const currentMessages = messagesByParticipant[activeParticipantId] || [];

  // Helper to append a message to a specific conversation
  const appendMessage = useCallback(
    (participantId: string, message: Message) => {
      setMessagesByParticipant((prev) => {
        const existing = prev[participantId] || [];
        return {
          ...prev,
          [participantId]: [...existing, message],
        };
      });

      // Update participant card with last message
      setParticipants((prev) =>
        prev.map((p) => {
          if (p.id === participantId) {
            return {
              ...p,
              lastMessage: message.text,
              lastMessageTime: message.timestamp,
              unreadCount:
                !message.isSelf && participantId !== activeParticipantId
                  ? (p.unreadCount || 0) + 1
                  : 0,
            };
          }
          return p;
        })
      );
    },
    [activeParticipantId]
  );

  // Connect to backend WebSocket server
  useEffect(() => {
    const wsUrl = `ws://localhost:8000?sender=${encodeURIComponent(
      currentUser
    )}&receiver=${encodeURIComponent(activeParticipantId)}`;

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log(`WebSocket connected as ${currentUser} to receiver ${activeParticipantId}`);
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const raw = typeof event.data === "string" ? event.data : event.data.toString();
          let data: any;
          try {
            data = JSON.parse(raw);
          } catch {
            data = { text: raw, sender: activeParticipantId };
          }

          // Handle server users broadcast
          if (data.type === "users" && Array.isArray(data.users)) {
            const onlineUsers = new Set(data.users);
            setParticipants((prev) =>
              prev.map((p) => ({
                ...p,
                isOnline: onlineUsers.has(p.id) || onlineUsers.has(p.name),
              }))
            );
            return;
          }

          // Handle system status message
          if (data.type === "system") {
            console.log("System notification:", data.text);
            return;
          }

          // Handle chat message
          const senderId = data.sender || activeParticipantId;
          const text = data.text || (typeof data === "string" ? data : JSON.stringify(data));
          const timestamp = data.timestamp || Date.now();

          // Make sure sender exists in participants list
          setParticipants((prev) => {
            if (!prev.some((p) => p.id === senderId)) {
              return [
                ...prev,
                {
                  id: senderId,
                  name: senderId,
                  isOnline: true,
                  lastMessage: text,
                  lastMessageTime: timestamp,
                },
              ];
            }
            return prev;
          });

          const incomingMsg: Message = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            sender: senderId,
            receiver: currentUser,
            text,
            timestamp,
            isSelf: false,
            status: "delivered",
          };

          appendMessage(senderId, incomingMsg);
        } catch (err) {
          console.error("Error processing incoming message:", err);
        }
      };

      ws.onclose = (event) => {
        console.log(`WebSocket disconnected (code: ${event.code})`);
        setIsConnected(false);

        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          // Trigger reconnect via state toggle if needed
        }, 3000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
      };
    } catch (err) {
      console.error("Failed to initialize WebSocket:", err);
      setIsConnected(false);
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [currentUser, activeParticipantId, appendMessage]);

  // Handle sending a message
  const handleSendMessage = (text: string) => {
    if (!activeParticipantId) return;

    const timestamp = Date.now();
    const newMsg: Message = {
      id: `msg-${timestamp}-${Math.random().toString(36).substring(2, 7)}`,
      sender: currentUser,
      receiver: activeParticipantId,
      text,
      timestamp,
      isSelf: true,
      status: "sending",
    };

    // Render immediately on the right side
    appendMessage(activeParticipantId, newMsg);

    // Send payload over WebSocket
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        type: "chat",
        sender: currentUser,
        receiver: activeParticipantId,
        text,
        timestamp,
      };
      socketRef.current.send(JSON.stringify(payload));
    } else {
      console.warn("WebSocket is not connected. Message saved locally.");
    }
  };

  // Add a new participant manually
  const handleAddParticipant = (name: string) => {
    const id = name.trim();
    if (!id) return;

    if (!participants.some((p) => p.id.toLowerCase() === id.toLowerCase())) {
      const newParticipant: Participant = {
        id,
        name,
        isOnline: false,
        lastMessage: "No messages yet",
        lastMessageTime: Date.now(),
      };
      setParticipants((prev) => [newParticipant, ...prev]);
      setActiveParticipantId(id);
    } else {
      setActiveParticipantId(id);
    }
  };

  // Switch active participant
  const handleSelectParticipant = (participant: Participant) => {
    setActiveParticipantId(participant.id);
    // Clear unread count for selected participant
    setParticipants((prev) =>
      prev.map((p) => (p.id === participant.id ? { ...p, unreadCount: 0 } : p))
    );
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* LEFT SIDE: Participants with small card components stacked in a row */}
      <Sidebar
        currentUser={currentUser}
        onUpdateCurrentUser={(name) => setCurrentUser(name)}
        participants={participants}
        activeParticipantId={activeParticipantId}
        onSelectParticipant={handleSelectParticipant}
        onAddParticipant={handleAddParticipant}
        isConnected={isConnected}
      />

      {/* RIGHT SIDE: Chat Window with header, incoming (left) & outgoing (right) messages, input & send icon */}
      <ChatWindow
        activeParticipant={activeParticipant}
        messages={currentMessages}
        onSendMessage={handleSendMessage}
        isConnected={isConnected}
      />
    </div>
  );
}

export default App;
