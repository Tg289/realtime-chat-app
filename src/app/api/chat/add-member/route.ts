import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      roomId,
      email,
    } = await req.json();

    const user =
      await prisma.user.findUnique({
        where: {
          email,
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

    const existing =
      await prisma.chatMember.findFirst({
        where: {
          roomId,
          userId: user.id,
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "User already in group",
        },
        {
          status: 400,
        }
      );
    }

    const member =
      await prisma.chatMember.create({
        data: {
          roomId,
          userId: user.id,
        },
      });

    return NextResponse.json(
      member
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to add member",
      },
      {
        status: 500,
      }
    );
  }
}