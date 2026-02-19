// src/types/Messaging.ts
export type Sender = "fiscal" | "you";

export type Message = {
  content: string;
  sender: Sender;
  createdAt: number; // helps with ordering & keys
};

export type Messages = Message[];
