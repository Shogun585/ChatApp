import React from "react";
import { User, MoreVertical, Phone, Video } from "lucide-react";
import type { Participant } from "./types";

interface ChatHeaderProps {
  participant?: Participant;
  isConnected: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  participant,
  isConnected,
}) => {
  if (!participant) {
    return (
      <header className="h-18 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
              Chat
            </h2>
            <p className="text-xs text-slate-400">Select a conversation to begin</p>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="h-18 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3.5">
        {/* Profile icon in circle (blank profile picture with icon) */}
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner">
            <User className="w-5 h-5" />
          </div>
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
              participant.isOnline ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
            }`}
            title={participant.isOnline ? "Online" : "Offline"}
          />
        </div>

        <div>
          <h2 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight">
            {participant.name}
          </h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`text-xs flex items-center gap-1 font-medium ${
                participant.isOnline
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  participant.isOnline ? "bg-emerald-500" : "bg-slate-400"
                }`}
              />
              {participant.isOnline ? "Online" : "Offline"}
            </span>
            <span className="text-slate-300 dark:text-slate-700 text-xs">•</span>
            <span className="text-[11px] text-slate-400">
              {isConnected ? "WS Connected" : "Connecting..."}
            </span>
          </div>
        </div>
      </div>

      {/* Decorative / standard action buttons */}
      <div className="flex items-center gap-2 text-slate-400">
        <button
          type="button"
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-500 dark:text-slate-400 hover:text-slate-700"
          title="Voice call (simulated)"
        >
          <Phone className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-500 dark:text-slate-400 hover:text-slate-700"
          title="Video call (simulated)"
        >
          <Video className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-500 dark:text-slate-400 hover:text-slate-700"
          title="More options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
