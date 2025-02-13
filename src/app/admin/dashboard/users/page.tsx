"use client"

import { useRouter } from "next/navigation"
import { useSnackbar } from "notistack"
import { useState } from "react"
import { FaEdit, FaSignOutAlt, FaTrash, FaUserPlus } from "react-icons/fa"

type UserRole = "supervisor" | "colaborador"

interface User {
  id: number
  name: string
  email: string
  password: string
  role: UserRole
}

const initialUsers: User[] = [
  { id: 1, name: "Juan Pérez", email: "juan@example.com", password: "password123", role: "supervisor" },
  { id: 2, name: "María García", email: "maria@example.com", password: "password456", role: "colaborador" },
  { id: 3, name: "Carlos López", email: "carlos@example.com", password: "password789", role: "colaborador" },
]

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState<Omit<User, "id">>({ name: "", email: "", password: "", role: "colaborador" })
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()

  const validateUser = (user: Omit<User, "id">) => {
    if (!user.name.trim()) {
      enqueueSnackbar("El nombre es obligatorio", { variant: "warning" });
      return false;
    }
    if (!user.email.includes("@")) {
      enqueueSnackbar("El email no es válido", { variant: "warning" });
      return false;
    }
    if (user.password.length < 6) {
      enqueueSnackbar("La contraseña debe tener al menos 6 caracteres", { variant: "warning" });
      return false;
    }
    return true;
  };

  const handleCreateUser = () => {
    if (!validateUser(newUser)) return;
    setUsers([...users, { ...newUser, id: users.length + 1 }]);
    setIsCreateModalOpen(false);
    setNewUser({ name: "", email: "", password: "", role: "colaborador" });
    enqueueSnackbar("Usuario creado exitosamente", { variant: "success" });
  };

  const handleUpdateUser = () => {
    if (currentUser && validateUser(currentUser)) {
      setUsers(users.map((user) => (user.id === currentUser.id ? currentUser : user)));
      setIsEditModalOpen(false);
      setCurrentUser(null);
      enqueueSnackbar("Usuario actualizado correctamente", { variant: "success" });
    }
  };

  const handleDeleteUser = () => {
    if (currentUser) {
      setUsers(users.filter((user) => user.id !== currentUser.id));
      setIsDeleteModalOpen(false);
      enqueueSnackbar("Usuario eliminado", { variant: "error" });
      setCurrentUser(null);
    }
  };

  return (
    <main className="bg-violet-100 w-full min-h-screen">
      <header className="bg-violet-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manejar Usuarios</h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="flex items-center bg-violet-700 hover:bg-violet-800 px-4 py-2 rounded-md transition duration-300"
        >
          <FaSignOutAlt className="mr-2" />
          Dashboard
        </button>
      </header>

      <section className="p-4">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="mb-6 bg-violet-700 hover:bg-violet-800 text-white font-bold py-2 px-4 rounded inline-flex items-center mt-4 w-full "
        >
          <FaUserPlus className="mr-2" />
          Crear Usuario
        </button>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setCurrentUser(user)
                        setIsEditModalOpen(true)
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => {
                        setCurrentUser(user)
                        setIsDeleteModalOpen(true)
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full px-4">
          <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full">
            <h3 className="text-lg font-bold mb-4">Crear Usuario</h3>
            <input
              type="text"
              placeholder="Nombre"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="supervisor">Supervisor</option>
              <option value="colaborador">Colaborador</option>
            </select>
            <div className="flex justify-end">
              <button
                onClick={handleCreateUser}
                className="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Crear
              </button>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && currentUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full px-4">
          <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full">
            <h3 className="text-lg font-bold mb-4">Editar Usuario</h3>
            <input
              type="text"
              placeholder="Nombre"
              value={currentUser.name}
              onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={currentUser.email}
              onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={currentUser.password}
              onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <select
              value={currentUser.role}
              onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value as UserRole })}
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="supervisor">Supervisor</option>
              <option value="colaborador">Colaborador</option>
            </select>
            <div className="flex justify-end">
              <button
                onClick={handleUpdateUser}
                className="bg-violet-500 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Actualizar
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {isDeleteModalOpen && currentUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full px-4">
          <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white w-full">
            <h3 className="text-lg font-bold mb-4">Confirmar Eliminación</h3>
            <p>¿Estás seguro de que quieres eliminar a {currentUser.name}?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={handleDeleteUser}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Eliminar
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

