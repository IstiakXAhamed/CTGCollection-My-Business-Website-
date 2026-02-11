'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Animated Bar Chart Component
interface BarChartData {
  label: string
  value: number
  color?: string
}

export function AnimatedBarChart({ data, title, subtitle }: { data: BarChartData[]; title: string; subtitle?: string }) {
  const maxValue = Math.max(...data.map(d => d.value))
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold">{item.value.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.value / maxValue) * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
                  className={cn(
                    "h-full rounded-full",
                    item.color || "bg-gradient-to-r from-blue-500 to-blue-600"
                  )}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Animated Line Chart Component
interface LineChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color?: string
  }[]
}

export function AnimatedLineChart({ data, title, subtitle }: { data: LineChartData; title: string; subtitle?: string }) {
  const maxValue = Math.max(...data.datasets.flatMap(d => d.data))
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {subtitle && <CardDescription>{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="relative h-48">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full border-t border-gray-100 dark:border-gray-800" />
            ))}
          </div>
          
          {/* Y-axis labels */}
          <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground">
            <span>{maxValue.toLocaleString()}</span>
            <span>{(maxValue * 0.75).toLocaleString()}</span>
            <span>{(maxValue * 0.5).toLocaleString()}</span>
            <span>{(maxValue * 0.25).toLocaleString()}</span>
            <span>0</span>
          </div>
          
          {/* Chart lines */}
          <div className="absolute inset-0 ml-4">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {data.datasets.map((dataset, datasetIndex) => {
                const points = dataset.data.map((value, i) => ({
                  x: (i / (dataset.data.length - 1)) * 100,
                  y: 100 - (value / maxValue) * 100
                }))
                const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
                
                return (
                  <motion.path
                    key={dataset.label}
                    d={pathD}
                    fill="none"
                    stroke={dataset.color || '#3b82f6'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, delay: datasetIndex * 0.2 }}
                  />
                )
              })}
            </svg>
            
            {/* Data points */}
            {data.datasets.map((dataset, datasetIndex) => 
              dataset.data.map((value, i) => {
                const x = (i / (dataset.data.length - 1)) * 100
                const y = 100 - (value / maxValue) * 100
                return (
                  <motion.circle
                    key={`${datasetIndex}-${i}`}
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="3"
                    fill={dataset.color || '#3b82f6'}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.5 + i * 0.1 }}
                  />
                )
              })
            )}
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4">
          {data.datasets.map((dataset, index) => (
            <div key={dataset.label} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: dataset.color || (index === 0 ? '#3b82f6' : '#10b981') }}
              />
              <span className="text-sm text-muted-foreground">{dataset.label}</span>
            </div>
          ))}
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          {data.labels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Donut Chart Component
interface DonutChartData {
  label: string
  value: number
  color: string
}

export function AnimatedDonutChart({ 
  data, 
  title, 
  centerValue,
  centerLabel 
}: { 
  data: DonutChartData[]; 
  title: string;
  centerValue?: string;
  centerLabel?: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  let currentOffset = 0
  
  const circumference = 2 * Math.PI * 40 // radius 40
  const dataWithOffsets = data.map(item => {
    const percentage = item.value / total
    const length = percentage * circumference
    const offset = currentOffset
    currentOffset += length
    return { ...item, offset, length, percentage }
  })

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            {/* Donut chart */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {dataWithOffsets.map((item, index) => (
                <motion.circle
                  key={item.label}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="12"
                  strokeDasharray={`${item.length} ${circumference - item.length}`}
                  strokeDashoffset={-item.offset}
                  initial={{ strokeDasharray: `0 ${circumference}` }}
                  animate={{ strokeDasharray: `${item.length} ${circumference - item.length}` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="transition-all hover:opacity-80"
                />
              ))}
            </svg>
            
            {/* Center text */}
            {(centerValue || centerLabel) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {centerValue && (
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-2xl font-bold"
                  >
                    {centerValue}
                  </motion.span>
                )}
                {centerLabel && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-xs text-muted-foreground"
                  >
                    {centerLabel}
                  </motion.span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-2"
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-semibold ml-auto">
                {((item.value / total) * 100).toFixed(0)}%
              </span>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Mini Stat Card with Sparkline
export function StatCardWithSparkline({
  title,
  value,
  prefix,
  suffix,
  icon: Icon,
  trend,
  trendValue,
  sparklineData,
  color = 'blue',
  href
}: {
  title: string
  value: number
  prefix?: string
  suffix?: string
  icon: any
  trend?: 'up' | 'down'
  trendValue?: string
  sparklineData?: number[]
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  href: string
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600'
  }
  
  const iconBgColors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    green: 'bg-emerald-100 dark:bg-emerald-900/30',
    orange: 'bg-orange-100 dark:bg-orange-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    red: 'bg-red-100 dark:bg-red-900/30'
  }
  
  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-emerald-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    red: 'text-red-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <a href={href}>
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer h-full border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{prefix}</span>
                  <motion.span 
                    key={value}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-bold"
                  >
                    {value.toLocaleString()}
                  </motion.span>
                  <span className="text-2xl font-bold">{suffix}</span>
                </div>
                {trend && trendValue && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    trend === 'up' ? "text-emerald-600" : "text-red-600"
                  )}>
                    {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trendValue}
                  </div>
                )}
              </div>
              <div className={cn(
                "p-3 rounded-xl transition-transform duration-300 group-hover:scale-110",
                iconBgColors[color]
              )}>
                <Icon className={cn("w-6 h-6", iconColors[color])} />
              </div>
            </div>
            
            {/* Sparkline */}
            {sparklineData && sparklineData.length > 0 && (
              <div className="mt-4 h-8">
                <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <motion.path
                    d={`M 0 ${30 - sparklineData[0]} ${sparklineData.map((v, i) => `L ${(i / (sparklineData.length - 1)) * 100} ${30 - v}`).join(' ')}`}
                    fill="none"
                    stroke={color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : '#f59e0b'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1 }}
                  />
                </svg>
              </div>
            )}
          </CardContent>
          <div className={cn("h-1 w-full bg-gradient-to-r", colors[color])} />
        </Card>
      </a>
    </motion.div>
  )
}

export default {
  AnimatedBarChart,
  AnimatedLineChart,
  AnimatedDonutChart,
  StatCardWithSparkline
}
