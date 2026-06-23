"use client"

import VerifyEmail from "./components/VerifyEmail"
import ResetPassword from "./components/ResetPasswordSection"
import { useSearchParams } from "next/navigation"

const Page = () => {
  const searchParams = useSearchParams()
  const type = searchParams.get("type") || ""

  return (
    <>
      {type === "signup" && <VerifyEmail />}
      {type === "recovery" && <ResetPassword code="" />}
    </>
  )
}

export default Page
