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

    const {
      name,
      isGroup,
      memberIds,
    } = body;

    const currentUser =
      await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
      });

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

    const room =
      await prisma.chatRoom.create({
        data: {
          name,
          isGroup,

          members: {
            create: [
              {
                userId:
                  currentUser.id,
              },

              ...memberIds.map(
                (
                  memberId: string
                ) => ({
                  userId:
                    memberId,
                })
              ),
            ],
          },
        },

        include: {
          members: true,
        },
      });

    return NextResponse.json(room);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to create room",
      },
      {
        status: 500,
      }
    );
  }
}