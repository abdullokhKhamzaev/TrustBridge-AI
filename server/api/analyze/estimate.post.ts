import { createError } from 'h3'
import { estimateCostRequestSchema } from '../../schemas/projectAnalysisSchemas'
import { fetchRepositoryData, parseGitHubUrl } from '../../utils/githubService'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

/**
 * Estimate the cost (tokens/credits) for analyzing a repository
 * 
 * POST /api/analyze/estimate
 * Body: { repositoryId, repoUrl, githubUsername }
 */
export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    // Get GitHub token from session
    const supabase = await serverSupabaseClient(event)
    const { data: sessionData } = await supabase.auth.getSession()
    const githubToken = sessionData.session?.provider_token || undefined

    // Parse and validate request body
    const body = await readBody(event)
    const validated = estimateCostRequestSchema.safeParse(body)

    if (!validated.success) {
      throw createError({
        statusCode: 400,
        statusMessage: validated.error.issues.map((e: { message: string }) => e.message).join(', ')
      })
    }

    const { repositoryId, repoUrl, githubUsername } = validated.data

    console.log(`💰 Estimating analysis cost for: ${repoUrl}`)

    // Parse repo URL
    const parsed = parseGitHubUrl(repoUrl)
    if (!parsed) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid GitHub repository URL'
      })
    }

    // Fetch basic repo data for estimation (with GitHub token for private repos)
    const repoData = await fetchRepositoryData(repoUrl, githubUsername, githubToken)

    // Estimate tokens based on repository data
    const baseTokens = 2000 // Base prompt + schema
    const commitTokens = Math.min(repoData.gitStats.total_commits * 10, 2000)
    const configTokens = Object.keys(repoData.configFiles).length * 300
    const readmeTokens = repoData.readme ? Math.min(repoData.readme.length / 4, 1000) : 0
    const fileStructureTokens = Math.min(repoData.fileStructure.length * 5, 500)
    const outputTokens = 2000 // Estimated output

    const estimatedInputTokens = baseTokens + commitTokens + configTokens + readmeTokens + fileStructureTokens
    const estimatedTotalTokens = estimatedInputTokens + outputTokens

    // Calculate credits (1 credit = 1000 tokens)
    const estimatedCredits = Math.ceil(estimatedTotalTokens / 1000)

    // Determine project scale for display
    let projectScale = 'micro'
    const commits = repoData.gitStats.total_commits
    if (commits > 500) projectScale = 'enterprise'
    else if (commits > 150) projectScale = 'large'
    else if (commits > 50) projectScale = 'medium'
    else if (commits > 10) projectScale = 'small'

    // Detect config files found
    const configFilesFound = Object.keys(repoData.configFiles)

    return {
      success: true,
      data: {
        repository_id: repositoryId,
        repo_url: repoUrl,
        repo_name: repoData.repoName,
        
        // Cost estimation
        estimated_input_tokens: estimatedInputTokens,
        estimated_output_tokens: outputTokens,
        estimated_total_tokens: estimatedTotalTokens,
        estimated_credits: estimatedCredits,
        
        // Repository info
        project_scale: projectScale,
        total_commits: repoData.gitStats.total_commits,
        project_duration_days: repoData.gitStats.project_duration_days,
        config_files: configFilesFound,
        has_readme: !!repoData.readme,
        file_count: repoData.fileStructure.length,
        languages: Object.keys(repoData.gitStats.languages || {}).slice(0, 5),
        
        // User-friendly message
        message: `Repository analysis will use approximately ${estimatedCredits} credits (~${estimatedTotalTokens} tokens). Project scale: ${projectScale}.`
      }
    }

  } catch (error: any) {
    console.error('❌ Cost estimation failed:', error.message)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to estimate analysis cost'
    })
  }
})
