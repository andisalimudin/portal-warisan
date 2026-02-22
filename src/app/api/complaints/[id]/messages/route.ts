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

    const timelineMessages = await prisma.complaintTimeline.findMany({
      where: {
        complaintId: id,
        title: "MSG",
      },
      orderBy: { createdAt: "asc" },
    });

    const result = timelineMessages.map((m) => ({
      id: m.id,
      senderId: null as string | null,
      senderName: m.actorName || "Pengguna Portal",
      senderRole: null as string | null,
      content: m.note || "",
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
      select: { id: true, status: true },
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

    const timelineEntry = await prisma.complaintTimeline.create({
      data: {
        complaintId: complaint.id,
        status: complaint.status,
        title: "MSG",
        note: content,
        actorName: finalSenderName,
      },
    });

    return NextResponse.json({
      message: {
        id: timelineEntry.id,
        senderId: finalSenderId,
        senderName: finalSenderName,
        senderRole: finalSenderRole || null,
        content,
        createdAt: timelineEntry.createdAt.toISOString(),
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
