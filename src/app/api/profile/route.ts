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

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Pengguna tidak dijumpai." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        icNumber: user.icNumber,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: (user as any).address ?? null,
        city: (user as any).city ?? null,
        state: user.state,
        parliament: (user as any).parliament ?? null,
        dun: (user as any).dun ?? null,
        role: user.role,
        status: user.status,
        referralCode: user.referralCode,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("PROFILE_ERROR", error);

    return NextResponse.json(
      { error: "Ralat pelayan. Sila cuba lagi sebentar lagi." },
      { status: 500 }
    );
  }
}

