export const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`

export const formatDate = (value) => {
  if (!value) return 'N/A'
  const parsed = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'N/A'
  return parsed.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatDateTime = (value) => {
  if (!value) return 'N/A'
  const parsed = typeof value?.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'N/A'
  return parsed.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
