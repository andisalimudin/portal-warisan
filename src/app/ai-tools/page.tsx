"use client";

import Link from "next/link";
import { FileText, Plus, History, Wand2 } from "lucide-react";

export default function AiToolsDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Tools</h1>
        <p className="text-gray-500">Gunakan kecerdasan buatan untuk membantu tugasan harian anda.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* AI Surat Generator Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
            <Wand2 className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">AI Surat Generator</h3>
          <p className="text-gray-600 text-sm mb-6">
            Jana surat rasmi kerajaan dan korporat secara automatik hanya dengan memasukkan isi penting.
          </p>
          <div className="flex gap-3">
            <Link 
              href="/ai-tools/letters/generate"
              className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Buat Baru
            </Link>
            <Link 
              href="/ai-tools/letters/history"
              className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              title="Sejarah"
            >
              <History className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Placeholder for future tools */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 border-dashed flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-400 mb-1">AI Laporan</h3>
          <p className="text-gray-400 text-xs">Akan Datang</p>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 border-dashed flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-400 mb-1">AI Minit Mesyuarat</h3>
          <p className="text-gray-400 text-xs">Akan Datang</p>
        </div>
      </div>
    </div>
  );
}
