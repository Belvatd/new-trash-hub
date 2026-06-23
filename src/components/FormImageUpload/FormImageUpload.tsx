"use client"

import { Control, Controller } from "react-hook-form"
import { ChangeEvent, useRef, useState } from "react"
import { createClient } from "@/supabase/client"
import { Camera, Image as ImageIcon, Loader } from "react-feather"

type FormImageUploadType = {
  control: Control<any, any>
  name: string
  label: string
}

const FormImageUpload = ({ control, name, label }: FormImageUploadType) => {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>, onChange: (url: string) => void) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`
      
      const { data, error } = await supabase.storage
        .from("trash_pictures")
        .upload(fileName, file)
        
      if (error) throw error

      const { data: publicUrlData } = supabase.storage
        .from("trash_pictures")
        .getPublicUrl(data.path)
        
      onChange(publicUrlData.publicUrl)
    } catch (err) {
      console.error("Upload failed", err)
      alert("Gagal mengunggah gambar. Silakan coba lagi.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="flex flex-col gap-2 w-full">
          {label && <label className="text-[14px] font-medium text-gray-700">{label}</label>}
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex h-[160px] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[12px] border-2 border-dashed ${
              error ? "border-red-500" : "border-gray-300"
            } bg-gray-50 hover:bg-gray-100`}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader className="animate-spin text-[#309C7A]" size={32} />
                <p className="text-[14px] text-gray-500">Mengunggah...</p>
              </div>
            ) : value ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <ImageIcon size={40} />
                <p className="text-[14px] text-gray-500">Tap untuk unggah foto sampah</p>
              </div>
            )}
            
            <input 
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => handleUpload(e, onChange)}
            />
          </div>
          {error && <span className="text-[12px] text-red-500">{error.message}</span>}
        </div>
      )}
    />
  )
}

export default FormImageUpload
