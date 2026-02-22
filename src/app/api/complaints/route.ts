import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

function buildTicketId(index: number) {
  const num = String(index + 1).padStart(3, "0");
  return `#ADU-2026-${num}`;
}

async function getNextTicketId() {
  const prisma = getPrisma();
  const last = await prisma.complaint.findFirst({
    orderBy: { createdAt: "desc" },
    select: { ticketId: true },
  });

  if (!last?.ticketId) {
    return buildTicketId(0);
  }

  const match = last.ticketId.match(/(\d+)$/);
  const lastNum = match ? parseInt(match[1], 10) : 0;
  return buildTicketId(lastNum);
}

export async function GET(req: NextRequest) {
  try {
    const prisma = getPrisma();
    const { searchParams } = new URL(req.url);
    const reporterId = searchParams.get("reporterId");

    let complaints = await prisma.complaint.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: true,
      },
    });

    if (!complaints.length) {
      const reporter =
        (await prisma.user.findFirst({
          where: {
            role: {
              in: ["AHLI_BIASA", "ADMIN_KAWASAN", "ADMIN_NEGERI", "ADMIN_PUSAT"],
            },
          },
          orderBy: { createdAt: "asc" },
        })) ||
        (await prisma.user.findFirst({
          orderBy: { createdAt: "asc" },
        }));

      if (reporter) {
        const baseArea = reporter.dun || reporter.parliament || "N.52 Sungai Sibuga";

        const now = new Date();
        const d1 = new Date(now);
        d1.setDate(now.getDate() - 2);
        const d2 = new Date(now);
        d2.setDate(now.getDate() - 4);
        const d3 = new Date(now);
        d3.setDate(now.getDate() - 7);

        const created = await prisma.complaint.createMany({
          data: [
            {
              ticketId: buildTicketId(0),
              title: "Jalan Berlubang di Kg. Tinusa 2",
              category: "INFRASTRUKTUR",
              description:
                "Terdapat lubang besar di tengah jalan utama masuk ke kampung yang membahayakan penunggang motosikal, terutamanya pada waktu malam kerana tiada lampu jalan.",
              location: "Jalan Utama Kg. Tinusa 2, berhadapan Kedai Runcit Ali",
              area: "Kg. Tinusa 2 (N.52)",
              status: "IN_PROGRESS",
              priority: "HIGH",
              reporterId: reporter.id,
              reporterName: reporter.fullName,
              reporterPhone: reporter.phoneNumber,
              assignedTo: "Ketua Cawangan Tinusa 2",
              slaDue: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
              createdAt: d1,
            },
            {
              ticketId: buildTicketId(1),
              title: "Bantuan Bakul Makanan",
              category: "KEBAJIKAN",
              description:
                "Memohon bantuan bakul makanan untuk keluarga yang terjejas pendapatan di sekitar kawasan kampung.",
              location: baseArea,
              area: baseArea,
              status: "PENDING",
              priority: "MEDIUM",
              reporterId: reporter.id,
              reporterName: reporter.fullName,
              reporterPhone: reporter.phoneNumber,
              assignedTo: "Pusat Khidmat N.52",
              slaDue: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
              createdAt: d2,
            },
            {
              ticketId: buildTicketId(2),
              title: "Lampu Jalan Rosak",
              category: "INFRASTRUKTUR",
              description:
                "Beberapa batang lampu jalan tidak menyala sejak dua minggu lepas di laluan utama ke sekolah.",
              location: baseArea,
              area: baseArea,
              status: "RESOLVED",
              priority: "LOW",
              reporterId: reporter.id,
              reporterName: reporter.fullName,
              reporterPhone: reporter.phoneNumber,
              assignedTo: "Ketua Cawangan Sim-Sim",
              slaDue: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
              createdAt: d3,
            },
          ],
        });

        if (created.count) {
          complaints = await prisma.complaint.findMany({
            orderBy: { createdAt: "desc" },
            include: {
              reporter: true,
            },
          });

          const main = complaints.find((c) => c.ticketId === buildTicketId(0));
          if (main) {
            await prisma.complaint.update({
              where: { id: main.id },
              data: {
                timeline: {
                  create: [
                    {
                      status: "PENDING",
                      title: "Aduan Diterima",
                      note: "Aduan telah didaftarkan ke dalam sistem.",
                      actorName: "Sistem",
                      createdAt: d1,
                    },
                    {
                      status: "IN_PROGRESS",
                      title: "Dalam Tindakan",
                      note: "Tugasan telah diserahkan kepada Ketua Cawangan Tinusa 2 untuk siasatan awal.",
                      actorName: "Admin Pusat",
                      createdAt: new Date(d1.getTime() + 4 * 60 * 60 * 1000),
                    },
                  ],
                },
              },
            });
          }
        }
      }
    }

    if (reporterId) {
      complaints = complaints.filter(
        (c) => c.reporterId && c.reporterId === reporterId
      );
    }

    const items = complaints.map((c) => ({
      id: c.id,
      ticketId: c.ticketId,
      title: c.title,
      category: c.category,
      status: c.status,
      priority: c.priority,
      date: c.createdAt.toISOString(),
      area: c.area || "",
      reporterName: c.reporterName,
      reporterPhone: c.reporterPhone || "",
    }));

    return NextResponse.json({ complaints: items });
  } catch (error) {
    console.error("COMPLAINTS_LIST_ERROR", error);
    return NextResponse.json(
      { error: "Ralat pelayan semasa memuatkan aduan." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const prisma = getPrisma();
    const body = await req.json().catch(() => ({}));

    const category =
      typeof body.category === "string" && body.category.trim()
        ? (body.category as string).trim()
        : null;
    const title =
      typeof body.title === "string" && body.title.trim()
        ? (body.title as string).trim()
        : null;
    const description =
      typeof body.description === "string" && body.description.trim()
        ? (body.description as string).trim()
        : null;
    const location =
      typeof body.location === "string" && body.location.trim()
        ? (body.location as string).trim()
        : null;
    const reporterId =
      typeof body.reporterId === "string" && body.reporterId.trim()
        ? (body.reporterId as string).trim()
        : null;
    const reporterName =
      typeof body.reporterName === "string" && body.reporterName.trim()
        ? (body.reporterName as string).trim()
        : null;
    const reporterPhone =
      typeof body.reporterPhone === "string" && body.reporterPhone.trim()
        ? (body.reporterPhone as string).trim()
        : null;
    const area =
      typeof body.area === "string" && body.area.trim()
        ? (body.area as string).trim()
        : null;
    const imageUrl =
      typeof body.imageUrl === "string" && body.imageUrl.trim()
        ? (body.imageUrl as string).trim()
        : null;

    if (!category || !title || !description || !location) {
      return NextResponse.json(
        { error: "Data aduan tidak lengkap." },
        { status: 400 }
      );
    }

    let finalReporterName = reporterName || "";
    let finalReporterPhone = reporterPhone || "";
    let finalArea = area || "";
    let finalReporterId: string | null = reporterId;

    if (reporterId && (!reporterName || !reporterPhone || !area)) {
      const user = await prisma.user.findUnique({
        where: { id: reporterId },
      });
      if (user) {
        if (!finalReporterName) finalReporterName = user.fullName;
        if (!finalReporterPhone) finalReporterPhone = user.phoneNumber;
        if (!finalArea) finalArea = user.dun || user.parliament || finalArea;
      }
    }

    if (!finalReporterName) {
      finalReporterName = "Pengadu Portal";
    }

    const ticketId = await getNextTicketId();

    const complaint = await prisma.complaint.create({
      data: {
        ticketId,
        title,
        category,
        description,
        location,
        area: finalArea || "N.52 Sungai Sibuga",
        status: "PENDING",
        priority: "MEDIUM",
        reporterId: finalReporterId || undefined,
        reporterName: finalReporterName,
        reporterPhone: finalReporterPhone || null,
        imageUrl: imageUrl || null,
        assignedTo: "Pusat Khidmat N.52",
        slaDue: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 7),
      },
    });

    await prisma.complaint.update({
      where: { id: complaint.id },
      data: {
        timeline: {
          create: {
            status: "PENDING",
            title: "Aduan Diterima",
            note: "Aduan telah didaftarkan ke dalam sistem.",
            actorName: "Sistem",
          },
        },
      },
    });

    return NextResponse.json({
      complaint: {
        id: complaint.id,
        ticketId: complaint.ticketId,
      },
    });
  } catch (error) {
    console.error("COMPLAINT_CREATE_ERROR", error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Ralat semasa menghantar aduan.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
