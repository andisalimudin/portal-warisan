import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  try {
    const prisma = getPrisma();

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    const members = users.map((u) => ({
      id: u.id,
      name: u.fullName,
      memberId: u.referralCode,
      phone: u.phoneNumber,
      email: u.email,
      branch: "",
      role: u.role === "AHLI_BIASA" ? "AHLI" : "ADMIN",
      status:
        u.status === "APPROVED"
          ? "AKTIF"
          : u.status === "PENDING"
          ? "MENUNGGU"
          : "DIGANTUNG",
      joinedAt: u.createdAt.toISOString().slice(0, 10),
    }));

    return NextResponse.json({ members });
  } catch (error) {
    console.error("ADMIN_MEMBERS_ERROR", error);

    return NextResponse.json(
      { error: "Ralat pelayan. Sila cuba lagi sebentar lagi." },
      { status: 500 }
    );
  }
}

