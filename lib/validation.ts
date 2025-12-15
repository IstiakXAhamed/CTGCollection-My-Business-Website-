// Centralized validation utilities for forms
// Use these for consistent validation across the website

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email?.trim() || '')
}

// Bangladesh phone validation (01XXXXXXXXX)
export function isValidBDPhone(phone: string): boolean {
  const cleaned = phone?.replace(/[\s\-\+]/g, '') || ''
  // Matches 01XXXXXXXXX or 8801XXXXXXXXX or +8801XXXXXXXXX
  return /^(0|880|\+880)?1[3-9]\d{8}$/.test(cleaned)
}

// Format phone to standard format
export function formatBDPhone(phone: string): string {
  const cleaned = phone?.replace(/[\s\-\+]/g, '') || ''
  if (cleaned.startsWith('880')) {
    return '+' + cleaned
  }
  if (cleaned.startsWith('0')) {
    return '+88' + cleaned
  }
  return '+880' + cleaned
}

// Name validation (at least 2 characters, no special characters)
export function isValidName(name: string): boolean {
  const trimmed = name?.trim() || ''
  return trimmed.length >= 2 && /^[a-zA-Z\s\u0980-\u09FF]+$/.test(trimmed)
}

// Password strength check
export interface PasswordStrength {
  score: number // 0-4
  label: 'weak' | 'fair' | 'good' | 'strong'
  suggestions: string[]
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const suggestions: string[] = []
  let score = 0

  if (!password || password.length === 0) {
    return { score: 0, label: 'weak', suggestions: ['Enter a password'] }
  }

  // Length checks
  if (password.length >= 6) score++
  else suggestions.push('Use at least 6 characters')
  
  if (password.length >= 10) score++

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  else if (!/[A-Z]/.test(password)) suggestions.push('Add uppercase letters')

  if (/\d/.test(password)) score++
  else suggestions.push('Add numbers')

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++
  else suggestions.push('Add special characters')

  const labels: PasswordStrength['label'][] = ['weak', 'fair', 'good', 'strong']
  
  return {
    score: Math.min(score, 4),
    label: labels[Math.min(Math.floor(score / 1.5), 3)],
    suggestions: suggestions.slice(0, 3)
  }
}

// Address validation
export function isValidAddress(address: string): boolean {
  const trimmed = address?.trim() || ''
  return trimmed.length >= 10 && trimmed.split(/\s+/).length >= 2
}

// Postal code validation (Bangladesh)
export function isValidPostalCode(code: string): boolean {
  return /^\d{4}$/.test(code?.trim() || '')
}

// Credit card validation (Luhn algorithm)
export function isValidCreditCard(number: string): boolean {
  const cleaned = number?.replace(/\s/g, '') || ''
  if (!/^\d{13,19}$/.test(cleaned)) return false

  let sum = 0
  let isEven = false

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10)
    if (isEven) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    isEven = !isEven
  }

  return sum % 10 === 0
}

// Price validation
export function isValidPrice(price: number | string): boolean {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return !isNaN(num) && num >= 0 && num <= 10000000
}

// Quantity validation
export function isValidQuantity(qty: number | string, max: number = 100): boolean {
  const num = typeof qty === 'string' ? parseInt(qty, 10) : qty
  return Number.isInteger(num) && num >= 1 && num <= max
}

// Coupon code validation
export function isValidCouponCode(code: string): boolean {
  const cleaned = code?.trim().toUpperCase() || ''
  return /^[A-Z0-9]{3,20}$/.test(cleaned)
}

// Sanitize user input (XSS prevention)
export function sanitizeInput(input: string): string {
  return input
    ?.replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim() || ''
}

// Validate form fields and return errors
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateCheckoutForm(data: {
  name: string
  phone: string
  email?: string
  address: string
  city: string
  district: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.name?.trim()) {
    errors.name = 'Name is required'
  } else if (!isValidName(data.name)) {
    errors.name = 'Enter a valid name'
  }

  if (!data.phone?.trim()) {
    errors.phone = 'Phone is required'
  } else if (!isValidBDPhone(data.phone)) {
    errors.phone = 'Enter valid BD phone (01XXXXXXXXX)'
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.email = 'Enter a valid email'
  }

  if (!data.address?.trim()) {
    errors.address = 'Address is required'
  } else if (!isValidAddress(data.address)) {
    errors.address = 'Enter complete address'
  }

  if (!data.city?.trim()) {
    errors.city = 'City is required'
  }

  if (!data.district?.trim()) {
    errors.district = 'District is required'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateLoginForm(data: { email: string; password: string }): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Enter a valid email'
  }

  if (!data.password) {
    errors.password = 'Password is required'
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateRegisterForm(data: {
  name: string
  email: string
  password: string
  phone?: string
}): ValidationResult {
  const errors: Record<string, string> = {}

  if (!data.name?.trim()) {
    errors.name = 'Name is required'
  } else if (!isValidName(data.name)) {
    errors.name = 'Enter a valid name'
  }

  if (!data.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Enter a valid email'
  }

  if (!data.password) {
    errors.password = 'Password is required'
  } else if (data.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  if (data.phone && !isValidBDPhone(data.phone)) {
    errors.phone = 'Enter valid BD phone number'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
