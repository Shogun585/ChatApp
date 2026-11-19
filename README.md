# WebSocket Chat Application

A real-time, bidirectional chat application built with **React 19**, **Tailwind CSS**, **Bun**, and native **WebSockets**. The application features a responsive two-column layout with a participants sidebar on the left and an interactive chat window on the right.

---

## Table of Contents
- [Features](#features)
- [Architecture & How It Works](#architecture--how-it-works)
  - [Frontend Overview](#frontend-overview)
  - [Backend Overview](#backend-overview)
  - [WebSocket Protocol & Message Flow](#websocket-protocol--message-flow)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
- [Running & Testing the Application](#running--testing-the-application)
- [Components Reference](#components-reference)

---

## Features

- **Component-Based UI Architecture**: Modular, cleanly separated React components for participant lists, cards, chat headers, message bubbles, and inputs.
- **Left-Side Participants Sidebar**:
  - Small participant cards containing a blank profile picture (`User` icon) and sender name stacked in a row.
  - Real-time online/offline indicators and unread message counters.
  - In-app switcher to change your active user identity or add new chat participants.
- **Right-Side Chat Window**:
  - **Incoming Messages**: Rendered on the **left side** with neutral styling, sender name, and profile icon.
  - **Outgoing Messages**: Rendered on the **right side** in emerald green with white text and delivery indicators.
  - **Bottom Chat Box**: Text input box with a dedicated send button using the `SendHorizontal` icon. Supports sending via <kbd>Enter</kbd>.
  - **Auto-Scrolling**: Smooth automatic scroll to latest messages.
- **Robust WebSocket Backend**:
  - Direct message routing by user ID.
  - Graceful notifications if a recipient is offline (connections are preserved).
  - Online user status broadcast upon client connection and disconnection.
  - Supports both structured JSON payloads and raw text strings without double-stringification bugs.

---

## Architecture & How It Works

### Frontend Overview
The frontend is built using **React 19** with **Bun**'s native bundler and styled with **Tailwind CSS**.
- When the app loads, it reads `sender` and `receiver` parameters from the URL query string (or defaults to `Alice` chatting with `Bob`).
- An active `WebSocket` instance connects to `ws://localhost:8000?sender=<username>&receiver=<activeParticipant>`.
- Incoming messages are parsed and automatically routed to the corresponding participant conversation history.
- The user can select any participant from the sidebar to switch conversations on the fly.

### Backend Overview
The backend runs a standalone `WebSocketServer` on port `8000`:
- **Client Registry**: Maintains a map of `userId -> WebSocket` (`clients: Map<string, WebSocket>`).
- **Connection Handshake**: Extracts `sender` (or `userId`) and `receiver` query parameters during the HTTP upgrade request.
- **User Discovery**: Broadcasts a `{ type: "users", users: [...] }` payload to all active clients whenever someone connects or disconnects, allowing the frontend to update online indicators automatically.
- **Message Dispatching**: When a client sends a message, the server extracts the target recipient and forwards the payload to that client's socket if connected. If offline, the sender receives a status notification rather than having their connection terminated.

### WebSocket Protocol & Message Flow

```
[ Alice (Browser Tab 1) ]           [ WebSocket Server (:8000) ]           [ Bob (Browser Tab 2) ]
          │                                      │                                    │
          │─────── ws.connect?sender=Alice ─────>│                                    │
          │<────── { type: "system", ... } ──────│                                    │
          │<────── { type: "users", ... } ───────│                                    │
          │                                      │<────── ws.connect?sender=Bob ──────│
          │<────── { type: "users", ... } ───────│─────── { type: "users", ... } ────>│
          │                                      │                                    │
          │── { type: "chat", text: "Hi" } ─────>│                                    │
          │                                      │────── { type: "chat", text: "Hi" }─>│
          │<── { type: "ack", ... } ─────────────│                                    │
```

#### Message Payload Format
```json
{
  "type": "chat",
  "sender": "Alice",
  "receiver": "Bob",
  "text": "Hello, how are you?",
  "timestamp": 1700000000000
}
```

---

## Prerequisites

- [Bun](https://bun.sh/) (version 1.0 or higher recommended)
  *To verify installation:*
  ```bash
  bun --version
  ```

---

## Setup & Installation

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. Start the WebSocket server:
   ```bash
   bun index.ts
   ```
   *The server will start listening on port `8000` (`ws://localhost:8000`).*

---

### 2. Frontend Setup

1. Open a second terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. Start the frontend development server:
   ```bash
   bun run dev
   ```
   *The frontend will run at `http://localhost:3000`.*

---

## Running & Testing the Application

To test real-time two-way messaging between two users:

1. **Open Browser Tab 1 (Alice):**
   Navigate to:
   ```
   http://localhost:3000/?sender=Alice&receiver=Bob
   ```
   *Logged in as **Alice**, connected to **Bob**.*

2. **Open Browser Tab 2 (Bob):**
   In an incognito window or separate browser tab, navigate to:
   ```
   http://localhost:3000/?sender=Bob&receiver=Alice
   ```
   *Logged in as **Bob**, connected to **Alice**.*

3. **Verify the Interactions:**
   - On the left sidebar, verify that **Bob** is listed in Alice's tab with a green online dot, and **Alice** is listed in Bob's tab.
   - Send a message from Tab 1:
     - In Tab 1 (Alice), the message renders on the **right side** in emerald green.
     - In Tab 2 (Bob), the message renders on the **left side** in neutral white/slate with Alice's name and avatar.
   - Reply from Tab 2 (Bob) and watch the incoming message appear on the left in Tab 1 immediately.

---

## Components Reference

| Component | Path | Responsibility |
|---|---|---|
| `App` | `frontend/src/App.tsx` | Root container managing active chat state, message history, and WebSocket lifecycle. |
| `Sidebar` | `frontend/src/components/chat/Sidebar.tsx` | Left-hand sidebar containing user profile info, online badge, search/add participant controls, and the list of cards. |
| `ParticipantCard` | `frontend/src/components/chat/ParticipantCard.tsx` | Card representing a single contact with blank profile circle (`User` icon) and name stacked in a row. |
| `ChatWindow` | `frontend/src/components/chat/ChatWindow.tsx` | Right-hand container combining `ChatHeader`, `MessageList`, and `ChatInput`. |
| `ChatHeader` | `frontend/src/components/chat/ChatHeader.tsx` | Displays current active contact info, status badge, and call/action buttons. |
| `MessageList` | `frontend/src/components/chat/MessageList.tsx` | Scrollable container with empty state handling and smooth auto-scrolling to the bottom. |
| `MessageBubble` | `frontend/src/components/chat/MessageBubble.tsx` | Renders sent messages on the right and received messages on the left with timestamps and checkmarks. |
| `ChatInput` | `frontend/src/components/chat/ChatInput.tsx` | Input bar with placeholder and submit button utilizing `SendHorizontal` icon from `lucide-react`. |
| `types` | `frontend/src/components/chat/types.ts` | Data models for `Message` and `Participant`. |
