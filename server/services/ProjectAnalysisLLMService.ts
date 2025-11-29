import type { H3Event } from 'h3'
import { readFileSync } from 'fs'
import { join } from 'path'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createAIConfigService } from './AIConfigService'
import { projectAnalysisDataSchema, type ProjectAnalysisData, type GitStats } from '../schemas/projectAnalysisSchemas'

/**
 * Service for GitHub repository analysis using LLM
 * Supports multiple AI providers: OpenAI, Anthropic, Gemini
 */
export class ProjectAnalysisLLMService {
  private event: H3Event
  private provider: string
  private model: string
  private openai?: OpenAI
  private anthropic?: Anthropic
  private gemini?: GoogleGenerativeAI

  private usageMetrics = {
    totalTokensUsed: 0,
    totalCalls: 0,
    totalErrors: 0,
    lastCallTokens: 0
  }

  constructor(event: H3Event) {
    this.event = event
    this.provider = 'openai'
    this.model = 'gpt-4o'
  }

  /**
   * Initialize the LLM service
   */
  async init(): Promise<void> {
    const aiConfigService = createAIConfigService(this.event)
    const config = aiConfigService.getConfig()
    const providerConfig = aiConfigService.getProviderConfig()

    // Validate configuration
    const validation = aiConfigService.validateProviderConfig()
    if (!validation.valid) {
      throw new Error(`AI Configuration Error: ${validation.errors.join(', ')}`)
    }

    this.provider = config.aiProvider
    this.model = providerConfig.model

    // Initialize provider client
    switch (this.provider.toLowerCase()) {
      case 'openai':
        this.openai = new OpenAI({
          apiKey: providerConfig.apiKey,
          baseURL: providerConfig.baseUrl
        })
        break

      case 'anthropic':
      case 'claude':
        this.anthropic = new Anthropic({
          apiKey: providerConfig.apiKey
        })
        break

      case 'gemini':
      case 'google':
        this.gemini = new GoogleGenerativeAI(providerConfig.apiKey)
        break

      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`)
    }

    console.log(`✅ AI Service initialized: ${this.provider} (${this.model})`)
  }

  /**
   * Analyze a GitHub repository
   */
  async analyzeRepository(
    repoName: string,
    gitStats: GitStats,
    packageJson?: Record<string, any>,
    readmeContent?: string,
    fileStructure?: string[],
    options: {
      onProgress?: (data: any) => void
      abortSignal?: AbortSignal
    } = {}
  ): Promise<ProjectAnalysisData> {
    console.log(`🔄 Starting repository analysis: ${repoName}`)

    const startTime = Date.now()

    try {
      // Load prompt
      const systemPrompt = await this.loadPrompt()

      // Build analysis context
      const analysisContext = this.buildAnalysisContext(
        repoName,
        gitStats,
        packageJson,
        readmeContent,
        fileStructure
      )

      // Report progress
      options.onProgress?.({
        stage: 'analyzing',
        percentage: 30,
        message: 'Analyzing repository structure...'
      })

      // Check for cancellation
      if (options.abortSignal?.aborted) {
        throw new Error('Analysis cancelled by user')
      }

      // Call LLM
      const result = await this.callLLM(systemPrompt, analysisContext, options)

      // Parse and validate response
      const analysisData = this.parseAndValidateResponse(result)

      // Track usage
      const elapsedTime = Date.now() - startTime
      const outputTokens = this.estimateTokens(JSON.stringify(analysisData))
      const inputTokens = this.estimateTokens(analysisContext)
      this.trackUsage(inputTokens + outputTokens, elapsedTime)

      // Add actual tokens
      analysisData.actual_tokens = inputTokens + outputTokens

      console.log(`✅ Repository analysis completed: ${repoName}`)
      return analysisData

    } catch (error: any) {
      this.usageMetrics.totalErrors++
      console.error(`❌ Repository analysis failed:`, error.message)
      throw error
    }
  }

  /**
   * Build analysis context from repository data
   */
  private buildAnalysisContext(
    repoName: string,
    gitStats: GitStats,
    packageJson?: Record<string, any>,
    readmeContent?: string,
    fileStructure?: string[]
  ): string {
    let context = `## Repository: ${repoName}\n\n`

    // Git Statistics
    context += `## Git Statistics\n`
    context += `- Total Commits: ${gitStats.total_commits}\n`
    context += `- Lines Added: ${gitStats.lines_added}\n`
    context += `- Lines Deleted: ${gitStats.lines_deleted}\n`
    context += `- Files Changed: ${gitStats.files_changed}\n`
    context += `- Project Duration: ${gitStats.project_duration_days} days\n`

    if (gitStats.first_commit_date) {
      context += `- First Commit: ${gitStats.first_commit_date}\n`
    }
    if (gitStats.last_commit_date) {
      context += `- Last Commit: ${gitStats.last_commit_date}\n`
    }
    if (gitStats.contributors) {
      context += `- Contributors: ${gitStats.contributors}\n`
    }

    // Languages
    if (gitStats.languages && Object.keys(gitStats.languages).length > 0) {
      context += `\n## Languages\n`
      const sortedLangs = Object.entries(gitStats.languages)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
      for (const [lang, bytes] of sortedLangs) {
        context += `- ${lang}: ${Math.round((bytes as number) / 1024)}KB\n`
      }
    }

    // Package.json analysis
    if (packageJson) {
      context += `\n## package.json\n`
      if (packageJson.name) context += `- Name: ${packageJson.name}\n`
      if (packageJson.description) context += `- Description: ${packageJson.description}\n`
      if (packageJson.version) context += `- Version: ${packageJson.version}\n`

      if (packageJson.dependencies) {
        context += `\n### Dependencies\n`
        context += `\`\`\`json\n${JSON.stringify(packageJson.dependencies, null, 2)}\n\`\`\`\n`
      }

      if (packageJson.devDependencies) {
        context += `\n### Dev Dependencies\n`
        context += `\`\`\`json\n${JSON.stringify(packageJson.devDependencies, null, 2)}\n\`\`\`\n`
      }

      if (packageJson.scripts) {
        context += `\n### Scripts\n`
        context += `\`\`\`json\n${JSON.stringify(packageJson.scripts, null, 2)}\n\`\`\`\n`
      }
    }

    // README
    if (readmeContent) {
      // Truncate if too long
      const maxReadme = 3000
      const truncatedReadme = readmeContent.length > maxReadme
        ? readmeContent.substring(0, maxReadme) + '\n\n[... truncated ...]'
        : readmeContent

      context += `\n## README.md\n`
      context += `\`\`\`markdown\n${truncatedReadme}\n\`\`\`\n`
    }

    // File structure
    if (fileStructure && fileStructure.length > 0) {
      context += `\n## File Structure (sample)\n`
      const sampleFiles = fileStructure.slice(0, 50)
      for (const file of sampleFiles) {
        context += `- ${file}\n`
      }
      if (fileStructure.length > 50) {
        context += `- ... and ${fileStructure.length - 50} more files\n`
      }
    }

    return context
  }

  /**
   * Call LLM based on provider
   */
  private async callLLM(
    systemPrompt: string,
    userPrompt: string,
    options: { abortSignal?: AbortSignal } = {}
  ): Promise<string> {
    switch (this.provider.toLowerCase()) {
      case 'openai':
        return this.callOpenAI(systemPrompt, userPrompt, options)

      case 'anthropic':
      case 'claude':
        return this.callAnthropic(systemPrompt, userPrompt, options)

      case 'gemini':
      case 'google':
        return this.callGemini(systemPrompt, userPrompt)

      default:
        throw new Error(`Unsupported provider: ${this.provider}`)
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(
    systemPrompt: string,
    userPrompt: string,
    options: { abortSignal?: AbortSignal } = {}
  ): Promise<string> {
    if (!this.openai) throw new Error('OpenAI client not initialized')

    const response = await this.openai.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    }, {
      signal: options.abortSignal
    })

    return response.choices[0]?.message?.content || ''
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic(
    systemPrompt: string,
    userPrompt: string,
    options: { abortSignal?: AbortSignal } = {}
  ): Promise<string> {
    if (!this.anthropic) throw new Error('Anthropic client not initialized')

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt + '\n\nRespond with a valid JSON object only.' }
      ]
    })

    const textBlock = response.content.find(block => block.type === 'text')
    return textBlock?.type === 'text' ? textBlock.text : ''
  }

  /**
   * Call Gemini API
   */
  private async callGemini(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    if (!this.gemini) throw new Error('Gemini client not initialized')

    const model = this.gemini.getGenerativeModel({ model: this.model })

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\n${userPrompt}\n\nRespond with a valid JSON object only.` }]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4000,
        responseMimeType: 'application/json'
      }
    })

    return result.response.text()
  }

  /**
   * Parse and validate LLM response
   */
  private parseAndValidateResponse(response: string): ProjectAnalysisData {
    // Extract JSON from response
    let jsonStr = response.trim()

    // Handle markdown code blocks
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (jsonMatch && jsonMatch[1]) {
      jsonStr = jsonMatch[1]
    }

    // Parse JSON
    let parsed: any
    try {
      parsed = JSON.parse(jsonStr)
    } catch (e) {
      console.error('Failed to parse LLM response as JSON:', jsonStr.substring(0, 500))
      throw new Error('Invalid JSON response from AI')
    }

    // Validate with Zod schema
    const validated = projectAnalysisDataSchema.safeParse(parsed)

    if (!validated.success) {
      console.error('Schema validation failed:', validated.error.issues)
      throw new Error(`Schema validation failed: ${validated.error.issues.map((e: { message: string }) => e.message).join(', ')}`)
    }

    return validated.data
  }

  /**
   * Load prompt from file
   */
  private async loadPrompt(): Promise<string> {
    try {
      const promptPath = join(process.cwd(), 'server/prompts/PROJECT_ANALYSIS_PROMPT.md')
      return readFileSync(promptPath, 'utf-8')
    } catch (error) {
      console.error('Failed to load prompt file:', error)
      throw new Error('PROJECT_ANALYSIS_PROMPT.md not found')
    }
  }

  /**
   * Estimate token count
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4)
  }

  /**
   * Track usage metrics
   */
  private trackUsage(tokens: number, elapsedTime: number): void {
    this.usageMetrics.totalTokensUsed += tokens
    this.usageMetrics.totalCalls++
    this.usageMetrics.lastCallTokens = tokens

    console.log(`📊 Usage: ${tokens} tokens, ${elapsedTime}ms, Total: ${this.usageMetrics.totalTokensUsed}`)
  }

  /**
   * Get current usage metrics
   */
  getUsageMetrics() {
    return { ...this.usageMetrics }
  }

  /**
   * Get provider info
   */
  getProviderInfo() {
    return {
      provider: this.provider,
      model: this.model
    }
  }
}

/**
 * Create and initialize ProjectAnalysisLLMService
 */
export async function createProjectAnalysisService(event: H3Event): Promise<ProjectAnalysisLLMService> {
  const service = new ProjectAnalysisLLMService(event)
  await service.init()
  return service
}
