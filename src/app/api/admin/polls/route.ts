import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

type CreatePollRequestBody = {
  question?: unknown;
  options?: unknown;
  createdById?: unknown;
};

export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    let body: CreatePollRequestBody = {};

    try {
      body = (await req.json()) as CreatePollRequestBody;
    } catch {
      body = {};
    }

    const rawQuestion =
      typeof body.question === "string" ? body.question.trim() : "";
    const rawOptions = Array.isArray(body.options) ? body.options : [];
    const createdById =
      typeof body.createdById === "string" ? body.createdById : "";

    if (!rawQuestion || rawQuestion.length < 5) {
      return NextResponse.json(
        { error: "Soalan poll wajib diisi (minimum 5 aksara)." },
        { status: 400 }
      );
    }

    const optionTexts = rawOptions
      .map((o) => (typeof o === "string" ? o.trim() : ""))
      .filter((text) => text.length > 0);

    if (optionTexts.length < 2) {
      return NextResponse.json(
        { error: "Sekurang-kurangnya dua pilihan jawapan diperlukan." },
        { status: 400 }
      );
    }

    if (!createdById) {
      return NextResponse.json(
        { error: "Maklumat admin tidak sah." },
        { status: 400 }
      );
    }

    const creator = await prisma.user.findUnique({
      where: { id: createdById },
      select: { id: true, role: true },
    });

    if (!creator || !String(creator.role || "").startsWith("ADMIN")) {
      return NextResponse.json(
        { error: "Hanya admin dibenarkan mencipta poll." },
        { status: 403 }
      );
    }

    await prisma.poll.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    const poll = await prisma.poll.create({
      data: {
        question: rawQuestion,
        isActive: true,
        createdById: creator.id,
        options: {
          create: optionTexts.map((text) => ({ text })),
        },
      },
      include: {
        options: true,
      },
    });

    return NextResponse.json({
      poll: {
        id: poll.id,
        question: poll.question,
        isActive: poll.isActive,
        options: poll.options.map((o) => ({
          id: o.id,
          text: o.text,
        })),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Ralat pelayan semasa mencipta poll." },
      { status: 500 }
    );
  }
}
