"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, User, Share2, Loader2, Download, FileText, Check, Facebook, Twitter, MessageCircle } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  author: { fullName: string };
  attachments: string[];
};

export default function AnnouncementDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [data, setData] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

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

  const handleShare = (platform: string) => {
    if (!data) return;
    const url = window.location.href;
    const text = `Baca: ${data.title} - Portal Warisan N.52`;

    let shareUrl = "";

    switch (platform) {
        case "whatsapp":
            shareUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
            break;
        case "facebook":
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case "twitter":
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
            break;
        case "copy":
            navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            return;
    }

    if (shareUrl) {
        window.open(shareUrl, "_blank", "width=600,height=400");
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
            <div className="relative">
                <button 
                    onClick={() => setShowShare(!showShare)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors" 
                    title="Kongsi"
                >
                    <Share2 className="w-5 h-5" />
                </button>
                {showShare && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
                        <button onClick={() => handleShare('whatsapp')} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                            <MessageCircle className="w-4 h-4 text-green-500" /> WhatsApp
                        </button>
                        <button onClick={() => handleShare('facebook')} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                            <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                        </button>
                        <button onClick={() => handleShare('twitter')} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                            <Twitter className="w-4 h-4 text-sky-500" /> Twitter / X
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button onClick={() => handleShare('copy')} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700">
                            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4 text-gray-500" />}
                            {copied ? "Disalin!" : "Salin Pautan"}
                        </button>
                    </div>
                )}
            </div>
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

                {/* Attachments */}
                {data.attachments && data.attachments.length > 0 && (
                  <div className="p-6 md:p-10 border-t border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Lampiran & Galeri
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data.attachments.map((url, idx) => {
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                        const fileName = url.split('/').pop();
                        
                        return (
                          <a 
                            key={idx} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-warisan-500 hover:shadow-md transition-all"
                          >
                            {isImage ? (
                              <div className="relative h-48 w-full bg-gray-200">
                                <Image 
                                  src={url} 
                                  alt={`Lampiran ${idx + 1}`}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                              </div>
                            ) : (
                              <div className="h-32 flex flex-col items-center justify-center p-4 text-gray-500 bg-gray-50">
                                <FileText className="w-12 h-12 mb-2 text-warisan-400" />
                                <span className="text-xs uppercase font-bold text-warisan-600">Dokumen</span>
                              </div>
                            )}
                            <div className="p-3 flex items-center justify-between gap-2">
                              <span className="text-sm font-medium text-gray-700 truncate flex-1">{fileName}</span>
                              <Download className="w-4 h-4 text-gray-400 group-hover:text-warisan-600" />
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
        </article>
      </main>

      <footer className="bg-white border-t py-8 text-center text-sm text-gray-500">
        &copy; 2026 Pejabat ADUN N.52 Sungai Sibuga. Hak Cipta Terpelihara.
      </footer>
    </div>
  );
}
