"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Upload, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function EditCommunicationPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    type: 'ANNOUNCEMENT',
    audience: 'ALL_MEMBERS',
    content: '',
    status: 'DRAFT',
    scheduledDate: ''
  });

  useEffect(() => {
    if (id) fetchAnnouncement();
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      const res = await fetch(`/api/admin/announcements/${id}`);
      const data = await res.json();
      if (data.announcement) {
        setFormData({
          title: data.announcement.title,
          type: data.announcement.type,
          audience: data.announcement.audience,
          content: data.announcement.content,
          status: data.announcement.status,
          scheduledDate: data.announcement.scheduledDate ? new Date(data.announcement.scheduledDate).toISOString().slice(0, 16) : ''
        });
      } else {
        alert("Pengumuman tidak dijumpai.");
        router.push("/admin/communication");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
        alert("Sila isi tajuk dan kandungan.");
        return;
    }

    setLoading(true);
    try {
        const res = await fetch(`/api/admin/announcements/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            router.push("/admin/communication");
        } else {
            const data = await res.json();
            alert(data.error || "Gagal mengemaskini pengumuman.");
        }
    } catch (error) {
        console.error(error);
        alert("Ralat rangkaian.");
    } finally {
        setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-warisan-600" /></div>;

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
          <h1 className="text-2xl font-bold text-gray-900">Kemaskini Pengumuman</h1>
          <p className="text-gray-500">Kemaskini maklumat pengumuman.</p>
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
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent resize-none"
              />
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
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
