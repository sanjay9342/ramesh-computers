export const ORDER_NUMBER_START = 100001

const normalizeDigits = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits || null
}

export const deriveLegacyOrderNumber = (order = {}) => {
  const orderedAtTs = Date.parse(order?.orderedAt || '')
  if (Number.isFinite(orderedAtTs) && orderedAtTs > 0) {
    return String(orderedAtTs)
  }

  const rawId = String(order?.id || '')
  if (!rawId) return String(ORDER_NUMBER_START)

  let hash = 0
  for (const character of rawId) {
    hash = (hash * 131 + character.charCodeAt(0)) % 1000000000000
  }

  return String(hash || ORDER_NUMBER_START)
}

export const getDisplayOrderId = (order = {}) =>
  normalizeDigits(order?.displayOrderId)
  || normalizeDigits(order?.orderNumber)
  || deriveLegacyOrderNumber(order)

export const serializeOrder = (id, data = {}) => {
  const baseOrder = { id, ...data }
  return {
    ...baseOrder,
    displayOrderId: getDisplayOrderId(baseOrder),
  }
}

export const reserveNextOrderNumber = async (transaction, counterRef, nowIso) => {
  const counterDoc = await transaction.get(counterRef)
  const currentValue = Math.max(
    ORDER_NUMBER_START - 1,
    Number(counterDoc.exists ? counterDoc.data()?.lastOrderNumber : ORDER_NUMBER_START - 1) || ORDER_NUMBER_START - 1
  )
  const nextValue = currentValue + 1

  transaction.set(
    counterRef,
    {
      lastOrderNumber: nextValue,
      updatedAt: nowIso,
    },
    { merge: true }
  )

  return nextValue
}
