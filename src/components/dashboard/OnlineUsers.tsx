"use client";

import useOnlineUsers from "@/hooks/useOnlineUsers";

export default function OnlineUsers() {
  const onlineUsers =
    useOnlineUsers();

  return (
    <div className="bg-zinc-900 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">
          Online Users
        </h2>

        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
          {onlineUsers.length} Online
        </span>
      </div>

      {onlineUsers.length === 0 ? (
        <p className="text-zinc-500 text-sm">
          No users online
        </p>
      ) : (
        <div className="space-y-2">
          {onlineUsers.map(
            (userId) => (
              <div
                key={userId}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-green-500" />

                <span className="text-sm">
                  {userId}
                </span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}