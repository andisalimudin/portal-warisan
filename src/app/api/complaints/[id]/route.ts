import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    const prisma = getPrisma();

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        reporter: true,
        timeline: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Aduan tidak dijumpai." },
        { status: 404 }
      );
    }

    const result = {
      id: complaint.id,
      ticketId: complaint.ticketId,
      title: complaint.title,
      category: complaint.category,
      status: complaint.status,
      priority: complaint.priority,
      description: complaint.description,
      location: complaint.location,
      area: complaint.area || "",
      reporter: {
        id: complaint.reporterId,
        name: complaint.reporterName,
        phone: complaint.reporterPhone || "",
      },
      createdAt: complaint.createdAt.toISOString(),
      slaDue: complaint.slaDue ? complaint.slaDue.toISOString() : null,
      assignedTo: complaint.assignedTo || "",
      timeline: complaint.timeline.map((t) => ({
        id: t.id,
        status: t.status,
        title: t.title,
        note: t.note || "",
        actor: t.actorName || "",
        createdAt: t.createdAt.toISOString(),
      })),
    };

    return NextResponse.json({ complaint: result });
  } catch (error) {
    console.error("COMPLAINT_DETAIL_ERROR", error);
    return NextResponse.json(
      { error: "Ralat pelayan semasa memuatkan aduan." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    const prisma = getPrisma();
    const body = await req.json().catch(() => ({}));

    const status =
      typeof body.status === "string" && body.status.trim()
        ? (body.status as string).trim()
        : null;
    const priority =
      typeof body.priority === "string" && body.priority.trim()
        ? (body.priority as string).trim()
        : null;
    const assignedTo =
      typeof body.assignedTo === "string" && body.assignedTo.trim()
        ? (body.assignedTo as string).trim()
        : null;
    const note =
      typeof body.note === "string" && body.note.trim()
        ? (body.note as string).trim()
        : null;
    const actorName =
      typeof body.actorName === "string" && body.actorName.trim()
        ? (body.actorName as string).trim()
        : "Admin Portal";

    const data: any = {};

    if (status) data.status = status;
    if (priority) data.priority = priority;
    if (assignedTo !== null) data.assignedTo = assignedTo;

    const updated = await prisma.complaint.update({
      where: { id },
      data,
    });

    if (status || note) {
      await prisma.complaintTimeline.create({
        data: {
          complaintId: updated.id,
          status: (status as any) || updated.status,
          title: status === "RESOLVED" ? "Aduan Selesai" : "Kemaskini Status",
          note: note || "",
          actorName,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("COMPLAINT_UPDATE_ERROR", error);
    return NextResponse.json(
      { error: "Ralat semasa mengemaskini aduan." },
      { status: 500 }
    );
  }
}

