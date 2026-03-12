
"use client";

import { useState } from "react";
import { generateCopywritingAction } from "@/app/actions/generate-copywriting";
import { Loader2, Sparkles, Copy, Check, Upload, Image as ImageIcon } from "lucide-react";
import { toast, Toaster } from "sonner"; // Assuming sonner is used, or fallback to alert/simple state

export default function CopywritingGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await generateCopywritingAction(formData);
      
      if (result.success && result.content) {
        setGeneratedContent(result.content);
      } else {
        setError(result.error || "Ralat tidak diketahui.");
      }
    } catch (err) {
      setError("Gagal menghubungi pelayan.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Teks berjaya disalin!");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Toaster position="top-center" />
      {/* Input Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">1</span>
          Maklumat Copywriting
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Topik / Tajuk</label>
            <input 
              name="topic" 
              placeholder="Contoh: Program Bantuan Prihatin N.52" 
              required 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all" 
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Isi Penting (Pilihan)</label>
            <textarea 
              name="points" 
              placeholder="Senaraikan isi penting..." 
              className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nada / Gaya</label>
              <select name="tone" className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 outline-none">
                <option value="Professional & Rasmi">Professional & Rasmi</option>
                <option value="Santai & Mesra">Santai & Mesra</option>
                <option value="Bersemangat & Inspiring">Bersemangat & Inspiring</option>
                <option value="Empathetic & Prihatin">Empathetic & Prihatin</option>
                <option value="Tegas & Informatif">Tegas & Informatif</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Platform</label>
              <select name="platform" className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-500 outline-none">
                <option value="Facebook Post">Facebook</option>
                <option value="Instagram Caption">Instagram</option>
                <option value="WhatsApp Blast">WhatsApp</option>
                <option value="Twitter / X">Twitter / X</option>
                <option value="LinkedIn Article">LinkedIn</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Muat Naik Gambar (Pilihan)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors relative">
              <input 
                type="file" 
                name="image" 
                accept="image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImageChange}
              />
              {imagePreview ? (
                <div className="relative w-full h-48">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-md" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white text-sm font-medium">
                    Tukar Gambar
                  </div>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 text-center">Klik atau tarik gambar ke sini</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG (Maks 5MB)</p>
                </>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sedang Menjana...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Jana Copywriting
              </>
            )}
          </button>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-start gap-2">
              <div className="mt-0.5">⚠️</div>
              <div>{error}</div>
            </div>
          )}
        </form>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-inner min-h-[600px] flex flex-col">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="bg-green-100 text-green-600 p-2 rounded-lg">2</span>
          Hasil Copywriting
        </h2>

        {generatedContent ? (
          <div className="flex-1 flex flex-col animate-in fade-in duration-500">
            <div className="flex-1 bg-white p-6 shadow-sm border border-gray-200 rounded-lg whitespace-pre-wrap text-gray-700 leading-relaxed font-sans text-base">
              {generatedContent}
            </div>
            
            <div className="mt-6 flex gap-4">
              <button 
                onClick={handleCopy}
                className="flex-1 bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "Disalin!" : "Salin Teks"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4 border-2 border-dashed border-gray-200 rounded-lg m-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-300" />
            </div>
            <p className="text-sm font-medium">Hasil AI akan muncul di sini...</p>
          </div>
        )}
      </div>
    </div>
  );
}
