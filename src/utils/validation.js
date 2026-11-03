export function validateMember(member) {
  const errors = {}
  if (!member.full_name?.trim()) errors.full_name = 'Full name is required.'
  if (!/^\S+@\S+\.\S+$/.test(member.email || '')) errors.email = 'Enter a valid email address.'
  if (!member.phone?.trim()) errors.phone = 'Phone number is required.'
  return errors
}

export function toCsv(rows) {
  if (!rows.length) return ''
  const keys = Object.keys(rows[0])
  return [keys.join(','), ...rows.map(row => keys.map(key => JSON.stringify(row[key] ?? '')).join(','))].join('\n')
}

export function downloadCsv(filename, rows) {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
