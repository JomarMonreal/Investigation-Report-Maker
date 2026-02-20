// src/context/MessagingProvider.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessagingContext } from "./MessagingContext";
import type { Message } from "../types/Messages";

const STORAGE_KEY = "virtual_fiscal_messages";

const normalizeContent = (content: string): string => content.trim();

const createMessage = (sender: Message["sender"], content: string): Message => ({
  sender,
  content,
  createdAt: Date.now(),
});

type AskResponseOk = {
  answer: string;
};

type AskResponseErr = {
  error: string;
  message?: string;
  details?: unknown;
};

async function askFiscal(question: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
    signal,
  });

  const data = (await res.json().catch(() => null)) as AskResponseOk | AskResponseErr | null;

  if (!res.ok) {
    const msg =
      (data && "message" in data && typeof data.message === "string" && data.message) ||
      (data && "error" in data && typeof data.error === "string" && data.error) ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }

  const answer =
    data && "answer" in data && typeof data.answer === "string" ? data.answer.trim() : "";

  if (!answer) throw new Error("Empty answer from /api/ask");
  return answer;
}

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const isHydratedRef = useRef(false);

  // Track latest in-flight request so old responses don’t overwrite newer ones
  const lastRequestIdRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Message[];
        setMessages(parsed);
      } catch {
        setMessages([]);
      }
    }
    isHydratedRef.current = true;
  }, []);

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
    async (content: string) => {
      const cleaned = normalizeContent(content);
      if (!cleaned) return;

      // Add user message immediately
      setMessages((prev) => [...prev, createMessage("you", cleaned)]);

      // Cancel prior request (optional but nice)
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const requestId = ++lastRequestIdRef.current;

      try {
        // Optional “thinking” placeholder
        send_fiscal_message("…");

        const answer = await askFiscal(cleaned, controller.signal);

        // If a newer request happened, ignore this result
        if (requestId !== lastRequestIdRef.current) return;

        // Replace the last "…" message with the actual answer
        setMessages((prev) => {
          const next = [...prev];
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].sender === "fiscal" && next[i].content === "…") {
              next[i] = { ...next[i], content: answer };
              return next;
            }
          }
          // If placeholder wasn’t found, just append
          next.push(createMessage("fiscal", answer));
          return next;
        });
      } catch (err) {
        if (requestId !== lastRequestIdRef.current) return;

        const message =
          err instanceof Error ? err.message : "Something went wrong calling /api/ask.";

        // Replace placeholder if present; otherwise append
        setMessages((prev) => {
          const next = [...prev];
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].sender === "fiscal" && next[i].content === "…") {
              next[i] = { ...next[i], content: `Error: ${message}` };
              return next;
            }
          }
          next.push(createMessage("fiscal", `Error: ${message}`));
          return next;
        });
      }
    },
    [send_fiscal_message]
  );

  const clear_messages = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;

    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ messages, send_your_message, send_fiscal_message, clear_messages }),
    [messages, send_your_message, send_fiscal_message, clear_messages]
  );

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
};