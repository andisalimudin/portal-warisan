import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z, ZodError } from "zod";
import { getPrisma } from "@/lib/prisma";

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = loginSchema.parse(json);

    const identifier = parsed.identifier.trim();
    const password = parsed.password;

    const prisma = getPrisma();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { icNumber: identifier },
        ],
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ID atau kata laluan tidak sah." },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      return NextResponse.json(
        { error: "ID atau kata laluan tidak sah." },
        { status: 401 }
      );
    }

    if (user.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Keahlian anda belum diluluskan." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Maklumat tidak sah. Sila semak borang anda." },
        { status: 400 }
      );
    }

    console.error("LOGIN_API_ERROR", error);

    const message =
      process.env.NODE_ENV !== "production" && error instanceof Error
        ? error.message
        : "Ralat pelayan. Sila cuba lagi sebentar lagi.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
