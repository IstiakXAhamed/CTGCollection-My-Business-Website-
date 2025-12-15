// Bangladesh Districts and Divisions Data

export const DIVISIONS = [
  'Barishal',
  'Chattogram',
  'Dhaka',
  'Khulna',
  'Mymensingh',
  'Rajshahi',
  'Rangpur',
  'Sylhet'
] as const

// All 64 Districts of Bangladesh grouped by Division
export const DISTRICTS_BY_DIVISION: Record<string, string[]> = {
  'Barishal': [
    'Barguna', 'Barishal', 'Bhola', 'Jhalokati', 'Patuakhali', 'Pirojpur'
  ],
  'Chattogram': [
    'Bandarban', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Comilla', 
    'Cox\'s Bazar', 'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali', 'Rangamati'
  ],
  'Dhaka': [
    'Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj', 
    'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi',
    'Rajbari', 'Shariatpur', 'Tangail'
  ],
  'Khulna': [
    'Bagerhat', 'Chuadanga', 'Jessore', 'Jhenaidah', 'Khulna', 
    'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira'
  ],
  'Mymensingh': [
    'Jamalpur', 'Mymensingh', 'Netrokona', 'Sherpur'
  ],
  'Rajshahi': [
    'Bogra', 'Chapainawabganj', 'Joypurhat', 'Naogaon', 'Natore', 
    'Nawabganj', 'Pabna', 'Rajshahi', 'Sirajganj'
  ],
  'Rangpur': [
    'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 
    'Panchagarh', 'Rangpur', 'Thakurgaon'
  ],
  'Sylhet': [
    'Habiganj', 'Moulvibazar', 'Sunamganj', 'Sylhet'
  ]
}

// All districts as a flat array
export const ALL_DISTRICTS = Object.values(DISTRICTS_BY_DIVISION).flat().sort()

// Chittagong Division Districts (for shipping calculation)
export const CTG_DISTRICTS = [
  'Bandarban', 'Brahmanbaria', 'Chandpur', 'Chattogram', 'Comilla', 
  'Cox\'s Bazar', 'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali', 'Rangamati'
]

// Shipping charges
export const SHIPPING_RATES = {
  INSIDE_CTG: 80,    // Inside Chittagong Division
  OUTSIDE_CTG: 130,  // Outside Chittagong Division
  FREE_THRESHOLD: 0  // Set to 0 to disable free shipping, or set amount for free shipping threshold
}

// Calculate shipping cost based on district
export function calculateShippingCost(district: string): number {
  if (!district) return SHIPPING_RATES.OUTSIDE_CTG
  
  const isCTG = CTG_DISTRICTS.some(
    d => d.toLowerCase() === district.toLowerCase()
  )
  
  return isCTG ? SHIPPING_RATES.INSIDE_CTG : SHIPPING_RATES.OUTSIDE_CTG
}

// Get division for a district
export function getDivisionForDistrict(district: string): string | null {
  for (const [division, districts] of Object.entries(DISTRICTS_BY_DIVISION)) {
    if (districts.some(d => d.toLowerCase() === district.toLowerCase())) {
      return division
    }
  }
  return null
}

// Bangladesh phone regex (starts with 01, 11 digits total)
export const BD_PHONE_REGEX = /^(?:\+?880)?0?1[3-9]\d{8}$/

// Validate Bangladesh phone number
export function isValidBDPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-]/g, '')
  return BD_PHONE_REGEX.test(cleaned)
}

// Format phone number
export function formatBDPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-\+]/g, '')
  if (cleaned.startsWith('880')) {
    return '+' + cleaned
  }
  if (cleaned.startsWith('0')) {
    return '+880' + cleaned.substring(1)
  }
  return '+880' + cleaned
}
