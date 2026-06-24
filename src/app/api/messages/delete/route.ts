import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { messageId } =
      await req.json();

    if (!messageId) {
      return NextResponse.json(
        {
          success: false,
          error: "Message ID required",
        },
        {
          status: 400,
        }
      );
    }

    const message =
      await prisma.message.update({
        where: {
          id: messageId,
        },
        data: {
          isDeleted: true,
        },
      });

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}