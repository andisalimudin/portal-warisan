# Spesifikasi Sistem Portal Digital Parti Politik (PARTI WARISAN)

Dokumen ini memperincikan struktur, aliran data, dan teknologi untuk pembangunan portal digital parti.

## 1. Cadangan Teknologi Stack (Tech Stack)

Kami memilih stack **"T3 Stack" / Next.js Fullstack** untuk prestasi tinggi, keselamatan jenis (type-safety), dan pembangunan pantas.

*   **Frontend & Backend Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
    *   *Sebab:* React Server Components (RSC) untuk prestasi, API Routes terbina dalam untuk backend, SEO friendly untuk laman awam.
*   **Bahasa:** [TypeScript](https://www.typescriptlang.org/)
    *   *Sebab:* Mengurangkan bug dan memastikan data konsisten (wajib untuk sistem kewangan/keahlian).
*   **Database:** [PostgreSQL](https://www.postgresql.org/)
    *   *Sebab:* Pangkalan data relasional yang teguh, sesuai untuk data berstruktur kompleks (Ahli, Hierarki Referral).
*   **ORM (Object-Relational Mapping):** [Prisma](https://www.prisma.io/)
    *   *Sebab:* Type-safe database queries, pengurusan migrasi schema yang mudah.
*   **UI Framework:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
    *   *Sebab:* Reka bentuk moden, aksesibiliti (a11y) terjaga, mudah disesuaikan (customizable).
*   **Autentikasi:** [NextAuth.js (Auth.js)](https://next-auth.js.org/)
    *   *Sebab:* Pengurusan sesi selamat, menyokong Credentials (IC/Password) dan MFA.
*   **Komunikasi (Real-time):** Pusher atau Socket.io (Untuk chat).

---

## 2. Struktur Pangkalan Data (ERD Schema Draft)

Berikut adalah struktur data utama dalam `prisma.schema`:

### Model: User (Ahli)
*   `id`: UUID
*   `icNumber`: String (Unique, Primary Login)
*   `fullName`: String
*   `email`: String (Unique, Verified)
*   `passwordHash`: String
*   `phone`: String
*   `role`: Enum (ADMIN_PUSAT, ADMIN_NEGERI, ADMIN_KAWASAN, AHLI_BIASA)
*   `status`: Enum (PENDING, APPROVED, REJECTED, SUSPENDED)
*   `referralCode`: String (Unique)
*   `referredById`: UUID (Relation to User)
*   `state`: String (Negeri)
*   `division`: String (Bahagian/Parlimen)
*   `branch`: String (Cawangan - Optional)
*   `createdAt`: DateTime

### Model: ReferralLog
*   Untuk menjejak statistik referral secara terperinci.

### Model: Announcement (Berita)
*   `id`, `title`, `content`, `authorId`, `targetAudience` (Public/MembersOnly).

---

## 3. Aliran Sistem (System Flow)

### A. Pendaftaran Ahli (Registration Flow)
1.  **Input:** Pengguna isi Borang (Nama, IC, Tel, Referral Code - Optional).
2.  **Validasi:** Sistem semak format IC dan jika IC sudah wujud.
3.  **Verifikasi:** OTP dihantar ke No. Telefon (menggunakan SMS Gateway seperti Twilio/local provider).
4.  **Creation:** Jika OTP sah, rekod dicipta dengan status `PENDING`.
5.  **Referral:** Jika ada kod referral, sistem merekodkan `referredBy` dan mengemaskini statistik perujuk.
6.  **Notifikasi:** Emel dihantar kepada pengguna ("Permohonan diterima").

### B. Kelulusan (Approval Flow)
1.  Admin (Pusat/Negeri) log masuk ke Dashboard Admin.
2.  Melihat senarai `PENDING`.
3.  Admin menyemak butiran -> Klik **Lulus** atau **Tolak**.
4.  Jika Lulus: Status bertukar `APPROVED`, Kad Ahli Digital dijana (QR).

---

## 4. Struktur Halaman (Sitemap)

1.  **Laman Awam (Public)**
    *   `/` (Home: Hero, Visi Misi, Berita Terkini)
    *   `/register` (Borang Pendaftaran)
    *   `/login` (Log Masuk Ahli/Admin)
    *   `/news` (Arkib Berita)

2.  **Portal Ahli (Protected)**
    *   `/dashboard` (Overview, Status, QR Card)
    *   `/dashboard/profile` (Edit Profil)
    *   `/dashboard/referrals` (Statistik Referral)
    *   `/dashboard/forum` (Perbincangan)

3.  **Portal Admin (RBAC Protected)**
    *   `/admin/members` (Pengurusan Ahli & Kelulusan)
    *   `/admin/analytics` (Statistik Keahlian)
    *   `/admin/content` (Urus Berita/Pengumuman)

---

## 5. Ciri Keselamatan & Privasi (Security Best Practices)

1.  **Data Encryption:** Katalaluan di-hash menggunakan `bcrypt` atau `argon2`. Data sensitif (IC) boleh dienkripsi pada tahap aplikasi (application-level encryption) jika perlu.
2.  **Rate Limiting:** Menggunakan `upstash/ratelimit` atau middleware tersendiri untuk mengelakkan *brute-force* pada login form.
3.  **Audit Logs:** Setiap tindakan Admin (Lulus/Tolak/Edit) direkodkan dalam table `AuditLog` (Who, What, When).
4.  **PDPA Compliance:**
    *   Dasar Privasi (Privacy Policy) wajib dipersetujui semasa daftar.
    *   Hak untuk memadam data (Right to be forgotten) diuruskan oleh Admin Pusat.
