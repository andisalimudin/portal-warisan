import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { z } from "zod";

const announcementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(["ANNOUNCEMENT", "NEWS", "DOCUMENT"]),
  status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]),
  audience: z.enum(["ALL_MEMBERS", "COMMITTEE", "LEADERSHIP", "PUBLIC"]),
  scheduledDate: z.string().optional().nullable(),
  attachments: z.array(z.string()).optional().default([]),
});

export async function GET(req: Request) {
  try {
    const prisma = getPrisma();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    const where: any = {};
    if (type && type !== "ALL") where.type = type;
    if (status && status !== "ALL") where.status = status;

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { fullName: true }
        }
      }
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("ANNOUNCEMENT_GET_ERROR", error);
    return NextResponse.json({ error: "Ralat mengambil senarai pengumuman" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = announcementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak sah", details: parsed.error }, { status: 400 });
    }

    const prisma = getPrisma();

    // Fallback: Find first admin user to assign as author
    // In production, use session.user.id
    const admin = await prisma.user.findFirst({
        where: { role: "ADMIN" }
    });

    if (!admin) {
        return NextResponse.json({ error: "Tiada admin dijumpai untuk dijadikan penulis." }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        type: parsed.data.type,
        status: parsed.data.status,
        audience: parsed.data.audience,
        scheduledDate: parsed.data.scheduledDate ? new Date(parsed.data.scheduledDate) : null,
        attachments: parsed.data.attachments,
        authorId: admin.id,
      },
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error) {
    console.error("ANNOUNCEMENT_POST_ERROR", error);
    return NextResponse.json({ error: "Ralat mencipta pengumuman" }, { status: 500 });
  }
}
