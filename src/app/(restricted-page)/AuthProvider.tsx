"use client"

import { useGetUserById } from "@/hooks/services/Auth"
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import { TypeAccount } from "@/constants/type"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/supabase/client"

type TAuthContext = {
  user?: User
  setUserLogin?: (data: User) => void
}

const AuthContext = createContext<TAuthContext>({})
export const useAuth = () => useContext<TAuthContext>(AuthContext)

const AuthProvider = (props: PropsWithChildren) => {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User>()

  const { data: userData } = useGetUserById(user?.id || "")

  const setUserLogin = (data: User) => setUser(data)

  const handleValidationType = () => {
    const typeAccount = userData?.type as TypeAccount

    if (
      typeAccount === TypeAccount.CUSTOMER &&
      pathname.startsWith("/cleaner")
    ) {
      return router.push("/customer")
    }

    if (
      typeAccount === TypeAccount.CLEANER &&
      pathname.startsWith("/customer")
    ) {
      return router.push("/cleaner")
    }
  }

  useEffect(() => {
    handleValidationType()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(undefined)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <>
      <AuthContext.Provider value={{ user, setUserLogin }}>
        {props.children}
      </AuthContext.Provider>
    </>
  )
}

export default AuthProvider
