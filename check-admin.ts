
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const admin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (admin) {
      console.log('✅ Admin user found:');
      console.log('ID:', admin.id);
      console.log('Email:', admin.email);
      console.log('IC Number:', admin.icNumber);
      console.log('Role:', admin.role);
      console.log('Status:', admin.status);
    } else {
      console.log('❌ No admin user found in the database.');
    }

    const allUsers = await prisma.user.findMany({
      select: { email: true, role: true, icNumber: true }
    });
    console.log('\n--- All Users Summary ---');
    console.table(allUsers);

  } catch (error) {
    console.error('Error checking admin:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
