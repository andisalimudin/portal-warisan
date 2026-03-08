"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamic import for rich text editor (to avoid SSR issues)
// For simplicity, we use a textarea for now, but structure allows enhancement
// You can install 'react-quill' or similar later.

export default function BlogEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const isNew = params.id === "new";
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!isNew);
  
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    image: "",
    published: false
  });

  useEffect(() => {
    if (!isNew) {
        // Fetch existing post
        // Since we don't have a direct "get by ID" API yet (only by slug or list), 
        // we might need to adjust API or just filter from list for MVP, 
        // OR better: Update API to support get by ID. 
        // Let's assume we update API to support ID fetch or just fetch all and find (inefficient but works for MVP small data)
        // Actually, let's fetch list and find for now to save API calls complexity
        fetch("/api/blog")
            .then(res => res.json())
            .then(data => {
                const post = data.posts?.find((p: any) => p.id === params.id);
                if (post) {
                    setForm({
                        title: post.title,
                        content: post.content,
                        excerpt: post.excerpt || "",
                        image: post.image || "",
                        published: post.published
                    });
                }
                setFetching(false);
            });
    }
  }, [params.id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = "/api/blog";
      const method = isNew ? "POST" : "PUT";
      const body = isNew ? form : { ...form, id: params.id };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.push("/admin/blog");
      } else {
        alert("Gagal menyimpan artikel.");
      }
    } catch (err) {
      console.error(err);
      alert("Ralat rangkaian.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center">Memuatkan...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/blog" className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? "Tambah Artikel Baru" : "Edit Artikel"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tajuk Artikel</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-warisan-500 focus:border-warisan-500"
            placeholder="Contoh: Majlis Perasmian Cawangan Baru..."
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ringkasan (Excerpt)</label>
          <textarea
            rows={2}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-warisan-500 focus:border-warisan-500"
            placeholder="Ringkasan pendek untuk paparan kad..."
          />
        </div>

        {/* Image URL (Simple input for MVP, can upgrade to file upload later) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pautan Gambar Utama</label>
          <div className="flex gap-2">
            <input
                type="url"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-warisan-500 focus:border-warisan-500"
                placeholder="https://example.com/image.jpg"
            />
            {/* Placeholder for future upload button */}
            {/* <button type="button" className="px-4 py-2 bg-gray-100 rounded-lg border border-gray-300"><Upload className="w-5 h-5" /></button> */}
          </div>
          {form.image && (
              <div className="mt-2 relative h-40 w-full rounded-lg overflow-hidden border border-gray-200">
                  <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
              </div>
          )}
        </div>

        {/* Content (HTML) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kandungan (HTML)</label>
          <textarea
            required
            rows={12}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-warisan-500 focus:border-warisan-500 font-mono text-sm"
            placeholder="<p>Tulis kandungan artikel di sini...</p>"
          />
          <p className="text-xs text-gray-500 mt-1">Anda boleh menulis teks biasa atau HTML.</p>
        </div>

        {/* Publish Status */}
        <div className="flex items-center gap-2">
            <input
                type="checkbox"
                id="published"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="w-4 h-4 text-warisan-600 border-gray-300 rounded focus:ring-warisan-500"
            />
            <label htmlFor="published" className="text-sm font-medium text-gray-700">Terbitkan Segera</label>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-warisan-600 text-white px-6 py-2.5 rounded-lg hover:bg-warisan-700 disabled:opacity-50"
            >
                <Save className="w-5 h-5" />
                {loading ? "Menyimpan..." : "Simpan Artikel"}
            </button>
        </div>
      </form>
    </div>
  );
}
