import React, { useEffect, useRef } from "react";
import { MessageSquare, MessageCircle } from "lucide-react";
import { MessageBubble } from "./MessageBubble";
import type { Message, Participant } from "./types";

interface MessageListProps {
  messages: Message[];
  activeParticipant?: Participant;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  activeParticipant,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!activeParticipant) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-950/30">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-base">
          No conversation selected
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Select a participant from the left sidebar to start messaging.
        </p>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-950/30">
        <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
          <MessageCircle className="w-7 h-7" />
        </div>
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
          No messages with {activeParticipant.name} yet
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Send a message below to start the conversation!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-1 bg-slate-50/50 dark:bg-slate-950/30">
      <div className="flex justify-center my-2">
        <span className="text-[11px] font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full">
          Chat started with {activeParticipant.name}
        </span>
      </div>

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      <div ref={bottomRef} />
    </div>
  );
};
