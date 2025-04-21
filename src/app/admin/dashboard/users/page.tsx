"use client"

import { useRouter } from "next/navigation"
import { useSnackbar } from "notistack"
import { useEffect, useState } from "react"
import { FaClock, FaEdit, FaSignOutAlt, FaTrash, FaUserPlus } from "react-icons/fa"
import { makeQuery, verifyForm } from "@/app/utils/api"

type UserRole = "topografo" | "colaborador" | "admin"

interface User {
  _id: number
  name: string
  email: string
  password: string
  role: UserRole
  costPerHour?: number
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState<Omit<User, "_id">>({ name: "", email: "", password: "", role: "colaborador", costPerHour: 0 })
  const router = useRouter()
  const { enqueueSnackbar } = useSnackbar()
  const navigate = useRouter().push;

  useEffect(() => {
    const token = localStorage.getItem("token");
    makeQuery(
      token,
      "getUsers",
      "",
      enqueueSnackbar,
      (data) => setUsers(data),
    );
  }, []);

  const handleCreateUser = async () => {
    const token = localStorage.getItem("token");
    const requiredFields = ["name", "email", "password", "role", "costPerHour"];
    const isValid = verifyForm(newUser, requiredFields, enqueueSnackbar);
    if (!isValid) return;

    makeQuery(
      token,
      "createUser",
      newUser,
      enqueueSnackbar,
      (createdUser) => {
        setUsers((prev) => [...prev, createdUser]);
        enqueueSnackbar("Usuario creado exitosamente", { variant: "success" });
        setIsCreateModalOpen(false);
        setNewUser({ name: "", email: "", password: "", role: "colaborador" });
      }
    );
  };

  const handleUpdateUser = async () => {
    const token = localStorage.getItem("token");
    if (!currentUser) return;

    const requiredFields = ["name", "email", "role", "costPerHour"];
    const isValid = verifyForm(currentUser, requiredFields, enqueueSnackbar);
    if (!isValid) return;

    makeQuery(
      token,
      "updateUser",
      {
        ...currentUser,
        password: currentUser.password === users.find((u) => u._id === currentUser._id)?.password ? '' : currentUser.password,
      },
      enqueueSnackbar,
      (updatedUser) => {
        setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
        enqueueSnackbar("Usuario actualizado correctamente", { variant: "success" });
        setIsEditModalOpen(false);
        setCurrentUser(null);
      }
    );
  };


  const handleDeleteUser = async () => {
    const token = localStorage.getItem("token");
    if (!currentUser) return;

    makeQuery(
      token,
      "deleteUser",
      currentUser._id,
      enqueueSnackbar,
      () => {
        setUsers(users.filter((u) => u._id !== currentUser._id));
        enqueueSnackbar("Usuario eliminado", { variant: "success" });
        setIsDeleteModalOpen(false);
        setCurrentUser(null);
      }
    );
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
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap">

                    <button
                      onClick={() => {
                        navigate(`/admin/dashboard/users/horarios/${user._id}`)
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      <FaClock />
                    </button>

                    <button
                      onClick={() => {
                        setCurrentUser(user)
                        setIsEditModalOpen(true)
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      <FaEdit />
                    </button>

                    {user.role !== "admin" && <button
                      onClick={() => {
                        setCurrentUser(user)
                        setIsDeleteModalOpen(true)
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FaTrash />
                    </button>}
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
            <label className="block mb-2 text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              placeholder="Nombre"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <label className="block mb-2 text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              placeholder="Contraseña"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <label className="block mb-2 text-sm font-medium text-gray-700">Rol</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="topografo">Topógrafo</option>
              <option value="colaborador">Colaborador</option>
            </select>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Costo por hora</label>
              <input
                type="number"
                placeholder="Costo por hora"
                value={newUser.costPerHour}
                onChange={(e) => setNewUser({ ...newUser, costPerHour: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded"
              />
            </div>

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
            <label className="block mb-2 text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              placeholder="Nombre"
              value={currentUser.name}
              onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <label className="block mb-2 text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              placeholder="Email"
              value={currentUser.email}
              onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <label className="block mb-2 text-sm font-medium text-gray-700">Contraseña (dejar igual en caso de no cambiar)</label>
            <input
              type="password"
              placeholder="Contraseña"
              value={currentUser.password}
              onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            />
            <label className="block mb-2 text-sm font-medium text-gray-700">Rol</label>
            <select
              value={currentUser.role}
              onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value as UserRole })}
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="topografo">Topógrafo</option>
              <option value="colaborador">Colaborador</option>
            </select>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Costo por hora</label>
              <input
                type="number"
                placeholder="Costo por hora"
                value={currentUser.costPerHour}
                onChange={(e) => setCurrentUser({ ...currentUser, costPerHour: parseFloat(e.target.value) })}
                className="w-full p-2 border rounded"
              />
            </div>

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

