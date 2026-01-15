import { makeQuery } from '@/app/utils/api'
import Link from 'next/link'
import { useSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'

interface Links {
  name: string
  url: string
  icon: string
}

const links: Links[] = [
  { name: 'Inicio', url: '/home', icon: '/navbar/home.svg' },
  { name: 'Historial', url: '/home/history', icon: '/navbar/history.svg' },
  { name: 'Notificaciones', url: '/home/notificaciones', icon: '/navbar/notifications.svg' },
  { name: 'Usuario', url: '/home/user', icon: '/navbar/user.svg' },
]

export default function Navbar({
  position = 'absolute',
}: {
  position?: string
}) {
  const { enqueueSnackbar } = useSnackbar()
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false)

  const getNotifications = () => {
    makeQuery(
      localStorage.getItem('token'),
      'getUserNotifications',
      {},
      enqueueSnackbar,
      (response) => {
        const hasUnread = response.some(
          (notification: any) => !notification.readed
        )
        setHasUnreadNotifications(hasUnread)
      }
    )
  }

  useEffect(() => {
    getNotifications()
  }, [])

  return (
    <nav
      className={`bg-[#F2F2F2] flex justify-around items-center py-4 ${position} bottom-0 w-full`}
    >
      {links.map((link) => {
        const isNotifications = link.name === 'Notificaciones'

        return (
          <Link
            href={link.url}
            key={link.name}
            className="flex flex-col items-center relative"
          >
            {/* Contenedor del icono */}
            <div className="relative">
              <img
                src={link.icon}
                alt={link.name}
                className="w-6 h-6"
              />

              {/* 🔴 Círculo rojo */}
              {isNotifications && hasUnreadNotifications && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
              )}
            </div>

            <span className="text-xs font-semibold mt-1">
              {link.name}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
