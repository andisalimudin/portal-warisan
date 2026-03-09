
import { Metadata } from "next";
import LetterGenerator from "@/components/ai/LetterGenerator";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Surat Generator | Admin Portal",
  description: "Jana surat rasmi menggunakan kecerdasan buatan.",
};

export default function GenerateLetterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/ai-tools"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Surat Generator</h1>
          <p className="text-gray-500 text-sm">Isi maklumat di bawah untuk menjana surat rasmi secara automatik.</p>
        </div>
      </div>

      <LetterGenerator />
    </div>
  );
}
