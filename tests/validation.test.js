import { describe, expect, it } from 'vitest'
import { toCsv, validateMember } from '../src/utils/validation'

describe('member validation', () => {
  it('requires name, email, and phone', () => {
    expect(validateMember({})).toEqual({
      full_name: 'Full name is required.',
      email: 'Enter a valid email address.',
      phone: 'Phone number is required.',
    })
  })
  it('accepts a complete member record', () => {
    expect(validateMember({ full_name: 'Alex Morgan', email: 'alex@example.com', phone: '+1 555 1234' })).toEqual({})
  })
})

describe('CSV export', () => {
  it('serializes headers and escaped values', () => {
    expect(toCsv([{ name: 'Alex', amount: 49 }, { name: 'Maya, Singh', amount: 25 }])).toBe('name,amount\n"Alex",49\n"Maya, Singh",25')
  })
})
