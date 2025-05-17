import type { ReactNode } from "react"

export interface User {
  id: number
  name: string
  role: string
}

export interface Activity {
  id: number
  userId: number
  description: string
  comments: string
}

export interface UserDayData {
  userId: number
  startTime: string
  endTime: string
  activities: Activity[]
  comments: string
  isComplete: boolean
}

export interface DayData {
  date: string
  totalHours: string 
  extraHours: string
  sent: boolean
  status: "incomplete" | "complete" | "sent" | "pending"
}

interface Usercito {
  _id: string 
  name: string
  email?: string
}

interface WorkEntryActivity {
  _id: string
  name: string
  description: string
  startTime: string
  endTime: string
  isOvertime: boolean
}

interface WorkEntry {
  _id: string
  name: string
  comments: string
  startTime: string
  endTime: string
  collaborators: Usercito[]
  user: Usercito
  supervisor: string
  supervisorName: string
  supervisorSignature: string
  topographerSignature: string
  incompleteUsers: Usercito[]
  activities: WorkEntryActivity[]
}

export interface DayDetails {
  date: string
  totalHours: string
  extraHours: string
  sent: boolean
  status: "incomplete" | "complete" | "sent" | "pending"
  entries: WorkEntry[]
}

export interface Project {
  _id: string
  name: string
  supervisor: {
    id: number
    name: string
    email: string
  }
}

export interface HoursData {
  normalHours: number
  overtimeHours: number
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}
