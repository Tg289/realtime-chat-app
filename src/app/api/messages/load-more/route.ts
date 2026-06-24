import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request
) {
  const {
    roomId,
    beforeDate,
  } = await req.json();

  const messages =
    await prisma.message.findMany({
      where: {
        roomId,

        createdAt: {
          lt: new Date(
            beforeDate
          ),
        },
      },

      take: 20,

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
    messages.reverse()
  );
}