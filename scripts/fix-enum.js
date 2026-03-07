
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Mula pembaikan kecemasan data role...');

  try {
    // 1. Tukar column role kepada TEXT sementara untuk membuang kebergantungan pada Enum
    console.log('Menukar column role ke TEXT sementara...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ALTER COLUMN role TYPE TEXT;`);

    // 2. Kemaskini nilai role lama kepada yang baharu (String replacement)
    console.log('Mengemaskini nilai role...');
    await prisma.$executeRawUnsafe(`UPDATE "User" SET role = 'ADMIN' WHERE role IN ('ADMIN_PUSAT', 'ADMIN_NEGERI');`);
    await prisma.$executeRawUnsafe(`UPDATE "User" SET role = 'KETUA_CAWANGAN' WHERE role = 'ADMIN_KAWASAN';`);
    await prisma.$executeRawUnsafe(`UPDATE "User" SET role = 'SUKARELAWAN' WHERE role = 'AHLI_BIASA';`);
    
    // Fallback untuk nilai pelik
    await prisma.$executeRawUnsafe(`UPDATE "User" SET role = 'SUKARELAWAN' WHERE role NOT IN ('ADMIN', 'KETUA_CAWANGAN', 'ADUN', 'SUKARELAWAN');`);

    // 3. Drop Enum lama jika wujud (untuk pastikan bersih)
    try {
        await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "Role";`);
        await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "Role_new";`);
        await prisma.$executeRawUnsafe(`DROP TYPE IF EXISTS "Role_old";`);
        console.log('Dropped old Role enums.');
    } catch (e) {
        console.log('Enum cleanup warning (safe to ignore):', e.message);
    }

    // 4. Create Enum Baharu
    console.log('Mencipta Enum Role baharu...');
    await prisma.$executeRawUnsafe(`CREATE TYPE "Role" AS ENUM ('ADMIN', 'KETUA_CAWANGAN', 'ADUN', 'SUKARELAWAN');`);

    // 5. Tukar semula column ke Enum dan set Default
    console.log('Menukar semula column role ke Enum...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ALTER COLUMN role TYPE "Role" USING role::"Role";`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ALTER COLUMN role SET DEFAULT 'SUKARELAWAN'::"Role";`);

    console.log('✅ Pembaikan berjaya! Sila jalankan "npx prisma db push" sekarang.');
  } catch (e) {
    console.error('❌ Pembaikan gagal:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
