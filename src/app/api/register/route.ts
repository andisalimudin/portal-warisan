import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z, ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

const registerSchema = z.object({
  fullName: z.string().min(3),
  icNumber: z.string().min(6),
  phoneNumber: z.string().min(7),
  email: z.string().email(),
  password: z.string().min(8),
  referralCode: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  parliament: z.string().optional(),
  dun: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = registerSchema.parse(json);

    const icNumber = parsed.icNumber.trim();
    const email = parsed.email.trim().toLowerCase();

    const prisma = getPrisma();

    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ icNumber }, { email }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "No. IC atau emel telah didaftarkan." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);

    const referralCodeRaw = parsed.referralCode?.trim();
    const address = parsed.address?.trim() || null;
    const state = parsed.state?.trim() || null;
    const parliament = parsed.parliament?.trim() || null;
    const dun = parsed.dun?.trim() || null;

    let referrerId: string | null = null;

    if (referralCodeRaw) {
      const referrer = await prisma.user.findFirst({
        where: {
          referralCode: {
            startsWith: referralCodeRaw,
          },
        },
      });

      if (!referrer) {
        return NextResponse.json(
          { error: "Kod referral tidak sah." },
          { status: 400 }
        );
      }

      referrerId = referrer.id;
    }

    const data: Prisma.UserCreateInput = {
      fullName: parsed.fullName.trim(),
      icNumber,
      email,
      phoneNumber: parsed.phoneNumber.trim(),
      passwordHash,
      address,
      state,
      parliament,
      dun,
    };

    if (referrerId) {
      data.referredBy = {
        connect: {
          id: referrerId,
        },
      };
    }

    await prisma.user.create({
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Maklumat tidak sah. Sila semak borang anda." },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "No. IC atau emel telah didaftarkan." },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Ralat pelayan. Sila cuba lagi sebentar lagi." },
      { status: 500 }
    );
  }
}
