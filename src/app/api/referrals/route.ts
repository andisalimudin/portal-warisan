import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "ID pengguna tidak diberikan." },
        { status: 400 }
      );
    }

    const prisma = getPrisma() as PrismaClient;

    const referrals = await prisma.user.findMany({
      where: { referredById: userId },
      orderBy: { createdAt: "desc" },
    });

    const total = referrals.length;
    const active = referrals.filter((u) => u.status === "APPROVED").length;
    const pending = referrals.filter((u) => u.status === "PENDING").length;
    const points = active * 10;

    return NextResponse.json({
      stats: {
        total,
        active,
        pending,
        points,
      },
      referrals: referrals.map((u) => ({
        id: u.id,
        name: u.fullName,
        date: u.createdAt.toISOString(),
        status: u.status,
        role: u.role,
        location: u.dun ?? u.parliament ?? u.address ?? null,
      })),
    });
  } catch (error) {
    console.error("REFERRALS_GET_ERROR", error);

    return NextResponse.json(
      { error: "Ralat pelayan semasa memuatkan senarai referral." },
      { status: 500 }
    );
  }
}

