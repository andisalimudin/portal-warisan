import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function getPrisma() {
  if (!globalForPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL;

    // Jika connection string bermula dengan 'postgres://' atau 'postgresql://'
    // dan kita menggunakan driver adapter, kita perlu initialize Pool
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: ['warn', 'error'],
    });
  }

  return globalForPrisma.prisma;
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = getPrisma();

