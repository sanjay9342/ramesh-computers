import { getDisplayOrderId } from './orderIdentity.js'

const resendApiKey = process.env.RESEND_API_KEY
const adminEmail = process.env.ADMIN_EMAIL
const fromEmail = process.env.MAIL_FROM || 'onboarding@resend.dev'
let lastResendWarning = ''

const logResendWarningOnce = (message) => {
  if (lastResendWarning === message) return
  lastResendWarning = message
  console.warn(message)
}

const extractAllowedTestRecipient = (details) => {
  if (!details) return null
  const match = details.match(/\(([^\s@()]+@[^\s@()]+\.[^\s@()]+)\)/)
  return match?.[1] || null
}

const sendEmail = async ({ to, subject, html }) => {
  if (!resendApiKey || !to) return false

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
    if (response.status === 401) {
      logResendWarningOnce(
        `Email notifications failed: Resend auth failed (401). Check RESEND_API_KEY. Details: ${details}`
      )
      return false
    }
    if (response.status === 403) {
      const allowedRecipient = extractAllowedTestRecipient(details)
      if (allowedRecipient) {
        logResendWarningOnce(
          `Email notifications blocked by Resend test mode. Set ADMIN_EMAIL=${allowedRecipient} (or verify domain and use your own MAIL_FROM). Details: ${details}`
        )
      } else {
        logResendWarningOnce(`Email notifications failed: Resend rejected request (403). Details: ${details}`)
      }
      return false
    }
    throw new Error(`Email API failed: ${response.status} ${details}`)
  }

  return true
}

const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toLocaleString('en-IN')}`
const getOrderLabel = (order) => getDisplayOrderId(order)
const getCustomerRecipient = (order) => order?.userEmail || order?.shippingAddress?.email || ''
const getPaymentLabel = (paymentMethod) => (paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment')

const getCustomerStatusSubject = (orderLabel, status) => {
  if (status === 'confirmed') return `Order ${orderLabel} confirmed`
  if (status === 'cancelled') return `Order ${orderLabel} cancelled`
  return `Order ${orderLabel} update: ${String(status || '').replace(/_/g, ' ')}`
}

const getCustomerStatusHeading = (status) => {
  if (status === 'confirmed') return 'Order Confirmed'
  if (status === 'cancelled') return 'Order Cancelled'
  return 'Order Update'
}

export const sendAdminOrderAlert = async (order) => {
  if (!adminEmail) return
  const orderLabel = getOrderLabel(order)
  return sendEmail({
    to: adminEmail,
    subject: `New confirmed order: ${orderLabel}`,
    html: `
      <h3>New order confirmed</h3>
      <p><strong>Order ID:</strong> ${orderLabel}</p>
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
  const recipientEmail = getCustomerRecipient(order)
  if (!recipientEmail) return
  const orderLabel = getOrderLabel(order)
  return sendEmail({
    to: recipientEmail,
    subject: getCustomerStatusSubject(orderLabel, status),
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
        <h2 style="margin: 0 0 12px; color: #8b1451;">${getCustomerStatusHeading(status)}</h2>
        <p style="margin: 0 0 12px;">Hello ${order.shippingAddress?.name || 'Customer'},</p>
        <p style="margin: 0 0 16px;">${statusMessage(status)}</p>
        <div style="border: 1px solid #f0d8e8; border-radius: 14px; padding: 16px; background: #fffafc;">
          <p style="margin: 0 0 8px;"><strong>Order ID:</strong> ${orderLabel}</p>
          <p style="margin: 0 0 8px;"><strong>Total:</strong> ${formatCurrency(order.totalAmount)}</p>
          <p style="margin: 0 0 8px;"><strong>Payment:</strong> ${getPaymentLabel(order.paymentMethod)}</p>
          <p style="margin: 0;"><strong>Email:</strong> ${recipientEmail}</p>
        </div>
        ${
          status === 'confirmed'
            ? '<p style="margin: 16px 0 0;">We have started processing your order and will keep sending updates to this email address.</p>'
            : ''
        }
      </div>
    `,
  })
}

export const sendAdminPendingOrderReminder = async (order) => {
  if (!adminEmail) return false
  const orderedAtText = order?.orderedAt ? new Date(order.orderedAt).toLocaleString('en-IN') : 'N/A'
  const orderLabel = getOrderLabel(order)
  return sendEmail({
    to: adminEmail,
    subject: `Reminder: Pending order ${orderLabel} is not shipped`,
    html: `
      <h3>Pending Order Reminder</h3>
      <p>This order is still pending after 24 hours.</p>
      <p><strong>Order ID:</strong> ${orderLabel}</p>
      <p><strong>Status:</strong> ${order.status || 'confirmed'}</p>
      <p><strong>Customer:</strong> ${order.shippingAddress?.name || 'N/A'} (${order.userEmail || 'No email'})</p>
      <p><strong>Total:</strong> ${formatCurrency(order.totalAmount)}</p>
      <p><strong>Ordered At:</strong> ${orderedAtText}</p>
      <p>Please review this order in the admin panel.</p>
    `,
  })
}

export const sendAdminOrderCancelled = async (order) => {
  if (!adminEmail) return false
  const orderLabel = getOrderLabel(order)
  return sendEmail({
    to: adminEmail,
    subject: `Order cancelled by customer: ${orderLabel}`,
    html: `
      <h3>Order Cancelled</h3>
      <p><strong>Order ID:</strong> ${orderLabel}</p>
      <p><strong>Customer:</strong> ${order.shippingAddress?.name || 'N/A'} (${order.userEmail || 'No email'})</p>
      <p><strong>Total:</strong> ${formatCurrency(order.totalAmount)}</p>
      <p>Status has been updated to cancelled.</p>
    `,
  })
}
