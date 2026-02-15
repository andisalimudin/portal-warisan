"use client";

import Link from "next/link";
import { ArrowLeft, Save, Upload } from "lucide-react";
import { useState } from "react";

export default function CreateCommunicationPage() {
  const [formData, setFormData] = useState({
    title: '',
    type: 'ANNOUNCEMENT',
    audience: 'ALL_MEMBERS',
    content: '',
    status: 'DRAFT',
    scheduledDate: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/communication"
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buat Pengumuman Baru</h1>
          <p className="text-gray-500">Isi maklumat di bawah untuk membuat pengumuman atau buletin baru.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Tajuk</label>
              <input 
                type="text" 
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Contoh: Notis Mesyuarat Agung Tahunan"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Kandungan</label>
              <textarea 
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={12}
                placeholder="Tulis kandungan pengumuman di sini..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Media & Lampiran</h3>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">Muat naik gambar atau dokumen</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF sehingga 10MB</p>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900">Tetapan Penerbitan</h3>
            
            <div>
              <label htmlFor="status" className="block text-xs font-medium text-gray-500 mb-1 uppercase">Status</label>
              <select 
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
              >
                <option value="DRAFT">Draf</option>
                <option value="PUBLISHED">Terbitkan Segera</option>
                <option value="SCHEDULED">Jadualkan</option>
              </select>
            </div>

            {formData.status === 'SCHEDULED' && (
              <div>
                <label htmlFor="scheduledDate" className="block text-xs font-medium text-gray-500 mb-1 uppercase">Tarikh & Masa</label>
                <input 
                  type="datetime-local"
                  id="scheduledDate"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <button className="w-full flex items-center justify-center gap-2 bg-warisan-600 text-white px-4 py-2 rounded-lg hover:bg-warisan-700 transition-colors font-medium">
                <Save className="w-4 h-4" />
                Simpan Pengumuman
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900">Klasifikasi</h3>
            
            <div>
              <label htmlFor="type" className="block text-xs font-medium text-gray-500 mb-1 uppercase">Jenis</label>
              <select 
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
              >
                <option value="ANNOUNCEMENT">Pengumuman Rasmi</option>
                <option value="NEWS">Berita / Buletin</option>
                <option value="DOCUMENT">Dokumen</option>
              </select>
            </div>

            <div>
              <label htmlFor="audience" className="block text-xs font-medium text-gray-500 mb-1 uppercase">Sasaran Audien</label>
              <select 
                id="audience"
                name="audience"
                value={formData.audience}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
              >
                <option value="ALL_MEMBERS">Semua Ahli</option>
                <option value="PUBLIC">Awam (Public)</option>
                <option value="COMMITTEE">Jawatankuasa Sahaja</option>
                <option value="LEADERSHIP">Pimpinan Tertinggi</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
