"use client"

import { useAuth } from "@/app/(restricted-page)/AuthProvider"
import { useGetUserById } from "@/hooks/services/Auth"
import { createClient } from "@/supabase/client"
import { useRouter } from "next/navigation"
import React, { useState } from "react"
import {
  User as UserIcon,
  Phone,
  Mail,
  ChevronRight,
  LogOut,
  Info,
  Shield,
  Briefcase,
  Star,
  CheckCircle,
} from "react-feather"
import { ClipLoader } from "react-spinners"

const CleanerAccountPage = () => {
  const { user } = useAuth()
  const { data: userData, isFetching } = useGetUserById(user?.id || "")
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
      setLoggingOut(false)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "C"
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-20">
      {/* Header Profile Section */}
      <div className="bg-patern relative h-[180px] w-full pt-10 text-white flex flex-col justify-end pb-6 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/90 to-brand-500/90 z-0"></div>
        <div className="relative z-10 flex items-center gap-4">
          {/* Avatar */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-white/40 bg-brand-600 font-bold text-white shadow-md text-xl">
            {getInitials(userData?.fullName || user?.user_metadata?.full_name)}
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">
              {userData?.fullName || user?.user_metadata?.full_name || "Cleaner Partner"}
            </h1>
            <p className="text-xs text-brand-100 font-medium">
              {userData?.email || user?.email}
            </p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
              <Briefcase size={10} /> Cleaner Partner
            </span>
          </div>
        </div>
      </div>

      {/* Stats Summary Card */}
      <div className="px-6 -mt-4 relative z-10">
        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100 divide-x divide-gray-100">
          <div className="flex flex-col items-center justify-center py-1">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1 flex items-center gap-1">
              <Star size={10} className="text-warning-500 fill-warning-500" /> Rating
            </span>
            <p className="text-lg font-bold text-gray-900">4.8</p>
          </div>
          <div className="flex flex-col items-center justify-center py-1">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mb-1 flex items-center gap-1">
              <CheckCircle size={10} className="text-brand-500" /> Selesai
            </span>
            <p className="text-lg font-bold text-gray-900">12 Pekerjaan</p>
          </div>
        </div>
      </div>

      {/* Profile Details List */}
      <div className="mt-6 px-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
          Informasi Partner
        </h2>
        <div className="flex flex-col rounded-2xl bg-white p-2 shadow-sm border border-gray-100 divide-y divide-gray-50">
          {/* Full Name */}
          <div className="flex items-center gap-3 py-3 px-2">
            <div className="text-gray-400">
              <UserIcon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-gray-400 leading-none">Nama Lengkap</p>
              <p className="text-sm font-semibold text-gray-800 mt-1 truncate">
                {userData?.fullName || "—"}
              </p>
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex items-center gap-3 py-3 px-2">
            <div className="text-gray-400">
              <Phone size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-gray-400 leading-none">Nomor HP</p>
              <p className="text-sm font-semibold text-gray-800 mt-1 truncate">
                {userData?.phoneNumber || "Belum ditambahkan"}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 py-3 px-2">
            <div className="text-gray-400">
              <Mail size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-gray-400 leading-none">Alamat Email</p>
              <p className="text-sm font-semibold text-gray-800 mt-1 truncate">
                {userData?.email || user?.email || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu / Settings List */}
      <div className="mt-6 px-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-1">
          Informasi Aplikasi
        </h2>
        <div className="flex flex-col rounded-2xl bg-white p-2 shadow-sm border border-gray-100 divide-y divide-gray-50">
          <div className="flex items-center justify-between py-3 px-2 cursor-pointer hover:bg-gray-25 transition-colors">
            <div className="flex items-center gap-3">
              <div className="text-brand-500">
                <Info size={18} />
              </div>
              <span className="text-sm font-medium text-gray-700">Tentang TrashHub Partner</span>
            </div>
            <span className="text-[10px] font-bold bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
              v1.0.0
            </span>
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <div className="mt-8 px-6">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-error-100 bg-error-50 py-3.5 text-sm font-bold text-error-600 hover:bg-error-100 active:bg-error-200 transition-colors"
        >
          {loggingOut ? (
            <ClipLoader size={18} color="#D92D20" />
          ) : (
            <>
              <LogOut size={16} />
              Keluar dari Akun
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default CleanerAccountPage
