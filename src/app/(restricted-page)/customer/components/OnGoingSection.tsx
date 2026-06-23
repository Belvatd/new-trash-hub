"use client"

import OrderCard from "@/components/OrderCard/OrderCard"
import { useGetOngoingOrders } from "@/hooks/services/CustomerOrders"

const OnGoingSection = ({ customerId }: { customerId?: string }) => {
  const { data: ongoingOrders, isLoading } = useGetOngoingOrders({
    variables: { customerId: customerId || "" },
    enabled: !!customerId
  })

  if (isLoading) {
    return (
      <div className="my-6">
        <p className="font-semibold text-gray-900">Layanan Berlangsung</p>
        <div className="mt-4 flex justify-center py-4">
          <div className="h-4 w-4 rounded-full bg-[#309C7A] animate-ping"></div>
        </div>
      </div>
    )
  }

  if (!ongoingOrders || ongoingOrders.length === 0) {
    return null
  }

  return (
    <div className="my-6">
      <p className="font-semibold text-gray-900">Layanan Berlangsung</p>

      <div className="mt-4 flex flex-col gap-3">
        {ongoingOrders.map((order) => (
          <OrderCard
            key={order.id}
            orderId={order.id}
            status={order.status as "WAITING" | "ONPROGRESS"}
            addressName={order.fullAddress || "Rumah"}
            cleanerName="Cleaner TrashHub"
            isOngoing={true}
          />
        ))}
      </div>
    </div>
  )
}

export default OnGoingSection
