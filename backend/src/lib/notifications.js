const resendApiKey = process.env.RESEND_API_KEY
const adminEmail = process.env.ADMIN_EMAIL
const fromEmail = process.env.MAIL_FROM || 'onboarding@resend.dev'

const sendEmail = async ({ to, subject, html }) => {
  if (!resendApiKey || !to) return

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Email API failed: ${response.status} ${details}`)
  }
}

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`

export const sendAdminOrderAlert = async (order) => {
  if (!adminEmail) return
  await sendEmail({
    to: adminEmail,
    subject: `New confirmed order: ${order.id}`,
    html: `
      <h3>New order confirmed</h3>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Customer:</strong> ${order.shippingAddress?.name || 'N/A'} (${order.userEmail || 'No email'})</p>
      <p><strong>Total:</strong> ${formatCurrency(order.totalAmount)}</p>
      <p>Please open admin panel to process this order.</p>
    `,
  })
}

const statusMessage = (status) => {
  if (status === 'confirmed') return 'Your order is confirmed and waiting for shipping.'
  if (status === 'packed') return 'Your order has been packed.'
  if (status === 'shipped') return 'Your order has been shipped.'
  if (status === 'out_for_delivery') return 'Your order is out for delivery.'
  if (status === 'delivered') return 'Your order has been delivered.'
  if (status === 'cancelled') return 'Your order has been cancelled.'
  return `Your order status is now ${status}.`
}

export const sendCustomerOrderStatusEmail = async (order, status) => {
  if (!order?.userEmail) return
  await sendEmail({
    to: order.userEmail,
    subject: `Order ${order.id} status: ${status}`,
    html: `
      <h3>Order Update</h3>
      <p>Hello ${order.shippingAddress?.name || 'Customer'},</p>
      <p>${statusMessage(status)}</p>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Total:</strong> ${formatCurrency(order.totalAmount)}</p>
    `,
  })
}
