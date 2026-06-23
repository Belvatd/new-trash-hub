"use client"

import { useAuth } from "@/app/(restricted-page)/AuthProvider"
import { createClient } from "@/supabase/client"
import getGreetingTime from "@/utils/getGreetingTime"
import { useRouter } from "next/navigation"
import { Bell, MessageSquare, Pocket } from "react-feather"
import PickupMenu from "./components/PickupMenu"
import RoutinePickupMenu from "./components/RoutinePickupMenu"
import CleanerMenu from "./components/CleanerMenu"
import CleanTogetherMenu from "./components/CleanTogetherMenu"
import OrderCard from "@/components/OrderCard/OrderCard"
import OnGoingSection from "./components/OnGoingSection"
import { useGetOrderHistory } from "@/hooks/services/CustomerOrders"
import { getTreeStage } from "@/utils/gamification"
import { useGetUserById } from "@/hooks/services/Auth"

const Page = () => {
  const { user } = useAuth()
  const router = useRouter()

  const { data: historyOrders } = useGetOrderHistory({
    variables: { customerId: user?.id || "" },
    enabled: !!user?.id,
  })

  const { data: userProfile } = useGetUserById(user?.id || "")
  const rewardClaimedCount = userProfile?.reward_claimed || 0

  const rawXp = (historyOrders || [])
    .filter((order) => order.status === "DONE")
    .reduce((sum, order) => sum + (order.points || 0), 0)

  const totalXp = Math.max(rawXp - (rewardClaimedCount * 1500), 0)
  const currentStage = getTreeStage(totalXp)

  return (
    <div className="flex flex-col">
      <div className="bg-patern h-[159px] pt-10 ">
        <div className="flex gap-6 px-6 py-4">
          <div className="flex-grow">
            <p className="text-[10px]">{getGreetingTime()},</p>
            <p className="text-sm font-semibold">
              {user?.user_metadata?.full_name ?? "Customer"}
            </p>
          </div>
          <button className="inline-block">
            <MessageSquare />
          </button>
          <button className="inline-block">
            <Bell />
          </button>
        </div>
      </div>

      <div className="flex-grow px-6">
        <div 
          onClick={() => router.push("/customer/tree")}
          className="-mt-10 flex items-center justify-between rounded-xl bg-white p-4 shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          <div className="flex gap-2">
            <div className="w-9 rounded-lg bg-brand-50 p-2 text-brand-500">
              <Pocket size={20} />
            </div>

            <div>
              <p className="text-[10px] text-gray-500">Pohon Lestari</p>
              <p className="text-sm font-medium">{currentStage.name}</p>
            </div>
          </div>

          <div className="flex">
            <p className="text-xl font-semibold">
              {totalXp}
              <span className="ml-1 text-[10px] font-normal text-gray-500">
                Xp
              </span>
            </p>
          </div>
        </div>

        <div className="mb-4 mt-8 grid grid-cols-4">
          <PickupMenu />
          <RoutinePickupMenu />
          <CleanerMenu />
          <CleanTogetherMenu />
        </div>

        <OnGoingSection customerId={user?.id} />
      </div>
    </div>
  )
}

export default Page
