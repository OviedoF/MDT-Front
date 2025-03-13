import Link from 'next/link';
import React from 'react'

interface Links {
  name: string;
  url: string;
  icon?: string;
}

const links: Links[] = [
  { name: 'Inicio', url: '/home', icon: '/navbar/home.svg' },
  { name: 'Historial', url: '/home/history', icon: '/navbar/history.svg' },
  { name: "Pendientes", url: '/home/pending', icon: '/navbar/stats.svg' },
  { name: "Usuario", url: '/home/user', icon: '/navbar/user.svg' },
]

export default function Navbar({
  position = "absolute",
} : {
  position?: string;
}) {
  return (
    <nav className={`bg-[#F2F2F2] flex justify-around items-center py-4 ${position} bottom-0 w-full`}>
      {links.map((link) => (
        <Link href={link.url} key={link.name} className='flex flex-col items-center'>
          <img src={link.icon} alt={link.name} className='w-6 h-6' />
          <span className='text-xs font-semibold mt-1'>{link.name}</span>
        </Link>
      ))}
    </nav>
  )
}
