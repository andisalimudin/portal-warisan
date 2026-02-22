import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma();
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "ID komen tidak sah." },
        { status: 400 }
      );
    }

    const existing = await prisma.forumComment.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Komen tidak dijumpai." },
        { status: 404 }
      );
    }

    await prisma.forumComment.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_FORUM_COMMENT_DELETE_ERROR", error);

    return NextResponse.json(
      { error: "Ralat semasa memadam komen." },
      { status: 500 }
    );
  }
}

