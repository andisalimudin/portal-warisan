import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const prisma = getPrisma();
    
    // In a real app, we would filter by user role/audience here
    // For now, return all PUBLISHED announcements
    const announcements = await prisma.announcement.findMany({
      where: {
        status: "PUBLISHED"
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        attachments: true,
        author: {
          select: { fullName: true }
        }
      },
      take: 5 // Limit to latest 5
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("PUBLIC_ANNOUNCEMENT_GET_ERROR", error);
    return NextResponse.json({ error: "Ralat mengambil pengumuman" }, { status: 500 });
  }
}
