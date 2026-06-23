"use client"

import { useAuth } from "@/app/(restricted-page)/AuthProvider"
import OrderCard from "@/components/OrderCard/OrderCard"
import ServiceHeader from "@/components/ServiceHeader/ServiceHeader"
import { useGetOrderHistory } from "@/hooks/services/CustomerOrders"
import { BounceLoader } from "react-spinners"

const Page = () => {
  const { user } = useAuth()
  const { data: historyOrders, isFetching, status } = useGetOrderHistory({
    variables: { customerId: user?.id || "" },
    enabled: !!user?.id,
  })

  return (
    <div className="h-full pb-6">
      <ServiceHeader
        pageName="Riwayat Transaksi"
        goToPage="/customer"
      />

      <div className="p-6 flex flex-col h-[calc(100%-80px)]">
        {isFetching && (
          <div className="flex flex-grow items-center justify-center min-h-[200px]">
            <BounceLoader color="#309C7A" />
          </div>
        )}

        {!isFetching && status === "success" && (
          <>
            {(!historyOrders || historyOrders.length === 0) ? (
              <div className="flex flex-col flex-grow items-center justify-center text-center p-8 gap-3">
                <div className="rounded-full bg-brand-50 p-4 text-[#309C7A]">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Belum Ada Riwayat</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
                    Semua pesanan pick-up yang telah selesai atau dibatalkan akan muncul di sini.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 overflow-y-auto">
                {historyOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    orderId={order.id}
                    isOngoing={false}
                    status={order.status as any}
                    addressName={order.fullAddress || "Alamat"}
                    date={order.createdDate}
                    points={order.points}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Page
