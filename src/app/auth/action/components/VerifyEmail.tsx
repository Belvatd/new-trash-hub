"use client"

import Link from "next/link"

const VerifyEmail = () => {
  return (
    <div className="mx-auto my-auto text-gray-500">
      <p>Email Berhasil Terverifikasi</p>
      <Link href={"/"} className="mt-2">
        <button className="text-brand-600 inline-block h-9 w-full px-4 text-sm">
          Kembali
        </button>
      </Link>
    </div>
  )
}

export default VerifyEmail
