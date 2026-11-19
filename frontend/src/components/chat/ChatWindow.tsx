import React from "react";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import type { Message, Participant } from "./types";

interface ChatWindowProps {
  activeParticipant?: Participant;
  messages: Message[];
  onSendMessage: (text: string) => void;
  isConnected: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  activeParticipant,
  messages,
  onSendMessage,
  isConnected,
}) => {
  return (
    <main className="flex-1 h-full flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
      {/* Top Header */}
      <ChatHeader participant={activeParticipant} isConnected={isConnected} />

      {/* Message History Area */}
      <MessageList messages={messages} activeParticipant={activeParticipant} />

      {/* Bottom Message Input Box */}
      <ChatInput
        onSendMessage={onSendMessage}
        disabled={!activeParticipant}
        placeholder={
          activeParticipant
            ? `Message ${activeParticipant.name}...`
            : "Select a participant to chat..."
        }
      />
    </main>
  );
};
