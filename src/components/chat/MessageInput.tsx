"use client";

import { useState } from "react";
import axios from "axios";

export default function MessageInput({
  roomId,
}: {
  roomId: string;
}) {
  const [message, setMessage] =
    useState("");

  async function sendMessage() {
    if (!message.trim()) {
      return;
    }

    try {
      await axios.post(
        "/api/messages",
        {
          roomId,
          content: message,
        }
      );

      setMessage("");

      window.location.reload();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="flex gap-2">
      <input
        value={message}
        onChange={(e) =>
          setMessage(
            e.target.value
          )
        }
        placeholder="Type a message..."
        className="flex-1 rounded-lg bg-zinc-900 p-3 outline-none"
      />

      <button
        onClick={sendMessage}
        className="px-4 rounded-lg bg-indigo-600"
      >
        Send
      </button>
    </div>
  );
}