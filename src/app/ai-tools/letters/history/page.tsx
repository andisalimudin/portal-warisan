"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, FileText, Calendar, Trash2, Eye } from "lucide-react";

type Letter = {
  id: string;
  title: string;
  createdAt: string;
};

export default function LetterHistoryPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real app, get userId from session
  const userId = "user-id-placeholder"; 

  useEffect(() => {
    // Simulated fetch
    // fetch(`/api/ai/letters?userId=${userId}`)
    //   .then(res => res.json())
    //   .then(data => setLetters(data.letters))
    //   .finally(() => setLoading(false));
    setLoading(false);
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ai-tools" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sejarah Surat</h1>
          <p className="text-gray-500">Senarai surat yang pernah dijana.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {letters.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Tiada rekod surat dijumpai.</p>
            </div>
        ) : (
            <table className="w-full">
                <thead className="bg-gray-50 border-b">
                    <tr>
                        <th className="text-left px-6 py-4 font-medium text-gray-500">Tajuk</th>
                        <th className="text-left px-6 py-4 font-medium text-gray-500">Tarikh</th>
                        <th className="text-right px-6 py-4 font-medium text-gray-500">Tindakan</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {letters.map((letter) => (
                        <tr key={letter.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{letter.title}</td>
                            <td className="px-6 py-4 text-gray-500 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {new Date(letter.createdAt).toLocaleDateString("ms-MY")}
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                                <button className="p-2 hover:bg-blue-50 text-blue-600 rounded"><Eye className="w-4 h-4" /></button>
                                <button className="p-2 hover:bg-red-50 text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
      </div>
    </div>
  );
}
