import React from "react";
import { User } from "lucide-react";
import type { Participant } from "./types";

interface ParticipantCardProps {
  participant: Participant;
  isActive: boolean;
  onSelect: (participant: Participant) => void;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  isActive,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(participant)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onSelect(participant);
        }
      }}
      className={`group w-full flex items-center gap-3.5 p-3 rounded-xl cursor-pointer transition-all duration-200 select-none border ${
        isActive
          ? "bg-emerald-50 border-emerald-400 shadow-md shadow-emerald-100 dark:bg-emerald-950/40 dark:border-emerald-600 dark:shadow-none"
          : "bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300 shadow-sm hover:shadow dark:bg-slate-900 dark:border-slate-800 dark:hover:bg-slate-800/80"
      }`}
    >
      {/* Blank profile picture with icon */}
      <div className="relative shrink-0">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors border shadow-inner ${
            isActive
              ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-300 dark:border-emerald-700"
              : "bg-slate-100 text-slate-500 border-slate-200 group-hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
          }`}
        >
          <User className="w-6 h-6 stroke-[1.75]" />
        </div>
        {/* Online status indicator */}
        <span
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
            participant.isOnline ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
          }`}
          title={participant.isOnline ? "Online" : "Offline"}
        />
      </div>

      {/* Participant Name and status stacked in a row / column details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <h4
            className={`font-semibold text-sm truncate ${
              isActive
                ? "text-emerald-950 dark:text-emerald-200 font-bold"
                : "text-slate-800 dark:text-slate-100"
            }`}
          >
            {participant.name}
          </h4>
          {participant.lastMessageTime && (
            <span className="text-[11px] text-slate-400 shrink-0">
              {new Date(participant.lastMessageTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-1 mt-0.5">
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {participant.lastMessage || (participant.isOnline ? "Active now" : "Offline")}
          </p>
          {Boolean(participant.unreadCount && participant.unreadCount > 0) && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded-full min-w-4 text-center">
              {participant.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
