import type { H3Event } from 'h3'

export interface AIConfig {
  // Provider selection
  aiProvider: string

  // OpenAI
  openaiApiKey: string
  openaiModel: string
  openaiBaseUrl?: string

  // Anthropic
  anthropicApiKey: string
  anthropicModel: string

  // Gemini
  geminiApiKey: string
  geminiModel: string
}

/**
 * Service to manage AI configuration from runtime config
 * Provides multi-provider support for DevProfile AI
 */
export class AIConfigService {
  private config: AIConfig

  constructor(event?: H3Event) {
    const runtimeConfig = useRuntimeConfig(event)

    this.config = {
      // Provider selection
      aiProvider: runtimeConfig.aiProvider || 'openai',

      // OpenAI
      openaiApiKey: runtimeConfig.openaiApiKey || '',
      openaiModel: runtimeConfig.openaiModel || 'gpt-4o',
      openaiBaseUrl: runtimeConfig.openaiBaseUrl || undefined,

      // Anthropic
      anthropicApiKey: runtimeConfig.anthropicApiKey || '',
      anthropicModel: runtimeConfig.anthropicModel || 'claude-3-5-sonnet-20241022',

      // Gemini
      geminiApiKey: runtimeConfig.geminiApiKey || '',
      geminiModel: runtimeConfig.geminiModel || 'gemini-2.0-flash-exp'
    }
  }

  /**
   * Get the full AI configuration
   */
  getConfig(): AIConfig {
    return this.config
  }

  /**
   * Get the current LLM provider
   */
  getProvider(): string {
    return this.config.aiProvider
  }

  /**
   * Get configuration for a specific provider
   */
  getProviderConfig(provider?: string): { apiKey: string; model: string; baseUrl?: string } {
    const targetProvider = provider || this.config.aiProvider

    switch (targetProvider.toLowerCase()) {
      case 'openai':
        return {
          apiKey: this.config.openaiApiKey,
          model: this.config.openaiModel,
          baseUrl: this.config.openaiBaseUrl
        }

      case 'anthropic':
      case 'claude':
        return {
          apiKey: this.config.anthropicApiKey,
          model: this.config.anthropicModel
        }

      case 'gemini':
      case 'google':
        return {
          apiKey: this.config.geminiApiKey,
          model: this.config.geminiModel
        }

      default:
        return {
          apiKey: this.config.openaiApiKey,
          model: this.config.openaiModel
        }
    }
  }

  /**
   * Validate that required configuration is present for a provider
   */
  validateProviderConfig(provider?: string): { valid: boolean; errors: string[] } {
    const targetProvider = provider || this.config.aiProvider
    const errors: string[] = []

    switch (targetProvider.toLowerCase()) {
      case 'openai':
        if (!this.config.openaiApiKey) {
          errors.push('OpenAI API key is missing (OPENAI_API_KEY)')
        }
        break

      case 'anthropic':
      case 'claude':
        if (!this.config.anthropicApiKey) {
          errors.push('Anthropic API key is missing (ANTHROPIC_API_KEY)')
        }
        break

      case 'gemini':
      case 'google':
        if (!this.config.geminiApiKey) {
          errors.push('Gemini API key is missing (GEMINI_API_KEY)')
        }
        break

      default:
        errors.push(`Unknown provider: ${targetProvider}`)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

/**
 * Factory function to create AIConfigService instance
 */
export function createAIConfigService(event?: H3Event): AIConfigService {
  return new AIConfigService(event)
}
