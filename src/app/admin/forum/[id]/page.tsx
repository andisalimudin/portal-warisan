"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  Heart,
  Share2,
  MoreHorizontal,
  User,
} from "lucide-react";

type AdminForumComment = {
  id: string;
  author: string;
  authorRole: string;
  content: string;
  createdAt: string;
  likes: number;
};

type AdminForumPostDetail = {
  id: string;
  title: string;
  content: string;
  author: string;
  authorRole: string;
  createdAt: string;
  likes: number;
  comments: AdminForumComment[];
};

export default function AdminForumDetailPage() {
  const params = useParams();
  const [post, setPost] = useState<AdminForumPostDetail | null>(null);
  const [comments, setComments] = useState<AdminForumComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const id = String(params?.id || "");
        if (!id) {
          setError("ID topik tidak sah.");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/forum/${encodeURIComponent(id)}`);
        const data = await res.json();

        if (!active) return;

        if (!res.ok) {
          setError(data.error || "Gagal memuatkan topik forum.");
          return;
        }

        setPost(data.post);
        setComments(
          Array.isArray(data.post?.comments) ? data.post.comments : []
        );
      } catch {
        if (active) {
          setError("Ralat rangkaian semasa memuatkan topik.");
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
  }, [params]);

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
    <div className="max-w-5xl mx-auto">
      <Link
        href="/admin/forum-moderation"
        className="inline-flex items-center text-gray-500 hover:text-warisan-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali ke Moderasi Forum
      </Link>

      {loading && (
        <p className="text-sm text-gray-500 mb-4">
          Memuatkan topik forum...
        </p>
      )}
      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}

      {!post && !loading && !error && (
        <p className="text-sm text-gray-500">Topik tidak dijumpai.</p>
      )}

      {!post ? null : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-warisan-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-warisan-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{post.author}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="bg-warisan-50 text-warisan-700 px-2 py-0.5 rounded font-medium border border-warisan-100">
                        {post.authorRole.replace("_", " ")}
                      </span>
                      <span>•</span>
                      <span>{formatTime(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              <div
                className="prose prose-slate max-w-none mb-8 text-gray-800"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              <div className="flex items-center gap-6 pt-6 border-t border-gray-100">
                <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span className="font-medium">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-warisan-600 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">{comments.length} Komen</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors ml-auto">
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">Kongsi</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 md:p-8">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              Perbincangan{" "}
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                {comments.length}
              </span>
            </h3>

            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4 group">
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">
                            {comment.author}
                          </span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                            {comment.authorRole.replace("_", " ")}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-800 text-sm leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mt-1 ml-2">
                      <button className="text-xs font-medium text-gray-500 hover:text-red-500 flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {comment.likes}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

