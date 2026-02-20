import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

type DbUserStatus = "APPROVED" | "PENDING" | "SUSPENDED" | "REJECTED";
type DbUserRole = "AHLI_BIASA" | "ADMIN_PUSAT";

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

function mapUserRoleToMemberRole(role: DbUserRole): "AHLI" | "ADMIN" {
  if (role === "ADMIN_PUSAT") return "ADMIN";
  return "AHLI";
}

function mapMemberRoleToUserRole(role: "AHLI" | "KETUA_CAWANGAN" | "ADMIN" | "CYBERTROOPER"): DbUserRole {
  if (role === "ADMIN") return "ADMIN_PUSAT";
  return "AHLI_BIASA";
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
      role: mapUserRoleToMemberRole(u.role as DbUserRole),
      status: mapUserStatusToMemberStatus(u.status as DbUserStatus),
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
    const role = body.role as "AHLI" | "KETUA_CAWANGAN" | "ADMIN" | "CYBERTROOPER" | undefined;

    if (ids.length && status) {
      const newStatus = mapMemberStatusToUserStatus(status);

      await prisma.user.updateMany({
        where: { id: { in: ids } },
        data: { status: newStatus },
      });

      return NextResponse.json({ success: true });
    }

    if (ids.length && role) {
      const newRole = mapMemberRoleToUserRole(role);

      await prisma.user.updateMany({
        where: { id: { in: ids } },
        data: { role: newRole },
      });

      return NextResponse.json({ success: true });
    }

    if (typeof body.id === "string") {
      const id = body.id as string;
      const data: Record<string, unknown> = {};

      if (typeof body.name === "string") data.fullName = body.name;
      if (typeof body.memberId === "string") data.referralCode = body.memberId;
      if (typeof body.phone === "string") data.phoneNumber = body.phone;
      if (typeof body.email === "string") data.email = body.email;
      if (role) data.role = mapMemberRoleToUserRole(role);

      if (!Object.keys(data).length) {
        return NextResponse.json(
          { error: "Tiada data untuk dikemas kini." },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id },
        data,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Permintaan kemas kini tidak sah." },
      { status: 400 }
    );
  } catch (error) {
    console.error("ADMIN_MEMBERS_PATCH_ERROR", error);

    return NextResponse.json(
      { error: "Ralat semasa mengemas kini status ahli." },
      { status: 500 }
    );
  }
}
