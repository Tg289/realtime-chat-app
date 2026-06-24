"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Room = {
  id: string;
  name: string | null;
  updatedAt: Date | string;

  messages: {
    content: string | null;
    sender: {
      name: string;
    };
  }[];
};

export default function RoomList({
  rooms,
}: {
  rooms: Room[];
}) {
  const [search, setSearch] =
    useState("");

  const filteredRooms =
    useMemo(() => {
      return rooms.filter((room) =>
        (room.name || "")
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      );
    }, [rooms, search]);

  return (
    <>
      <input
        type="text"
        placeholder="Search chats..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
        className="w-full mb-4 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 outline-none"
      />

      {filteredRooms.length === 0 ? (
        <p className="text-zinc-500">
          No matching rooms.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredRooms.map(
            (room) => {
              const lastMessage =
                room.messages[0];

              return (
                <Link
                  key={room.id}
                  href={`/chat/${room.id}`}
                  className="block p-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition"
                >
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
  <h3 className="font-semibold">
    {room.name ??
      "Unnamed Chat"}
  </h3>

  <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full">
    New
  </span>
</div>

                    <span className="text-xs text-zinc-500">
                      {new Date(
                        room.updatedAt
                      ).toLocaleDateString()}
                    </span>
                  </div>

                  {lastMessage ? (
                    <p className="text-sm text-zinc-400 mt-2 truncate">
                      <span className="font-medium">
                        {
                          lastMessage
                            .sender
                            .name
                        }
                        :
                      </span>{" "}
                      {lastMessage.content ??
                        "📷 Image"}
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-500 mt-2">
                      No messages yet
                    </p>
                  )}
                </Link>
              );
            }
          )}
        </div>
      )}
    </>
  );
}