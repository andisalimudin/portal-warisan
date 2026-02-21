import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

type BranchStatus = "AKTIF" | "TIDAK_AKTIF";

function mapBranchStatus(status: string | null | undefined): BranchStatus {
  if (status === "TIDAK_AKTIF") return "TIDAK_AKTIF";
  return "AKTIF";
}

export async function GET() {
  try {
    const prisma = getPrisma() as any;

    let branches = await prisma.branch.findMany({
      orderBy: { createdAt: "asc" },
    });

    if (!branches.length) {
      await prisma.branch.createMany({
        data: [
          {
            name: "Cawangan Taman Mawar",
            code: "SIB-001",
            status: "AKTIF",
            leaderName: "Haji Ahmad bin Kassim",
            leaderPhone: "013-8881234",
            location: "Taman Mawar, Jalan Sibuga",
          },
          {
            name: "Cawangan Kg. Sungai Kayu",
            code: "SIB-002",
            status: "AKTIF",
            leaderName: "Encik Yusof bin Ismail",
            leaderPhone: "019-5556789",
            location: "Kg. Sungai Kayu, Sandakan",
          },
          {
            name: "Cawangan Flat Sibuga",
            code: "SIB-003",
            status: "AKTIF",
            leaderName: "Puan Fatimah binti Ali",
            leaderPhone: "011-2223334",
            location: "Flat Sibuga, Batu 8",
          },
          {
            name: "Cawangan Kg. Bahagia",
            code: "SIB-004",
            status: "TIDAK_AKTIF",
            leaderName: "Encik Ramli bin Mat",
            leaderPhone: "014-7778899",
            location: "Kg. Bahagia, Mile 7",
          },
        ],
      });

      branches = await prisma.branch.findMany({
        orderBy: { createdAt: "asc" },
      });
    }

    const result = await Promise.all(
      branches.map(async (b) => {
        const memberCount = await prisma.user.count({
          where: { dun: b.name },
        });

        return {
          id: b.id,
          name: b.name,
          code: b.code,
          status: mapBranchStatus(b.status),
          leaderName: b.leaderName || "",
          leaderPhone: b.leaderPhone || "",
          location: b.location || "",
          memberCount,
          establishedDate: b.createdAt.toISOString().slice(0, 10),
        };
      })
    );

    return NextResponse.json({ branches: result });
  } catch (error) {
    console.error("ADMIN_BRANCHES_GET_ERROR", error);

    return NextResponse.json(
      { error: "Ralat pelayan. Sila cuba lagi sebentar lagi." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const prisma = getPrisma() as any;
    const body = await req.json().catch(() => ({}));

    const name = typeof body.name === "string" ? body.name.trim() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const status = mapBranchStatus(body.status);
    const leaderName =
      typeof body.leaderName === "string" ? body.leaderName.trim() : "";
    const leaderPhone =
      typeof body.leaderPhone === "string" ? body.leaderPhone.trim() : "";
    const location =
      typeof body.location === "string" ? body.location.trim() : "";

    if (!name || !code) {
      return NextResponse.json(
        { error: "Nama dan kod cawangan diperlukan." },
        { status: 400 }
      );
    }

    const created = await prisma.branch.create({
      data: {
        name,
        code,
        status,
        leaderName: leaderName || null,
        leaderPhone: leaderPhone || null,
        location: location || null,
      },
    });

    return NextResponse.json({
      branch: {
        id: created.id,
        name: created.name,
        code: created.code,
        status: mapBranchStatus(created.status),
        leaderName: created.leaderName || "",
        leaderPhone: created.leaderPhone || "",
        location: created.location || "",
        memberCount: 0,
        establishedDate: created.createdAt.toISOString().slice(0, 10),
      },
    });
  } catch (error) {
    console.error("ADMIN_BRANCHES_POST_ERROR", error);

    return NextResponse.json(
      { error: "Ralat semasa menambah cawangan." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const prisma = getPrisma() as any;
    const body = await req.json().catch(() => ({}));

    const id = typeof body.id === "string" ? body.id : "";

    if (!id) {
      return NextResponse.json(
        { error: "ID cawangan tidak diberikan." },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = {};

    if (typeof body.name === "string") data.name = body.name.trim();
    if (typeof body.code === "string") data.code = body.code.trim();
    if (typeof body.status === "string")
      data.status = mapBranchStatus(body.status);
    if (typeof body.leaderName === "string")
      data.leaderName = body.leaderName.trim();
    if (typeof body.leaderPhone === "string")
      data.leaderPhone = body.leaderPhone.trim();
    if (typeof body.location === "string")
      data.location = body.location.trim();

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
        status: mapBranchStatus(updated.status),
        leaderName: updated.leaderName || "",
        leaderPhone: updated.leaderPhone || "",
        location: updated.location || "",
        memberCount,
        establishedDate: updated.createdAt.toISOString().slice(0, 10),
      },
    });
  } catch (error) {
    console.error("ADMIN_BRANCHES_PATCH_ERROR", error);

    return NextResponse.json(
      { error: "Ralat semasa mengemas kini cawangan." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const prisma = getPrisma() as any;
    const body = await req.json().catch(() => ({}));

    const id = typeof body.id === "string" ? body.id : "";

    if (!id) {
      return NextResponse.json(
        { error: "ID cawangan tidak diberikan." },
        { status: 400 }
      );
    }

    await prisma.branch.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN_BRANCHES_DELETE_ERROR", error);

    return NextResponse.json(
      { error: "Ralat semasa memadam cawangan." },
      { status: 500 }
    );
  }
}
