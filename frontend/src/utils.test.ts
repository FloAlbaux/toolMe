import { describe, it, expect } from 'vitest'
import { isValidEmail, EMAIL_REGEX } from './utils'

describe('isValidEmail', () => {
  it('returns true for valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('a.b@domain.co')).toBe(true)
    expect(isValidEmail('  user@test.org  ')).toBe(true)
  })

  it('returns false for invalid email', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('no-at')).toBe(false)
    expect(isValidEmail('@nodomain.com')).toBe(false)
    expect(isValidEmail('missing@.com')).toBe(false)
  })
})

describe('EMAIL_REGEX', () => {
  it('matches valid local@domain.tld pattern', () => {
    expect(EMAIL_REGEX.test('a@b.co')).toBe(true)
    expect(EMAIL_REGEX.test('user+tag@example.com')).toBe(true)
  })
})
