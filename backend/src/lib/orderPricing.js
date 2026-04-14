export const DELIVERY_FREE_THRESHOLD = 500
export const STANDARD_DELIVERY_CHARGE = 50

const asNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const toIsoOrNull = (value) => {
  if (!value) return null
  const parsed = Date.parse(value)
  if (Number.isNaN(parsed)) return null
  return new Date(parsed).toISOString()
}

export const normalizeCouponInput = (input = {}) => ({
  code: String(input.code || '').trim().toUpperCase(),
  description: String(input.description || '').trim(),
  discountType: input.discountType === 'fixed' ? 'fixed' : 'percentage',
  discountValue: Math.max(0, asNumber(input.discountValue)),
  minOrderAmount: Math.max(0, asNumber(input.minOrderAmount)),
  maxDiscountAmount:
    input.maxDiscountAmount === '' || input.maxDiscountAmount === null || input.maxDiscountAmount === undefined
      ? null
      : Math.max(0, asNumber(input.maxDiscountAmount)),
  usageLimit:
    input.usageLimit === '' || input.usageLimit === null || input.usageLimit === undefined
      ? null
      : Math.max(0, Math.floor(asNumber(input.usageLimit))),
  usedCount: Math.max(0, Math.floor(asNumber(input.usedCount))),
  active: input.active !== false,
  expiresAt: toIsoOrNull(input.expiresAt),
})

export const validateCouponForSubtotal = (coupon, subtotal, nowTs = Date.now()) => {
  if (!coupon) {
    return { valid: false, reason: 'Coupon not found' }
  }
  if (!coupon.active) {
    return { valid: false, reason: 'Coupon is inactive' }
  }

  const expiresAtTs = coupon.expiresAt ? Date.parse(coupon.expiresAt) : null
  if (expiresAtTs && expiresAtTs < nowTs) {
    return { valid: false, reason: 'Coupon has expired' }
  }

  if (coupon.usageLimit !== null && Number(coupon.usedCount || 0) >= Number(coupon.usageLimit)) {
    return { valid: false, reason: 'Coupon usage limit has been reached' }
  }

  if (subtotal < Number(coupon.minOrderAmount || 0)) {
    return {
      valid: false,
      reason: `Minimum order amount is Rs. ${Number(coupon.minOrderAmount || 0).toLocaleString('en-IN')}`,
    }
  }

  let discountAmount = 0
  if (coupon.discountType === 'fixed') {
    discountAmount = Math.max(0, Number(coupon.discountValue || 0))
  } else {
    discountAmount = subtotal * (Math.max(0, Number(coupon.discountValue || 0)) / 100)
  }

  if (coupon.maxDiscountAmount !== null && coupon.maxDiscountAmount !== undefined) {
    discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount || 0))
  }

  discountAmount = Math.min(subtotal, Math.max(0, Math.round(discountAmount)))

  return {
    valid: true,
    discountAmount,
    coupon: {
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue || 0),
      maxDiscountAmount: coupon.maxDiscountAmount ?? null,
      minOrderAmount: Number(coupon.minOrderAmount || 0),
    },
  }
}

export const buildOrderPricing = ({ productsById, requestedItems, coupon }) => {
  const items = requestedItems.map((requestedItem) => {
    const product = productsById.get(requestedItem.id)
    const effectiveUnitPrice = Number(product?.discountPrice || product?.price || 0)
    const quantity = Math.max(1, Math.floor(asNumber(requestedItem.quantity, 1)))

    return {
      id: requestedItem.id,
      title: String(product?.title || requestedItem.title || '').trim(),
      image: product?.image || product?.images?.[0] || requestedItem.image || '',
      price: effectiveUnitPrice,
      originalPrice: Number(product?.price || effectiveUnitPrice || 0),
      quantity,
      totalPrice: effectiveUnitPrice * quantity,
      sku: String(product?.sku || '').trim(),
    }
  })

  const subtotal = items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0)
  const deliveryCharge = subtotal >= DELIVERY_FREE_THRESHOLD ? 0 : STANDARD_DELIVERY_CHARGE

  let appliedCoupon = null
  let discountAmount = 0
  if (coupon) {
    const validation = validateCouponForSubtotal(coupon, subtotal)
    if (!validation.valid) {
      const error = new Error(validation.reason)
      error.statusCode = 400
      throw error
    }
    appliedCoupon = validation.coupon
    discountAmount = validation.discountAmount
  }

  const totalAmount = Math.max(0, subtotal + deliveryCharge - discountAmount)

  return {
    items,
    subtotal,
    deliveryCharge,
    discountAmount,
    totalAmount,
    coupon: appliedCoupon,
  }
}
