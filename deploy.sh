#!/bin/bash

# Konfigurasi
APP_NAME="portal-warisan"
APP_DIR="/var/www/portal-warisan"

echo "🚀 Memulakan proses kemaskini di VPS..."

# Masuk ke direktori aplikasi
cd $APP_DIR || exit

# Pasang dependensi
echo "📦 Memasang dependensi..."
npm install

# Jalankan migrasi pangkalan data
echo "🗄️ Mengemaskini pangkalan data..."
npx prisma generate
npx prisma migrate deploy

# Bina aplikasi Next.js
echo "🏗️ Membina aplikasi (Build)..."
npm run build

# Mulakan semula aplikasi menggunakan PM2
echo "🔄 Memulakan semula aplikasi dengan PM2..."
pm2 restart $APP_NAME || pm2 start npm --name "$APP_NAME" -- start -- -p 3000

# Simpan konfigurasi PM2
pm2 save

echo "✅ Deployment berjaya!"
