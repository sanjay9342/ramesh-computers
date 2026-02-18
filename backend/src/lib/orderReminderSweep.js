import { firestore } from './firebaseAdmin.js'
import { sendAdminPendingOrderReminder } from './notifications.js'

const ordersCollection = firestore.collection('orders')
const REMINDER_DELAY_MS = 24 * 60 * 60 * 1000
const REMINDABLE_STATUSES = new Set(['confirmed', 'packed'])

const parseTime = (value) => {
  if (!value) return null
  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? null : parsed
  }
  if (typeof value?.toDate === 'function') {
    return value.toDate().getTime()
  }
  return null
}

const shouldSendReminder = (order, nowTs) => {
  if (!order || !REMINDABLE_STATUSES.has(order.status)) return false
  if (order.followUpReminderSentAt) return false

  const orderedAtTs = parseTime(order.orderedAt)
  if (!orderedAtTs) return false

  return nowTs - orderedAtTs >= REMINDER_DELAY_MS
}

export const runPendingOrderReminderSweep = async () => {
  const nowTs = Date.now()
  const snapshot = await ordersCollection.get()
  const candidates = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((order) => shouldSendReminder(order, nowTs))

  let sentCount = 0
  for (const order of candidates) {
    try {
      const sent = await sendAdminPendingOrderReminder(order)
      if (!sent) continue

      await ordersCollection.doc(order.id).set(
        {
          followUpReminderSentAt: new Date().toISOString(),
          followUpReminderStatus: order.status,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
      sentCount += 1
    } catch (error) {
      console.error(`Failed sending pending-order reminder for ${order.id}:`, error.message)
    }
  }

  return sentCount
}
