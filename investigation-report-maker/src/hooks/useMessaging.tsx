// src/context/useMessaging.ts
import { useContext } from "react";
import { type MessagingContextProps, MessagingContext } from "../context/MessagingContext";


export const useMessaging = (): MessagingContextProps => {
  const ctx = useContext(MessagingContext);
  if (!ctx) {
    throw new Error("useMessaging must be used within a MessagingProvider.");
  }
  return ctx;
};
