"use client";

import { useState } from "react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Loader2, Download, Copy, Save, ArrowLeft, Wand2 } from "lucide-react";
import Link from "next/link";

export default function GenerateLetterPage() {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Editor
  const [formData, setFormData] = useState({
    senderName: "",
    senderPosition: "",
    senderOrg: "",
    senderAddress: "",
    receiverName: "",
    receiverPosition: "",
    receiverOrg: "",
    receiverAddress: "",
    title: "",
    purpose: "",
    points: ""
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '<p>Surat anda akan muncul di sini...</p>',
    editorProps: {
        attributes: {
            class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px] p-8 border rounded-lg bg-white shadow-sm',
        },
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/letters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        editor?.commands.setContent(data.content);
        setStep(2);
      } else {
        alert("Gagal menjana surat.");
      }
    } catch (error) {
      console.error(error);
      alert("Ralat sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.querySelector('.ProseMirror');
    const opt = {
      margin: 20,
      filename: `${formData.title || 'surat'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Dynamically import html2pdf only on client side
    const html2pdf = (await import("html2pdf.js")).default;
    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  const handleCopy = () => {
    const text = editor?.getText() || "";
    navigator.clipboard.writeText(text);
    alert("Teks disalin!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/ai-tools" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Surat Generator</h1>
          <p className="text-gray-500">Isi maklumat di bawah untuk menjana surat rasmi.</p>
        </div>
      </div>

      {step === 1 && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Sender Info */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 border-b pb-2">Maklumat Pengirim</h3>
            <input name="senderName" placeholder="Nama Penuh" className="w-full border p-2 rounded" onChange={handleChange} />
            <input name="senderPosition" placeholder="Jawatan" className="w-full border p-2 rounded" onChange={handleChange} />
            <input name="senderOrg" placeholder="Organisasi / Jabatan" className="w-full border p-2 rounded" onChange={handleChange} />
            <textarea name="senderAddress" placeholder="Alamat (Optional)" className="w-full border p-2 rounded h-24" onChange={handleChange} />
          </div>

          {/* Receiver Info */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 border-b pb-2">Maklumat Penerima</h3>
            <input name="receiverName" placeholder="Nama Penerima" className="w-full border p-2 rounded" onChange={handleChange} />
            <input name="receiverPosition" placeholder="Jawatan" className="w-full border p-2 rounded" onChange={handleChange} />
            <input name="receiverOrg" placeholder="Organisasi" className="w-full border p-2 rounded" onChange={handleChange} />
            <textarea name="receiverAddress" placeholder="Alamat Penerima" className="w-full border p-2 rounded h-24" onChange={handleChange} />
          </div>

          {/* Letter Content */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-900 border-b pb-2">Kandungan Surat</h3>
            <input name="title" placeholder="Tajuk Surat (Perkara)" className="w-full border p-2 rounded font-bold" onChange={handleChange} />
            <input name="purpose" placeholder="Tujuan Surat (cth: Memohon kelulusan, Menjemput hadir)" className="w-full border p-2 rounded" onChange={handleChange} />
            <textarea name="points" placeholder="Isi-isi penting (Satu per baris)" className="w-full border p-2 rounded h-32" onChange={handleChange} />
            
            <button 
              onClick={handleGenerate} 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Wand2 className="w-5 h-5" />}
              Jana Surat Dengan AI
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-2 items-center justify-between sticky top-4 z-10">
            <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="px-4 py-2 text-sm border rounded hover:bg-gray-50">Edit Maklumat</button>
                <button onClick={() => editor?.chain().focus().toggleBold().run()} className={`px-3 py-2 border rounded ${editor?.isActive('bold') ? 'bg-gray-200' : ''}`}>B</button>
                <button onClick={() => editor?.chain().focus().toggleItalic().run()} className={`px-3 py-2 border rounded ${editor?.isActive('italic') ? 'bg-gray-200' : ''}`}>I</button>
                <button onClick={() => editor?.chain().focus().toggleUnderline().run()} className={`px-3 py-2 border rounded ${editor?.isActive('underline') ? 'bg-gray-200' : ''}`}>U</button>
            </div>
            <div className="flex gap-2">
                <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 text-sm border rounded hover:bg-gray-50">
                    <Copy className="w-4 h-4" /> Salin
                </button>
                <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                    <Download className="w-4 h-4" /> PDF
                </button>
            </div>
          </div>

          {/* Editor */}
          <EditorContent editor={editor} />
        </div>
      )}
    </div>
  );
}
