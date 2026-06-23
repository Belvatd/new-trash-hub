"use client"
import { getCookie } from "cookies-next"
import { useSearchParams } from "next/navigation"
import { Mail } from "react-feather"
import { useEffect, useMemo, useState } from "react"
import useCountDown from "react-countdown-hook"
import { useSendEmailResetPassword, useResendVerificationEmail } from "@/hooks/services/Auth"
import { ClipLoader, MoonLoader } from "react-spinners"

type TAction = "verifyPassword" | "resetPassword" | "verifyEmail"
const initialTime = 59 * 1000
const interval = 1000

const content: Record<string, { title: string; desc: string }> = {
  verifyEmail: {
    title: "Verifikasi Akun",
    desc: "Silakan cek email Anda untuk memverifikasi pendaftaran Akun",
  },
  resetPassword: {
    title: "Verifikasi OTP",
    desc: "Silakan cek email Anda untuk memverifikasi ganti kata sandi.",
  },
}

const Page = () => {
  const searchParams = useSearchParams()
  const action = searchParams.get("action") as TAction
  const [timeLeft, { start }] = useCountDown(initialTime, interval)

  const { mutate: sendEmail, isPending: isSendingReset } = useSendEmailResetPassword({
    onSuccess() {
      start(initialTime)
    },
  })

  const { mutate: resendVerification, isPending: isResendingVerify } = useResendVerificationEmail({
    onSuccess() {
      start(initialTime)
    },
  })

  const isPending = isSendingReset || isResendingVerify

  const handleClick = () => {
    if (action === "resetPassword") {
      const email = getCookie("email-reset-password") || ""
      sendEmail({ email })
    } else if (action === "verifyEmail") {
      const email = getCookie("email-signup") || ""
      resendVerification({ email })
    }
  }

  const textButton = useMemo(() => {
    if (!timeLeft) {
      return "Kirim Ulang"
    }

    const digit = timeLeft / 1000
    return `00:${digit.toString().padStart(2, "0")}`
  }, [timeLeft])

  useEffect(() => {
    start()
  }, [start])

  return (
    <div className="mt-3 grid w-full gap-5 rounded-xl bg-white p-4 pb-5">
      <div className="bg-brand-25 mx-auto h-12 w-12 rounded-lg p-3">
        <Mail className="text-brand-600" />
      </div>

      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-900">
          {content[action || ""].title}
        </h1>
        <p className="mx-auto mt-2 w-[300px] text-sm text-gray-500">
          {content[action || ""].desc}
        </p>
      </div>

      <button
        className="text-brand-600 text-sm font-semibold disabled:text-gray-400"
        onClick={handleClick}
        disabled={!!timeLeft || isPending}
      >
        {isPending ? <ClipLoader size={16} /> : textButton}
      </button>
    </div>
  )
}

export default Page
