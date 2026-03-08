import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });

    const prisma = getPrisma();
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        author: { select: { fullName: true } }
      }
    });

    if (!announcement) {
      return NextResponse.json({ error: "Pengumuman tidak dijumpai" }, { status: 404 });
    }

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error("ANNOUNCEMENT_GET_ERROR", error);
    return NextResponse.json({ error: "Ralat mengambil pengumuman" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const prisma = getPrisma();

    // Validate if exists
    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Pengumuman tidak dijumpai" }, { status: 404 });

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title: body.title,
        content: body.content,
        type: body.type,
        status: body.status,
        audience: body.audience,
        scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : null,
        attachments: body.attachments || [],
      },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error("ANNOUNCEMENT_PUT_ERROR", error);
    return NextResponse.json({ error: "Ralat mengemaskini pengumuman" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const prisma = getPrisma();

    await prisma.announcement.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ANNOUNCEMENT_DELETE_ERROR", error);
    return NextResponse.json({ error: "Ralat memadam pengumuman" }, { status: 500 });
  }
}
