"use client";
 
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, User, Users, MessageSquare, LogOut, Settings, Target, DollarSign, ClipboardList, Menu, X } from "lucide-react";
import Image from "next/image";

export default function ProtectedLayout({
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

      if (role.startsWith("ADMIN")) {
        router.replace("/admin/dashboard");
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
            <span className="font-bold text-base tracking-wide">N.52 SUNGAI SIBUGA</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            <NavLink href="/dashboard" icon={<LayoutDashboard />} label="Dashboard" active />
            <NavLink href="/dashboard/profile" icon={<User />} label="Profil Saya" />
            <NavLink href="/dashboard/referrals" icon={<Users />} label="Rangkaian" />
            <NavLink href="/dashboard/chat" icon={<MessageSquare />} label="Mesej" />
            <NavLink href="/dashboard/forum" icon={<Users />} label="Forum" />
            <NavLink href="/dashboard/war-room" icon={<Target />} label="War Room" />
            <NavLink href="/dashboard/csr" icon={<DollarSign />} label="CSR" />
            <NavLink href="/dashboard/complaints" icon={<ClipboardList />} label="Aduan Rakyat" />
            <NavLink href="/dashboard/settings" icon={<Settings />} label="Tetapan" />
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
                Dashboard Ahli N.52
              </span>
              <h1 className="hidden md:block text-xl font-semibold text-gray-800">
                Dashboard Ahli N.52
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">Ali bin Abu</div>
              <div className="text-xs text-gray-500">Ahli Biasa</div>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
              A
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
                    N.52 SUNGAI SIBUGA
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
                  <NavLink href="/dashboard" icon={<LayoutDashboard />} label="Dashboard" />
                  <NavLink href="/dashboard/profile" icon={<User />} label="Profil Saya" />
                  <NavLink href="/dashboard/referrals" icon={<Users />} label="Rangkaian" />
                  <NavLink href="/dashboard/chat" icon={<MessageSquare />} label="Mesej" />
                  <NavLink href="/dashboard/forum" icon={<Users />} label="Forum" />
                  <NavLink href="/dashboard/war-room" icon={<Target />} label="War Room" />
                  <NavLink href="/dashboard/csr" icon={<DollarSign />} label="CSR" />
                  <NavLink href="/dashboard/complaints" icon={<ClipboardList />} label="Aduan Rakyat" />
                  <NavLink href="/dashboard/settings" icon={<Settings />} label="Tetapan" />
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
