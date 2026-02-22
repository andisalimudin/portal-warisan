import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Fail tidak diterima." },
        { status: 400 }
      );
    }

    const mime = file.type || "";
    if (!mime.startsWith("image/")) {
      return NextResponse.json(
        { error: "Hanya fail gambar dibenarkan." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Saiz gambar melebihi 5MB." },
        { status: 400 }
      );
    }

    const ext = mime === "image/png" ? ".png" : ".jpg";
    const fileName = `${randomUUID()}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "complaints");
    fs.mkdirSync(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const urlPath = `/uploads/complaints/${fileName}`;

    return NextResponse.json({ url: urlPath });
  } catch (error) {
    console.error("COMPLAINT_IMAGE_UPLOAD_ERROR", error);
    return NextResponse.json(
      { error: "Ralat semasa memuat naik gambar." },
      { status: 500 }
    );
  }
}

