// src/context/MessagingProvider.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessagingContext } from "./MessagingContext";
/**
 * Define the Message type locally since the imported one does not have 'sender'.
 */
import type { Message } from "../types/Messages";

const STORAGE_KEY = "virtual_fiscal_messages";

const normalizeContent = (content: string): string => content.trim();

const createMessage = (sender: Message["sender"], content: string): Message => ({
  sender,
  content,
  createdAt: Date.now(),
});

/**
 * Replace this mock with your real fiscal responder later.
 */
const mockFiscalReply = (yourMessage: string): string => {
  // Mildly snarky placeholder. Swap out anytime.
  return `Noted. (Mock fiscal reply) You said: "${yourMessage}"`;
};

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const isHydratedRef = useRef(false);

  // Hydrate once
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Message[];
        setMessages(parsed);
      } catch {
        // If storage is corrupted, ignore it.
        setMessages([]);
      }
    }
    isHydratedRef.current = true;
  }, []);

  // Persist whenever messages changes (after hydration)
  useEffect(() => {
    if (!isHydratedRef.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const send_fiscal_message = useCallback((content: string) => {
    const cleaned = normalizeContent(content);
    if (!cleaned) return;

    setMessages((prev) => [...prev, createMessage("fiscal", cleaned)]);
  }, []);

  const send_your_message = useCallback(
    (content: string) => {
      const cleaned = normalizeContent(content);
      if (!cleaned) return;

      setMessages((prev) => [...prev, createMessage("you", cleaned)]);

      // Mock async response; replace with API/LLM call later.
      window.setTimeout(() => {
        const reply = mockFiscalReply(cleaned);
        send_fiscal_message(reply);
      }, 600);
    },
    [send_fiscal_message]
  );

  const clear_messages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ messages, send_your_message, send_fiscal_message, clear_messages }),
    [messages, send_your_message, send_fiscal_message, clear_messages]
  );

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
};
