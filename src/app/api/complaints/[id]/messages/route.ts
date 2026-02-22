import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    const prisma = getPrisma();

    const messages = await prisma.complaintMessage.findMany({
      where: { complaintId: id },
      orderBy: { createdAt: "asc" },
    });

    const result = messages.map((m) => ({
      id: m.id,
      senderId: m.senderId || null,
      senderName: m.senderName,
      senderRole: m.senderRole || null,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    }));

    return NextResponse.json({ messages: result });
  } catch (error) {
    console.error("COMPLAINT_MESSAGES_LIST_ERROR", error);
    return NextResponse.json(
      { error: "Ralat semasa memuatkan mesej aduan." },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    const prisma = getPrisma();
    const body = await req.json().catch(() => ({}));

    const content =
      typeof body.content === "string" && body.content.trim()
        ? (body.content as string).trim()
        : null;
    const senderId =
      typeof body.senderId === "string" && body.senderId.trim()
        ? (body.senderId as string).trim()
        : null;
    const senderName =
      typeof body.senderName === "string" && body.senderName.trim()
        ? (body.senderName as string).trim()
        : null;
    const senderRole =
      typeof body.senderRole === "string" && body.senderRole.trim()
        ? (body.senderRole as string).trim()
        : null;

    if (!content) {
      return NextResponse.json(
        { error: "Mesej tidak boleh kosong." },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Aduan tidak dijumpai." },
        { status: 404 }
      );
    }

    let finalSenderName = senderName || "";
    let finalSenderRole: any = senderRole || null;
    let finalSenderId: string | null = senderId;

    if (senderId && (!finalSenderName || !finalSenderRole)) {
      const user = await prisma.user.findUnique({
        where: { id: senderId },
      });
      if (user) {
        if (!finalSenderName) finalSenderName = user.fullName;
        if (!finalSenderRole) finalSenderRole = user.role;
      }
    }

    if (!finalSenderName) {
      finalSenderName = "Pengguna Portal";
    }

    const message = await prisma.complaintMessage.create({
      data: {
        complaintId: complaint.id,
        senderId: finalSenderId || undefined,
        senderName: finalSenderName,
        senderRole: finalSenderRole || null,
        content,
      },
    });

    return NextResponse.json({
      message: {
        id: message.id,
        senderId: message.senderId,
        senderName: message.senderName,
        senderRole: message.senderRole,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("COMPLAINT_MESSAGES_CREATE_ERROR", error);
    return NextResponse.json(
      { error: "Ralat semasa menghantar mesej." },
      { status: 500 }
    );
  }
}

