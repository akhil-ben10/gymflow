export const demoMembers = [
  { id: 'm1', full_name: 'Maya Singh', email: 'maya.singh@email.com', phone: '+1 (555) 201-4821', plan: 'Pro Annual', status: 'active', joined: '2024-10-24', expiry: '2025-10-24', tone: 'pink' },
  { id: 'm2', full_name: 'Liam Walker', email: 'liam.walker@email.com', phone: '+1 (555) 201-8457', plan: 'Growth Monthly', status: 'active', joined: '2024-10-21', expiry: '2025-01-21', tone: 'blue' },
  { id: 'm3', full_name: 'Elena Carter', email: 'elena.carter@email.com', phone: '+1 (555) 201-1198', plan: 'Pro Annual', status: 'active', joined: '2024-10-18', expiry: '2025-10-18', tone: 'orange' },
  { id: 'm4', full_name: 'Ryan Johnson', email: 'ryan.johnson@email.com', phone: '+1 (555) 201-7443', plan: 'Starter Monthly', status: 'expired', joined: '2024-10-12', expiry: '2024-11-12', tone: 'green' },
  { id: 'm5', full_name: 'Sofia Williams', email: 'sofia.williams@email.com', phone: '+1 (555) 201-9832', plan: 'Growth Monthly', status: 'active', joined: '2024-10-09', expiry: '2025-02-09', tone: 'purple' },
  { id: 'm6', full_name: 'Noah Brown', email: 'noah.brown@email.com', phone: '+1 (555) 201-6324', plan: 'Starter Monthly', status: 'active', joined: '2024-10-05', expiry: '2025-01-05', tone: 'blue' },
  { id: 'm7', full_name: 'Ava Martinez', email: 'ava.martinez@email.com', phone: '+1 (555) 201-3077', plan: 'Pro Annual', status: 'expired', joined: '2024-09-28', expiry: '2024-10-28', tone: 'pink' },
]

export const demoPayments = [
  { id: 'p1', member: 'Maya Singh', amount: 249, method: 'Card', status: 'paid', date: 'Nov 06, 2024' },
  { id: 'p2', member: 'Liam Walker', amount: 49, method: 'Bank transfer', status: 'paid', date: 'Nov 05, 2024' },
  { id: 'p3', member: 'Sofia Williams', amount: 49, method: 'Cash', status: 'pending', date: 'Nov 04, 2024' },
  { id: 'p4', member: 'Elena Carter', amount: 249, method: 'Card', status: 'paid', date: 'Nov 03, 2024' },
]

export const demoAttendance = [
  { id: 'a1', member: 'Maya Singh', checkIn: '06:42 AM', checkOut: '08:05 AM', date: 'Today', status: 'checked-out' },
  { id: 'a2', member: 'Liam Walker', checkIn: '07:15 AM', checkOut: '—', date: 'Today', status: 'checked-in' },
  { id: 'a3', member: 'Elena Carter', checkIn: '08:02 AM', checkOut: '09:30 AM', date: 'Today', status: 'checked-out' },
  { id: 'a4', member: 'Noah Brown', checkIn: '09:18 AM', checkOut: '—', date: 'Today', status: 'checked-in' },
]

export const demoPlans = [
  { id: 'pl1', name: 'Starter Monthly', interval: 'Monthly', price: 29, members: 286, color: 'orange', description: 'Essential access for getting started.' },
  { id: 'pl2', name: 'Growth Monthly', interval: 'Monthly', price: 49, members: 486, color: 'blue', description: 'Flexible membership for growing members.' },
  { id: 'pl3', name: 'Pro Annual', interval: 'Annual', price: 249, members: 512, color: 'purple', description: 'Best value for committed members.' },
]

export const demoActivities = [
  { icon: 'user-plus', title: 'New member joined', detail: 'Maya Singh joined Pro Annual', time: '12 min ago', color: 'purple' },
  { icon: 'credit-card', title: 'Payment recorded', detail: '$249 payment from Elena Carter', time: '1 hr ago', color: 'green' },
  { icon: 'log-in', title: 'Member checked in', detail: 'Noah Brown checked in', time: '2 hrs ago', color: 'blue' },
]
