
import { Metadata } from "next";
import CopywritingGenerator from "@/components/ai/CopywritingGenerator";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Copywriting Assistant | Admin Portal",
  description: "Jana teks copywriting untuk media sosial dan laporan.",
};

export default function GenerateCopywritingPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">AI Copywriting Assistant</h1>
          <p className="text-gray-500 text-sm">Jana kapsyen media sosial, artikel pendek, dan teks pemasaran dengan bantuan AI.</p>
        </div>
      </div>

      <CopywritingGenerator />
    </div>
  );
}
