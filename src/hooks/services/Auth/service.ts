import { deleteCookie, setCookie } from "cookies-next"
import { createMutation } from "react-query-kit"
import { CreateUserType, LoginUserType } from "./model"
import { QueryHook, TypeAccount } from "@/constants/type"
import { useQuery } from "@tanstack/react-query"
import { TAddressItem } from "@/app/(restricted-page)/customer/address/edit/page"
import { createClient } from "@/supabase/client"

export const useCreateUser = createMutation({
  mutationFn: async ({
    email,
    password,
    type,
    address,
    phoneNumber,
    fullName,
  }: CreateUserType) => {
    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          type: type,
        }
      }
    })

    if (authError) throw authError

    const user = authData.user

    if (user) {
      const userData = {
        id: user.id,
        fullName: fullName,
        email: email,
        address: address ? address : [],
        phoneNumber: phoneNumber || "",
        type: type,
        role: [],
        indexAddressSelected: 0,
      }

      const { error: dbError } = await supabase.from("users").insert(userData)
      if (dbError) throw dbError
    }

    return { user }
  },
})

export const useEditUser = createMutation({
  mutationFn: async (variable: {
    id: string
    fullName?: string
    email?: string
    phoneNumber?: string
    type?: TypeAccount
    indexAddressSelected?: number
  }) => {
    const supabase = createClient()
    const { id, ...data } = variable
    
    const { error } = await supabase
      .from("users")
      .update(data)
      .eq("id", id)

    if (error) throw error
    return { message: "success edit user" }
  },
})

export const useGetUserById = (id: string): QueryHook => {
  const supabase = createClient()
  const { data, status, isFetching } = useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle() // Tidak throw error jika 0 baris
      
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
  return { data, status, isFetching }
}

export const useLoginUser = createMutation({
  mutationFn: async ({ email, password }: LoginUserType) => {
    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) throw authError

    // Ambil type dari user_metadata agar tidak perlu query DB (hindari masalah RLS)
    const userType = authData.user?.user_metadata?.type as TypeAccount

    // Auto-create baris di public.users jika belum ada
    const supabaseForUpsert = createClient()
    const { data: existingUser } = await supabaseForUpsert
      .from("users")
      .select("id")
      .eq("id", authData.user.id)
      .maybeSingle()

    if (!existingUser) {
      await supabaseForUpsert.from("users").insert({
        id: authData.user.id,
        fullName: authData.user.user_metadata?.full_name || "",
        email: authData.user.email || "",
        phoneNumber: "",
        type: userType || TypeAccount.CUSTOMER,
        role: [],
        address: [],
        indexAddressSelected: 0,
      })
    }

    return { user: authData.user, type: userType }
  },
})

export const useSendEmailResetPassword = createMutation({
  mutationFn: async ({ email }: { email: string }) => {
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://new-trash-hub.vercel.app/auth/action?type=recovery",
    })
    
    if (error) throw error
    return { status: true, email }
  },
})

export const useResetPassword = createMutation({
  mutationFn: async ({
    code,
    password,
  }: {
    code: string
    password: string
  }) => {
    const supabase = createClient()
    if (code) {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      if (exchangeError) throw exchangeError
    }
    const { error } = await supabase.auth.updateUser({ password })
    
    if (error) throw error
    deleteCookie("email-reset-password")
    return { status: true }
  },
})

export const useAddAddressUser = createMutation({
  mutationFn: async ({
    address,
    userId,
  }: {
    address: TAddressItem
    userId: string
  }) => {
    const supabase = createClient()
    
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("address")
      .eq("id", userId)
      .single()
      
    if (fetchError) throw fetchError

    const currentAddresses = user?.address || []
    const updatedAddresses = [...currentAddresses, address]

    const { error: updateError } = await supabase
      .from("users")
      .update({ address: updatedAddresses })
      .eq("id", userId)

    if (updateError) throw updateError

    return { message: "Success add address" }
  },
})

export const useEditCurrentAddress = createMutation({
  mutationFn: async ({
    address,
    userId,
    idx,
  }: {
    address: TAddressItem
    userId: string
    idx: number
  }) => {
    const supabase = createClient()
    
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("address")
      .eq("id", userId)
      .single()
      
    if (fetchError) throw fetchError

    const addressUser: TAddressItem[] = user?.address || []

    const addressUpdated = addressUser.map((item, i) => {
      if (i === idx) {
        return address
      }
      return item
    })

    const { error: updateError } = await supabase
      .from("users")
      .update({ address: addressUpdated })
      .eq("id", userId)

    if (updateError) throw updateError

    return { message: "Success add address" }
  },
})

export const useClaimReward = createMutation({
  mutationFn: async ({ userId }: { userId: string }) => {
    const supabase = createClient()
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("reward_claimed")
      .eq("id", userId)
      .single()

    if (fetchError) throw fetchError

    const currentClaimed = user?.reward_claimed || 0
    const newClaimed = currentClaimed + 1

    const { error } = await supabase
      .from("users")
      .update({ reward_claimed: newClaimed })
      .eq("id", userId)

    if (error) throw error
    return { message: "success claim reward" }
  },
})

