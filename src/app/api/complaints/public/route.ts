
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const description = formData.get("description") as string;
    const location = formData.get("location") as string;
    const area = formData.get("area") as string;
    const image = formData.get("image") as File | null;

    // Validation
    if (!name || !title || !category || !description || !location) {
      return NextResponse.json(
        { error: "Sila lengkapkan semua maklumat wajib." },
        { status: 400 }
      );
    }

    // Process image upload
    let imageUrl: string | null = null;
    if (image && image.size > 0) {
      if (image.size > 100 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Saiz gambar terlalu besar (Maksimum 100MB)." },
          { status: 400 }
        );
      }

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create uploads directory if it doesn't exist (handled by OS usually, but good to know path)
      // For simple local storage in Next.js public folder:
      const fileName = `${uuidv4()}-${image.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
      const publicPath = join(process.cwd(), "public", "uploads", "complaints");
      const filePath = join(publicPath, fileName);
      
      // Ensure directory exists
      const fs = require('fs');
      if (!fs.existsSync(publicPath)){
          fs.mkdirSync(publicPath, { recursive: true });
      }

      await writeFile(filePath, buffer);
      imageUrl = `/uploads/complaints/${fileName}`;
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
        imageUrl, // Save image URL
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
