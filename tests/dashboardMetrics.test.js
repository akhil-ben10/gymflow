import { describe, expect, it } from 'vitest'
import { calculateDashboardMetrics } from '../src/utils/dashboardMetrics'

describe('dashboard metrics', () => {
  it('calculates live member, payment, and attendance totals', () => {
    const metrics = calculateDashboardMetrics({
      members: [
        { status: 'active', plan: 'Growth' },
        { status: 'expired', plan: 'Growth' },
        { status: 'paused', plan: 'Starter' },
      ],
      payments: [
        { status: 'paid', amount: '49.50' },
        { status: 'pending', amount: '20' },
        { status: 'refunded', amount: 100 },
      ],
      attendance: [{ checked_in_at: '2025-01-15T09:00:00.000Z' }],
    }, new Date('2025-01-15T12:00:00.000Z'))

    expect(metrics).toMatchObject({ totalMembers: 3, activeMembers: 1, expiredMembers: 1, paidRevenue: 49.5, pendingPayments: 20, todayAttendance: 1 })
    expect(metrics.membershipDistribution).toEqual(expect.arrayContaining([{ name: 'Growth', value: 67 }, { name: 'Starter', value: 33 }]))
  })

  it('returns empty-safe metrics without sample values', () => {
    expect(calculateDashboardMetrics()).toMatchObject({ totalMembers: 0, activeMembers: 0, paidRevenue: 0, pendingPayments: 0, todayAttendance: 0, membershipDistribution: [] })
  })
})
