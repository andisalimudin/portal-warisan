
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      name, 
      phone, 
      title, 
      category, 
      description, 
      location, 
      area 
    } = body;

    // Validation
    if (!name || !title || !category || !description || !location) {
      return NextResponse.json(
        { error: "Sila lengkapkan semua maklumat wajib." },
        { status: 400 }
      );
    }

    const prisma = getPrisma();

    // Generate Ticket ID (e.g., ADU-20231025-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `ADU-${dateStr}-${randomSuffix}`;

    // Create Complaint
    const complaint = await prisma.complaint.create({
      data: {
        ticketId,
        title,
        category,
        description,
        location,
        area: area || null,
        reporterName: name,
        reporterPhone: phone || null,
        status: "PENDING",
        priority: "MEDIUM",
        // reporterId is null for public complaints
        timeline: {
          create: {
            status: "PENDING",
            title: "Aduan Diterima",
            note: "Aduan telah diterima daripada portal awam.",
            actorName: "Sistem",
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      ticketId: complaint.ticketId,
      message: "Aduan anda telah berjaya dihantar." 
    });

  } catch (error) {
    console.error("Error creating public complaint:", error);
    return NextResponse.json(
      { error: "Berlaku ralat semasa menghantar aduan." },
      { status: 500 }
    );
  }
}
