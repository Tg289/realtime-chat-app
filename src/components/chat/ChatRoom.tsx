"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Smile, Trash2 } from "lucide-react";
import Image from "next/image";

import { useSocket } from "@/hooks/useSocket";
import useAutoScroll from "@/hooks/useAutoScroll";
import useNotifications from "@/hooks/useNotifications";
import TypingIndicator from "./TypingIndicator";
import EmojiPickerButton from "./EmojiPickerButton";
import ImageUpload from "./ImageUpload";
import ImagePreview from "./ImagePreview";
import OnlineUsers from "./OnlineUsers";

type Reaction = {
  id: string;
  emoji: string;
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
};

type Message = {
  id: string;
  content?: string | null;
  imageUrl?: string | null;
  seen: boolean;
  unread?: boolean;
  isDeleted?: boolean;
  sender: {
    name: string;
    image?: string | null;
  };
  reactions?: Reaction[];
  createdAt: Date;
};

export default function ChatRoom({
  roomId,
  initialMessages,
}: {
  roomId: string;
  initialMessages: Message[];
}) {
  const socket = useSocket();
  const { data: session } = useSession();
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [message, setMessage] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");  
  const [loadingMore, setLoadingMore] = useState(false); // Step 4: Added pagination state

  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  useAutoScroll(bottomRef, messages);
  useNotifications();

  const currentUserName = session?.user?.name || "Anonymous User";

  function groupReactions(reactions: Reaction[] = []) {
    return reactions.reduce((acc: Record<string, number>, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    }, {});
  }

  const filteredMessages = messages.filter((msg) => {
    if (!searchQuery.trim()) return true;
    if (msg.isDeleted) return false;

    return (
      msg.content?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
    );
  });

  useEffect(() => {
    if (!socket) return;

    socket.emit("join-room", roomId);
    socket.emit("user-online", currentUserName);

    socket.on("receive-message", (newMessage: Message) => {
      setMessages((prev) => [...prev, { ...newMessage, unread: true }]);

      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification(`${newMessage.sender.name}`, {
          body: newMessage.content || "Sent an image",
        });
      }
    });

    socket.on("typing", (data: { userName: string }) => {
      setTypingUser(data.userName);
    });

    socket.on("stop-typing", () => {
      setTypingUser("");
    });

    socket.on("message-read", (data: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, seen: true } : msg
        )
      );
    });

    socket.on("message-deleted", (data: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, isDeleted: true } : msg
        )
      );
    });

    socket.on("online-users", (data: { users: string[] }) => {
      setOnlineUsers(data.users);
    });

    socket.on("reaction-updated", (data: { messageId: string; reactions: Reaction[] }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId ? { ...msg, reactions: data.reactions } : msg
        )
      );
    });

    return () => {
      socket.off("receive-message");
      socket.off("typing");
      socket.off("stop-typing");
      socket.off("message-read");
      socket.off("reaction-updated");
      socket.off("online-users");
      socket.off("message-deleted");
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [roomId, socket, currentUserName]);

  useEffect(() => {
    if (!socket) return;

    async function markSeen() {
      for (const msg of messages) {
        if (!msg.seen) {
          try {
            await axios.post("/api/messages/read", { messageId: msg.id });
            socket.emit("message-read", { roomId, messageId: msg.id });
          } catch (error) {
            console.error("Failed to mark message as read:", error);
          }
        }
      }
    }

    markSeen();
  }, [messages, roomId, socket]);

  async function handleSend() {
    if (!message.trim()) return;

    try {
      const response = await axios.post("/api/messages", {
        roomId,
        content: message,
      });

      socket?.emit("send-message", response.data);
      setMessage("");
    } catch (error) {
      console.error("Message send failed:", error);
    }
  }

  async function handleImageUpload(imageUrl: string) {
    try {
      const response = await axios.post("/api/messages/image", {
        roomId,
        imageUrl,
      });

      socket?.emit("send-message", response.data);
    } catch (error) {
      console.error("Image upload event failed:", error);
    }
  }

  async function handleReaction(messageId: string, emoji: string) {
    try {
      const response = await axios.post("/api/reactions", { messageId, emoji });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, reactions: response.data.reactions } : msg
        )
      );

      socket?.emit("reaction-updated", {
        roomId,
        messageId,
        reactions: response.data.reactions,
      });
    } catch (error) {
      console.error("Reaction update failed:", error);
    }
  }

  async function handleDelete(messageId: string) {
    try {
      await axios.post("/api/messages/delete", { messageId });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isDeleted: true } : msg
        )
      );

      socket?.emit("message-deleted", { roomId, messageId });
    } catch (error) {
      console.error("Message deletion failed:", error);
    }
  }

  // Step 5: Added loadOlderMessages function below handleDelete
  async function loadOlderMessages() {
    if (!messages.length) return;

    try {
      setLoadingMore(true);
      const oldest = messages[0];

      const res = await axios.post("/api/messages/load-more", {
        roomId,
        beforeDate: oldest.createdAt,
      });

      setMessages((prev) => [...res.data, ...prev]);
    } catch (error) {
      console.error("Failed to fetch older messages:", error);
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 h-full">
      <OnlineUsers users={onlineUsers} />
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 outline-none text-white focus:border-zinc-700 transition"
          />
        </div>

        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-[50vh]">
            <p className="text-zinc-500">Start a conversation 🚀</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-[50vh]">
            <p className="text-zinc-500">No messages found.</p>
          </div>
        ) : (
          // Step 6: Fragment wrap with "Load Older Messages" CTA integrated directly
          <>
            <div className="mb-4 flex justify-center">
              <button
                onClick={loadOlderMessages}
                disabled={loadingMore}
                className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-xs text-zinc-300 font-medium px-4 py-2 rounded transition"
              >
                {loadingMore ? "Loading..." : "Load Older Messages"}
              </button>
            </div>

            <div className="space-y-4">
              {filteredMessages.map((msg) => (
                <div key={msg.id} className="bg-zinc-900 rounded-lg p-4 flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {msg.sender.image && (
                        <div className="relative w-8 h-8">
                          <Image
                            src={msg.sender.image}
                            alt={msg.sender.name}
                            fill
                            sizes="32px"
                            className="rounded-full object-cover"
                            priority={false}
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-white">{msg.sender.name}</div>
                        <div className="text-[10px] text-zinc-500">
                          {new Date(msg.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <p className="text-xs text-zinc-500">{msg.seen ? "Seen" : "Delivered"}</p>
                      {!msg.isDeleted && (
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="text-red-500 hover:text-red-400 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Content Area */}
                  <div className="text-zinc-200 text-sm pl-1">
                    {msg.isDeleted ? (
                      <p className="italic text-zinc-500">This message was deleted</p>
                    ) : (
                      <>
                        {msg.content && (
                          <p
                            className={
                              searchQuery && msg.content.toLowerCase().includes(searchQuery.toLowerCase())
                                ? "bg-yellow-500/20 text-yellow-200 inline-block rounded px-2 py-1"
                                : ""
                            }
                          >
                            {msg.content}
                          </p>
                        )}

                        {msg.imageUrl && <ImagePreview imageUrl={msg.imageUrl} />}
                      </>
                    )}
                  </div>

                  {/* Reactions UI Block */}
                  {!msg.isDeleted && (
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {Object.entries(groupReactions(msg.reactions || [])).map(([emoji, count]) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(msg.id, emoji)}
                          className="bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded-full text-xs transition text-zinc-300"
                        >
                          {emoji} {count}
                        </button>
                      ))}
                      
                      <div className="relative">
                        <button
                          onClick={() => setActiveMessage(activeMessage === msg.id ? null : msg.id)}
                          className="text-zinc-400 hover:text-white transition p-1"
                        >
                          <Smile size={18} />
                        </button>

                        {activeMessage === msg.id && (
                          <div className="absolute z-50 left-0 mt-2">
                            <EmojiPickerButton
                              onEmojiSelect={(emoji: string) => {
                                handleReaction(msg.id, emoji);
                                setActiveMessage(null);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          </>
        )}
      </div>

      {/* Input Action Panel */}
      <div className="border-t border-zinc-800 bg-zinc-950">
        <TypingIndicator user={typingUser} />

        <div className="p-4 flex gap-3 items-center">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              socket?.emit("typing", { roomId, userName: currentUserName });

              if (typingTimeout.current) clearTimeout(typingTimeout.current);

              typingTimeout.current = setTimeout(() => {
                socket?.emit("stop-typing", { roomId });
              }, 1000);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 outline-none text-white focus:border-zinc-700 transition"
          />

          <ImageUpload onUpload={handleImageUpload} />

          <button
            onClick={handleSend}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}