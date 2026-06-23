"use client"

import { FormInputText } from "@/components/FormInputText"
import { TypeAccount } from "@/constants/type"
import {
  CreateUserSchema,
  CreateUserType,
  useCreateUser,
} from "@/hooks/services/Auth"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff } from "react-feather"
import { FieldErrors, useForm } from "react-hook-form"
import { PulseLoader } from "react-spinners"

import { Snackbar, Alert } from "@mui/material"
import { setCookie } from "cookies-next"

type TRegistrationFormProps = {
  type: TypeAccount
}

const UserRegistrationForm = ({ type }: TRegistrationFormProps) => {
  const router = useRouter()
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

  const { handleSubmit, control } = useForm<CreateUserType>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      password: "",
      type: type,
      fullName: "",
      email: "",
    },
    mode: "onChange",
  })

  const { mutate, isPending } = useCreateUser({
    onSuccess(data) {
      setSnackbar({
        open: true,
        message: "Registrasi berhasil! Silakan periksa email Anda.",
        severity: "success",
      })
      if (data?.user?.email) {
        setCookie("email-signup", data.user.email)
      }
      console.log(data)
      setTimeout(() => {
        if (data?.user && !data.user.email_confirmed_at) {
          router.push("/email-action?action=verifyEmail")
        }
      }, 1500)
    },
    onError(err: any) {
      setSnackbar({
        open: true,
        message: err?.message || "Registrasi gagal. Silakan coba lagi.",
        severity: "error",
      })
      console.log("error:", err)
    },
  })

  const onError = (error: FieldErrors<CreateUserType>) => {
    console.log(error)
    return error
  }

  const onSubmit = async (data: CreateUserType) => {
    try {
      const payload = {
        email: data?.email,
        password: data?.password,
        type: type,
        fullName: data?.fullName,
      }
      mutate(payload)
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div className="mt-auto grid w-full gap-5 rounded-2xl bg-white p-4 pb-5">
      <div>
        <p className="text-xl font-semibold text-gray-900">
          Daftar{" "}
          {`${type.charAt(0).toUpperCase()}${type.toLowerCase().slice(1)}`}
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Silakan isi data dibawah.
        </p>
      </div>
      <form
        className="grid gap-4"
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        <FormInputText name={"fullName"} control={control} label={"Nama"} />
        <FormInputText name={"email"} control={control} label={"Email"} />
        <FormInputText
          type={showPassword ? "text" : "password"}
          name={"password"}
          control={control}
          label={"Kata Sandi"}
          addonRight={() => (
            <button
              type="button"
              className="text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        />
        <button
          className="btn-success w-full mt-2"
          type="submit"
          disabled={isPending}
        >
          {isPending ? <PulseLoader color="white" size={10} /> : "Daftar"}
        </button>
      </form>
      <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-500">
        Sudah punya akun?{" "}
        <Link href={"/login"} className="text-brand-600 font-semibold">
          Masuk
        </Link>
      </div>

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

export default UserRegistrationForm
