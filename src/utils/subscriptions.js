const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

export function normalizeDateOnly(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new Error('Invalid date.')
    return value.toISOString().slice(0, 10)
  }
  if (typeof value !== 'string' || !DATE_ONLY.test(value)) throw new Error('Use a valid date in YYYY-MM-DD format.')
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error('Use a valid date in YYYY-MM-DD format.')
  return value
}

export function addCalendarMonths(dateValue, months) {
  const date = normalizeDateOnly(dateValue)
  const duration = Number(months)
  if (!Number.isInteger(duration) || duration <= 0) throw new Error('Duration must be a positive whole number of months.')
  const [year, month, day] = date.split('-').map(Number)
  const target = new Date(Date.UTC(year, month - 1 + duration, 1))
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate()
  target.setUTCDate(Math.min(day, lastDay))
  return target.toISOString().slice(0, 10)
}

export function calculateExpiry(startDate, durationMonths) {
  const next = addCalendarMonths(startDate, durationMonths)
  const date = new Date(`${next}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

export function effectiveSubscriptionStatus(subscription, now = new Date()) {
  if (subscription?.status === 'paused') return 'paused'
  if (!subscription?.ends_on) return subscription?.status || 'expired'
  const today = normalizeDateOnly(now)
  return subscription.ends_on < today ? 'expired' : (subscription.status || 'active')
}

export function isExpiringSoon(subscription, now = new Date(), days = 30) {
  if (effectiveSubscriptionStatus(subscription, now) !== 'active') return false
  const today = new Date(`${normalizeDateOnly(now)}T00:00:00Z`)
  const end = new Date(`${normalizeDateOnly(subscription.ends_on)}T00:00:00Z`)
  const diff = Math.ceil((end - today) / 86400000)
  return diff >= 0 && diff <= days
}
