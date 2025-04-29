"use client"

import { FaSignOutAlt } from "react-icons/fa"
import { useRouter } from "next/navigation"

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <button
        onClick={() => router.push("/admin/dashboard")}
        className="flex items-center bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-md transition duration-300"
      >
        <FaSignOutAlt className="mr-2" />
        Dashboard
      </button>
    </header>
  )
}
