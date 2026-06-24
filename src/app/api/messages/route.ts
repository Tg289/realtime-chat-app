import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(
      authOptions
    );

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await req.json();

    const { roomId, content } = body;

    if (!roomId || !content) {
      return NextResponse.json(
        {
          error:
            "Room ID and content are required",
        },
        {
          status: 400,
        }
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const message =
      await prisma.message.create({
        data: {
          content,
          roomId,
          senderId: user.id,
          seen: false,
        },

        include: {
          sender: true,
        },
      });

    return NextResponse.json(
      message
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to send message",
      },
      {
        status: 500,
      }
    );
  }
}