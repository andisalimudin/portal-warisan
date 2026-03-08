import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, content, userId } = body;

    if (!userId) {
        return NextResponse.json({ error: "ID Pengguna diperlukan" }, { status: 400 });
    }

    const prisma = getPrisma();
    const letter = await prisma.aiLetter.create({
      data: {
        title,
        content,
        userId
      }
    });

    return NextResponse.json({ success: true, letter });
  } catch (error) {
    console.error("SAVE_LETTER_ERROR", error);
    return NextResponse.json({ error: "Gagal menyimpan surat" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "ID Pengguna diperlukan" }, { status: 400 });
    }

    const prisma = getPrisma();
    const letters = await prisma.aiLetter.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ letters });
  } catch (error) {
    console.error("GET_LETTERS_ERROR", error);
    return NextResponse.json({ error: "Gagal mengambil senarai surat" }, { status: 500 });
  }
}
