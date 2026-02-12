'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Search, X, Building, Home, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { haptics } from '@/lib/haptics'

// Bangladesh areas database
const BANGLADESH_AREAS = [
  // Dhaka Division
  { district: 'Dhaka', areas: ['Dhaka', 'Gazipur', 'Tangail', 'Narayanganj', 'Narsingdi', 'Manikganj', 'Munshiganj', 'Rajbari', 'Madaripur', 'Shariatpur', 'Faridpur'] },
  // Chattogram Division
  { district: 'Chattogram', areas: ['Chattogram', 'Cox\'s Bazar', 'Rangamati', 'Bandarban', 'Khagrachari', 'Feni', 'Lakshmipur', 'Noakhali', 'Chandpur', 'Brahmanbaria', 'Comilla'] },
  // Rajshahi Division
  { district: 'Rajshahi', areas: ['Rajshahi', 'Bogura', 'Joypurhat', 'Natore', 'Naogaon', 'Sirajganj', 'Pabna', 'Chapainawabganj'] },
  // Khulna Division
  { district: 'Khulna', areas: ['Khulna', 'Satkhira', 'Bagerhat', 'Narail', 'Jessore', 'Magura', 'Jhenaidah', 'Chuadanga', 'Meherpur', 'Kushtia'] },
  // Barishal Division
  { district: 'Barishal', areas: ['Barishal', 'Bhola', 'Patuakhali', 'Pirojpur', 'Jhalokathi', 'Barguna'] },
  // Sylhet Division
  { district: 'Sylhet', areas: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'] },
  // Rangpur Division
  { district: 'Rangpur', areas: ['Rangpur', 'Dinajpur', 'Thakurgaon', 'Panchagarh', 'Nilphamari', 'Lalmonirhat', 'Kurigram', 'Gaibandha'] },
  // Mymensingh Division
  { district: 'Mymensingh', areas: ['Mymensingh', 'Jamalpur', 'Netrakona', 'Sherpur'] },
]

// Common Bangladesh Thanas
const DHAKA_THANAS = ['Gulshan', 'Banani', 'Dhanmondi', 'Mirpur', 'Uttara', 'Mohammadpur', 'Farmgate', 'Motijheel', 'Ramna', 'Sutrapur', 'Kotwali', 'Lalbag', 'Hazaribagh', 'Shyampur', 'Savar', 'Keraniganj']

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelect: (address: { full: string; district: string; area: string }) => void
  placeholder?: string
  className?: string
  required?: boolean
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Enter your address',
  className,
  required = false,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<typeof BANGLADESH_AREAS[0]['areas']>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filter suggestions based on input
  const getSuggestions = useCallback((query: string) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      return
    }

    const lowerQuery = query.toLowerCase()
    const allAreas = BANGLADESH_AREAS.flatMap(d => d.areas)
    const filtered = allAreas.filter(area =>
      area.toLowerCase().includes(lowerQuery)
    ).slice(0, 8)

    setSuggestions(filtered)
  }, [])

  useEffect(() => {
    getSuggestions(value)
  }, [value, getSuggestions])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (suggestion: string) => {
    haptics.light()
    onChange(suggestion)
    setShowSuggestions(false)
    setSelectedIndex(-1)

    // Find the district
    const districtData = BANGLADESH_AREAS.find(d => d.areas.includes(suggestion))
    onSelect({
      full: suggestion,
      district: districtData?.district || '',
      area: suggestion,
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        break
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            haptics.light()
            onChange(e.target.value)
            setShowSuggestions(true)
            setSelectedIndex(-1)
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'placeholder:text-muted-foreground'
          )}
          required={required}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              haptics.light()
              onChange('')
              setSuggestions([])
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
      </div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-2 text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              Bangladesh addresses
            </div>
            <ul className="max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => {
                const districtData = BANGLADESH_AREAS.find(d => d.areas.includes(suggestion))
                return (
                  <li key={suggestion}>
                    <button
                      type="button"
                      onClick={() => handleSelect(suggestion)}
                      className={cn(
                        'w-full px-4 py-3 text-left flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                        index === selectedIndex && 'bg-gray-50 dark:bg-gray-800'
                      )}
                    >
                      <div className="mt-0.5">
                        {districtData?.district === 'Dhaka' ? (
                          <Building className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Home className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{suggestion}</p>
                        <p className="text-xs text-muted-foreground">{districtData?.district}</p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Full address form with autocomplete
interface AddressFormData {
  fullName: string
  phone: string
  district: string
  area: string
  address: string
  postalCode: string
  instructions: string
}

interface AddressFormProps {
  data: AddressFormData
  onChange: (data: AddressFormData) => void
  onSubmit?: () => void
  className?: string
}

export function AddressForm({ data, onChange, onSubmit, className }: AddressFormProps) {
  const handleSelect = (address: { full: string; district: string; area: string }) => {
    onChange({
      ...data,
      district: address.district,
      area: address.area,
    })
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Full Name</label>
        <input
          type="text"
          value={data.fullName}
          onChange={(e) => onChange({ ...data, fullName: e.target.value })}
          placeholder="Enter your full name"
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium mb-1">Phone Number</label>
        <input
          type="tel"
          value={data.phone}
          onChange={(e) => onChange({ ...data, phone: e.target.value })}
          placeholder="01XXXXXXXXX"
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Address Autocomplete */}
      <div>
        <label className="block text-sm font-medium mb-1">Area / City</label>
        <AddressAutocomplete
          value={data.area}
          onChange={(area) => onChange({ ...data, area })}
          onSelect={(addr) => {
            onChange({ ...data, district: addr.district, area: addr.area })
          }}
          placeholder="Start typing your area..."
        />
      </div>

      {/* District (auto-filled) */}
      <div>
        <label className="block text-sm font-medium mb-1">District</label>
        <input
          type="text"
          value={data.district}
          onChange={(e) => onChange({ ...data, district: e.target.value })}
          placeholder="District"
          className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          readOnly
        />
      </div>

      {/* Full Address */}
      <div>
        <label className="block text-sm font-medium mb-1">Street Address</label>
        <textarea
          value={data.address}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          placeholder="House number, road name, landmark..."
          rows={3}
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          required
        />
      </div>

      {/* Postal Code */}
      <div>
        <label className="block text-sm font-medium mb-1">Postal Code (Optional)</label>
        <input
          type="text"
          value={data.postalCode}
          onChange={(e) => onChange({ ...data, postalCode: e.target.value })}
          placeholder="1200"
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Delivery Instructions */}
      <div>
        <label className="block text-sm font-medium mb-1">Delivery Instructions (Optional)</label>
        <textarea
          value={data.instructions}
          onChange={(e) => onChange({ ...data, instructions: e.target.value })}
          placeholder="e.g., Leave at door, call before delivery..."
          rows={2}
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  )
}

export default {
  AddressAutocomplete,
  AddressForm,
}
