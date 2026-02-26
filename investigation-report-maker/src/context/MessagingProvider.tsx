// src/context/MessagingProvider.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MessagingContext } from "./MessagingContext";
import type { Message } from "../types/Messages";
import { useCaseDetails } from "../hooks/useCaseDetails";
import type { CaseDetailsSlateValue } from "./CaseDetailsContext";

const STORAGE_KEY = "virtual_fiscal_messages";

const normalizeContent = (content: string): string => content.trim();
const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

type ErrorWithStatus = Error & { status?: number };

const isServerUnavailable = (err: unknown): boolean => {
  if (!(err instanceof Error)) return false;
  const withStatus = err as ErrorWithStatus;
  if (typeof withStatus.status === "number" && withStatus.status >= 500) {
    return true;
  }
  const message = err.message.toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("fetch failed") ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("load failed") ||
    message.includes("request failed (502)") ||
    message.includes("request failed (503)") ||
    message.includes("request failed (504)")
  );
};

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

async function askFiscal(question: string, slateValue: CaseDetailsSlateValue, signal?: AbortSignal): Promise<string> {
  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, slateValue }),
    signal,
  });

  const data = (await res.json().catch(() => null)) as AskResponseOk | AskResponseErr | null;

  if (!res.ok) {
    const msg =
      (data && "message" in data && typeof data.message === "string" && data.message) ||
      (data && "error" in data && typeof data.error === "string" && data.error) ||
      `Request failed (${res.status})`;
    const error = new Error(msg) as ErrorWithStatus;
    error.status = res.status;
    throw error;
  }

  const answer =
    data && "answer" in data && typeof data.answer === "string" ? data.answer.trim() : "";

  if (!answer) throw new Error("Empty answer from /api/ask");
  return answer;
}

export const MessagingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const isHydratedRef = useRef(false);
  const  {slateValue} = useCaseDetails(); // for now we just want to trigger re-render on case details change so messages are cleared, but could be used for more advanced features later

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
      if (abortRef.current) return;

      // Add user message immediately
      setMessages((prev) => [...prev, createMessage("you", cleaned)]);

      const controller = new AbortController();
      abortRef.current = controller;
      setIsSending(true);

      const requestId = ++lastRequestIdRef.current;

      try {
        // Optional “thinking” placeholder
        send_fiscal_message("…");

        const answer = await askFiscal(cleaned, slateValue, controller.signal);

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
        if (isServerUnavailable(err)) {
          await sleep(1000);
        }

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
      } finally {
        if (requestId === lastRequestIdRef.current) {
          abortRef.current = null;
          setIsSending(false);
        }
      }
    },
    [send_fiscal_message, slateValue]
  );

  const clear_messages = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsSending(false);

    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ messages, isSending, send_your_message, send_fiscal_message, clear_messages }),
    [messages, isSending, send_your_message, send_fiscal_message, clear_messages]
  );

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
};
