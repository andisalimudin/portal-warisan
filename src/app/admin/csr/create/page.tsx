"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, DollarSign, Save } from "lucide-react";

type CsrType = "KEMPEN" | "ISU";
type CsrStatus = "AKTIF" | "TAMAT";

export default function AdminCsrCreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    type: "KEMPEN" as CsrType,
    status: "AKTIF" as CsrStatus,
    targetAmount: "10000",
    endDate: "2026-02-15",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Kempen/isu CSR berjaya dicipta (simulasi).");
    router.push("/admin/csr");
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/csr" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke CSR
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Cipta Kempen / Isu CSR</h1>
          <p className="text-gray-500 mt-1">Hanya admin boleh memuat naik kempen/isu untuk derma.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tajuk</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Contoh: Kempen CSR Bantuan Tangki Air"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
              >
                <option value="KEMPEN">KEMPEN</option>
                <option value="ISU">ISU</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
              >
                <option value="AKTIF">AKTIF</option>
                <option value="TAMAT">TAMAT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh Tamat</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sasaran Kutipan (RM)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                inputMode="numeric"
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Penerangan</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Ringkasan tujuan kutipan dan penggunaan dana."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent min-h-[140px]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Link
              href="/admin/csr"
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-warisan-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-warisan-800 transition-colors"
            >
              <Save className="w-4 h-4" />
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

