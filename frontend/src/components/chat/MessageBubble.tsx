import React from "react";
import { User, Check, CheckCheck } from "lucide-react";
import type { Message } from "./types";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isSelf = message.isSelf;
  const timeString = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`w-full flex items-end gap-2 my-2 ${
        isSelf ? "justify-end" : "justify-start"
      }`}
    >
      {/* Incoming message: Show blank profile picture icon on the left */}
      {!isSelf && (
        <div
          className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mb-1 shadow-xs border border-slate-300/60 dark:border-slate-600"
          title={message.sender}
        >
          <User className="w-4 h-4" />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={`max-w-[75%] sm:max-w-[65%] md:max-w-[55%] flex flex-col ${
          isSelf ? "items-end" : "items-start"
        }`}
      >
        {/* Sender name for received messages */}
        {!isSelf && (
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 ml-1 mb-1">
            {message.sender}
          </span>
        )}

        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-sm ${
            isSelf
              ? "bg-emerald-600 text-white rounded-br-xs selection:bg-emerald-800"
              : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
          }`}
        >
          {message.text}
        </div>

        {/* Timestamp and delivery checkmark */}
        <div
          className={`flex items-center gap-1 text-[10px] mt-1 px-1 ${
            isSelf ? "text-slate-400 dark:text-slate-500" : "text-slate-400 dark:text-slate-500"
          }`}
        >
          <span>{timeString}</span>
          {isSelf && (
            <span>
              {message.status === "delivered" ? (
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Check className="w-3.5 h-3.5 text-slate-400" />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Outgoing message: Optional profile icon on the right */}
      {isSelf && (
        <div
          className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mb-1 border border-emerald-300 dark:border-emerald-800 shadow-xs"
          title="You"
        >
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
