'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Testimonial {
  id: string
  name: string
  avatar?: string
  content: string
  rating: number
  location?: string
}

export function TestimonialsCarousel() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (testimonials.length <= 1) return
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [testimonials.length])

  const fetchTestimonials = async () => {
    try {
      const res = await fetch('/api/testimonials?featured=true')
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data.testimonials || [])
      } else {
        // Use demo testimonials if API fails
        setTestimonials(demoTestimonials)
      }
    } catch (error) {
      console.error('Failed to fetch testimonials:', error)
      setTestimonials(demoTestimonials)
    } finally {
      setLoading(false)
    }
  }

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-48 h-8 bg-gray-200 rounded mb-4" />
            <div className="w-96 h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </section>
    )
  }

  if (testimonials.length === 0) return null

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from our happy customers
          </p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Quote Icon */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Quote className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Testimonial Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center"
            >
              {/* Stars */}
              <div className="flex justify-center mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= currentTestimonial.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-8 italic">
                "{currentTestimonial.content}"
              </p>

              {/* Author */}
              <div className="flex flex-col items-center">
                {currentTestimonial.avatar ? (
                  <img
                    src={currentTestimonial.avatar}
                    alt={currentTestimonial.name}
                    className="w-16 h-16 rounded-full object-cover mb-3"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold mb-3">
                    {currentTestimonial.name.charAt(0)}
                  </div>
                )}
                <h4 className="font-semibold text-lg">{currentTestimonial.name}</h4>
                {currentTestimonial.location && (
                  <p className="text-muted-foreground text-sm">
                    {currentTestimonial.location}
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          {testimonials.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-white shadow-lg hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-white shadow-lg hover:bg-gray-50"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </>
          )}

          {/* Dots Indicator */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-3 h-3 rounded-full transition ${
                    idx === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// Demo testimonials for fallback
const demoTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Rahman',
    content: 'Amazing quality products! The delivery was super fast and the customer service was exceptionally helpful. Will definitely shop here again!',
    rating: 5,
    location: 'Dhaka, Bangladesh'
  },
  {
    id: '2',
    name: 'Mohammad Hasan',
    content: 'Best online shopping experience in Bangladesh. The prices are reasonable and the products match exactly what was shown in the pictures.',
    rating: 5,
    location: 'Chittagong, Bangladesh'
  },
  {
    id: '3',
    name: 'Fatima Akhter',
    content: 'I love Silk Mart! The variety of products is amazing and the quality never disappoints. Highly recommend to everyone!',
    rating: 5,
    location: 'Sylhet, Bangladesh'
  }
]

export default TestimonialsCarousel
