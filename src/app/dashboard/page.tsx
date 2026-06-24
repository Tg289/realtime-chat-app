import { prisma } from "@/lib/prisma";

import CreateChatButton from "@/components/dashboard/CreateChatButton";
import OnlineUsers from "@/components/dashboard/OnlineUsers";
import RoomList from "@/components/dashboard/RoomList";
import Link from "next/link";

export default async function DashboardPage() {
  const rooms = await prisma.chatRoom.findMany({
    orderBy: {
      updatedAt: "desc",
    },

    include: {
      messages: {
        orderBy: {
          createdAt: "desc",
        },

        take: 1,

        include: {
          sender: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Dashboard
            </h1>

            <p className="text-zinc-400">
              Manage chats and conversations
            </p>
          </div>

         <div className="flex gap-3">
  <Link
    href="/profile"
    className="bg-zinc-800 px-4 py-2 rounded-lg"
  >
    Profile
  </Link>

  <CreateChatButton />
</div>
        </div>

        {/* Main Grid */}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Rooms */}

          <div className="lg:col-span-2 bg-zinc-900 rounded-xl p-5">
            <h2 className="text-xl font-semibold mb-4">
              Chat Rooms
            </h2>

            <RoomList rooms={rooms} />
          </div>

          {/* Sidebar */}

          <div className="space-y-6">
            <OnlineUsers />

            <div className="bg-zinc-900 rounded-xl p-4">
              <h2 className="font-semibold mb-3">
                Notifications
              </h2>

              <p className="text-zinc-500 text-sm">
                No notifications yet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}