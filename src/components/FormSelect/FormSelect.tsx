"use client"

import { Control, Controller } from "react-hook-form"

type FormSelectType = {
  control: Control<any, any>
  name: string
  label: string
  options: { label: string; value: string | number }[]
  placeholder?: string
  className?: string
}

const FormSelect = (props: FormSelectType) => {
  const { control, name, label, options, placeholder, className } = props

  return (
    <Controller
      name={name || ""}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="flex flex-col gap-1 w-full">
          {label && <label className="text-[14px] font-medium text-gray-700">{label}</label>}
          <select
            className={`w-full appearance-none rounded-[12px] border border-gray-300 bg-white pl-4 pr-10 py-[14px] text-[14px] text-gray-900 focus:border-[#309C7A] focus:outline-none focus:ring-1 focus:ring-[#309C7A] ${className || ""}`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: "right 16px center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "20px 20px"
            }}
            onChange={onChange}
            value={value || ""}
          >
            <option value="" disabled hidden>
              {placeholder || "Pilih salah satu"}
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {error && <span className="text-[12px] text-red-500">{error.message}</span>}
        </div>
      )}
    />
  )
}

export default FormSelect
