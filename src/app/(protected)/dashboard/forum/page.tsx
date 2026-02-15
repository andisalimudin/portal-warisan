"use client";

import Link from "next/link";
import { useState } from "react";
import { MessageSquare, Heart, Share2, Plus, Search, Filter, Pin } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Data
const FORUM_CATEGORIES = [
  { id: 'all', name: 'Semua Topik' },
  { id: 'announcement', name: 'Pengumuman Rasmi' },
  { id: 'policy', name: 'Dasar Parti' },
  { id: 'complaints', name: 'Aduan & Cadangan' },
  { id: 'general', name: 'Umum' },
];

const FORUM_POSTS = [
  {
    id: '1',
    title: 'Pengumuman: Jadual Mesyuarat Agung Tahunan 2026',
    excerpt: 'Dimaklumkan bahawa Mesyuarat Agung Tahunan akan diadakan pada bulan hadapan...',
    author: 'Setiausaha Agung',
    category: 'announcement',
    likes: 156,
    comments: 42,
    time: '2 jam lepas',
    isPinned: true,
  },
  {
    id: '2',
    title: 'Cadangan penambahbaikan sistem pendaftaran ahli baru',
    excerpt: 'Saya mencadangkan agar proses pengesahan OTP dipercepatkan untuk kawasan pedalaman...',
    author: 'Ahli P.171',
    category: 'complaints',
    likes: 34,
    comments: 12,
    time: '5 jam lepas',
    isPinned: false,
  },
  {
    id: '3',
    title: 'Perbincangan Belanjawan Negeri Sabah 2026',
    excerpt: 'Apakah pandangan rakan-rakan mengenai peruntukan pembangunan luar bandar?',
    author: 'Ketua Pemuda',
    category: 'policy',
    likes: 89,
    comments: 56,
    time: '1 hari lepas',
    isPinned: false,
  },
];

export default function ForumPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredPosts = selectedCategory === 'all' 
    ? FORUM_POSTS 
    : FORUM_POSTS.filter(post => post.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forum Perbincangan</h1>
          <p className="text-gray-500">Ruang interaksi dan pertukaran idea ahli parti.</p>
        </div>
        <button className="flex items-center gap-2 bg-warisan-600 text-white px-4 py-2 rounded-lg hover:bg-warisan-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>Topik Baru</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari topik perbincangan..." 
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {FORUM_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                selectedCategory === cat.id 
                  ? "bg-warisan-100 text-warisan-800" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="grid gap-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {post.isPinned && (
                    <span className="bg-warisan-100 text-warisan-700 text-xs px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                      <Pin className="w-3 h-3" /> PENGUMUMAN
                    </span>
                  )}
                  <span className="text-xs text-gray-500">{post.time}</span>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs font-medium text-gray-700">{post.author}</span>
                </div>
                <Link href={`/dashboard/forum/${post.id}`}>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-warisan-600 transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-6">
                  <button className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-sm">
                    <Heart className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-500 hover:text-warisan-600 transition-colors text-sm">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.comments} Komen</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors text-sm">
                    <Share2 className="w-4 h-4" />
                    <span>Kongsi</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
