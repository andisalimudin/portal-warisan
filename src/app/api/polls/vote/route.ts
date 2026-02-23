import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

type VoteRequestBody = {
  pollId?: unknown;
  optionId?: unknown;
  userId?: unknown;
};

export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    let body: VoteRequestBody = {};

    try {
      body = (await req.json()) as VoteRequestBody;
    } catch {
      body = {};
    }

    const pollId = typeof body.pollId === "string" ? body.pollId : "";
    const optionId = typeof body.optionId === "string" ? body.optionId : "";
    const userId = typeof body.userId === "string" ? body.userId : "";

    if (!pollId || !optionId || !userId) {
      return NextResponse.json(
        { error: "Maklumat undian tidak lengkap." },
        { status: 400 }
      );
    }

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: true,
        votes: true,
      },
    });

    if (!poll || !poll.isActive) {
      return NextResponse.json(
        { error: "Poll tidak ditemui atau sudah ditutup." },
        { status: 400 }
      );
    }

    const optionExists = poll.options.some((o) => o.id === optionId);
    if (!optionExists) {
      return NextResponse.json(
        { error: "Pilihan undian tidak sah." },
        { status: 400 }
      );
    }

    const existingVote = poll.votes.find((v) => v.userId === userId);

    if (existingVote) {
      if (existingVote.optionId !== optionId) {
        await prisma.pollVote.update({
          where: { id: existingVote.id },
          data: { optionId },
        });
      }
    } else {
      await prisma.pollVote.create({
        data: {
          pollId,
          optionId,
          userId,
        },
      });
    }

    const updated = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: true,
        votes: true,
      },
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Ralat selepas mengemas kini undian." },
        { status: 500 }
      );
    }

    const optionCounts: Record<string, number> = {};
    for (const vote of updated.votes) {
      optionCounts[vote.optionId] = (optionCounts[vote.optionId] || 0) + 1;
    }

    const totalVotes = updated.votes.length;

    return NextResponse.json({
      poll: {
        id: updated.id,
        question: updated.question,
        options: updated.options.map((o) => ({
          id: o.id,
          text: o.text,
          votes: optionCounts[o.id] || 0,
        })),
        totalVotes,
        userVoteOptionId: optionId,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Ralat pelayan semasa menghantar undian." },
      { status: 500 }
    );
  }
}
