#!/bin/bash

# Skrip persediaan awal VPS untuk Portal Warisan N.52 Sungai Sibuga
# Digunakan untuk memasang Node.js, PM2, dan Nginx

echo "🛠️ Memulakan persediaan VPS..."

# 1. Update sistem
sudo apt update && sudo apt upgrade -y

# 2. Pasang Node.js (Versi 20 LTS) jika belum ada
if ! command -v node &> /dev/null; then
    echo "📦 Memasang Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# 3. Pasang PM2 secara global
if ! command -v pm2 &> /dev/null; then
    echo "🚀 Memasang PM2..."
    sudo npm install -g pm2
fi

# 4. Pasang Nginx
if ! command -v nginx &> /dev/null; then
    echo "🌐 Memasang Nginx..."
    sudo apt install -y nginx
fi

# 5. Konfigurasi Nginx sebagai Reverse Proxy
echo "⚙️ Mengkonfigurasi Nginx..."
cat <<EOF | sudo tee /etc/nginx/sites-available/portal-warisan
server {
    listen 80;
    server_name 154.26.132.159;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Optimasi untuk fail statik Next.js
    location /_next/static {
        alias /var/www/portal-warisan/.next/static;
        expires 365d;
        access_log off;
    }
}
EOF

# Aktifkan konfigurasi Nginx
sudo ln -sf /etc/nginx/sites-available/portal-warisan /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Persediaan VPS selesai!"
echo "Sila pastikan kod telah dimuat naik ke /var/www/portal-warisan sebelum menjalankan ./deploy.sh"
