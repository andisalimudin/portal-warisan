
// Skrip ini direka untuk dijalankan terus menggunakan `node` tanpa perlu compile TypeScript atau Prisma
// Ia menggunakan library 'pg' standard untuk berhubung dengan database

const { Client } = require('pg');

// Dapatkan connection string dari command line argument atau environment variable
const connectionString = process.argv[2] || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ Sila berikan DATABASE_URL sebagai argument atau set environment variable.');
  console.error('Contoh: node scripts/fix-enum-vps.js "postgresql://user:pass@localhost:5432/dbname"');
  process.exit(1);
}

async function main() {
  console.log('🚀 Mula pembaikan data role...');
  
  // Parse URL untuk handle prisma+postgres jika perlu (biasanya di VPS guna standard postgresql://)
  let realConnectionString = connectionString;
  if (connectionString.startsWith("prisma+postgres://")) {
      console.log("⚠️ Mengesan Prisma Postgres URL. Cuba decode...");
      try {
        const urlObj = new URL(connectionString);
        const apiKey = urlObj.searchParams.get("api_key");
        if (apiKey) {
            const decoded = Buffer.from(apiKey, 'base64').toString('utf-8');
            const json = JSON.parse(decoded);
            if (json.databaseUrl) {
                realConnectionString = json.databaseUrl;
                console.log("✅ Berjaya decode connection string.");
            }
        }
      } catch (e) {
          console.error("Gagal decode Prisma URL:", e.message);
      }
  }

  const client = new Client({
    connectionString: realConnectionString,
    ssl: realConnectionString.includes("localhost") ? false : { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database.');

    // 1. Tukar column role kepada TEXT sementara
    console.log('🔄 Menukar column role ke TEXT sementara...');
    await client.query(`ALTER TABLE "User" ALTER COLUMN role TYPE TEXT;`);

    // 2. Kemaskini nilai role
    console.log('🔄 Mengemaskini nilai role...');
    // Mapping lama -> baru
    await client.query(`UPDATE "User" SET role = 'ADMIN' WHERE role IN ('ADMIN_PUSAT', 'ADMIN_NEGERI');`);
    await client.query(`UPDATE "User" SET role = 'KETUA_CAWANGAN' WHERE role = 'ADMIN_KAWASAN';`);
    await client.query(`UPDATE "User" SET role = 'SUKARELAWAN' WHERE role = 'AHLI_BIASA';`);
    
    // Safety net: Set default untuk nilai yang tidak dikenali
    await client.query(`UPDATE "User" SET role = 'SUKARELAWAN' WHERE role NOT IN ('ADMIN', 'KETUA_CAWANGAN', 'ADUN', 'SUKARELAWAN');`);
    console.log('✅ Nilai role dikemaskini.');

    // 3. Bersihkan Enum lama
    console.log('🧹 Membersihkan Enum lama...');
    try {
        await client.query(`DROP TYPE IF EXISTS "Role" CASCADE;`);
        await client.query(`DROP TYPE IF EXISTS "Role_new" CASCADE;`);
        await client.query(`DROP TYPE IF EXISTS "Role_old" CASCADE;`);
    } catch (e) {
        console.log('Info: Ralat kecil semasa drop enum (boleh diabaikan):', e.message);
    }

    // 4. Create Enum Baharu
    console.log('🆕 Mencipta Enum Role baharu...');
    await client.query(`CREATE TYPE "Role" AS ENUM ('ADMIN', 'KETUA_CAWANGAN', 'ADUN', 'SUKARELAWAN');`);

    // 5. Tukar semula column ke Enum
    console.log('🔄 Menukar semula column role ke Enum...');
    await client.query(`ALTER TABLE "User" ALTER COLUMN role TYPE "Role" USING role::"Role";`);
    await client.query(`ALTER TABLE "User" ALTER COLUMN role SET DEFAULT 'SUKARELAWAN'::"Role";`);

    console.log('🎉 Pembaikan SELESAI! Sila jalankan "npx prisma db push" untuk sync schema.');

  } catch (e) {
    console.error('❌ Ralat Kritikal:', e);
  } finally {
    await client.end();
  }
}

main();
