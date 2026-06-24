import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

import ChatRoom from "@/components/chat/ChatRoom";
import GroupSettings from "@/components/chat/GroupSettings";

export default async function ChatPage({
  params,
}: {
  params: Promise<{
    roomId: string;
  }>;
}) {
  const { roomId } =
    await params;

  const room =
    await prisma.chatRoom.findUnique({
      where: {
        id: roomId,
      },

      include: {
        members: {
          include: {
            user: true,
          },
        },

        messages: {
          include: {
            sender: true,

            reactions: {
              include: {
                user: true,
              },
            },
          },

          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

  if (!room) {
    notFound();
  }

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-4 h-screen bg-zinc-950 text-white">
      <div className="lg:col-span-3">
        <ChatRoom
          roomId={room.id}
          initialMessages={
            room.messages
          }
        />
      </div>

      <div className="border-t lg:border-t-0 lg:border-l border-zinc-800">
        <GroupSettings
          roomId={room.id}
          members={room.members}
        />
      </div>
    </div>
  );
}