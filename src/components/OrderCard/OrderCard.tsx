import { OrderType } from "@/constants/type"
import OrderIcon from "./components/OrderIcon"
import formatDate from "@/utils/formatDate"
import { ArrowRight } from "react-feather"
import { useRouter } from "next/navigation"

type OrderCardProps = {
  orderId?: string
  status?: "WAITING" | "ONPROGRESS" | "DONE" | "CANCELLED"
  addressName?: string
  cleanerName?: string
  isOngoing?: boolean
  date?: string
  points?: number
}

const OrderCard = ({
  orderId,
  status,
  addressName = "Rumah",
  cleanerName = "Cleaner",
  isOngoing = true,
  date,
  points,
}: OrderCardProps) => {
  const router = useRouter()

  const handleCardClick = () => {
    if (isOngoing && orderId) {
      router.push(`/customer/pickup-process?orderId=${orderId}`)
    }
  }

  const getStatusLabel = () => {
    if (status === "WAITING") return "Mencari cleaner..."
    if (status === "ONPROGRESS") return "Cleaner menuju lokasi"
    if (status === "DONE") return "Selesai"
    if (status === "CANCELLED") return "Dibatalkan"
    return "Layanan"
  }

  return (
    <div 
      className={`flex gap-[9px] rounded-xl border border-gray-100 p-4 ${isOngoing ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors' : ''}`}
      onClick={handleCardClick}
    >
      <OrderIcon orderType={OrderType.PICKUP} />
      <div className="flex-grow">
        <div className="flex w-full items-center gap-2">
          {status === "WAITING" && <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></div>}
          {status === "ONPROGRESS" && <div className="h-2 w-2 rounded-full bg-[#309C7A]"></div>}
          {status === "CANCELLED" && <div className="h-2 w-2 rounded-full bg-red-500"></div>}
          <p className="text-sm font-medium text-gray-900">{getStatusLabel()}</p>

          {!isOngoing && (
            <p className="ml-auto text-[10px] text-gray-500">
              {formatDate(date ? new Date(date) : new Date())}
            </p>
          )}
        </div>

        <div className="text-[10px] mt-1 flex items-center gap-2 text-gray-500">
          <p>{addressName}</p>
          {isOngoing ? (
            <>
              {status === "ONPROGRESS" && (
                <>
                  <hr className="inline-block h-2 w-[1px] bg-gray-200" />
                  <p>{cleanerName}</p>
                </>
              )}
            </>
          ) : (
            <p className="ml-auto">+{points ?? 20}xp</p>
          )}
        </div>
      </div>

      {isOngoing && (
        <div className="flex items-center text-gray-400">
          <ArrowRight size={16} />
        </div>
      )}
    </div>
  )
}

export default OrderCard
