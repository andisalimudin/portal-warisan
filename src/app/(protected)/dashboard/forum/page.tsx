"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MessageSquare, Heart, Share2, Plus, Search, Filter, Pin } from "lucide-react";
import { cn } from "@/lib/utils";

type ForumCategory = {
  id: string;
  name: string;
  description: string;
};

type ForumPostListItem = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  authorRole: string;
  categoryId: string;
  categoryName: string;
  likes: number;
  comments: number;
  createdAt: string;
  isPinned: boolean;
};

export default function ForumPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPostListItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch("/api/forum");
        const data = await res.json();

        if (!active) return;

        if (!res.ok) {
          setError(data.error || "Gagal memuatkan data forum.");
          return;
        }

        setCategories(
          Array.isArray(data.categories) ? data.categories : []
        );
        setPosts(Array.isArray(data.posts) ? data.posts : []);
      } catch {
        if (active) {
          setError("Ralat rangkaian semasa memuatkan forum.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    let list = posts;

    if (selectedCategory !== "all") {
      list = list.filter((post) => post.categoryId === selectedCategory);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (post) =>
          post.title.toLowerCase().includes(q) ||
          post.excerpt.toLowerCase().includes(q) ||
          post.author.toLowerCase().includes(q)
      );
    }

    return list;
  }, [posts, selectedCategory, searchTerm]);

  function formatTime(input: string) {
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) return "";

    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 1) return "Baru saja";
    if (diffMinutes < 60) return `${diffMinutes} minit lepas`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} jam lepas`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} hari lepas`;
    return date.toLocaleDateString("ms-MY");
  }

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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            key="all"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              selectedCategory === "all"
                ? "bg-warisan-100 text-warisan-800"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Semua Topik
          </button>
          {categories.map((cat) => (
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

      {loading && (
        <p className="text-sm text-gray-500">Memuatkan forum...</p>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

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
                  <span className="text-xs text-gray-500">
                    {formatTime(post.createdAt)}
                  </span>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs font-medium text-gray-700">
                    {post.author}
                  </span>
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
