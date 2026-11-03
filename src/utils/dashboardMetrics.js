export function calculateDashboardMetrics({ members = [], payments = [], attendance = [] } = {}, now = new Date()) {
  const today = now.toISOString().slice(0, 10)
  const paidRevenue = payments.filter(payment => payment.status === 'paid').reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  const pendingPayments = payments.filter(payment => payment.status === 'pending').reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  const todayAttendance = attendance.filter(item => item.checked_in_at?.slice(0, 10) === today || item.date === 'Today').length
  const planCounts = members.reduce((counts, member) => {
    const name = member.plan || 'No plan'
    counts[name] = (counts[name] || 0) + 1
    return counts
  }, {})
  const total = members.length || 1

  return {
    totalMembers: members.length,
    activeMembers: members.filter(member => member.status === 'active').length,
    expiredMembers: members.filter(member => member.status === 'expired').length,
    paidRevenue,
    pendingPayments,
    todayAttendance,
    membershipDistribution: Object.entries(planCounts).map(([name, count]) => ({ name, value: Math.round((count / total) * 100) })),
  }
}
