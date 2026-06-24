"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Smile,
  Trash2,
} from "lucide-react";

import { useSocket } from "@/hooks/useSocket";

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

  const [messages, setMessages] =
    useState<Message[]>(initialMessages);

  const [message, setMessage] =
    useState("");

  const [typingUser, setTypingUser] =
    useState("");

  const [onlineUsers, setOnlineUsers] =
  useState<string[]>([]);

  const [activeMessage, setActiveMessage] =
    useState<string | null>(null);

  const [searchQuery, setSearchQuery] =
  useState("");  

  function groupReactions(
    reactions: Reaction[] = []
  ) {
    return reactions.reduce(
      (
        acc: Record<string, number>,
        reaction
      ) => {
        acc[reaction.emoji] =
          (acc[reaction.emoji] || 0) + 1;

        return acc;
      },
      {}
    );
  }

  const filteredMessages =
  messages.filter((msg) => {
    if (msg.isDeleted) {
      return false;
    }
    
    return (
      msg.content
        ?.toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        ) ?? false
    );
  });

  useEffect(() => {
    if (!socket) return;

    socket.emit("join-room", roomId);

    socket.emit(
      "user-online",
      "test-user"
    );

    socket.on(
      "receive-message",
      (newMessage: Message) => {
        setMessages((prev) => [
          ...prev,
          newMessage,
        ]);
      }
    );

    socket.on(
      "typing",
      (data) => {
        setTypingUser(
          data.userName
        );
      }
    );

    socket.on(
      "stop-typing",
      () => {
        setTypingUser("");
      }
    );

    socket.on(
      "message-read",
      (data) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId
              ? {
                ...msg,
                seen: true,
              }
              : msg
          )
        );
      }
    );


  socket.on(
  "message-deleted",
  (data) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === data.messageId
          ? {
              ...msg,
              isDeleted: true,
            }
          : msg
      )
    );
  }
);

  socket.on(
  "online-users",
  (data) => {
    setOnlineUsers(data.users);
  }
);
    socket.on(
      "reaction-updated",
      (data) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId
              ? {
                ...msg,
                reactions:
                  data.reactions,
              }
              : msg
          )
        );
      }
    );

    return () => {
      socket.off(
        "receive-message"
      );

      socket.off("typing");

      socket.off(
        "stop-typing"
      );

      socket.off(
        "message-read"
      );

      socket.off(
        "reaction-updated"
      );

      socket.off(
  "online-users"
);

socket.off(
  "message-deleted"
);
    };
  }, [roomId, socket]);

  useEffect(() => {
    if (!socket) return;

    async function markSeen() {
      for (const msg of messages) {
        if (!msg.seen) {
          try {
            await axios.post(
              "/api/messages/read",
              {
                messageId:
                  msg.id,
              }
            );

            socket.emit(
              "message-read",
              {
                roomId,
                messageId:
                  msg.id,
              }
            );
          } catch (error) {
            console.error(error);
          }
        }
      }
    }

    markSeen();
  }, [messages, roomId, socket]);

  async function handleSend() {
    if (!message.trim()) return;

    try {
      const response =
        await axios.post(
          "/api/messages",
          {
            roomId,
            content: message,
          }
        );

      socket?.emit(
        "send-message",
        response.data
      );

      setMessage("");
    } catch (error) {
      console.error(error);
    }
  }

  async function handleImageUpload(
    imageUrl: string
  ) {
    try {
      const response =
        await axios.post(
          "/api/messages/image",
          {
            roomId,
            imageUrl,
          }
        );

      socket?.emit(
        "send-message",
        response.data
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function handleReaction(
    messageId: string,
    emoji: string
  ) {
    try {
      const response =
        await axios.post(
          "/api/reactions",
          {
            messageId,
            emoji,
          }
        );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
              ...msg,
              reactions:
                response.data.reactions,
            }
            : msg
        )
      );

      socket?.emit(
        "reaction-updated",
        {
          roomId,
          messageId,
          reactions:
            response.data.reactions,
        }
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function handleDelete(
  messageId: string
) {
  try {
    await axios.post(
      "/api/messages/delete",
      {
        messageId,
      }
    );

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              isDeleted: true,
            }
          : msg
      )
    );

    socket?.emit(
      "message-deleted",
      {
        roomId,
        messageId,
      }
    );
  } catch (error) {
    console.error(error);
  }
}

  return (
    <div className="flex flex-col flex-1">
      <OnlineUsers
  users={onlineUsers}
/>
      <div className="flex-1 overflow-y-auto p-5">
  <div className="mb-4">
    <input
      type="text"
      placeholder="Search messages..."
      value={searchQuery}
      onChange={(e) =>
        setSearchQuery(
          e.target.value
        )
      }
      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 outline-none"
    />
  </div>

  {filteredMessages.length === 0 ? (
    <div className="h-full flex items-center justify-center">
      <p className="text-zinc-500">
        No messages found.
      </p>
    </div>
  ) : (
    <div className="space-y-4">
            {filteredMessages.map(
              (msg) => (
                <div
                  key={msg.id}
                  className="bg-zinc-900 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
  {msg.sender.image && (
    <img
      src={msg.sender.image}
      alt={msg.sender.name}
      className="w-8 h-8 rounded-full object-cover"
    />
  )}

 <div>
  <div className="font-semibold">
    {msg.sender.name}
  </div>

  <div className="text-xs text-zinc-500">
    {new Date(
      msg.createdAt
    ).toLocaleString()}
  </div>

    <div className="flex items-center justify-between mt-2">
  <p className="text-xs text-zinc-500">
    {msg.seen
      ? "Seen"
      : "Delivered"}
  </p>

  {!msg.isDeleted && (
    <button
      onClick={() =>
        handleDelete(msg.id)
      }
      className="text-red-500 hover:text-red-400"
    >
      <Trash2 size={16} />
    </button>
  )}
</div>
  </div>
</div>
<div className="mt-2">
  {msg.isDeleted ? (
    <p className="italic text-zinc-500">
      This message was deleted
    </p>
  ) : (
    <>
      {msg.content && (
        <p
          className={
            searchQuery &&
            msg.content
              ?.toLowerCase()
              .includes(
                searchQuery.toLowerCase()
              )
              ? "bg-yellow-500/20 rounded px-2 py-1"
              : ""
          }
        >
          {msg.content}
        </p>
      )}

      {msg.imageUrl && (
        <ImagePreview
          imageUrl={msg.imageUrl}
        />
      )}
    </>
  )}
</div>

                  {!msg.isDeleted && (
  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(
                      groupReactions(
                        msg.reactions ||
                        []
                      )
                    ).map(
                      ([
                        emoji,
                        count,
                      ]) => (
                        <button
                          key={
                            emoji
                          }
                          onClick={() =>
                            handleReaction(
                              msg.id,
                              emoji
                            )
                          }
                          className="bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded-full text-sm"
                        >
                          {emoji}{" "}
                          {count}
                        </button>
                      )
                    )}
                  </div>
                  )}
                  {!msg.isDeleted && (
                  <div className="mt-2 relative">
                    <button
                      onClick={() =>
                        setActiveMessage(
                          activeMessage ===
                            msg.id
                            ? null
                            : msg.id
                        )
                      }
                      className="text-zinc-400 hover:text-white"
                    >
                      <Smile
                        size={18}
                      />
                    </button>

                    {activeMessage ===
                      msg.id && (
                        <div className="absolute z-50 mt-2">
                          <EmojiPickerButton
                            onEmojiSelect={(
                              emoji: string
                            ) => {
                              handleReaction(
                                msg.id,
                                emoji
                              );

                              setActiveMessage(
                                null
                              );
                            }}
                          />
                        </div>
                      )}
                  </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-800">
        <TypingIndicator
          user={typingUser}
        />

        <div className="p-4 flex gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(
                e.target.value
              );

              socket?.emit(
                "typing",
                {
                  roomId,
                  userName:
                    "test-user",
                }
              );

              setTimeout(() => {
                socket?.emit(
                  "stop-typing",
                  {
                    roomId,
                  }
                );
              }, 1000);
            }}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 outline-none"
          />

          <ImageUpload
            onUpload={
              handleImageUpload
            }
          />

          <button
            onClick={
              handleSend
            }
            className="bg-indigo-600 hover:bg-indigo-700 px-6 py-3 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}