"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, User, Share2, Loader2 } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  author: { fullName: string };
};

export default function AnnouncementDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) fetchAnnouncement();
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      const res = await fetch(`/api/announcements/${id}`);
      const json = await res.json();
      if (res.ok && json.announcement) {
        setData(json.announcement);
      } else {
        setError("Pengumuman tidak dijumpai.");
      }
    } catch (err) {
      setError("Ralat rangkaian.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-warisan-600" />
    </div>
  );

  if (error || !data) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Maaf</h1>
        <p className="text-gray-600 mb-4">{error || "Halaman tidak wujud."}</p>
        <Link href="/" className="text-warisan-600 hover:underline">Kembali ke Halaman Utama</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-warisan-50 flex flex-col">
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-warisan-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Kembali</span>
            </Link>
            <div className="font-bold text-lg text-warisan-950 truncate max-w-[200px] md:max-w-none">
                Portal Rasmi N.52 Sungai Sibuga
            </div>
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" title="Kongsi">
                <Share2 className="w-5 h-5" />
            </button>
        </div>
      </header>

      <main className="flex-1 py-8 md:py-12">
        <article className="container mx-auto px-4 max-w-3xl">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Hero / Header */}
                <div className="p-6 md:p-10 border-b border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase 
                            ${data.type === 'NEWS' ? 'bg-blue-100 text-blue-800' : 
                              data.type === 'DOCUMENT' ? 'bg-orange-100 text-orange-800' : 
                              'bg-purple-100 text-purple-800'}`}>
                            {data.type}
                        </span>
                        <span className="text-gray-400 text-xs">•</span>
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(data.createdAt).toLocaleDateString("ms-MY", { 
                                year: 'numeric', month: 'long', day: 'numeric' 
                            })}
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                        {data.title}
                    </h1>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-warisan-100 flex items-center justify-center text-warisan-700 font-bold">
                            {data.author?.fullName?.[0] || <User className="w-5 h-5" />}
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-900">
                                {data.author?.fullName || "Admin"}
                            </div>
                            <div className="text-xs text-gray-500">
                                Parti Warisan N.52 Sungai Sibuga
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-10 prose prose-lg prose-warisan max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {data.content}
                </div>
            </div>
        </article>
      </main>

      <footer className="bg-white border-t py-8 text-center text-sm text-gray-500">
        &copy; 2026 Pejabat ADUN N.52 Sungai Sibuga. Hak Cipta Terpelihara.
      </footer>
    </div>
  );
}
