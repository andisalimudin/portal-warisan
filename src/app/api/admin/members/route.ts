import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

type DbUserStatus = "APPROVED" | "PENDING" | "SUSPENDED" | "REJECTED";
type DbUserRole = "SUKARELAWAN" | "ADMIN" | "ADUN" | "KETUA_CAWANGAN";

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

function mapUserRoleToMemberRole(role: DbUserRole): "SUKARELAWAN" | "KETUA_CAWANGAN" | "ADMIN" | "ADUN" {
  if (role === "ADMIN") return "ADMIN";
  if (role === "KETUA_CAWANGAN") return "KETUA_CAWANGAN";
  if (role === "ADUN") return "ADUN";
  return "SUKARELAWAN";
}

function mapMemberRoleToUserRole(role: "SUKARELAWAN" | "KETUA_CAWANGAN" | "ADMIN" | "ADUN"): DbUserRole {
  if (role === "ADMIN") return "ADMIN";
  if (role === "KETUA_CAWANGAN") return "KETUA_CAWANGAN";
  if (role === "ADUN") return "ADUN";
  return "SUKARELAWAN";
}

export async function GET() {
  try {
    const prisma = getPrisma();

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    const members = users.map((u: any) => ({
      id: u.id,
      name: u.fullName,
      memberId: u.referralCode,
      phone: u.phoneNumber,
      email: u.email,
      branch: u.dun || "",
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

export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json().catch(() => ({}));

    // Basic validation
    if (!body.name || !body.email || !body.phone || !body.icNumber) {
        return NextResponse.json(
            { error: "Sila lengkapkan maklumat wajib (Nama, Emel, Telefon, No. IC)." },
            { status: 400 }
        );
    }

    // Check duplicate
    const existing = await prisma.user.findFirst({
        where: {
            OR: [
                { email: body.email },
                { icNumber: body.icNumber }
            ]
        }
    });

    if (existing) {
        return NextResponse.json(
            { error: "Emel atau No. IC telah wujud." },
            { status: 400 }
        );
    }

    // Password
    const rawPassword = body.password || body.icNumber.slice(-6); // Default password: last 6 digits of IC if not provided
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const role = mapMemberRoleToUserRole(body.role || "SUKARELAWAN");
    const status = mapMemberStatusToUserStatus(body.status || "MENUNGGU");

    const newUser = await prisma.user.create({
        data: {
            fullName: body.name,
            email: body.email,
            phoneNumber: body.phone,
            icNumber: body.icNumber,
            passwordHash,
            dun: body.branch || null,
            role,
            status,
            // Optional fields
            address: body.address || null,
            state: body.state || null,
            parliament: body.parliament || null,
        }
    });

    // Format response
    const member = {
        id: newUser.id,
        name: newUser.fullName,
        memberId: newUser.referralCode,
        phone: newUser.phoneNumber,
        email: newUser.email,
        branch: newUser.dun || "",
        role: mapUserRoleToMemberRole(newUser.role as DbUserRole),
        status: mapUserStatusToMemberStatus(newUser.status as DbUserStatus),
        joinedAt: newUser.createdAt.toISOString().slice(0, 10),
    };

    return NextResponse.json({ success: true, member });

  } catch (error) {
    console.error("ADMIN_CREATE_MEMBER_ERROR", error);
    return NextResponse.json(
      { error: "Ralat semasa mencipta ahli baru." },
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
    const role = body.role as "SUKARELAWAN" | "KETUA_CAWANGAN" | "ADMIN" | "ADUN" | undefined;

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
      if (typeof body.branch === "string") data.dun = body.branch;
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
