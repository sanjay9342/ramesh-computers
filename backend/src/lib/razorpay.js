import crypto from 'crypto'

const razorpayKeyId = process.env.RAZORPAY_KEY_ID
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

const getAuthHeader = () => {
  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new Error('Razorpay keys are not configured in backend env')
  }
  const token = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64')
  return `Basic ${token}`
}

export const createRazorpayOrder = async ({ amount, receipt }) => {
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: Math.round(Number(amount) * 100),
      currency: 'INR',
      receipt,
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Failed to create Razorpay order: ${response.status} ${details}`)
  }

  return response.json()
}

export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  if (!razorpayKeySecret) {
    throw new Error('Razorpay secret is not configured in backend env')
  }

  const generated = crypto
    .createHmac('sha256', razorpayKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  return generated === signature
}
