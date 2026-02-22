import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma() as any;
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "ID cawangan tidak sah." },
        { status: 400 }
      );
    }

    const branch = await prisma.branch.findUnique({
      where: { id },
    });

    if (!branch) {
      return NextResponse.json(
        { error: "Cawangan tidak dijumpai." },
        { status: 404 }
      );
    }

    const memberCount = await prisma.user.count({
      where: { dun: branch.name },
    });

    return NextResponse.json({
      branch: {
        id: branch.id,
        name: branch.name,
        code: branch.code,
        status: branch.status,
        leaderName: branch.leaderName || "",
        leaderPhone: branch.leaderPhone || "",
        location: branch.location || "",
        description: branch.description || "",
        activities: branch.activities || "",
        calendar: branch.calendar || "",
        memberCount,
        establishedDate: branch.createdAt.toISOString().slice(0, 10),
      },
    });
  } catch (error) {
    console.error("BRANCH_DETAIL_GET_ERROR", error);

    return NextResponse.json(
      { error: "Ralat pelayan. Sila cuba lagi sebentar lagi." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma() as any;
    const { id } = await context.params;
    const body = await req.json().catch(() => ({}));

    if (!id) {
      return NextResponse.json(
        { error: "ID cawangan tidak sah." },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};

    if (typeof body.description === "string") {
      data.description = body.description.trim();
    }
    if (typeof body.activities === "string") {
      data.activities = body.activities.trim();
    }
    if (typeof body.calendar === "string") {
      data.calendar = body.calendar.trim();
    }

    if (!Object.keys(data).length) {
      return NextResponse.json(
        { error: "Tiada data untuk dikemas kini." },
        { status: 400 }
      );
    }

    const updated = await prisma.branch.update({
      where: { id },
      data,
    });

    const memberCount = await prisma.user.count({
      where: { dun: updated.name },
    });

    return NextResponse.json({
      branch: {
        id: updated.id,
        name: updated.name,
        code: updated.code,
        status: updated.status,
        leaderName: updated.leaderName || "",
        leaderPhone: updated.leaderPhone || "",
        location: updated.location || "",
        description: updated.description || "",
        activities: updated.activities || "",
        calendar: updated.calendar || "",
        memberCount,
        establishedDate: updated.createdAt.toISOString().slice(0, 10),
      },
    });
  } catch (error) {
    console.error("BRANCH_DETAIL_PATCH_ERROR", error);

    return NextResponse.json(
      { error: "Ralat semasa mengemas kini maklumat cawangan." },
      { status: 500 }
    );
  }
}

