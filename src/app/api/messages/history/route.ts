import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request
) {
  const { searchParams } =
    new URL(req.url);

  const roomId =
    searchParams.get("roomId");

  const cursor =
    searchParams.get("cursor");

  const messages =
    await prisma.message.findMany({
      where: {
        roomId: roomId!,
      },

      take: 20,

      ...(cursor && {
        skip: 1,
        cursor: {
          id: cursor,
        },
      }),

      orderBy: {
        createdAt: "desc",
      },

      include: {
        sender: true,
        reactions: {
          include: {
            user: true,
          },
        },
      },
    });

  return NextResponse.json(
    messages
  );
}