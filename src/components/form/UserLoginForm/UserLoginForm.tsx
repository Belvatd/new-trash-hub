"use client"

import { useAuth } from "@/app/(restricted-page)/AuthProvider"
import TextField from "@/components/TextField/TextField"
import { TypeAccount } from "@/constants/type"
import {
  LoginUserSchema,
  LoginUserType,
  useLoginUser,
} from "@/hooks/services/Auth"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff } from "react-feather"
import { Controller, FieldErrors, useForm } from "react-hook-form"
import { ClipLoader } from "react-spinners"

import { Snackbar, Alert } from "@mui/material"

const pathTypeAccont = {
  [TypeAccount.CLEANER]: "/cleaner",
  [TypeAccount.CUSTOMER]: "/customer",
}

const UserLoginForm = () => {
  const router = useRouter()
  const { setUserLogin } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: "success" | "error"
  }>({
    open: false,
    message: "",
    severity: "success",
  })

  const { handleSubmit, control } = useForm<LoginUserType>({
    resolver: zodResolver(LoginUserSchema),
    defaultValues: {},
    mode: "onChange",
  })

  const { mutate, isPending } = useLoginUser({
    onSuccess: async (data) => {
      setUserLogin && setUserLogin(data.user)
      setSnackbar({
        open: true,
        message: "Login berhasil! Mengalihkan...",
        severity: "success",
      })

      setTimeout(async () => {
        if (!data.user.email_confirmed_at) {
          const supabase = createClient()
          if (data.user.email) {
            await supabase.auth.resend({ type: "signup", email: data.user.email })
          }
          return router.push("/email-action?action=verifyEmail")
        }

        const targetPath = data.type ? pathTypeAccont[data.type] : "/customer"
        router.push(targetPath)
      }, 1500)
    },
    onError(err: any) {
      setSnackbar({
        open: true,
        message: err?.message || "Login gagal. Silakan periksa email/kata sandi Anda.",
        severity: "error",
      })
      console.log(JSON.stringify(err))
    },
  })

  const onError = (error: FieldErrors<LoginUserType>) => {
    console.log(error)
    return error
  }

  const onSubmit = async (data: LoginUserType) => {
    try {
      const payload = {
        email: data?.email,
        password: data?.password,
      }
      mutate(payload)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit, onError)}>
        <div className="grid gap-2">
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextField
                placeholder="Email"
                type="email"
                onChange={onChange}
                isError={!!error}
                caption={error?.message}
                value={value || ""}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <TextField
                onChange={onChange}
                value={value || ""}
                placeholder="Kata Sandi"
                type={showPassword ? "text" : "password"}
                isError={!!error}
                caption={error?.message}
                addonRight={() => (
                  <button
                    className="text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                )}
              />
            )}
          />
        </div>

        <div className="flex">
          <Link
            className="mb-5 ml-auto mt-2 inline-block text-sm font-semibold text-brand-600"
            href={"/reset-password"}
          >
            Lupa kata sandi?
          </Link>
        </div>

        <button
          className="btn-success w-full"
          type="submit"
          disabled={isPending}
        >
          {isPending ? <ClipLoader size={20} color="#309C7A" /> : "Masuk"}
        </button>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default UserLoginForm
