 "use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight, Users, Shield, Globe } from "lucide-react";

type PollOptionData = {
  id: string;
  text: string;
  votes: number;
};

type PollData = {
  id: string;
  question: string;
  options: PollOptionData[];
  totalVotes: number;
};

export default function Home() {
  const [poll, setPoll] = useState<PollData | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPoll() {
      try {
        const res = await fetch("/api/polls/active");
        const data = await res.json();

        if (!active) return;

        if (res.ok && data.poll) {
          setPoll(data.poll as PollData);
        }
      } catch {
      }
    }

    loadPoll();

    return () => {
      active = false;
    };
  }, []);

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
        <section className="bg-warisan-50 py-12 md:py-20">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center max-w-6xl">
            <div className="text-left">
              <h1 className="text-4xl md:text-6xl font-extrabold text-warisan-950 mb-6 tracking-tight leading-tight">
                Membangun Masa Depan <span className="text-warisan-600">Sungai Sibuga</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 max-w-xl">
                Sertai perjuangan kami untuk menegakkan keadilan, perpaduan, dan kemajuan untuk semua rakyat di N.52 Sungai Sibuga. Bersama Lisa Hassan Alban untuk masa depan yang lebih baik.
              </p>
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-3 bg-warisan-accent-500 text-white rounded-lg font-semibold hover:bg-warisan-accent-600 transition-all flex items-center justify-center shadow-lg shadow-warisan-accent-200"
                >
                  Daftar Ahli Sekarang
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
                <Link
                  href="#visi"
                  className="w-full sm:w-auto px-8 py-3 bg-white border border-warisan-200 text-warisan-950 rounded-lg font-semibold hover:bg-warisan-50 transition-all"
                >
                  Ketahui Manifesto
                </Link>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-warisan-600 to-warisan-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-2 rounded-2xl shadow-2xl border border-warisan-100 overflow-hidden">
                <img
                  src="/images/manifesto.jpg"
                  alt="Manifesto Lisa Hassan Alban N.52 Sungai Sibuga"
                  className="rounded-xl w-full h-auto transform transition duration-500 hover:scale-[1.02]"
                  loading="eager"
                />
                <div className="absolute bottom-4 right-4 bg-warisan-950/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                  CALON NO. 02
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="visi" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Prinsip Perjuangan Kami</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Berlandaskan prinsip demokrasi, keadilan sosial dan pembelaan hak rakyat Sabah.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card
                icon={<Users className="w-8 h-8 text-warisan-700" />}
                title="Komited Memperjuangkan MA63"
                desc="Memastikan hak dan kedudukan Sabah dalam Perjanjian Malaysia 1963 dihormati dan dilaksanakan demi masa depan rakyat Sungai Sibuga."
              />
              <Card
                icon={<Shield className="w-8 h-8 text-warisan-700" />}
                title="Memperkasa Program Pendidikan"
                desc="Menambah baik akses pendidikan, program bimbingan dan sokongan untuk anak-anak Sungai Sibuga daripada sekolah rendah hingga ke IPT."
              />
              <Card
                icon={<Globe className="w-8 h-8 text-warisan-700" />}
                title="Meningkatkan Perkhidmatan Kesihatan"
                desc="Memperjuangkan fasiliti kesihatan yang lebih lengkap, perkhidmatan rawatan yang lebih cekap dan mudah diakses oleh penduduk setempat."
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

        {poll && (
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-3xl">
              <div className="bg-warisan-50 border border-warisan-100 rounded-xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Tinjauan Ahli
                </h2>
                <p className="text-gray-700 mb-6">
                  {poll.question}
                </p>
                <div className="space-y-4">
                  {poll.options.map((option) => {
                    const percentage =
                      poll.totalVotes > 0
                        ? Math.round((option.votes / poll.totalVotes) * 100)
                        : 0;

                    return (
                      <div key={option.id}>
                        <div className="flex justify-between items-center mb-1 text-xs md:text-sm text-gray-600">
                          <span className="truncate">{option.text}</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-warisan-600"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  {poll.totalVotes > 0
                    ? `${poll.totalVotes} undian setakat ini. Log masuk ke akaun ahli untuk mengundi.`
                    : "Belum ada undian. Log masuk ke akaun ahli untuk jadi yang pertama mengundi."}
                </p>
              </div>
            </div>
          </section>
        )}
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
