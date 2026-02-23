import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const prisma = getPrisma();
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    const poll = await prisma.poll.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        options: true,
        votes: true,
      },
    });

    if (!poll) {
      return NextResponse.json({ poll: null });
    }

    const optionCounts: Record<string, number> = {};
    for (const vote of poll.votes) {
      optionCounts[vote.optionId] = (optionCounts[vote.optionId] || 0) + 1;
    }

    let userVoteOptionId: string | null = null;
    if (userId) {
      const userVote = poll.votes.find((v) => v.userId === userId);
      if (userVote) {
        userVoteOptionId = userVote.optionId;
      }
    }

    const totalVotes = poll.votes.length;

    return NextResponse.json({
      poll: {
        id: poll.id,
        question: poll.question,
        options: poll.options.map((o) => ({
          id: o.id,
          text: o.text,
          votes: optionCounts[o.id] || 0,
        })),
        totalVotes,
        userVoteOptionId,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Ralat pelayan semasa memuatkan poll." },
      { status: 500 }
    );
  }
}
