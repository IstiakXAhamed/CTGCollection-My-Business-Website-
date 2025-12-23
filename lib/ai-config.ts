import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

export interface AIConfig {
  enabled: boolean
  features: {
    product_assist: boolean
    chat_assist: boolean
    review_moderation: boolean
    seo_generator: boolean
    analytics_insights: boolean
    [key: string]: boolean
  }
  maxTokens: number
  temperature: number
}

const AI_CONFIG_PATH = join(process.cwd(), 'data', 'ai-config.json')

export const DEFAULT_AI_CONFIG: AIConfig = {
  enabled: true,
  features: {
    product_assist: true,
    chat_assist: false,
    review_moderation: false,
    seo_generator: false,
    analytics_insights: false,
  },
  maxTokens: 1024,
  temperature: 0.7,
}

export function readAIConfig(): AIConfig {
  try {
    if (existsSync(AI_CONFIG_PATH)) {
      const data = readFileSync(AI_CONFIG_PATH, 'utf-8')
      const parsed = JSON.parse(data)
      return { ...DEFAULT_AI_CONFIG, ...parsed }
    }
  } catch (e) {
    console.error('Failed to read AI config:', e)
  }
  
  return DEFAULT_AI_CONFIG
}

export function writeAIConfig(config: AIConfig): boolean {
  try {
    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'data')
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true })
    }
    writeFileSync(AI_CONFIG_PATH, JSON.stringify(config, null, 2))
    return true
  } catch (e) {
    console.error('Failed to write AI config:', e)
    return false
  }
}
