import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

type DbUserStatus = "APPROVED" | "PENDING" | "SUSPENDED" | "REJECTED";

function mapUserStatusToMemberStatus(status: DbUserStatus): "AKTIF" | "MENUNGGU" | "DIGANTUNG" {
  if (status === "APPROVED") return "AKTIF";
  if (status === "PENDING") return "MENUNGGU";
  return "DIGANTUNG";
}

function mapMemberStatusToUserStatus(status: "AKTIF" | "MENUNGGU" | "DIGANTUNG"): DbUserStatus {
  if (status === "AKTIF") return "APPROVED";
  if (status === "MENUNGGU") return "PENDING";
  return "SUSPENDED";
}

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
      status: mapUserStatusToMemberStatus(u.status),
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

export async function PATCH(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json().catch(() => ({}));

    const ids = Array.isArray(body.ids) ? (body.ids as string[]) : [];
    const status = body.status as "AKTIF" | "MENUNGGU" | "DIGANTUNG" | undefined;

    if (!ids.length || !status) {
      return NextResponse.json(
        { error: "Parameter ids atau status tidak sah." },
        { status: 400 }
      );
    }

    const newStatus = mapMemberStatusToUserStatus(status);

    await prisma.user.updateMany({
      where: { id: { in: ids } },
      data: { status: newStatus },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_MEMBERS_PATCH_ERROR", error);

    return NextResponse.json(
      { error: "Ralat semasa mengemas kini status ahli." },
      { status: 500 }
    );
  }
}
