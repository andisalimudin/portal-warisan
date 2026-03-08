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

    // Optional: Check status is PUBLISHED
    if (announcement.status !== "PUBLISHED") {
        return NextResponse.json({ error: "Pengumuman tidak aktif" }, { status: 404 });
    }

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error("ANNOUNCEMENT_GET_ERROR", error);
    return NextResponse.json({ error: "Ralat mengambil pengumuman" }, { status: 500 });
  }
}
