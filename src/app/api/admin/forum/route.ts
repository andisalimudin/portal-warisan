import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json().catch(() => ({}));

    const ids = Array.isArray(body.ids)
      ? (body.ids as string[])
      : [];
    const action = body.action as
      | "DELETE"
      | "PIN"
      | "UNPIN"
      | undefined;

    if (!ids.length || !action) {
      return NextResponse.json(
        { error: "Permintaan moderasi tidak sah." },
        { status: 400 }
      );
    }

    if (action === "DELETE") {
      await prisma.forumComment.deleteMany({
        where: { postId: { in: ids } },
      });
      await prisma.forumLike.deleteMany({
        where: { postId: { in: ids } },
      });
      await prisma.forumPost.deleteMany({
        where: { id: { in: ids } },
      });

      return NextResponse.json({ success: true });
    }

    if (action === "PIN") {
      await prisma.forumPost.updateMany({
        where: { id: { in: ids } },
        data: { isPinned: true },
      });

      return NextResponse.json({ success: true });
    }

    if (action === "UNPIN") {
      await prisma.forumPost.updateMany({
        where: { id: { in: ids } },
        data: { isPinned: false },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Tindakan moderasi tidak dikenali." },
      { status: 400 }
    );
  } catch (error) {
    console.error("ADMIN_FORUM_MODERATION_ERROR", error);

    return NextResponse.json(
      { error: "Ralat semasa memproses tindakan moderasi." },
      { status: 500 }
    );
  }
}

