"use client"
import Image from "next/image"
import Link from "next/link"
import Navbar from "../components/Navbar"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { makeQuery } from "@/app/utils/api"

interface User {
  name: string
  _id?: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User>({
    name: '',
    _id: ''
  })
  const navigate = useRouter().push
  
    useEffect(() => {
      if(localStorage.getItem('user')) {
        const userData = JSON.parse(localStorage.getItem('user') || '')
        setUser(userData)
      }
    }, [])

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="bg-green pt-8 pb-16 px-4 relative h-[22vh] flex items-center justify-center">
          <div className="text-white flex items-center gap-2">
            <Image src={'/logo_h.svg'} width={120} height={120} alt="Logo" />
          </div>
      </div>

      {/* Profile Picture - Positioned to overlap the header */}
      <div className="relative -mt-12 flex flex-col items-center px-4">
        {/* <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white relative z-10 -top-2">
          <Image
            src="/avatar.png"
            alt="Profile picture"
            fill
          />
        </div> */}
        <h1 className="mt-20 text-3xl font-medium text-gray-800">
          {user?.name}
        </h1>
        <p className="text-gray-600 text-md">
          {user?._id?.slice(0, 6).toUpperCase()}
        </p>
      </div>

      {/* Main Menu */}
      <div className="px-10 mt-4 space-y-3">
        <Link
          href="/home/request-hours"
          className="block bg-[#F2F2F2] hover:bg-gray-200 transition-colors rounded-lg py-3 px-4 text-center text-gray-800"
        >
          Solicitar horas
        </Link>
        <Link
          href="/home/control"
          className="block bg-[#F2F2F2] hover:bg-gray-200 transition-colors rounded-lg py-3 px-4 text-center text-gray-800"
        >
          Control de horarios
        </Link>
      </div>

      {/* Footer Menu */}
      <div className="mt-10 pt-3">
        <div className="space-y-0">
          <Link href="/support" className="block w-full py-4 text-center text-gray-600 hover:text-gray-800 border-b-2 border-[#B3B3B3]">
            Soporte
          </Link>
          <Link href="/legal" className="block w-full py-4 text-center text-gray-600 hover:text-gray-800 border-b-2 border-[#B3B3B3]">
            Legal
          </Link>
          <button
            className="w-full py-4 text-center text-gray-600 hover:text-gray-800"
            onClick={() => {
              // Handle sign out logic here
              console.log("Sign out clicked")
              navigate("/")
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <Navbar position="relative"/>
    </div>
  )
}

