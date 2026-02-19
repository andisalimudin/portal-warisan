import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getPrisma() {
  if (!globalForPrisma.prisma) {
    const accelerateUrl = process.env.DATABASE_URL;

    if (!accelerateUrl) {
      throw new Error("DATABASE_URL is not set");
    }

    globalForPrisma.prisma = new PrismaClient({
      accelerateUrl,
    }).$extends(withAccelerate());
  }

  return globalForPrisma.prisma;
}
