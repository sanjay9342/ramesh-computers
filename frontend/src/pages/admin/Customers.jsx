import React, { useEffect, useMemo, useState } from 'react'
import { FaSearch, FaUserShield } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { getUsers, updateUser } from '../../services/adminService'
import { formatDate } from '../../utils/formatters'

function Customers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [updatingUserId, setUpdatingUserId] = useState(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Failed to load users:', error)
      toast.error(error?.response?.data?.error || 'Unable to load customers')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return users.filter((user) => {
      const matchesSearch =
        !term ||
        String(user.displayName || '').toLowerCase().includes(term) ||
        String(user.email || '').toLowerCase().includes(term) ||
        String(user.phone || '').toLowerCase().includes(term)

      const matchesRole = roleFilter === 'all' || String(user.role || 'user') === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, searchTerm, roleFilter])

  const stats = useMemo(() => {
    const admins = users.filter((user) => user.role === 'admin').length
    const customers = users.filter((user) => user.role !== 'admin').length
    const withAddress = users.filter((user) => user.address?.city || user.address?.street).length
    return {
      total: users.length,
      admins,
      customers,
      withAddress,
    }
  }, [users])

  const handleRoleChange = async (user, role) => {
    try {
      setUpdatingUserId(user.id)
      await updateUser(user.id, { role })
      toast.success(`Updated ${user.displayName || user.email || 'user'} to ${role}`)
      await loadUsers()
    } catch (error) {
      console.error('Failed to update user role:', error)
      toast.error(error?.response?.data?.error || 'Unable to update user role')
    } finally {
      setUpdatingUserId(null)
    }
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
            <p className="text-sm text-gray-500 mt-1">See who is buying, who needs admin access, and who has saved delivery details.</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-fk-bg text-fk-blue px-4 py-2 rounded">
            <FaUserShield />
            <span className="font-medium">Role manager</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Customers</p>
            <p className="text-2xl font-bold text-gray-800">{stats.customers}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Admins</p>
            <p className="text-2xl font-bold text-gray-800">{stats.admins}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Profiles with Address</p>
            <p className="text-2xl font-bold text-gray-800">{stats.withAddress}</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-fk-blue"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
          >
            <option value="all">All Roles</option>
            <option value="user">Customers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading customers...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users found.</div>
        ) : (
          <table className="w-full min-w-[980px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Contact</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Address</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Joined</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-800">{user.displayName || 'Unnamed User'}</div>
                    <div className="text-xs text-gray-500 break-all">{user.email || 'No email'}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div>{user.phone || 'No phone'}</div>
                    <div className="text-xs text-gray-500">UID: {user.uid || user.id}</div>
                  </td>
                  <td className="py-3 px-4">
                    {user.address?.street || user.address?.city ? (
                      <div className="text-sm text-gray-700">
                        <div>{user.address.street}</div>
                        <div>
                          {user.address.city}
                          {user.address.state ? `, ${user.address.state}` : ''} {user.address.pincode || ''}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No saved address</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        user.role === 'admin' ? 'bg-fk-blue text-white' : 'bg-fk-bg text-fk-blue'
                      }`}
                    >
                      {user.role === 'admin' ? 'Admin' : 'Customer'}
                    </span>
                  </td>
                  <td className="py-3 px-4">{formatDate(user.createdAt)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRoleChange(user, user.role === 'admin' ? 'user' : 'admin')}
                        disabled={updatingUserId === user.id}
                        className="text-xs px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-60"
                      >
                        {updatingUserId === user.id
                          ? 'Updating...'
                          : user.role === 'admin'
                            ? 'Make Customer'
                            : 'Make Admin'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

export default Customers
