
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Mula migrasi role pengguna...');

  try {
    // 1. Rename existing enum (jika belum ditukar)
    // Kita guna try-catch untuk langkah ini sekiranya enum sudah berubah separa
    try {
      await prisma.$executeRawUnsafe(`ALTER TYPE "Role" RENAME TO "Role_old";`);
      console.log('Renamed old Role enum.');
    } catch (e) {
      console.log('Role enum might already be renamed or not exists, proceeding...');
    }
    
    // 2. Create new enum
    try {
        await prisma.$executeRawUnsafe(`CREATE TYPE "Role" AS ENUM ('ADMIN', 'KETUA_CAWANGAN', 'ADUN', 'SUKARELAWAN');`);
        console.log('Created new Role enum.');
    } catch (e) {
        console.log('New Role enum might already exist, proceeding...');
    }

    // 3. Update User table
    console.log('Updating User table...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" 
      ALTER COLUMN role TYPE "Role" 
      USING (
        CASE role::text
          WHEN 'ADMIN_PUSAT' THEN 'ADMIN'::"Role"
          WHEN 'ADMIN_NEGERI' THEN 'ADMIN'::"Role"
          WHEN 'ADMIN_KAWASAN' THEN 'KETUA_CAWANGAN'::"Role"
          WHEN 'AHLI_BIASA' THEN 'SUKARELAWAN'::"Role"
          WHEN 'ADMIN' THEN 'ADMIN'::"Role"
          WHEN 'KETUA_CAWANGAN' THEN 'KETUA_CAWANGAN'::"Role"
          WHEN 'ADUN' THEN 'ADUN'::"Role"
          WHEN 'SUKARELAWAN' THEN 'SUKARELAWAN'::"Role"
          ELSE 'SUKARELAWAN'::"Role"
        END
      );
    `);

    // 4. Drop old enum
    try {
        await prisma.$executeRawUnsafe(`DROP TYPE "Role_old";`);
        console.log('Dropped old Role enum.');
    } catch (e) {
        console.log('Old Role enum might already be dropped.');
    }
    
    // 5. Set default
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ALTER COLUMN role SET DEFAULT 'SUKARELAWAN'::"Role";`);

    console.log('✅ Migrasi berjaya! Role pengguna telah dikemaskini.');
  } catch (e) {
    console.error('❌ Migrasi gagal:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
