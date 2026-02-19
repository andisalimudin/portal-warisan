"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") || "").trim();
    const password = String(formData.get("password") || "");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Log masuk gagal. Sila cuba lagi.");
        return;
      }

      const role = result.user?.role as string | undefined;

      if (role && role.startsWith("ADMIN")) {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Ralat rangkaian. Sila cuba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-warisan-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image
            src="/logo-warisan-sabah.svg"
            alt="Logo N.52 Sungai Sibuga"
            width={72}
            height={72}
            className="h-16 w-16"
            priority
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Log Masuk Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Belum menjadi ahli?{" "}
          <Link href="/register" className="font-medium text-warisan-700 hover:text-warisan-800">
            Daftar keahlian baru
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                No. Kad Pengenalan / Emel
              </label>
              <div className="mt-1">
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-warisan-500 focus:border-warisan-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Kata Laluan
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-warisan-500 focus:border-warisan-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-warisan-accent-500 focus:ring-warisan-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Ingat saya
                </label>
              </div>

              <div className="text-sm">
                <Link href="#" className="font-medium text-warisan-700 hover:text-warisan-800">
                  Lupa kata laluan?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-warisan-accent-500 hover:bg-warisan-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warisan-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Sedang Log Masuk...
                  </>
                ) : (
                  "Log Masuk"
                )}
              </button>
            </div>
            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}
          </form>

          <div className="mt-6">
             <div className="mt-6 text-center">
                <Link href="/" className="text-warisan-700 hover:text-warisan-800 flex items-center justify-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Laman Utama
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
