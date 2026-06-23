import { createMutation, createQuery } from "react-query-kit"
import { CreateOrderType } from "."
import { TTrashRow } from "@/constants/type"
import { createClient } from "@/supabase/client"

export const useCreateOrder = createMutation({
  mutationFn: async ({
    customerId,
    addressNotes,
    orderNotes,
    trashPicture,
    pinpoint,
    status,
    createdDate,
    trashId,
    fullAddress,
  }: CreateOrderType) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("customer_orders")
      .insert({
        customerId,
        addressNotes,
        orderNotes,
        trashPicture,
        pinpoint,
        status,
        createdDate,
        trashId,
        fullAddress,
      })
      .select()
      .single()

    if (error) throw error

    return { id: data.id, status: true }
  },
})

export const useEditOrder = createMutation({
  mutationFn: async ({ id, updatedData }: { id: string; updatedData: any }) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("customer_orders")
      .update(updatedData)
      .eq("id", id)

    if (error) throw error

    return { status: true }
  },
})

export const useGetCustomerOrder = createQuery({
  queryKey: ["customer-order-detail"],
  fetcher: async (variable: { id: string }) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("customer_orders")
      .select("*")
      .eq("id", variable.id)
      .single()

    if (error) throw error

    return data as CreateOrderType
  },
})

export const useGetTrash = createQuery({
  queryKey: ["trash"],
  fetcher: async (variable: { id: string }) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("trash")
      .select("*")
      .eq("id", variable.id)
      .single()

    if (error) throw error

    return data as TTrashRow
  },
})

export const useGetAllTrashes = createQuery({
  queryKey: ["all-trashes"],
  fetcher: async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("trash")
      .select("*")

    if (error) throw error

    return data as TTrashRow[]
  },
})

export const useGetOngoingOrders = createQuery({
  queryKey: ["ongoing-orders"],
  fetcher: async (variable: { customerId: string }) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("customer_orders")
      .select("*")
      .eq("customerId", variable.customerId)
      .in("status", ["WAITING", "ONPROGRESS"])
      .order("createdDate", { ascending: false })

    if (error) throw error
    return data as (CreateOrderType & { id: string })[]
  },
})

export const useGetOrderHistory = createQuery({
  queryKey: ["order-history"],
  fetcher: async (variable: { customerId: string }) => {
    const supabase = createClient()
    const { data: orders, error: ordersError } = await supabase
      .from("customer_orders")
      .select("*")
      .eq("customerId", variable.customerId)
      .in("status", ["DONE", "CANCELLED"])
      .order("createdDate", { ascending: false })

    if (ordersError) throw ordersError

    const { data: trashes, error: trashesError } = await supabase
      .from("trash")
      .select("*")

    if (trashesError) throw trashesError

    return (orders || []).map((order) => {
      const trash = (trashes || []).find((t) => t.id === order.trashId)
      return {
        ...order,
        id: order.id,
        trashName: trash ? trash.name : "Layanan",
        points: trash ? trash.points : 20,
      }
    }) as (CreateOrderType & { id: string; trashName: string; points: number })[]
  },
})

