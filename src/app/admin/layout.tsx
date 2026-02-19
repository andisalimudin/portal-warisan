"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  DollarSign, 
  Building2, 
  Megaphone, 
  MessageSquare, 
  BarChart3,
  ShieldAlert,
  ClipboardList,
  Menu,
  X
} from "lucide-react";
import Image from "next/image";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem("warisan_user");

    if (!raw) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(raw);
      const role = String(user?.role || "");

      if (!role.startsWith("ADMIN")) {
        router.replace("/login");
      }
    } catch {
      router.replace("/login");
    }
  }, [router]);

  function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("warisan_user");
    }
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-warisan-50 flex">
      <aside className="hidden md:flex flex-col w-64 bg-warisan-950 text-white">
        <div className="h-16 flex items-center justify-center border-b border-warisan-800">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-warisan-sabah.svg"
              alt="Logo N.52 Sungai Sibuga"
              width={32}
              height={32}
              className="h-8 w-8 bg-white rounded p-1"
            />
            <span className="font-bold text-base tracking-wide">ADMIN N.52</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            <div className="px-3 py-2 text-xs font-semibold text-warisan-400 uppercase tracking-wider">
              Utama
            </div>
            <NavLink href="/admin/dashboard" icon={<LayoutDashboard />} label="Dashboard" active />
            <NavLink href="/admin/members" icon={<Users />} label="Pengurusan Ahli" />
            
            <div className="px-3 py-2 mt-4 text-xs font-semibold text-warisan-400 uppercase tracking-wider">
              Organisasi
            </div>
            <NavLink href="/admin/organization" icon={<Building2 />} label="Struktur Parti" />
            <NavLink href="/admin/committees" icon={<Users />} label="Jawatankuasa" />

            <div className="px-3 py-2 mt-4 text-xs font-semibold text-warisan-400 uppercase tracking-wider">
              Komunikasi
            </div>
            <NavLink href="/admin/communication" icon={<Megaphone />} label="Pengumuman" />
            <NavLink href="/admin/forum-moderation" icon={<MessageSquare />} label="Moderasi Forum" />
            <NavLink href="/admin/complaints" icon={<ClipboardList />} label="Aduan Rakyat" />

            <div className="px-3 py-2 mt-4 text-xs font-semibold text-warisan-400 uppercase tracking-wider">
              Pentadbiran
            </div>
            <NavLink href="/admin/csr" icon={<DollarSign />} label="CSR (Kempen Derma)" />
            <NavLink href="/admin/finance" icon={<DollarSign />} label="Kewangan" />
            <NavLink href="/admin/reports" icon={<FileText />} label="Laporan & Analitik" />
            <NavLink href="/admin/settings" icon={<Settings />} label="Tetapan Sistem" />
          </nav>
        </div>
        <div className="p-4 border-t border-warisan-800">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center space-x-3 text-warisan-200 hover:text-white w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Log Keluar</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center md:hidden p-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
              onClick={() => setIsMobileNavOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="inline-flex md:hidden text-sm font-semibold text-gray-800">
                Dashboard Admin
              </span>
              <h1 className="hidden md:block text-xl font-semibold text-gray-800">
                Dashboard Admin
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">Super Admin</div>
              <div className="text-xs text-gray-500">Ibu Pejabat</div>
            </div>
            <div className="w-10 h-10 bg-warisan-700 rounded-full flex items-center justify-center text-white font-bold">
              AD
            </div>
          </div>
        </header>

        {isMobileNavOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden">
            <div className="w-72 h-full bg-warisan-950 text-white shadow-xl flex flex-col">
              <div className="h-16 flex items-center justify-between px-4 border-b border-warisan-800">
                <div className="flex items-center gap-2">
                  <Image
                    src="/logo-warisan-sabah.svg"
                    alt="Logo N.52 Sungai Sibuga"
                    width={28}
                    height={28}
                    className="h-7 w-7 bg-white rounded p-1"
                  />
                  <span className="font-semibold text-sm tracking-wide">
                    ADMIN N.52
                  </span>
                </div>
                <button
                  type="button"
                  className="p-2 rounded-md text-warisan-100 hover:bg-warisan-800"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-2">
                  <div className="px-3 py-2 text-xs font-semibold text-warisan-400 uppercase tracking-wider">
                    Utama
                  </div>
                  <NavLink href="/admin/dashboard" icon={<LayoutDashboard />} label="Dashboard" />
                  <NavLink href="/admin/members" icon={<Users />} label="Pengurusan Ahli" />
                  <div className="px-3 py-2 mt-4 text-xs font-semibold text-warisan-400 uppercase tracking-wider">
                    Organisasi
                  </div>
                  <NavLink href="/admin/organization" icon={<Building2 />} label="Struktur Parti" />
                  <NavLink href="/admin/committees" icon={<Users />} label="Jawatankuasa" />
                  <div className="px-3 py-2 mt-4 text-xs font-semibold text-warisan-400 uppercase tracking-wider">
                    Komunikasi
                  </div>
                  <NavLink href="/admin/communication" icon={<Megaphone />} label="Pengumuman" />
                  <NavLink href="/admin/forum-moderation" icon={<MessageSquare />} label="Moderasi Forum" />
                  <NavLink href="/admin/complaints" icon={<ClipboardList />} label="Aduan Rakyat" />
                  <div className="px-3 py-2 mt-4 text-xs font-semibold text-warisan-400 uppercase tracking-wider">
                    Pentadbiran
                  </div>
                  <NavLink href="/admin/csr" icon={<DollarSign />} label="CSR (Kempen Derma)" />
                  <NavLink href="/admin/finance" icon={<DollarSign />} label="Kewangan" />
                  <NavLink href="/admin/reports" icon={<FileText />} label="Laporan & Analitik" />
                  <NavLink href="/admin/settings" icon={<Settings />} label="Tetapan Sistem" />
                </nav>
              </div>
              <div className="p-4 border-t border-warisan-800">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center space-x-3 text-warisan-200 hover:text-white w-full transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Log Keluar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({ href, icon, label, active = false }: { href: string, icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
        active ? "bg-warisan-800 text-white" : "text-warisan-100 hover:bg-warisan-800 hover:text-white"
      }`}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
