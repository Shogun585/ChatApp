import React, { useState } from "react";
import { User, Users, Plus, Wifi, WifiOff } from "lucide-react";
import { ParticipantCard } from "./ParticipantCard";
import type { Participant } from "./types";

interface SidebarProps {
  currentUser: string;
  onUpdateCurrentUser: (newUser: string) => void;
  participants: Participant[];
  activeParticipantId: string;
  onSelectParticipant: (participant: Participant) => void;
  onAddParticipant: (name: string) => void;
  isConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  onUpdateCurrentUser,
  participants,
  activeParticipantId,
  onSelectParticipant,
  onAddParticipant,
  isConnected,
}) => {
  const [newParticipantName, setNewParticipantName] = useState("");
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editUserName, setEditUserName] = useState(currentUser);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newParticipantName.trim()) {
      onAddParticipant(newParticipantName.trim());
      setNewParticipantName("");
    }
  };

  const handleUserSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editUserName.trim() && editUserName.trim() !== currentUser) {
      onUpdateCurrentUser(editUserName.trim());
    }
    setIsEditingUser(false);
  };

  return (
    <aside className="w-80 md:w-96 h-full flex flex-col bg-slate-50/80 dark:bg-slate-950/70 border-r border-slate-200 dark:border-slate-800">
      {/* Current User Profile Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setEditUserName(currentUser);
                  setIsEditingUser(!isEditingUser);
                }}
                title="Your profile (click to edit username)"
                className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm hover:ring-2 hover:ring-emerald-400 transition"
              >
                <User className="w-5 h-5" />
              </button>
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                  isConnected ? "bg-emerald-500" : "bg-rose-500 animate-pulse"
                }`}
                title={isConnected ? "Connected to WebSocket" : "Disconnected"}
              />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Logged in as
              </p>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight">
                {currentUser}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {isConnected ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-medium">
                <Wifi className="w-3.5 h-3.5" />
                <span>Live</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 font-medium">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline</span>
              </span>
            )}
          </div>
        </div>

        {/* Optional inline switch username */}
        {isEditingUser && (
          <form onSubmit={handleUserSave} className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={editUserName}
              onChange={(e) => setEditUserName(e.target.value)}
              placeholder="Your username"
              className="flex-1 px-2.5 py-1 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              autoFocus
            />
            <button
              type="submit"
              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition"
            >
              Save
            </button>
          </form>
        )}
      </div>

      {/* Participants Header and Search / Add */}
      <div className="p-3.5 space-y-2 border-b border-slate-200/60 dark:border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Participants</span>
            <span className="text-[11px] font-semibold px-1.5 py-0.2 bg-slate-200 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300">
              {participants.length}
            </span>
          </div>
        </div>

        {/* Quick Add participant */}
        <form onSubmit={handleAddSubmit} className="flex gap-1.5">
          <input
            type="text"
            value={newParticipantName}
            onChange={(e) => setNewParticipantName(e.target.value)}
            placeholder="+ Add participant by name..."
            className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
            title="Add participant"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>

        {/* Filter input if > 3 participants */}
        {participants.length > 3 && (
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search participants..."
            className="w-full px-3 py-1 text-xs rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none"
          />
        )}
      </div>

      {/* Participants Cards List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredParticipants.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center text-slate-400 text-xs px-4">
            <p className="font-medium">No participants yet</p>
            <p className="text-[11px] mt-1 text-slate-400">
              Add someone above or wait for incoming messages.
            </p>
          </div>
        ) : (
          filteredParticipants.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              isActive={participant.id === activeParticipantId}
              onSelect={onSelectParticipant}
            />
          ))
        )}
      </div>
    </aside>
  );
};
