// src/components/VirtualFiscalDrawer.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useMessaging } from "../hooks/useMessaging";
import type { Message } from "../types/Messages";


export interface VirtualFiscalDrawerProps {
  open: boolean;
  onClose: () => void;
  width?: number;
}

const bubbleStyles = (sender: Message["sender"]) => {
  const isYou = sender === "you";

  return {
    alignSelf: isYou ? "flex-end" : "flex-start",
    bgcolor: isYou ? "primary.main" : "grey.200",
    color: isYou ? "primary.contrastText" : "text.primary",
    px: 1.5,
    py: 1,
    borderRadius: 2,
    maxWidth: "80%",
    whiteSpace: "pre-wrap" as const,
    overflowWrap: "anywhere" as const,
  };
};

export const VirtualFiscalDrawer: React.FC<VirtualFiscalDrawerProps> = ({
  open,
  onClose,
  width = 420,
}) => {
  const { messages, send_your_message } = useMessaging();
  const [draft, setDraft] = useState<string>("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const canSend = useMemo(() => draft.trim().length > 0, [draft]);

  useEffect(() => {
    // Scroll to bottom when messages change or drawer opens
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = () => {
    if (!canSend) return;
    send_your_message(draft);
    setDraft("");
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} slotProps={{ paper: { sx: { width } } }}>
      {/* 1) Title */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          Virtual Fiscal
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ask. Receive judgment. Repeat.
        </Typography>
      </Box>

      <Divider />

      {/* 2) Chatbox */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          overflowY: "auto",
          height: "100%",
        }}
      >
        <Stack spacing={1.25}>
          {messages.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.default" }}>
              <Typography variant="body2" color="text.secondary">
                No messages yet. Send one. The fiscal is “waiting.” Allegedly.
              </Typography>
            </Paper>
          ) : (
            messages.map((m) => (
              <Box key={`${m.createdAt}-${m.sender}`} sx={bubbleStyles(m.sender)}>
                <Typography variant="body2">{m.content}</Typography>
              </Box>
            ))
          )}
          <div ref={bottomRef} />
        </Stack>
      </Box>

      <Divider />

      {/* 3) Text field + Send icon */}
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="flex-end">
          <TextField
            fullWidth
            label="Message"
            placeholder="Type your message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            multiline
            maxRows={4}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={!canSend}
            aria-label="Send message"
            sx={{ mb: 0.5 }}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </Box>
    </Drawer>
  );
};
