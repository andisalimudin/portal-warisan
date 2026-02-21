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
        address: user.address,
        state: user.state,
        parliament: user.parliament,
        dun: user.dun,
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

export async function PATCH(req: Request) {
  try {
    const prisma = getPrisma() as PrismaClient;
    const body = await req.json().catch(() => ({}));

    const userId = typeof body.userId === "string" ? body.userId : null;

    if (!userId) {
      return NextResponse.json(
        { error: "ID pengguna tidak diberikan." },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};

    if (typeof body.fullName === "string") data.fullName = body.fullName;
    if (typeof body.phoneNumber === "string") data.phoneNumber = body.phoneNumber;
    if (typeof body.address === "string") data.address = body.address;
    if (typeof body.state === "string") data.state = body.state;
    if (typeof body.parliament === "string") data.parliament = body.parliament;
    if (typeof body.dun === "string") data.dun = body.dun;

    if (!Object.keys(data).length) {
      return NextResponse.json(
        { error: "Tiada data untuk dikemas kini." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        icNumber: user.icNumber,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
        state: user.state,
        parliament: user.parliament,
        dun: user.dun,
        role: user.role,
        status: user.status,
        referralCode: user.referralCode,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR", error);

    return NextResponse.json(
      { error: "Ralat semasa mengemas kini profil." },
      { status: 500 }
    );
  }
}
