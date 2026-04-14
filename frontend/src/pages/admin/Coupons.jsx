import React, { useEffect, useMemo, useState } from 'react'
import { FaEdit, FaPlus, FaSearch, FaTimes, FaTrash } from 'react-icons/fa'
import { toast } from 'react-toastify'
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  toggleCouponStatus,
  updateCoupon,
} from '../../services/couponService'
import { formatCurrency, formatDate } from '../../utils/formatters'

const initialCouponForm = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  usageLimit: '',
  expiresAt: '',
  active: true,
}

function Coupons() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [couponForm, setCouponForm] = useState(initialCouponForm)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingCoupon, setDeletingCoupon] = useState(null)

  useEffect(() => {
    loadCoupons()
  }, [])

  const loadCoupons = async () => {
    try {
      setLoading(true)
      const data = await getAllCoupons()
      setCoupons(data)
    } catch (error) {
      console.error('Failed to load coupons:', error)
      toast.error(error?.response?.data?.error || 'Unable to load coupons')
    } finally {
      setLoading(false)
    }
  }

  const filteredCoupons = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return coupons
    return coupons.filter(
      (coupon) =>
        String(coupon.code || '').toLowerCase().includes(term) ||
        String(coupon.description || '').toLowerCase().includes(term)
    )
  }, [coupons, searchTerm])

  const stats = useMemo(() => {
    const active = coupons.filter((coupon) => coupon.active).length
    const expiringSoon = coupons.filter((coupon) => {
      if (!coupon.expiresAt) return false
      const expiresAt = new Date(coupon.expiresAt).getTime()
      const now = Date.now()
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      return expiresAt >= now && expiresAt - now <= sevenDays
    }).length
    const totalUses = coupons.reduce((sum, coupon) => sum + Number(coupon.usedCount || 0), 0)
    return {
      total: coupons.length,
      active,
      expiringSoon,
      totalUses,
    }
  }, [coupons])

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target
    setCouponForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const openCreateModal = () => {
    setEditingCoupon(null)
    setCouponForm(initialCouponForm)
    setShowModal(true)
  }

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon)
    setCouponForm({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: String(coupon.discountValue ?? ''),
      minOrderAmount: String(coupon.minOrderAmount ?? ''),
      maxDiscountAmount:
        coupon.maxDiscountAmount === null || coupon.maxDiscountAmount === undefined
          ? ''
          : String(coupon.maxDiscountAmount),
      usageLimit:
        coupon.usageLimit === null || coupon.usageLimit === undefined ? '' : String(coupon.usageLimit),
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : '',
      active: coupon.active !== false,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCoupon(null)
    setCouponForm(initialCouponForm)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      code: couponForm.code.trim().toUpperCase(),
      description: couponForm.description.trim(),
      discountType: couponForm.discountType,
      discountValue: Number(couponForm.discountValue),
      minOrderAmount: Number(couponForm.minOrderAmount || 0),
      maxDiscountAmount:
        couponForm.maxDiscountAmount === '' ? null : Number(couponForm.maxDiscountAmount),
      usageLimit: couponForm.usageLimit === '' ? null : Number(couponForm.usageLimit),
      expiresAt: couponForm.expiresAt ? new Date(couponForm.expiresAt).toISOString() : null,
      active: Boolean(couponForm.active),
    }

    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id || editingCoupon.code, payload)
        toast.success('Coupon updated successfully')
      } else {
        await createCoupon(payload)
        toast.success('Coupon created successfully')
      }
      await loadCoupons()
      closeModal()
    } catch (error) {
      console.error('Failed to save coupon:', error)
      toast.error(error?.response?.data?.error || 'Unable to save coupon')
    }
  }

  const handleToggleStatus = async (coupon) => {
    try {
      await toggleCouponStatus(coupon.id || coupon.code, !coupon.active)
      await loadCoupons()
      toast.success(`Coupon ${coupon.active ? 'deactivated' : 'activated'}`)
    } catch (error) {
      console.error('Failed to update coupon status:', error)
      toast.error(error?.response?.data?.error || 'Unable to update coupon status')
    }
  }

  const handleDelete = async () => {
    if (!deletingCoupon) return
    try {
      await deleteCoupon(deletingCoupon.id || deletingCoupon.code)
      toast.success('Coupon deleted successfully')
      setShowDeleteModal(false)
      setDeletingCoupon(null)
      await loadCoupons()
    } catch (error) {
      console.error('Failed to delete coupon:', error)
      toast.error(error?.response?.data?.error || 'Unable to delete coupon')
    }
  }

  const isExpired = (coupon) => {
    if (!coupon.expiresAt) return false
    const expiresAt = new Date(coupon.expiresAt).getTime()
    return Number.isFinite(expiresAt) && expiresAt < Date.now()
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Coupon Studio</h1>
            <p className="text-sm text-gray-500 mt-1">Create, update, activate, and track promotional codes.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-fk-blue text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-fk-blue-dark"
          >
            <FaPlus /> Add Coupon
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Coupons</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Expiring in 7 Days</p>
            <p className="text-2xl font-bold text-gray-800">{stats.expiringSoon}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Redemptions</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalUses}</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search coupons by code or description"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-fk-blue"
          />
        </div>
      </section>

      <section className="bg-white rounded-lg shadow overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading coupons...</div>
        ) : filteredCoupons.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No coupons found.</div>
        ) : (
          <table className="w-full min-w-[980px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Code</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Offer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Minimum Order</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Usage</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Expiry</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon) => (
                <tr key={coupon.id || coupon.code} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-800">{coupon.code}</div>
                    <div className="text-xs text-gray-500">{coupon.description || 'No description'}</div>
                  </td>
                  <td className="py-3 px-4">
                    {coupon.discountType === 'fixed'
                      ? `${formatCurrency(coupon.discountValue)} off`
                      : `${coupon.discountValue}% off`}
                    {coupon.maxDiscountAmount ? (
                      <div className="text-xs text-gray-500">
                        Max {formatCurrency(coupon.maxDiscountAmount)}
                      </div>
                    ) : null}
                  </td>
                  <td className="py-3 px-4">{formatCurrency(coupon.minOrderAmount)}</td>
                  <td className="py-3 px-4">
                    {coupon.usedCount || 0}
                    {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' / unlimited'}
                  </td>
                  <td className="py-3 px-4">
                    {coupon.expiresAt ? (
                      <div>
                        <div>{formatDate(coupon.expiresAt)}</div>
                        {isExpired(coupon) ? (
                          <span className="text-xs text-red-500">Expired</span>
                        ) : null}
                      </div>
                    ) : (
                      'No expiry'
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        coupon.active ? 'bg-fk-yellow text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {coupon.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(coupon)}
                        className="text-xs px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
                      >
                        {coupon.active ? 'Pause' : 'Activate'}
                      </button>
                      <button onClick={() => openEditModal(coupon)} className="text-fk-blue hover:text-fk-blue-dark p-2">
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingCoupon(coupon)
                          setShowDeleteModal(true)
                        }}
                        className="text-red-500 hover:text-red-700 p-2"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{editingCoupon ? 'Edit Coupon' : 'Add Coupon'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    name="code"
                    value={couponForm.code}
                    onChange={handleInputChange}
                    disabled={Boolean(editingCoupon)}
                    className="w-full border border-gray-300 rounded px-4 py-2 uppercase focus:outline-none focus:border-fk-blue disabled:bg-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offer Type</label>
                  <select
                    name="discountType"
                    value={couponForm.discountType}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                  >
                    <option value="percentage">Percentage Discount</option>
                    <option value="fixed">Fixed Amount Discount</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  value={couponForm.description}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                  placeholder="Weekend laptop offer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {couponForm.discountType === 'fixed' ? 'Discount Amount' : 'Discount Percentage'}
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    min="1"
                    value={couponForm.discountValue}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount</label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    min="0"
                    value={couponForm.minOrderAmount}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount</label>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    min="0"
                    value={couponForm.maxDiscountAmount}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    name="usageLimit"
                    min="0"
                    value={couponForm.usageLimit}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                  <input
                    type="datetime-local"
                    name="expiresAt"
                    value={couponForm.expiresAt}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-fk-blue"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="active" checked={couponForm.active} onChange={handleInputChange} />
                Coupon is active
              </label>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-fk-blue text-white py-2 rounded hover:bg-fk-blue-dark">
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-2">Delete Coupon</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete coupon "{deletingCoupon?.code}"?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeletingCoupon(null)
                }}
                className="flex-1 border border-gray-300 py-2 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Coupons
