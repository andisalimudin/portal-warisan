"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";

export default function RegisterPage() {
  const [referralFromUrl, setReferralFromUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const url = new URL(window.location.href);
      const ref = url.searchParams.get("ref") || "";
      setReferralFromUrl(ref);
    } catch {
      setReferralFromUrl("");
    }
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);

    const fullName = String(formData.get("name") || "").trim();
    const icNumber = String(formData.get("ic") || "").trim();
    const phoneNumber = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const referralCode = String(formData.get("referral") || "").trim();
    const address = String(formData.get("address") || "").trim();
    const state = String(formData.get("state") || "").trim();
    const parliament = String(formData.get("parliament") || "").trim();
    const dun = String(formData.get("dun") || "").trim();
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password.length < 8) {
      setError("Kata laluan mesti sekurang-kurangnya 8 aksara.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Sahkan kata laluan tidak sepadan.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          icNumber,
          phoneNumber,
          email,
          referralCode: referralCode || undefined,
          address: address || undefined,
          state: state || undefined,
          parliament: parliament || undefined,
          dun: dun || undefined,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Pendaftaran gagal. Sila cuba lagi.");
      } else {
        setSuccess("Pendaftaran berjaya! Permohonan anda akan disemak oleh admin.");
        event.currentTarget.reset();
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
          Daftar Keahlian Baru
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Atau{" "}
          <Link href="/login" className="font-medium text-warisan-700 hover:text-warisan-800">
            log masuk ke akaun sedia ada
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nama Penuh (Seperti dalam IC)
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-warisan-500 focus:border-warisan-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="ic" className="block text-sm font-medium text-gray-700">
                No. Kad Pengenalan
              </label>
              <div className="mt-1">
                <input
                  id="ic"
                  name="ic"
                  type="text"
                  placeholder="Contoh: 900101-12-1234"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-warisan-500 focus:border-warisan-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                No. Telefon (Untuk OTP)
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-warisan-500 focus:border-warisan-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Alamat Emel
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-warisan-500 focus:border-warisan-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="referral" className="block text-sm font-medium text-gray-700">
                Kod Referral (Pilihan)
              </label>
              <div className="mt-1">
                <input
                  id="referral"
                  name="referral"
                  type="text"
                  defaultValue={referralFromUrl}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-warisan-500 focus:border-warisan-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Alamat Surat-Menyurat
              </label>
              <div className="mt-1">
                <input
                  id="address"
                  name="address"
                  type="text"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-warisan-500 focus:border-warisan-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  Negeri
                </label>
                <div className="mt-1">
                  <input
                    id="state"
                    name="state"
                    type="text"
                    placeholder="Contoh: Sabah"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-warisan-500 focus:border-warisan-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="parliament" className="block text-sm font-medium text-gray-700">
                  Parlimen
                </label>
                <div className="mt-1">
                  <input
                    id="parliament"
                    name="parliament"
                    type="text"
                    placeholder="Contoh: Batu Sapi"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-warisan-500 focus:border-warisan-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dun" className="block text-sm font-medium text-gray-700">
                  DUN
                </label>
                <div className="mt-1">
                  <input
                    id="dun"
                    name="dun"
                    type="text"
                    placeholder="Contoh: N.52 Sungai Sibuga"
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
                    autoComplete="new-password"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-warisan-500 focus:border-warisan-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Sahkan Kata Laluan
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-warisan-500 focus:border-warisan-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            {success && (
              <p className="text-sm text-green-600">
                {success}
              </p>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-warisan-accent-500 hover:bg-warisan-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warisan-500 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Sedang Memproses...
                  </>
                ) : (
                  "Daftar Sekarang"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Perlukan bantuan?</span>
              </div>
            </div>

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
