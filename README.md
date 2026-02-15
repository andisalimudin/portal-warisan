# Portal Digital PARTI WARISAN

Sistem Portal Keahlian dan Pengurusan Parti Politik Malaysia.

## 🚀 Panduan Permulaan (Getting Started)

### 1. Prasyarat
Pastikan anda mempunyai [Node.js](https://nodejs.org/) (v18+) dan [PostgreSQL](https://www.postgresql.org/) dipasang.

### 2. Pemasangan
Masuk ke direktori projek:
```bash
cd portal
```

Install dependencies:
```bash
npm install
```

### 3. Konfigurasi Database
Salin fail `.env` dan kemaskini `DATABASE_URL` anda:
```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/parti_warisan?schema=public"
```

Jalankan migrasi database:
```bash
npx prisma migrate dev --name init
```

### 4. Jalankan Server Pembangunan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser anda.

## 📂 Struktur Projek

*   `src/app/(public)` - Laman awam (Landing page).
*   `src/app/(auth)` - Halaman Login & Register.
*   `src/app/(protected)` - Halaman Dashboard Ahli (memerlukan login).
*   `src/app/(admin)` - Panel Admin.
*   `prisma/schema.prisma` - Skema Pangkalan Data.

## 🛠 Teknologi

*   **Framework**: Next.js 15 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **Database**: PostgreSQL + Prisma ORM
*   **Icons**: Lucide React

## 📄 Dokumentasi
Sila rujuk [DESIGN_SPEC.md](../DESIGN_SPEC.md) untuk perincian arkitektur dan aliran sistem.
