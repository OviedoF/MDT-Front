"use client"

import { useSnackbar } from "notistack"
import type React from "react"

import { useState } from "react"
import { FaEye, FaEyeSlash } from "react-icons/fa"

export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  })
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const {enqueueSnackbar} = useSnackbar()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password.length < 8) {
      enqueueSnackbar("La contraseña debe tener al menos 8 caracteres", { variant: "error" })
      return
    }
    if (formData.password !== formData.confirmPassword) {
      enqueueSnackbar("Las contraseñas no coinciden", { variant: "error" })
      return
    }
    // Handle password reset logic here
    console.log("Password reset attempt with:", formData)
  }

  const togglePasswordVisibility = (field: "password" | "confirmPassword") => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-full h-full">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <path d="M0,100 C150,200 250,0 400,100 L400,400 L0,400 Z" className="fill-green opacity-30" />
          </svg>
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col items-center z-10">
        <form onSubmit={handleSubmit} className="w-full space-y-8">
          <h1 className="text-center text-gray-700 text-lg font-bold mb-6">Crea una nueva contraseña</h1>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="relative">
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword.password ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-12 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("password")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword.password ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-sm text-gray-500 px-1">La contraseña debe tener al menos 8 caracteres</p>
            </div>

            <div className="space-y-1">
              <div className="relative">
                <input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  type={showPassword.confirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-12 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword.confirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-sm text-gray-500 px-1">Ambas contraseñas deben coincidir</p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-green hover:bg-lightgreen text-white rounded-md font-medium transition-colors"
          >
            Restablecer contraseña
          </button>
        </form>
      </div>
    </main>
  )
}

