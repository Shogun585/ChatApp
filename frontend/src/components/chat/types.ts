export interface Message {
  id: string;
  sender: string;
  receiver: string;
  text: string;
  timestamp: number;
  isSelf: boolean;
  status?: "sending" | "sent" | "delivered" | "error";
}

export interface Participant {
  id: string;
  name: string;
  isOnline: boolean;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount?: number;
}
