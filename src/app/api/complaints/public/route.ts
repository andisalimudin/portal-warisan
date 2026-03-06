
import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import * as fs from 'fs';

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
    
    // Get all images
    const images = formData.getAll("images") as File[];

    // Validation
    if (!name || !title || !category || !description || !location) {
      return NextResponse.json(
        { error: "Sila lengkapkan semua maklumat wajib." },
        { status: 400 }
      );
    }

    // Process image uploads
    const imageUrls: string[] = [];
    let totalSize = 0;

    if (images.length > 5) {
      return NextResponse.json(
        { error: "Maksimum 5 gambar sahaja dibenarkan." },
        { status: 400 }
      );
    }

    const publicPath = join(process.cwd(), "public", "uploads", "complaints");
    if (!fs.existsSync(publicPath)){
      fs.mkdirSync(publicPath, { recursive: true });
    }

    for (const image of images) {
      if (image && image.size > 0) {
        totalSize += image.size;
        
        // Individual file size check (optional, but good practice)
        // Global limit check is done below
      }
    }

    if (totalSize > 200 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Jumlah saiz gambar terlalu besar (Maksimum 200MB)." },
        { status: 400 }
      );
    }

    for (const image of images) {
      if (image && image.size > 0) {
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${uuidv4()}-${image.name.replace(/[^a-zA-Z0-9.]/g, "")}`;
        const filePath = join(publicPath, fileName);
        
        await writeFile(filePath, buffer);
        imageUrls.push(`/uploads/complaints/${fileName}`);
      }
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
        images: imageUrls, // Save array of image URLs
        // imageUrl field is deprecated but we can populate it with first image for backward compatibility if needed
        imageUrl: imageUrls.length > 0 ? imageUrls[0] : null,
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
