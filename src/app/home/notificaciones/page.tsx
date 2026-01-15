'use client'
import { useEffect, useState } from "react"
import UserPage from "../components/UserPage"
import { makeQuery } from "@/app/utils/api"
import { useSnackbar } from "notistack"

interface Project {
  _id: string
  name: string
}

interface Notification {
  _id: string
  createdAt: string
  message: string
  title?: string
  project?: Project
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { enqueueSnackbar } = useSnackbar()


  const getNotifications = () => {
    makeQuery(
      localStorage.getItem("token"),
      'getUserNotifications',
      {},
      enqueueSnackbar,
      (response) => {
        console.log("Notifications:", response)
        setNotifications(response)
      },
    )
    
    makeQuery(
      localStorage.getItem("token"),
      'readUserNotifications',
      {},
      enqueueSnackbar,
      (response) => {
      },
    )
  }

  useEffect(() => {
    getNotifications()
  }, [])

  return (
    <UserPage>
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto py-6">
          <h1 className="text-xl font-medium text-gray-800 mb-6 px-4">Notificaciones</h1>

          <div className="divide-y">
            {notifications.map((notification) => (
              <div key={notification._id} className="py-4 px-4 ">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-4" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{
                        new Date(notification.createdAt).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })

                      }</span>
                      <span className="text-gray-600">{notification.title}</span>
                    </div>
                  </div>
                </div>

                <div className="text-gray-500 mt-2">{notification.message}</div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </UserPage>
  )
}
