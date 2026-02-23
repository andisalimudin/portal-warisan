"use client";

import { useEffect, useState } from "react";
import { User, MapPin, Calendar, Camera, Save, Lock, Shield, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type UserProfile = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  icNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  parliament: string | null;
  dun: string | null;
  role: string;
  joinDate: string;
  status: string;
  profileImage: string | null;
};

function formatRole(role: string) {
  if (role === "AHLI_BIASA") return "Ahli Biasa";
  if (role.startsWith("ADMIN")) return "Admin";
  return role.replace("_", " ");
}

function formatStatus(status: string) {
  if (status === "APPROVED") return "Aktif";
  if (status === "PENDING") return "Menunggu Kelulusan";
  if (status === "SUSPENDED") return "Digantung";
  if (status === "REJECTED") return "Ditolak";
  return status;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const raw = window.localStorage.getItem("warisan_user");

    if (!raw) {
      setError("Sesi anda telah tamat. Sila log masuk semula.");
      setLoading(false);
      return;
    }

    try {
      const basicUser = JSON.parse(raw) as { id?: string };
      const userId = basicUser.id;

      if (!userId) {
        setError("Maklumat pengguna tidak sah. Sila log masuk semula.");
        setLoading(false);
        return;
      }

      async function fetchProfile(id: string) {
        try {
          const res = await fetch(`/api/profile?userId=${encodeURIComponent(id)}`);
          const data = await res.json();

          if (!res.ok) {
            setError(data.error || "Gagal memuatkan profil.");
            return;
          }

          const u = data.user;

          const profile: UserProfile = {
            id: u.id,
            fullName: u.fullName ?? "",
            email: u.email ?? null,
            phone: u.phoneNumber ?? null,
            icNumber: u.icNumber ?? null,
            address: u.address ?? null,
            city: u.city ?? null,
            state: u.state ?? null,
            parliament: u.parliament ?? null,
            dun: u.dun ?? null,
            role: u.role ?? "",
            joinDate: u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : "",
            status: u.status ?? "",
            profileImage: null,
          };

          setUser(profile);
        } catch {
          setError("Ralat rangkaian semasa memuatkan profil.");
        } finally {
          setLoading(false);
        }
      }

      fetchProfile(userId);
    } catch {
      setError("Maklumat sesi tidak sah. Sila log masuk semula.");
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          fullName: user.fullName,
          phoneNumber: user.phone || "",
          address: user.address || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Gagal mengemas kini profil.");
        return;
      }

      const u = data.user;

      const updated: UserProfile = {
        id: u.id,
        fullName: u.fullName ?? "",
        email: u.email ?? null,
        phone: u.phoneNumber ?? null,
        icNumber: u.icNumber ?? null,
        address: u.address ?? null,
        city: user.city ?? null,
        state: u.state ?? null,
        parliament: u.parliament ?? null,
        dun: u.dun ?? null,
        role: u.role ?? "",
        joinDate: u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : "",
        status: u.status ?? "",
        profileImage: user.profileImage,
      };

      setUser(updated);
      setIsEditing(false);

      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem("warisan_user");
          if (raw) {
            const basic = JSON.parse(raw);
            const nextBasic = {
              ...basic,
              fullName: updated.fullName,
              email: updated.email,
            };
            window.localStorage.setItem("warisan_user", JSON.stringify(nextBasic));
          }
        } catch {
        }
      }

      alert("Profil berjaya dikemaskini!");
    } catch {
      alert("Ralat rangkaian semasa mengemas kini profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local URL for preview
      const imageUrl = URL.createObjectURL(file);
      setUser(prev => (prev ? { ...prev, profileImage: imageUrl } : prev));
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-sm text-gray-500">Memuatkan profil...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-sm text-red-600">
          {error || "Profil tidak dapat dimuatkan."}
        </p>
      </div>
    );
  }

  const profile = user;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-warisan-900 to-warisan-800"></div>
        
        <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-6 pt-16 px-4">
          {/* Profile Image */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden shadow-lg">
              {profile.profileImage ? (
                <Image 
                  src={profile.profileImage} 
                  alt={profile.fullName} 
                  width={128} 
                  height={128} 
                  className="w-full h-full object-cover"
                />
              ) : (
                  <User className="w-16 h-16 text-gray-400" />
              )}
            </div>
            <label 
              htmlFor="profile-upload"
              className="absolute bottom-0 right-0 p-2 bg-warisan-500 hover:bg-warisan-600 text-white rounded-full cursor-pointer shadow-md transition-colors"
            >
              <Camera className="w-4 h-4" />
              <input 
                type="file" 
                id="profile-upload" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {/* Basic Info */}
          <div className="flex-1 text-center sm:text-left pb-2">
            <h1 className="text-2xl font-bold text-gray-900">{profile.fullName}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-warisan-600" />
                {formatRole(profile.role)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                {profile.parliament || "Parlimen belum ditetapkan"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                Ahli sejak {profile.joinDate ? new Date(profile.joinDate).getFullYear() : "-"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pb-2">
            {isEditing ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-warisan-600 hover:bg-warisan-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 text-sm font-medium text-warisan-700 bg-warisan-50 hover:bg-warisan-100 border border-warisan-200 rounded-lg transition-colors"
              >
                Kemaskini Profil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 bg-white px-6 rounded-t-xl">
        <button
          onClick={() => setActiveTab('info')}
          className={cn(
            "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'info' 
              ? "border-warisan-600 text-warisan-700" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          Maklumat Peribadi
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={cn(
            "px-6 py-4 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'security' 
              ? "border-warisan-600 text-warisan-700" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          Keselamatan
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white p-6 rounded-b-xl rounded-tr-xl shadow-sm border border-gray-100 border-t-0 mt-0">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Butiran Utama</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nama Penuh</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      name="fullName"
                      value={profile.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">No. Kad Pengenalan</label>
                  <p className="text-gray-900 font-medium flex items-center gap-2">
                    {profile.icNumber}
                    <BadgeCheck className="w-4 h-4 text-green-500" />
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">No. Telefon</label>
                  {isEditing ? (
                    <input 
                      type="tel" 
                      name="phone"
                      value={profile.phone || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.phone || "-"}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Alamat Emel</label>
                  <p className="text-gray-900 font-medium">{profile.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Alamat & Kawasan</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Alamat Surat Menyurat</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      name="address"
                      value={profile.address || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile.address || "-"}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Bandar</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="city"
                        value={profile.city || ""}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{profile.city || "-"}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Negeri</label>
                    <p className="text-gray-900 font-medium">{profile.state || "-"}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Parlimen</label>
                  <p className="text-gray-900 font-medium">{profile.parliament || "-"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">DUN</label>
                  <p className="text-gray-900 font-medium">{profile.dun || "-"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-6">Tukar Kata Laluan</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kata Laluan Semasa</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="password" 
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kata Laluan Baru</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="password" 
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sahkan Kata Laluan Baru</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="password" 
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-warisan-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button className="bg-warisan-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-warisan-700 transition-colors">
                  Kemas Kini Kata Laluan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
