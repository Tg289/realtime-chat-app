import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request
) {
  try {
    const { messageId } =
      await req.json();

    const updated =
      await prisma.message.update({
        where: {
          id: messageId,
        },

        data: {
          seen: true,
        },
      });

    return NextResponse.json(
      updated
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed to update message",
      },
      {
        status: 500,
      }
    );
  }
}