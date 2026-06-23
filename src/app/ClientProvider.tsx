"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { usePathname, useRouter } from "next/navigation"
import { PropsWithChildren, useEffect, useState } from "react"
import { TypeAccount } from "@/constants/type"
import { createClient } from "@/supabase/client"

const restrictedPath = ["/cleaner", "/customer"]

const ClientProvider = (props: PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient())
  const pathname = usePathname()
  const router = useRouter()

  const isRestricted = restrictedPath.some((path) => pathname.startsWith(path))

  const handleAuthentication = () => {
    const supabase = createClient()
    supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user
      // Jika halaman restricted tapi tidak ada user, redirect ke home
      if (isRestricted && !currentUser) {
        return router.push("/")
      }

      // Hanya redirect ke dashboard jika user ada di halaman publik (bukan setelah login form push)
      // Gunakan user_metadata untuk dapat type tanpa perlu query DB
      if (currentUser && currentUser.email_confirmed_at && !isRestricted && pathname === "/") {
        const type = currentUser.user_metadata?.type as TypeAccount

        if (type === TypeAccount.CLEANER) {
          router.push("/cleaner")
        } else if (type === TypeAccount.CUSTOMER) {
          router.push("/customer")
        }
      }
    })
  }

  useEffect(() => {
    handleAuthentication()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  )
}

export default ClientProvider
