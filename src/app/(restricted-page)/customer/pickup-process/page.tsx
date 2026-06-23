"use client"

import ServiceHeader from "@/components/ServiceHeader/ServiceHeader"
import { useEditOrder, useGetCustomerOrder } from "@/hooks/services/CustomerOrders"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MessageSquare, Phone } from "react-feather"
import { MapsComponent } from "@/components/MapsComponent"
import { BottomSheet } from "@/components/BottomSheet"
import { useGetUserById } from "@/hooks/services/Auth"

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

  const { data: orderData } = useGetCustomerOrder({
    variables: { id: orderId || "" },
    enabled: !!orderId,
  })

  const { data: cleanerData } = useGetUserById(orderData?.cleanerId || "")

  const pinpoint = orderData?.pinpoint
    ? { lat: orderData.pinpoint._lat, lng: orderData.pinpoint._long }
    : undefined

  const { mutateAsync: mutateEdit } = useEditOrder({
    onSuccess(val) {
      console.log(val)
    },
    onError(err) {
      console.log(err)
    },
  })

  useEffect(() => {
    if (orderData?.status && orderData.status !== "WAITING") {
      setStatusProgress(orderData.status as any)
    }
  }, [orderData?.status])

  useEffect(() => {
    if (statusProgress === "WAITING") {
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
    }
  }, [statusProgress, mutateEdit, orderId])

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
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-gray-50">
      {/* Header absolutely positioned over the map */}
      <div className="absolute left-0 right-0 top-0 z-[1000]">
        <ServiceHeader pageName="Pilih Alamat" goToPage="/customer" />
      </div>

      {/* Map filling the entire background */}
      <div className="absolute inset-0">
        <MapsComponent
          customPinpoint={pinpoint}
          mapProps={{
            mapContainerClassName: "h-full w-full",
            draggable: false,
            showRadius: statusProgress === "WAITING",
            radiusInMeters: 600,
          }}
          containerProps={{
            className: "h-full w-full",
          }}
        />
      </div>

      {/* Bottom Sheet for Status and Cleaner Info */}
      <BottomSheet open={true} setOpen={() => { }} className="p-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[16px] font-bold text-gray-900">
              {listCopyTitle[statusProgress]}
            </p>
            <p className="mt-1 text-[14px] font-normal text-gray-500">
              {listCopySubTitle[statusProgress]}
            </p>
          </div>

          {(statusProgress === "ONPROGRESS" || statusProgress === "DONE") && (
            <>
              <hr className="border-gray-200" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[12px] bg-slate-500">
                    <span className="font-bold text-white">
                      {cleanerData?.fullName?.charAt(0) || "C"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[16px] font-semibold text-gray-900">
                      {cleanerData?.fullName || "Sulastri Aminah"}
                    </p>
                    <p className="text-[14px] font-normal text-gray-500">
                      Cleaner
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-[12px] border border-gray-200 bg-white transition-colors hover:bg-gray-50">
                    <Phone size={18} className="text-[#309C7A]" />
                  </div>
                  <div className="flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-[12px] border border-gray-200 bg-white transition-colors hover:bg-gray-50">
                    <MessageSquare size={18} className="text-[#309C7A]" />
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            onClick={() => router.push("/customer")}
            className="mt-2 w-full rounded-full border border-gray-300 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            Kembali
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}

export default Page
