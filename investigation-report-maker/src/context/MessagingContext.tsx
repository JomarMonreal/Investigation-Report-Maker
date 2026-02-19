// src/context/MessagingContext.ts
import React from "react";
import type { Messages } from "../types/Messages";

export interface MessagingContextProps {
  messages: Messages;
  send_your_message: (content: string) => void;
  send_fiscal_message: (content: string) => void;
  clear_messages: () => void;
}

export const MessagingContext = React.createContext<MessagingContextProps | null>(null);
