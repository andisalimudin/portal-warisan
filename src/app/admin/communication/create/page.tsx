"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, Loader2 } from "lucide-react";
import { useState } from "react";

export default function CreateCommunicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'ANNOUNCEMENT',
    audience: 'ALL_MEMBERS',
    content: '',
    status: 'DRAFT',
    scheduledDate: '',
    attachments: [] as string[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    if (formData.attachments.length >= 10) {
        alert("Maksimum 10 fail sahaja dibenarkan.");
        return;
    }

    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
        setLoading(true);
        const res = await fetch("/api/upload", {
            method: "POST",
            body: uploadData
        });
        const data = await res.json();
        
        if (res.ok && data.url) {
            setFormData(prev => ({
                ...prev,
                attachments: [...prev.attachments, data.url]
            }));
        } else {
            alert("Gagal memuat naik fail.");
        }
    } catch (error) {
        console.error("Upload error", error);
        alert("Ralat memuat naik fail.");
    } finally {
        setLoading(false);
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
        alert("Sila isi tajuk dan kandungan.");
        return;
    }

    setLoading(true);
    try {
        const res = await fetch("/api/admin/announcements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            router.push("/admin/communication");
        } else {
            const data = await res.json();
            alert(data.error || "Gagal mencipta pengumuman.");
        }
    } catch (error) {
        console.error(error);
        alert("Ralat rangkaian.");
    } finally {
        setLoading(false);
    }
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
            
            <div className="space-y-4">
                {formData.attachments.map((url, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-sm truncate max-w-[200px]">{url.split('/').pop()}</span>
                        <button onClick={() => removeAttachment(idx)} className="text-red-500 hover:text-red-700 text-sm">Buang</button>
                    </div>
                ))}
            </div>

            <label className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer mt-4">
              <input type="file" className="hidden" onChange={handleFileUpload} />
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-900">Muat naik gambar atau dokumen</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF sehingga 10MB</p>
            </label>
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

            <div>
              <label htmlFor="type" className="block text-xs font-medium text-gray-500 mb-1 uppercase">Jenis</label>
              <select 
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
              >
                <option value="ANNOUNCEMENT">Pengumuman</option>
                <option value="NEWS">Berita</option>
                <option value="DOCUMENT">Dokumen</option>
              </select>
            </div>

            <div>
              <label htmlFor="audience" className="block text-xs font-medium text-gray-500 mb-1 uppercase">Sasaran</label>
              <select 
                id="audience"
                name="audience"
                value={formData.audience}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
              >
                <option value="ALL_MEMBERS">Semua Ahli</option>
                <option value="COMMITTEE">Jawatankuasa</option>
                <option value="LEADERSHIP">Pimpinan</option>
                <option value="PUBLIC">Awam</option>
              </select>
            </div>

            {formData.status === 'SCHEDULED' && (
              <div>
                <label htmlFor="scheduledDate" className="block text-xs font-medium text-gray-500 mb-1 uppercase">Tarikh Jadual</label>
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

            <button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-warisan-600 text-white px-4 py-2 rounded-lg hover:bg-warisan-700 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Simpan & Terbit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
