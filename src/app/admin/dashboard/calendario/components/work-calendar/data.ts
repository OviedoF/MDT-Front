import type { User, Project, DayData } from "../../types"
import { startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"

export const users: User[] = [
  { id: 1, name: "Juan Pérez", role: "Topógrafo" },
  { id: 2, name: "María García", role: "Colaborador" },
  { id: 3, name: "Carlos López", role: "Topógrafo" },
]