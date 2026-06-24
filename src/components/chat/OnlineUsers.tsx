"use client";

interface Props {
  users: string[];
}
export default function OnlineUsers({
  users,
}: Props) {
  return (
    <div className="border-b border-zinc-800 p-3">
      <h3 className="font-semibold mb-2">
        Online Users
      </h3>

      <div className="flex flex-wrap gap-2">
        {users.map((user) => (
          <div
            key={user}
            className="px-3 py-1 bg-green-600 rounded-full text-sm"
          >
            {user}
          </div>
        ))}
      </div>
    </div>
  );
}