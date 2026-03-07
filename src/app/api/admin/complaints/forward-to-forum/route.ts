
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const prisma = getPrisma();
    const body = await req.json().catch(() => ({}));

    const complaintId = typeof body.complaintId === "string" ? body.complaintId : null;
    const adminId = typeof body.adminId === "string" ? body.adminId : null;
    const categoryId = typeof body.categoryId === "string" ? body.categoryId : null;

    if (!complaintId || !adminId || !categoryId) {
      return NextResponse.json(
        { error: "Maklumat tidak lengkap (complaintId, adminId, categoryId diperlukan)." },
        { status: 400 }
      );
    }

    // 1. Get complaint details
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { reporter: true },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: "Aduan tidak dijumpai." },
        { status: 404 }
      );
    }

    // 2. Verify Admin
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || !admin.role.startsWith("ADMIN")) {
      return NextResponse.json(
        { error: "Hanya admin dibenarkan melakukan tindakan ini." },
        { status: 403 }
      );
    }

    // 3. Create Forum Post
    // Improved Format: Use HTML because the forum uses dangerouslySetInnerHTML
    let content = `<p><strong>BUTIRAN ADUAN (Tiket: #${complaint.ticketId})</strong></p>`;
    content += `<p><strong>Lokasi:</strong><br/>${complaint.location}`;
    if (complaint.area) content += ` (${complaint.area})`;
    content += `</p>`;
    
    content += `<p><strong>Huraian Masalah:</strong><br/>${complaint.description.replace(/\n/g, "<br/>")}</p>`;
    
    if (complaint.images && complaint.images.length > 0) {
      content += `<p><strong>Lampiran Gambar:</strong></p>`;
      complaint.images.forEach((img, idx) => {
        content += `<div class="mb-4"><img src="${img}" alt="Lampiran ${idx + 1}" class="rounded-lg border border-gray-200 shadow-sm max-w-full h-auto" style="max-height: 400px;" /></div>`;
      });
    } else if (complaint.imageUrl) {
        content += `<p><strong>Lampiran Gambar:</strong></p><div class="mb-4"><img src="${complaint.imageUrl}" alt="Lampiran" class="rounded-lg border border-gray-200 shadow-sm max-w-full h-auto" style="max-height: 400px;" /></div>`;
    }

    content += `<hr class="my-4" /><p class="text-sm text-gray-500 italic">Topik ini dibuka secara automatik daripada sistem aduan untuk perbincangan lanjut.</p>`;

    const post = await prisma.forumPost.create({
      data: {
        title: `Perbincangan Aduan: ${complaint.title}`,
        content: content,
        authorId: adminId, // Posted by Admin
        categoryId: categoryId,
        isPinned: false,
      },
    });

    // 4. Update Complaint Timeline
    await prisma.complaintTimeline.create({
      data: {
        complaintId: complaint.id,
        status: complaint.status,
        title: "Dimajukan ke Forum",
        note: `Aduan telah dimajukan ke forum untuk perbincangan (Post ID: ${post.id})`,
        actorName: admin.fullName,
      },
    });

    return NextResponse.json({
      success: true,
      postId: post.id,
      message: "Aduan berjaya dimajukan ke forum.",
    });

  } catch (error) {
    console.error("FORWARD_COMPLAINT_TO_FORUM_ERROR", error);
    return NextResponse.json(
      { error: "Ralat semasa memajukan aduan ke forum." },
      { status: 500 }
    );
  }
}
