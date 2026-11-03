import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({ responses: {}, calls: [] }))

vi.mock('../src/lib/supabaseClient', () => ({
  supabase: {
    from(table) {
      const chain = {
        select(value) { state.calls.push(['select', table, value]); return chain },
        eq(field, value) { state.calls.push(['eq', table, field, value]); return chain },
        order(field, options) { state.calls.push(['order', table, field, options]); return chain },
        insert(payload) { state.calls.push(['insert', table, payload]); return chain },
        single() { return chain },
        then(resolve, reject) { return Promise.resolve(state.responses[table] || { data: [], error: null }).then(resolve, reject) },
      }
      return chain
    },
  },
}))

const { createMember, listMembers, recordPayment } = await import('../src/services/gymService')

describe('Supabase service contracts', () => {
  beforeEach(() => {
    state.responses = {}
    state.calls = []
  })

  it('scopes member listing and maps database fields to display fields', async () => {
    state.responses.gym_members = { data: [{ id: 'm1', gym_id: 'g1', full_name: 'Alex Morgan', email: 'alex@example.com', phone: '555', membership_start: '2025-01-01', membership_expiry: '2025-12-31', status: 'active', membership_plans: { name: 'Growth', price: '49.00' } }], error: null }
    const members = await listMembers('g1')
    expect(members[0]).toMatchObject({ id: 'm1', plan: 'Growth', joined: '2025-01-01', expiry: '2025-12-31' })
    expect(state.calls).toContainEqual(['eq', 'gym_members', 'gym_id', 'g1'])
  })

  it('sends schema fields instead of UI-only member fields', async () => {
    state.responses.gym_members = { data: { id: 'm1', gym_id: 'g1', full_name: 'Alex Morgan', email: 'alex@example.com', phone: '555', status: 'active', membership_plans: null }, error: null }
    await createMember('g1', { full_name: ' Alex Morgan ', email: 'alex@example.com', phone: '555', plan_id: 'plan-1', membership_expiry: '2025-12-31', notes: 'note' })
    const insert = state.calls.find(call => call[0] === 'insert')
    expect(insert[2]).toMatchObject({ gym_id: 'g1', full_name: 'Alex Morgan', plan_id: 'plan-1', membership_expiry: '2025-12-31', notes: 'note' })
    expect(insert[2]).not.toHaveProperty('plan')
    expect(insert[2]).not.toHaveProperty('expiry')
  })

  it('does not report a payment as successful when Supabase returns an error', async () => {
    state.responses.payments = { data: null, error: new Error('insert denied') }
    await expect(recordPayment('g1', { member_id: 'm1', amount: '49', method: 'Cash' })).rejects.toThrow('insert denied')
  })
})
