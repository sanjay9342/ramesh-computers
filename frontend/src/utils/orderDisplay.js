const normalizeDigits = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits || null
}

const deriveLegacyOrderNumber = (order = {}) => {
  const orderedAtTs = Date.parse(order?.orderedAt || '')
  if (Number.isFinite(orderedAtTs) && orderedAtTs > 0) {
    return String(orderedAtTs)
  }

  const rawId = String(order?.id || '')
  if (!rawId) return '100001'

  let hash = 0
  for (const character of rawId) {
    hash = (hash * 131 + character.charCodeAt(0)) % 1000000000000
  }

  return String(hash || 100001)
}

export const getOrderDisplayId = (order = {}) =>
  normalizeDigits(order?.displayOrderId)
  || normalizeDigits(order?.orderNumber)
  || deriveLegacyOrderNumber(order)

export const matchesOrderSearch = (order, searchTerm) => {
  const normalizedTerm = String(searchTerm || '').trim().toLowerCase()
  if (!normalizedTerm) return true

  const digitTerm = normalizedTerm.replace(/\D/g, '')
  const displayId = getOrderDisplayId(order)
  const rawId = String(order?.id || '').toLowerCase()

  return (
    (digitTerm && displayId.includes(digitTerm))
    || rawId.includes(normalizedTerm)
  )
}
