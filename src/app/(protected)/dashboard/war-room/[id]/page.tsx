"use client";

import { useState } from "react";
import { ArrowLeft, Download, MessageSquare, Send, ThumbsUp, Share2, MoreHorizontal, Image as ImageIcon, FileText, Link as LinkIcon, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

// Mock Data
const MISSION_DETAIL = {
  id: '1',
  title: 'Gerak Gempur Isu Air Sandakan',
  description: `
    <p class="mb-4">Kami memerlukan bantuan semua Cybertrooper untuk mengetengahkan isu bekalan air yang kritikal di kawasan N.52 Sungai Sibuga. Pihak lawan cuba memanipulasi fakta seolah-olah tiada tindakan diambil.</p>
    <p class="mb-4 font-semibold">Objektif Misi:</p>
    <ul class="list-disc pl-5 mb-4 space-y-2">
      <li>Tularkan gambar-gambar paip kering dan tangki air kosong dengan hashtag #SandakanKering.</li>
      <li>Kongsikan infografik perbandingan peruntukan air yang telah diluluskan tetapi belum dilaksanakan.</li>
      <li>Jawab komen-komen negatif dengan fakta (rujuk dokumen lampiran).</li>
    </ul>
    <p>Sila pastikan bahasa yang digunakan adalah sopan tetapi tegas.</p>
  `,
  priority: 'HIGH',
  status: 'ACTIVE',
  date: '12 Jan 2026',
  author: 'Ketua Penerangan',
  assets: [
    { type: 'image', name: 'Poster_Isu_Air_1.jpg', size: '1.2 MB' },
    { type: 'image', name: 'Bukti_Paip_Kering.png', size: '2.5 MB' },
    { type: 'document', name: 'Fakta_Sebenar_Isu_Air.pdf', size: '500 KB' },
    { type: 'link', name: 'Pautan Berita Sinar Harian', url: 'https://sinarharian.com.my/...' }
  ],
  comments: [
    { id: 1, user: 'Azlan Cyber', role: 'CYBER_TROOPER', content: 'Poster pertama sudah saya viralkan di Group Komuniti Sungai Sibuga. Respon sangat panas!', time: '10 minit lepas', likes: 12 },
    { id: 2, user: 'Sarah Media', role: 'ADMIN_MEDIA', content: 'Terima kasih Azlan. Fokus juga kepada TikTok, video pendek sedang disunting.', time: '5 minit lepas', likes: 5 }
  ]
};

export default function WarRoomDetailPage() {
  const params = useParams();
  const [commentInput, setCommentInput] = useState("");
  
  // In a real app, fetch data based on params.id
  const mission = MISSION_DETAIL;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Button */}
      <Link 
        href="/dashboard/war-room" 
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali ke War Room
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mission Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  KEUTAMAAN TINGGI
                </span>
                <span className="text-sm text-gray-500">{mission.date}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{mission.title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                  KP
                </div>
                <span>{mission.author}</span>
              </div>
            </div>
            
            <div className="p-6 prose prose-red max-w-none text-gray-700">
              <div dangerouslySetInnerHTML={{ __html: mission.description }} />
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
              <button className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Saya Terima Misi Ini
              </button>
              <button className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Kongsi
              </button>
            </div>
          </div>

          {/* Discussion Area */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-500" />
                Perbincangan Strategi ({mission.comments.length})
              </h3>
            </div>
            
            <div className="p-4 space-y-6">
              {mission.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                    {comment.user.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-900">{comment.user}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-medium">
                          {comment.role.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{comment.time}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                    <button className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors">
                      <ThumbsUp className="w-3 h-3" />
                      {comment.likes} Suka
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Tulis komen atau cadangan strategi..."
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                />
                <button className="bg-gray-900 text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Assets */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-gray-500" />
                Bahan Kempen
              </h3>
            </div>
            <div className="p-2">
              {mission.assets.map((asset, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg group cursor-pointer transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                    {asset.type === 'image' && <ImageIcon className="w-5 h-5" />}
                    {asset.type === 'document' && <FileText className="w-5 h-5" />}
                    {asset.type === 'link' && <LinkIcon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{asset.name}</p>
                    {asset.size && <p className="text-xs text-gray-500">{asset.size}</p>}
                  </div>
                  <button className="text-gray-400 hover:text-red-600">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-red-500 hover:text-red-600 transition-colors flex items-center justify-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Sumbang Bahan / Gambar
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h4 className="font-semibold text-blue-900 mb-2">Panduan Cybertrooper</h4>
            <ul className="text-sm text-blue-800 space-y-2 list-disc pl-4">
              <li>Jangan guna bahasa kesat.</li>
              <li>Fokus kepada fakta, bukan emosi.</li>
              <li>Elak provokasi kaum dan agama.</li>
              <li>Lapor akaun palsu pihak lawan.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
