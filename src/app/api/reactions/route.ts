import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request
) {
  try {
    const session =
      await getServerSession(
        authOptions
      );

    if (
      !session?.user?.email
    ) {
      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          email:
            session.user.email,
        },
      });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const {
      messageId,
      emoji,
    } = await req.json();

    const existingReaction =
      await prisma.messageReaction.findFirst(
        {
          where: {
            userId:
              user.id,
            messageId,
            emoji,
          },
        }
      );

    if (
      existingReaction
    ) {
      await prisma.messageReaction.delete(
        {
          where: {
            id: existingReaction.id,
          },
        }
      );
    } else {
      await prisma.messageReaction.create(
        {
          data: {
            userId:
              user.id,
            messageId,
            emoji,
          },
        }
      );
    }

    const reactions =
      await prisma.messageReaction.findMany(
        {
          where: {
            messageId,
          },

          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        }
      );

    return NextResponse.json(
      {
        success: true,
        reactions,
      }
    );
  } catch (error) {
    console.error(
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update reaction",
      },
      {
        status: 500,
      }
    );
  }
}