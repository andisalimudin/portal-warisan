import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const prisma = getPrisma();
    
    const letter = await prisma.aiLetter.findUnique({
      where: { id }
    });

    if (!letter) {
      return NextResponse.json({ error: "Surat tidak dijumpai" }, { status: 404 });
    }

    return NextResponse.json({ letter });
  } catch (error) {
    return NextResponse.json({ error: "Ralat mengambil surat" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const prisma = getPrisma();

    await prisma.aiLetter.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Ralat memadam surat" }, { status: 500 });
  }
}
