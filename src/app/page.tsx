import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, Shield, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Image
              src="/logo-warisan-sabah.svg"
              alt="Logo N.52 Sungai Sibuga"
              width={40}
              height={40}
              className="h-10 w-10"
              priority
            />
            <span className="font-bold text-xl text-warisan-950">N.52 SUNGAI SIBUGA</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#" className="text-gray-600 hover:text-warisan-950">Pengenalan</Link>
            <Link href="#visi" className="text-gray-600 hover:text-warisan-950">Visi & Misi</Link>
            <Link href="#berita" className="text-gray-600 hover:text-warisan-950">Berita</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-warisan-950">
              Log Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-warisan-accent-500 text-white rounded-md text-sm font-medium hover:bg-warisan-accent-600 transition-colors"
            >
              Daftar Ahli
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-warisan-50 py-20">
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-extrabold text-warisan-950 mb-6 tracking-tight">
              Membangun Masa Depan Malaysia Yang Lebih Gemilang
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Sertai perjuangan kami untuk menegakkan keadilan, perpaduan, dan kemajuan untuk semua rakyat Malaysia tanpa mengira kaum dan agama.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3 bg-warisan-accent-500 text-white rounded-lg font-semibold hover:bg-warisan-accent-600 transition-all flex items-center justify-center"
              >
                Sertai Kami Sekarang
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                href="#visi"
                className="w-full sm:w-auto px-8 py-3 bg-white border border-warisan-200 text-warisan-950 rounded-lg font-semibold hover:bg-warisan-50 transition-all"
              >
                Ketahui Lebih Lanjut
              </Link>
            </div>
          </div>
        </section>

        <section id="visi" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Prinsip Perjuangan Kami</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Berlandaskan prinsip demokrasi dan keadilan sosial.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card
                icon={<Users className="w-8 h-8 text-warisan-700" />}
                title="Perpaduan Nasional"
                desc="Memupuk semangat bersatu padu di kalangan rakyat berbilang kaum."
              />
              <Card
                icon={<Shield className="w-8 h-8 text-warisan-700" />}
                title="Integriti & Ketelusan"
                desc="Menolak rasuah dan memastikan tadbir urus yang bersih dan amanah."
              />
              <Card
                icon={<Globe className="w-8 h-8 text-warisan-700" />}
                title="Kemajuan Ekonomi"
                desc="Memacu ekonomi digital dan mampan untuk kesejahteraan rakyat."
              />
            </div>
          </div>
        </section>

        <section id="berita" className="py-20 bg-warisan-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Berita & Pengumuman</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <NewsCard
                date="12 Jan 2026"
                title="Pelancaran Portal Digital Rasmi Parti"
                desc="Parti Warisan melangkah ke era digital dengan pelancaran sistem keahlian baharu."
              />
              <NewsCard
                date="10 Jan 2026"
                title="Jelajah Penerangan di Sungai Sibuga"
                desc="Pimpinan ADUN akan turun padang bertemu rakyat di zon Sungai Sibuga bermula minggu depan."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-warisan-950 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/logo-warisan-sabah.svg"
                  alt="Logo N.52 Sungai Sibuga"
                  width={40}
                  height={40}
                  className="h-10 w-10 bg-white rounded-md p-1"
                />
                <span className="font-bold text-xl">N.52 SUNGAI SIBUGA</span>
              </div>
              <p className="text-warisan-200 max-w-sm">
                Pejabat ADUN N.52 Sungai Sibuga,<br />
                Sandakan, Sabah.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Pautan Pantas</h4>
              <ul className="space-y-2 text-warisan-200">
                <li><Link href="/register" className="hover:text-white">Daftar Ahli</Link></li>
                <li><Link href="/login" className="hover:text-white">Log Masuk</Link></li>
                <li><Link href="#" className="hover:text-white">Hubungi Kami</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Ikuti Kami</h4>
              <ul className="space-y-2 text-warisan-200">
                <li>Facebook</li>
                <li>Twitter / X</li>
                <li>Instagram</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-warisan-800 mt-12 pt-8 text-center text-warisan-200 text-sm">
            &copy; 2026 Pejabat ADUN N.52 Sungai Sibuga. Hak Cipta Terpelihara.
          </div>
        </div>
      </footer>
    </div>
  );
}

function Card({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      <div className="mb-4 bg-warisan-50 w-16 h-16 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
      <p className="text-gray-600 leading-relaxed">
        {desc}
      </p>
    </div>
  )
}

function NewsCard({ date, title, desc }: { date: string, title: string, desc: string }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden border hover:border-warisan-500 transition-colors group cursor-pointer">
      <div className="p-6">
        <span className="text-xs font-semibold text-warisan-700 uppercase tracking-wider">{date}</span>
        <h3 className="text-xl font-bold mt-2 mb-3 text-gray-900 group-hover:text-warisan-800">{title}</h3>
        <p className="text-gray-600">{desc}</p>
        <div className="mt-4 flex items-center text-warisan-700 font-medium text-sm">
          Baca Selanjutnya <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </div>
  )
}
