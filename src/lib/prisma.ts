import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const url = process.env.DATABASE_URL;

    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }

    // Jika guna Prisma Postgres (prisma+postgres://), gunakan Accelerate
    if (url.startsWith("prisma+postgres://")) {
      globalForPrisma.prisma = new PrismaClient({
        accelerateUrl: url,
      }).$extends(withAccelerate());
    } else {
      // Jika guna Postgres biasa (postgres:// atau postgresql://), gunakan adapter PG
      const adapter = new PrismaPg({
        connectionString: url,
      });

      globalForPrisma.prisma = new PrismaClient({
        adapter,
      });
    }
  }

  return globalForPrisma.prisma!;
}
