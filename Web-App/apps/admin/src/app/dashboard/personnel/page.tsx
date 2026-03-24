"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "../../../../components/dashboard/sidebar"
import { Header } from "../../../../components/dashboard/header"
import { SearchIcon, DownloadIcon } from "../../../../components/shared/icons"
import { fetchUsers, User } from "../../../../src/lib/api"

export default function PersonnelPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const res = await fetchUsers()
        if (res.success && res.data) {
          setUsers(res.data)
        }
      } catch (err) {
        console.error("Failed to fetch users", err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-[200px]">
        <Header />
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Platform Users</h1>
              <p className="text-gray-500 text-sm">Manage public users registered on the application</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
              <DownloadIcon className="w-4 h-4" />
              Export Directory
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="relative w-[300px]">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">User Info</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Blood Type</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Medical Conditions</th>
                    <th className="text-left py-3 px-6 text-xs font-semibold text-gray-500 uppercase">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">Loading users...</td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-medium text-sm">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-xs text-gray-500">ID: {user.user_id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">{user.phone}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-red-50 text-red-700 border border-red-100">
                            {user.blood_type || "Unknown"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 max-w-[200px] truncate">
                          {user.medical_conditions || "None reported"}
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {new Date(user.registered_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
