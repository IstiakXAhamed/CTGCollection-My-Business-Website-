'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, X, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VoiceSearchProps {
  onSearch: (query: string) => void
  placeholder?: string
  language?: string
}

// Check if browser supports speech recognition
const isSpeechRecognitionSupported = () => {
  if (typeof window === 'undefined') return false
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
}

export function VoiceSearch({
  onSearch,
  placeholder = 'Search products...',
  language = 'bn-BD' // Bengali (Bangladesh)
}: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    setIsSupported(isSpeechRecognitionSupported())
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Voice search is not supported in your browser')
      return
    }

    setError('')
    setTranscript('')
    setInterimTranscript('')

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = language
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        let interim = ''
        let final = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            final += result[0].transcript
          } else {
            interim += result[0].transcript
          }
        }

        if (final) {
          setTranscript(final)
        }
        setInterimTranscript(interim)
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        
        switch (event.error) {
          case 'not-allowed':
            setError('Microphone access denied. Please allow microphone access.')
            break
          case 'no-speech':
            setError('No speech detected. Please try again.')
            break
          case 'network':
            setError('Network error. Please check your connection.')
            break
          default:
            setError('An error occurred. Please try again.')
        }
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
        if (transcript) {
          onSearch(transcript)
        }
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.error('Speech recognition error:', err)
      setError('Failed to start voice search')
      setIsListening(false)
    }
  }, [isSupported, language, onSearch, transcript])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }, [])

  const handleSearch = () => {
    if (transcript) {
      onSearch(transcript)
    }
  }

  if (!isSupported) {
    return null // Don't render if not supported
  }

  return (
    <>
      {/* Voice Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => isListening ? stopListening() : startListening()}
        className={`relative ${isListening ? 'text-red-500' : ''}`}
        aria-label={isListening ? 'Stop listening' : 'Voice search'}
      >
        {isListening ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <MicOff className="w-5 h-5" />
          </motion.div>
        ) : (
          <Mic className="w-5 h-5" />
        )}
        
        {/* Pulsing indicator */}
        {isListening && (
          <motion.div
            className="absolute inset-0 rounded-full bg-red-500/20"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </Button>

      {/* Voice Modal */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={stopListening}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={stopListening}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Animated Mic */}
              <motion.div
                className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Mic className="w-12 h-12 text-white" />
              </motion.div>

              {/* Sound Waves */}
              <div className="flex items-center justify-center gap-1 mb-6 h-8">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-blue-500 rounded-full"
                    animate={{
                      height: ['12px', '32px', '12px']
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.1
                    }}
                  />
                ))}
              </div>

              <h3 className="text-xl font-bold mb-2">Listening...</h3>
              <p className="text-gray-500 mb-4">Speak now to search products</p>

              {/* Transcript Display */}
              {(transcript || interimTranscript) && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <p className="text-lg">
                    <span className="font-medium">{transcript}</span>
                    <span className="text-gray-400">{interimTranscript}</span>
                  </p>
                </div>
              )}

              {error && (
                <p className="text-red-500 text-sm mb-4">{error}</p>
              )}

              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={stopListening}>
                  Cancel
                </Button>
                {transcript && (
                  <Button onClick={handleSearch}>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                )}
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Supports Bengali (বাংলা) and English
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Compact voice search for navbar
export function VoiceSearchCompact({ onSearch }: { onSearch: (query: string) => void }) {
  return (
    <VoiceSearch 
      onSearch={onSearch} 
      language="bn-BD"
    />
  )
}
