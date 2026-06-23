"use client"

import { useAuth } from "@/app/(restricted-page)/AuthProvider"
import { useGetUserById, useClaimReward } from "@/hooks/services/Auth"
import { useGetOrderHistory } from "@/hooks/services/CustomerOrders"
import { getTreeStage } from "@/utils/gamification"
import formatDate from "@/utils/formatDate"
import { useRouter } from "next/navigation"
import { ArrowLeft, MessageSquare, Bell, Award, CheckCircle, X } from "react-feather"
import { BounceLoader } from "react-spinners"
import Image from "next/image"
import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

const Page = () => {
  const { user } = useAuth()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [modalInfo, setModalInfo] = useState<{ title: string; text: string; isSuccess: boolean } | null>(null)

  const { data: userProfile } = useGetUserById(user?.id || "")
  const { data: historyOrders, isFetching: isFetchingHistory } = useGetOrderHistory({
    variables: { customerId: user?.id || "" },
    enabled: !!user?.id,
  })

  const { mutate: claimReward, isPending: isClaiming } = useClaimReward({
    onSuccess: () => {
      setModalInfo({
        title: "Klaim Berhasil!",
        text: "Selamat! Kamu berhasil mengklaim reward Pohon Lestari.",
        isSuccess: true,
      })
      queryClient.invalidateQueries({ queryKey: ["users", user?.id] })
    },
    onError: (err: any) => {
      setModalInfo({
        title: "Gagal Klaim",
        text: err?.message || "Terjadi kesalahan saat mengklaim reward.",
        isSuccess: false,
      })
    }
  })

  // Calculate total XP (sum of points of all completed/DONE orders, minus 1500 for each claimed reward)
  const completedOrders = (historyOrders || []).filter((order) => order.status === "DONE")

  const rawXp = completedOrders.reduce((sum, order) => sum + (order.points || 0), 0)
  const rewardClaimedCount = userProfile?.reward_claimed || 0
  const totalXp = Math.max(rawXp - (rewardClaimedCount * 1500), 0)
  const currentStage = getTreeStage(totalXp)

  // Calculate progress bar percentage
  let progressPercent = 100
  if (currentStage.nextThreshold !== null) {
    const range = currentStage.nextThreshold - currentStage.minXp
    const currentProgress = totalXp - currentStage.minXp
    progressPercent = Math.min(Math.max((currentProgress / range) * 100, 0), 100)
  }

  const handleClaim = () => {
    if (!user?.id) return
    claimReward({ userId: user.id })
  }

  return (
    <div className="flex h-full w-full flex-col bg-gray-50">
      {/* Full Graphic Header Banner */}
      <div className="relative w-full h-[370px] bg-[#A5DAFC] overflow-hidden">
        {/* Full Banner SVG */}
        <Image
          src={currentStage.illustration}
          alt={currentStage.name}
          fill
          className="object-cover object-bottom"
          priority
        />

        {/* Navigation & Header Actions Overlay */}
        <div className="absolute top-4 left-0 right-0 flex w-full items-center justify-between px-6 text-white z-10">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/customer")}
              className="rounded-full bg-black/20 p-2 hover:bg-black/35 transition text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <span className="text-lg font-semibold drop-shadow-sm text-white">Pohon Lestari</span>
          </div>
          <div className="flex gap-3">
            <button className="rounded-full bg-black/20 p-2 hover:bg-black/35 transition text-white">
              <MessageSquare size={18} />
            </button>
            <button className="rounded-full bg-black/20 p-2 hover:bg-black/35 transition text-white">
              <Bell size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 flex-1 -mt-8 bg-white rounded-t-3xl shadow-xl z-20 pt-6 overflow-y-auto">

        {/* Progress Section */}
        <div className="mb-6">
          <div className="flex justify-between items-baseline mb-2">
            <h2 className="text-lg font-medium text-gray-900">{currentStage.name}</h2>
            <span className="text-base font-medium text-gray-800">
              {totalXp}
              <span className="text-[10px] font-normal text-gray-400 ml-0.5">xp</span>
            </span>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-500 ${currentStage.colorClass}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Notification Banner */}
          {currentStage.nextThreshold !== null ? (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-amber-700 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              Capai {currentStage.nextThreshold}xp untuk menumbuhkan pohon.
            </div>
          ) : (
            /* Reach Pohon Lestari (Max Stage) */
            <div className="mt-4">
              <button
                onClick={handleClaim}
                disabled={isClaiming}
                className="w-full flex items-center justify-center gap-2 bg-[#309C7A] hover:bg-[#288467] text-white font-medium py-3 px-4 rounded-xl shadow-lg transition active:scale-[0.98] disabled:opacity-50 text-xs"
              >
                {isClaiming ? (
                  <BounceLoader size={16} color="#fff" />
                ) : (
                  <>
                    <Award size={16} />
                    Klaim Reward
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* History XP Section */}
        <div>
          <h3 className="text-xs font-medium text-gray-900 mb-3">Riwayat Xp</h3>

          {isFetchingHistory ? (
            <div className="flex py-10 justify-center">
              <BounceLoader color="#309C7A" />
            </div>
          ) : completedOrders.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-[11px] rounded-2xl bg-gray-50 border border-dashed border-gray-200">
              Belum ada riwayat XP. Selesaikan order untuk mendapatkan XP!
            </div>
          ) : (
            <div className="flex flex-col gap-2.5 pb-6">
              {completedOrders.map((order) => {
                const isLayanan = order.trashName === "Layanan"

                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${isLayanan ? "bg-blue-50 text-blue-500" : "bg-emerald-50 text-emerald-500"}`}>
                        {/* Leaf SVG or default award icon */}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800">
                          {isLayanan ? "Layanan Kebersihan" : `Pick-Up Sampah (${order.trashName})`}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {formatDate(new Date(order.createdDate))}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs font-medium text-emerald-600">
                      +{order.points || 20}xp
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Custom Premium Modal Overlay */}
      {modalInfo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 relative flex flex-col items-center text-center">
            <button
              onClick={() => setModalInfo(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
              <X size={20} />
            </button>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${modalInfo.isSuccess ? "bg-emerald-50 text-emerald-500" : "bg-red-50 text-red-500"}`}>
              {modalInfo.isSuccess ? <CheckCircle size={36} /> : <X size={36} />}
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">{modalInfo.title}</h4>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">{modalInfo.text}</p>
            <button
              onClick={() => setModalInfo(null)}
              className={`w-full text-lg py-3.5 px-4 rounded-xl font-medium text-white shadow-lg transition active:scale-[0.98] ${modalInfo.isSuccess ? "bg-[#309C7A] hover:bg-[#288467]" : "bg-[#309C7A]"
                }`}
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Page
