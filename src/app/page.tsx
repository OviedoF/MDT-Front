"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import type React from "react"

import { useState } from "react"
import { FaEye, FaEyeSlash, FaInfoCircle } from "react-icons/fa"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    password: "",
  })
  const navigate = useRouter().push

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log("Login attempt with:", formData)
    navigate("/home")
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
        {/* Logo */}
        <div className="w-24 h-24 bg-green flex items-center justify-center mb-8">
          <div className="text-white text-center">
            <div className="mb-1">
              <svg viewBox="0 0 100 40" className="w-16 h-8">
                <path d="M10,20 C30,5 70,35 90,20" className="stroke-white fill-none stroke-2" />
                <path d="M10,25 C30,10 70,40 90,25" className="stroke-white fill-none stroke-2" />
                <path d="M10,30 C30,15 70,45 90,30" className="stroke-white fill-none stroke-2" />
              </svg>
            </div>
            <div className="text-xs font-bold">MDT</div>
            <div className="text-[8px]">INGENIEROS</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <h1 className="text-center text-gray-700 text-xl font-medium">Ingresa tus datos</h1>

          <div className="space-y-4">
            <input
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Código de Colaborador"
              className="w-full h-12 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent"
              required
            />

            <div className="relative">
              <input
                name="password"
                value={formData.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                className="w-full h-12 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-green hover:bg-lightgreen text-white rounded-md font-medium transition-colors"
          >
            Ingresar
          </button>

          <Link href={'/recovery-password'} className="bg-lightgreen p-3 rounded-md flex items-start gap-2 text-sm text-white">
            <FaInfoCircle className="h-5 w-5 min-w-5 text-white mt-0.5" />
            <p>Si olvidaste tu contraseña, por favor comunícate al área de sistemas al número 0000-0000</p>
          </Link>
        </form>
      </div>
    </main>
  )
}

