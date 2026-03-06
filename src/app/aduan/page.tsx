
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function PublicComplaintPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      title: formData.get("title"),
      category: formData.get("category"),
      location: formData.get("location"),
      area: formData.get("area"),
      description: formData.get("description"),
    };

    try {
      const res = await fetch("/api/complaints/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal menghantar aduan.");
      }

      setSuccess(true);
      setTicketId(json.ticketId);
      e.currentTarget.reset();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ralat rangkaian. Sila cuba lagi.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Image
              src="/logo-warisan-sabah.svg"
              alt="Logo N.52 Sungai Sibuga"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="font-bold text-lg text-warisan-950 hidden sm:inline">
              N.52 SUNGAI SIBUGA
            </span>
          </Link>
          <Link 
            href="/"
            className="flex items-center text-sm font-medium text-gray-600 hover:text-warisan-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Laman Utama
          </Link>
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-extrabold text-warisan-950 mb-4">
              Saluran Aduan Rakyat
            </h1>
            <p className="text-gray-600 text-lg">
              Suarakan masalah anda untuk tindakan segera kami. Kami komited mendengar dan menyelesaikan isu rakyat di N.52 Sungai Sibuga.
            </p>
          </div>

          {success ? (
            <div className="bg-white p-8 rounded-xl shadow-lg border border-green-100 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Aduan Berjaya Dihantar!</h2>
              <p className="text-gray-600 mb-6">
                Terima kasih atas maklum balas anda. Pihak kami akan menyemak aduan ini secepat mungkin.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 inline-block mb-6">
                <p className="text-sm text-gray-500 mb-1">ID Tiket Aduan Anda</p>
                <p className="text-xl font-mono font-bold text-warisan-900 tracking-wider select-all">
                  {ticketId}
                </p>
              </div>
              <p className="text-sm text-gray-500 mb-8">
                Sila simpan ID tiket ini untuk rujukan masa hadapan.
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setTicketId(null);
                }}
                className="text-warisan-600 font-medium hover:text-warisan-800 underline underline-offset-4"
              >
                Hantar Aduan Lain
              </button>
            </div>
          ) : (
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Nama Penuh <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="Contoh: Ali Bin Abu"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-warisan-500 focus:ring-warisan-500 sm:text-sm py-2.5 px-3 border"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      No. Telefon (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="Contoh: 012-3456789"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-warisan-500 focus:ring-warisan-500 sm:text-sm py-2.5 px-3 border"
                    />
                    <p className="text-xs text-gray-500">
                      Untuk kami hubungi jika perlu maklumat lanjut.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Tajuk Aduan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    placeholder="Ringkasan masalah (Contoh: Jalan berlubang di Kg. Contoh)"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-warisan-500 focus:ring-warisan-500 sm:text-sm py-2.5 px-3 border"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Kategori Masalah <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      defaultValue=""
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-warisan-500 focus:ring-warisan-500 sm:text-sm py-2.5 px-3 border bg-white"
                    >
                      <option value="" disabled>Pilih Kategori</option>
                      <option value="Infrastruktur">Infrastruktur (Jalan/Parit/Jambatan)</option>
                      <option value="Kebersihan">Kebersihan & Sampah</option>
                      <option value="Keselamatan">Keselamatan & Jenayah</option>
                      <option value="Bantuan">Bantuan Kebajikan</option>
                      <option value="Lain-lain">Lain-lain</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="area" className="block text-sm font-medium text-gray-700">
                      Kawasan / Kampung
                    </label>
                    <input
                      type="text"
                      id="area"
                      name="area"
                      placeholder="Nama kampung atau taman perumahan"
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-warisan-500 focus:ring-warisan-500 sm:text-sm py-2.5 px-3 border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Lokasi Terperinci <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required
                    placeholder="Alamat atau mercu tanda berhampiran"
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-warisan-500 focus:ring-warisan-500 sm:text-sm py-2.5 px-3 border"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Huraian Masalah <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={5}
                    placeholder="Sila jelaskan masalah dengan terperinci..."
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-warisan-500 focus:ring-warisan-500 sm:text-sm py-2.5 px-3 border"
                  ></textarea>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-warisan-600 hover:bg-warisan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warisan-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Sedang Menghantar...
                      </>
                    ) : (
                      "Hantar Aduan"
                    )}
                  </button>
                  <p className="mt-4 text-xs text-center text-gray-500">
                    Dengan menghantar aduan ini, anda bersetuju bahawa maklumat yang diberikan adalah benar.
                    Pihak kami berhak menolak aduan yang tidak berasas atau palsu.
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-warisan-950 text-white py-8 border-t border-warisan-900">
        <div className="container mx-auto px-4 text-center">
          <p className="text-warisan-200 text-sm">
            &copy; {new Date().getFullYear()} Pejabat ADUN N.52 Sungai Sibuga. Hak Cipta Terpelihara.
          </p>
        </div>
      </footer>
    </div>
  );
}
