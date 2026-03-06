
"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateComplaintPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    
    // Check file size if files are selected
    const files = formData.getAll("images") as File[];
    let totalSize = 0;
    
    if (files.length > 5) {
      setError("Anda hanya boleh memuat naik maksimum 5 keping gambar.");
      setLoading(false);
      return;
    }

    for (const file of files) {
      if (file.size > 0) {
        totalSize += file.size;
      }
    }

    if (totalSize > 300 * 1024 * 1024) { // 300MB
      setError("Jumlah saiz fail gambar terlalu besar. Sila pastikan jumlah saiz kurang daripada 300MB.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/complaints/public", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Gagal mencipta aduan.");
      }

      router.push(`/admin/complaints`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ralat rangkaian. Sila cuba lagi.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/admin/complaints" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Senarai
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h1 className="text-xl font-bold text-gray-900">Tambah Aduan Baru (Manual)</h1>
          <p className="text-sm text-gray-500">Masukkan butiran aduan yang diterima secara manual (telefon/kaunter).</p>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nama Pengadu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Nama penuh pengadu"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-warisan-500 focus:ring-warisan-500 sm:text-sm py-2.5 px-3 border"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  No. Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="Contoh: 012-3456789"
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-warisan-500 focus:ring-warisan-500 sm:text-sm py-2.5 px-3 border"
                />
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
                placeholder="Ringkasan masalah"
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

            <div className="space-y-2">
              <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                Muat Naik Gambar (Pilihan)
              </label>
              <input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                multiple
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-warisan-50 file:text-warisan-700
                  hover:file:bg-warisan-100"
              />
              <p className="text-xs text-gray-500">
                Maksimum 5 gambar. Jumlah saiz maksimum 300MB. Format: JPG, PNG, GIF.
              </p>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex justify-center items-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-warisan-900 hover:bg-warisan-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warisan-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Aduan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
