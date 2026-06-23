"use client"

import ServiceHeader from "@/components/ServiceHeader/ServiceHeader"
import { useEditOrder } from "@/hooks/services/CustomerOrders"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MessageSquare, Phone } from "react-feather"

const Page = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [statusProgress, setStatusProgress] = useState<
    "WAITING" | "ONPROGRESS" | "DONE"
  >("WAITING")

  const listCopyTitle = {
    WAITING: "Sedang Mencari Cleaner Terdekat...",
    ONPROGRESS: "Cleaner Sedang Menuju Lokasi Anda",
    DONE: "Sampah Diangkut",
  }

  const listCopySubTitle = {
    WAITING: "Sampah akan dipick-up setelah Anda mendapatkan Cleaner",
    ONPROGRESS: "Estimasi waktu 15 menit",
    DONE: "Cleaner telah mengangkut sampah Anda",
  }

  const { mutateAsync: mutateEdit } = useEditOrder({
    onSuccess(val) {
      console.log(val)
    },
    onError(err) {
      console.log(err)
    },
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      mutateEdit({
        id: orderId || "",
        updatedData: {
          status: "ONPROGRESS",
          cleanerId: "da6806e2-ee3f-42e1-959c-85a22d7ffceb",
        },
      })
      setStatusProgress("ONPROGRESS")
    }, 10000)
    return () => clearTimeout(timeout)
  }, [mutateEdit, orderId])

  useEffect(() => {
    if (statusProgress === "ONPROGRESS") {
      const timeout = setTimeout(() => {
        setStatusProgress("DONE")
        mutateEdit({
          id: orderId || "",
          updatedData: {
            status: "DONE",
          },
        })
      }, 8000)

      return () => clearTimeout(timeout)
    }
  }, [statusProgress, mutateEdit, orderId])

  useEffect(() => {
    if (statusProgress === "DONE") {
      const timeout = setTimeout(() => {
        router.push(`/customer/order-detail?orderId=${orderId}`)
      }, 4000)

      return () => clearTimeout(timeout)
    }
  }, [statusProgress, router, orderId])

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <ServiceHeader pageName="Pick-Up Process" goToPage="/customer" />
      <div className="flex flex-col gap-4 p-4">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 pb-3">
            {statusProgress === "WAITING" && (
              <div className="h-3 w-3 rounded-full bg-yellow-400 animate-pulse"></div>
            )}
            {statusProgress === "ONPROGRESS" && (
              <div className="h-3 w-3 rounded-full bg-[#309C7A]"></div>
            )}
            {statusProgress === "DONE" && (
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            )}
            <p className="text-[16px] font-semibold text-gray-900">
              {listCopyTitle[statusProgress]}
            </p>
          </div>
          <p className="text-[14px] font-normal text-gray-500">
            {listCopySubTitle[statusProgress]}
          </p>
        </div>
        
        {(statusProgress === "ONPROGRESS" || statusProgress === "DONE") && (
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-slate-200 flex items-center justify-center overflow-hidden">
                  <div className="h-full w-full bg-[#309C7A]/10 text-[#309C7A] font-bold flex items-center justify-center">CT</div>
                </div>
                <div className="flex flex-col">
                  <p className="text-[16px] font-semibold text-gray-900">
                    Cleaner TrashHub
                  </p>
                  <p className="text-[14px] font-normal text-gray-500">
                    Cleaner
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#309C7A]/10 p-2 cursor-pointer transition-colors active:bg-[#309C7A]/20">
                  <Phone size={18} color="#309C7A" />
                </div>
                <div className="flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#309C7A]/10 p-2 cursor-pointer transition-colors active:bg-[#309C7A]/20">
                  <MessageSquare size={18} color="#309C7A" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Page
