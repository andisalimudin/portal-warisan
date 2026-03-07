
// scripts/cleanup-users.js
// Script to delete all non-admin users and handle related data cleanup

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Fungsi untuk membaca fail .env secara manual
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      console.log('📄 Membaca fail .env...');
      const envConfig = fs.readFileSync(envPath, 'utf-8');
      envConfig.split('\n').forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    } else {
        console.log('⚠️ Fail .env tidak dijumpai di root directory.');
    }
  } catch (e) {
    console.error('⚠️ Gagal membaca fail .env:', e.message);
  }
}

loadEnv();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL tidak dijumpai.');
  process.exit(1);
}

async function main() {
  console.log('🚀 Mula pembersihan pengguna (kecuali ADMIN)...');
  
  // Handle Prisma Postgres URL if needed
  let realConnectionString = connectionString;
  if (connectionString.startsWith("prisma+postgres://")) {
      try {
        const urlObj = new URL(connectionString);
        const apiKey = urlObj.searchParams.get("api_key");
        if (apiKey) {
            const decoded = Buffer.from(apiKey, 'base64').toString('utf-8');
            const json = JSON.parse(decoded);
            if (json.databaseUrl) realConnectionString = json.databaseUrl;
        }
      } catch (e) {}
  }

  const client = new Client({
    connectionString: realConnectionString,
    ssl: realConnectionString.includes("localhost") ? false : { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database.');

    // 1. Nullify Complaint.reporterId
    console.log('🔄 Mengemaskini Complaint (set reporterId = NULL)...');
    await client.query(`
      UPDATE "Complaint" 
      SET "reporterId" = NULL 
      WHERE "reporterId" IN (SELECT id FROM "User" WHERE role != 'ADMIN');
    `);

    // 2. Nullify Poll.createdById
    console.log('🔄 Mengemaskini Poll (set createdById = NULL)...');
    await client.query(`
      UPDATE "Poll" 
      SET "createdById" = NULL 
      WHERE "createdById" IN (SELECT id FROM "User" WHERE role != 'ADMIN');
    `);

    // 3. Nullify User.referredById (Self-relation)
    console.log('🔄 Mengemaskini Referral (set referredById = NULL)...');
    await client.query(`
      UPDATE "User" 
      SET "referredById" = NULL 
      WHERE "referredById" IN (SELECT id FROM "User" WHERE role != 'ADMIN');
    `);

    // 4. Delete AuditLogs
    console.log('🗑️ Memadam AuditLog pengguna...');
    await client.query(`
      DELETE FROM "AuditLog" 
      WHERE "userId" IN (SELECT id FROM "User" WHERE role != 'ADMIN');
    `);

    // 5. Delete Users
    console.log('🗑️ Memadam Pengguna (Bukan Admin)...');
    const res = await client.query(`
      DELETE FROM "User" 
      WHERE role != 'ADMIN';
    `);

    console.log(`✅ Berjaya memadam ${res.rowCount} pengguna.`);
    console.log('🎉 Pembersihan SELESAI!');

  } catch (e) {
    console.error('❌ Ralat Pembersihan:', e);
  } finally {
    await client.end();
  }
}

main();
