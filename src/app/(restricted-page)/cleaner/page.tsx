"use client"
import { createClient } from "@/supabase/client"
import { useRouter } from "next/navigation"

const Page = () => {
  const router = useRouter()
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
      .then(() => {
        router.push("/login")
      })
      .catch((error) => {
        console.log(error)
      })
  }

  return (
    <div>
      Cleaner Restricted Page
      <button onClick={handleLogout}>logout</button>
    </div>
  )
}

export default Page
