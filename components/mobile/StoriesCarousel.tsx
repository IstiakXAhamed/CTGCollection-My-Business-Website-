'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { X, ChevronLeft, ChevronRight, Volume2, VolumeX, Pause, Play, Heart, Share, ShoppingBag } from 'lucide-react'
import { haptics } from '@/lib/haptics'
import { cn } from '@/lib/utils'

interface Story {
  id: string
  type: 'image' | 'video'
  url: string
  duration?: number // in seconds, default 5
  link?: string
  linkText?: string
  title?: string
  subtitle?: string
}

interface StoryGroup {
  id: string
  name: string
  avatar: string
  stories: Story[]
  isViewed?: boolean
  isLive?: boolean
}

interface StoriesCarouselProps {
  stories: StoryGroup[]
  onStoryView?: (storyId: string, groupId: string) => void
  className?: string
}

// Story thumbnail in the carousel
function StoryThumbnail({ 
  group, 
  onClick, 
  index 
}: { 
  group: StoryGroup
  onClick: () => void
  index: number
}) {
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => { haptics.light(); onClick() }}
      className="flex flex-col items-center gap-1.5 flex-shrink-0"
    >
      <div className={cn(
        "relative w-[72px] h-[72px] rounded-full p-[3px]",
        group.isViewed
          ? "bg-gray-300 dark:bg-gray-700"
          : "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400",
        group.isLive && "ring-2 ring-red-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-950"
      )}>
        <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-gray-900 p-0.5">
          <Image
            src={group.avatar}
            alt={group.name}
            width={68}
            height={68}
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        
        {/* Live indicator */}
        {group.isLive && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-bold rounded uppercase">
            Live
          </div>
        )}
        
        {/* Add story button for first item */}
        {index === 0 && !group.isLive && (
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
            <span className="text-white text-xs font-bold">+</span>
          </div>
        )}
      </div>
      
      <span className={cn(
        "text-[11px] font-medium truncate max-w-[72px]",
        group.isViewed ? "text-gray-400" : "text-gray-900 dark:text-white"
      )}>
        {group.name}
      </span>
    </motion.button>
  )
}

// Full screen story viewer
function StoryViewer({
  groups,
  initialGroupIndex,
  onClose,
  onStoryView,
}: {
  groups: StoryGroup[]
  initialGroupIndex: number
  onClose: () => void
  onStoryView?: (storyId: string, groupId: string) => void
}) {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)
  
  const currentGroup = groups[currentGroupIndex]
  const currentStory = currentGroup?.stories[currentStoryIndex]
  const storyDuration = (currentStory?.duration || 5) * 1000

  // Progress animation
  useEffect(() => {
    if (isPaused) return
    
    setProgress(0)
    const startTime = Date.now()
    
    progressInterval.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / storyDuration) * 100, 100)
      setProgress(newProgress)
      
      if (newProgress >= 100) {
        goToNextStory()
      }
    }, 50)
    
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current)
      }
    }
  }, [currentGroupIndex, currentStoryIndex, isPaused, storyDuration])

  // Track story view
  useEffect(() => {
    if (currentStory && currentGroup) {
      onStoryView?.(currentStory.id, currentGroup.id)
    }
  }, [currentStory, currentGroup, onStoryView])

  const goToNextStory = useCallback(() => {
    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1)
    } else if (currentGroupIndex < groups.length - 1) {
      setCurrentGroupIndex(currentGroupIndex + 1)
      setCurrentStoryIndex(0)
    } else {
      onClose()
    }
  }, [currentStoryIndex, currentGroup?.stories.length, currentGroupIndex, groups.length, onClose])

  const goToPrevStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1)
    } else if (currentGroupIndex > 0) {
      setCurrentGroupIndex(currentGroupIndex - 1)
      setCurrentStoryIndex(groups[currentGroupIndex - 1].stories.length - 1)
    }
  }, [currentStoryIndex, currentGroupIndex, groups])

  // Handle tap zones
  const handleTap = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    
    if (x < width * 0.3) {
      haptics.light()
      goToPrevStory()
    } else if (x > width * 0.7) {
      haptics.light()
      goToNextStory()
    }
  }

  // Handle swipe
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (Math.abs(info.velocity.y) > 500 || info.offset.y > 100) {
      onClose()
    } else if (info.offset.x < -50) {
      goToNextStory()
    } else if (info.offset.x > 50) {
      goToPrevStory()
    }
  }

  // Handle long press to pause
  const handlePressStart = () => setIsPaused(true)
  const handlePressEnd = () => setIsPaused(false)

  if (!currentGroup || !currentStory) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-black"
    >
      {/* Story content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={handleDragEnd}
        onClick={handleTap}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        className="relative w-full h-full"
      >
        {/* Media */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentGroupIndex}-${currentStoryIndex}`}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {currentStory.type === 'video' ? (
              <video
                ref={videoRef}
                src={currentStory.url}
                className="w-full h-full object-cover"
                autoPlay
                loop={false}
                muted={isMuted}
                playsInline
              />
            ) : (
              <Image
                src={currentStory.url}
                alt=""
                fill
                className="object-cover"
                priority
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Gradient overlays */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 pt-safe px-2 pt-2 flex gap-1">
          {currentGroup.stories.map((_, idx) => (
            <div key={idx} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                style={{
                  width: idx < currentStoryIndex 
                    ? '100%' 
                    : idx === currentStoryIndex 
                      ? `${progress}%` 
                      : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 pt-safe px-4 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
              <Image
                src={currentGroup.avatar}
                alt={currentGroup.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm">{currentGroup.name}</h4>
              {currentStory.title && (
                <p className="text-white/70 text-xs">{currentStory.title}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Pause/Play */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setIsPaused(!isPaused); haptics.light() }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm"
            >
              {isPaused ? (
                <Play className="w-5 h-5 text-white" fill="white" />
              ) : (
                <Pause className="w-5 h-5 text-white" fill="white" />
              )}
            </motion.button>
            
            {/* Mute (for videos) */}
            {currentStory.type === 'video' && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); haptics.light() }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </motion.button>
            )}
            
            {/* Close */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); onClose(); haptics.light() }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm"
            >
              <X className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 pb-safe px-4 pb-6">
          {/* Story text */}
          {currentStory.subtitle && (
            <p className="text-white text-base font-medium mb-4 text-center">
              {currentStory.subtitle}
            </p>
          )}
          
          {/* CTA Link */}
          {currentStory.link && (
            <Link href={currentStory.link} onClick={(e) => e.stopPropagation()}>
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 bg-white text-gray-900 font-semibold text-center rounded-xl flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                {currentStory.linkText || 'Shop Now'}
              </motion.div>
            </Link>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); haptics.success() }}
              className="flex flex-col items-center gap-1"
            >
              <Heart className="w-7 h-7 text-white" />
              <span className="text-white/70 text-xs">Like</span>
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); haptics.light() }}
              className="flex flex-col items-center gap-1"
            >
              <Share className="w-7 h-7 text-white" />
              <span className="text-white/70 text-xs">Share</span>
            </motion.button>
          </div>
        </div>

        {/* Navigation arrows (desktop) */}
        <div className="hidden md:flex absolute inset-y-0 left-0 items-center pl-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); goToPrevStory() }}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </motion.button>
        </div>
        <div className="hidden md:flex absolute inset-y-0 right-0 items-center pr-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); goToNextStory() }}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Main carousel component
export function StoriesCarousel({ stories, onStoryView, className }: StoriesCarouselProps) {
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const openViewer = (index: number) => {
    setSelectedGroupIndex(index)
    setViewerOpen(true)
  }

  if (stories.length === 0) return null

  return (
    <>
      <div 
        ref={scrollRef}
        className={cn(
          "flex gap-3 px-4 py-3 overflow-x-auto scrollbar-hide",
          "scroll-smooth snap-x snap-mandatory",
          className
        )}
      >
        {stories.map((group, index) => (
          <StoryThumbnail
            key={group.id}
            group={group}
            index={index}
            onClick={() => openViewer(index)}
          />
        ))}
      </div>

      {/* Full screen viewer */}
      <AnimatePresence>
        {viewerOpen && (
          <StoryViewer
            groups={stories}
            initialGroupIndex={selectedGroupIndex}
            onClose={() => setViewerOpen(false)}
            onStoryView={onStoryView}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default StoriesCarousel
