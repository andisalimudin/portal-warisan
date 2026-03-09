
"use client";

import { useState } from "react";
import { generateLetterAction } from "@/app/actions/generate-letter";
import { Loader2, Send, Download } from "lucide-react";

export default function LetterGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);

    const formData = new FormData(event.currentTarget);
    
    const input = {
      senderName: formData.get("senderName") as string,
      senderPosition: formData.get("senderPosition") as string,
      senderOrg: formData.get("senderOrg") as string,
      recipientName: formData.get("recipientName") as string,
      recipientPosition: formData.get("recipientPosition") as string,
      recipientOrg: formData.get("recipientOrg") as string,
      recipientAddress: formData.get("recipientAddress") as string,
      title: formData.get("title") as string,
      purpose: formData.get("purpose") as string,
      points: formData.get("points") as string,
    };

    try {
      const result = await generateLetterAction(input);
      
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

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Input Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="bg-blue-100 text-blue-600 p-2 rounded-lg">1</span>
          Maklumat Surat
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pengirim */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Maklumat Pengirim</h3>
            <div className="grid grid-cols-2 gap-4">
              <input name="senderName" placeholder="Nama Anda" required className="w-full p-2 border rounded-lg text-sm" />
              <input name="senderPosition" placeholder="Jawatan" required className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <input name="senderOrg" placeholder="Organisasi (Contoh: Parti Warisan N.52)" required className="w-full p-2 border rounded-lg text-sm" />
          </div>

          {/* Penerima */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Maklumat Penerima</h3>
            <div className="grid grid-cols-2 gap-4">
              <input name="recipientName" placeholder="Nama Penerima" required className="w-full p-2 border rounded-lg text-sm" />
              <input name="recipientPosition" placeholder="Jawatan Penerima" required className="w-full p-2 border rounded-lg text-sm" />
            </div>
            <input name="recipientOrg" placeholder="Organisasi Penerima" required className="w-full p-2 border rounded-lg text-sm" />
            <textarea name="recipientAddress" placeholder="Alamat Penuh Penerima" required className="w-full p-2 border rounded-lg text-sm h-20" />
          </div>

          {/* Isi Surat */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Kandungan Surat</h3>
            <input name="title" placeholder="Tajuk Surat (Huruf Besar)" required className="w-full p-2 border rounded-lg text-sm font-bold" />
            <input name="purpose" placeholder="Tujuan Utama Surat" required className="w-full p-2 border rounded-lg text-sm" />
            <textarea 
              name="points" 
              placeholder="Senaraikan isi penting (satu per baris):&#10;- Masalah air selama 3 hari&#10;- Memohon lori tangki air&#10;- Tindakan segera diperlukan" 
              required 
              className="w-full p-2 border rounded-lg text-sm h-32" 
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Sedang Menjana...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Jana Surat Sekarang
              </>
            )}
          </button>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}
        </form>
      </div>

      {/* Preview */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-inner min-h-[600px] flex flex-col">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="bg-green-100 text-green-600 p-2 rounded-lg">2</span>
          Hasil Surat (Preview)
        </h2>

        {generatedContent ? (
          <div className="flex-1 flex flex-col">
            <div 
              className="flex-1 bg-white p-8 shadow-sm border border-gray-200 rounded-lg prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: generatedContent }}
            />
            
            <div className="mt-6 flex gap-4">
              <button 
                onClick={() => window.print()}
                className="flex-1 bg-gray-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-900 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Cetak / Simpan PDF
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <p>Sila isi borang di sebelah untuk menjana surat.</p>
          </div>
        )}
      </div>
    </div>
  );
}
