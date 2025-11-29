import { createError } from 'h3'
import { z } from 'zod'
import { createProjectAnalysisService } from '../../services/ProjectAnalysisLLMService'
import { fetchRepositoryData } from '../../utils/githubService'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// Request schema
const analyzeBodySchema = z.object({
  repoUrl: z.string().url('Invalid repository URL'),
  githubUsername: z.string().min(1, 'GitHub username required'),
  branch: z.string().default('main')
})

/**
 * Start repository analysis
 * 
 * POST /api/analyze/:id
 * Params: id = repository ID (UUID)
 * Body: { repoUrl, githubUsername, branch }
 */
export default defineEventHandler(async (event) => {
  const startTime = Date.now()

  try {
    // Get repository ID from params
    const repositoryId = getRouterParam(event, 'id')
    if (!repositoryId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Repository ID is required'
      })
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(repositoryId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid repository ID format'
      })
    }

    // Get authenticated user
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    // Parse and validate body
    const body = await readBody(event)
    const validated = analyzeBodySchema.safeParse(body)

    if (!validated.success) {
      throw createError({
        statusCode: 400,
        statusMessage: validated.error.issues.map((e: { message: string }) => e.message).join(', ')
      })
    }

    const { repoUrl, githubUsername, branch } = validated.data

    console.log(`🔄 Starting analysis for repository: ${repositoryId}`)
    console.log(`📦 Repo: ${repoUrl}, User: ${githubUsername}, Branch: ${branch}`)

    // Get Supabase client
    const supabase = await serverSupabaseClient(event)

    // Get GitHub token from session for private repo access
    const { data: sessionData } = await supabase.auth.getSession()
    const githubToken = sessionData.session?.provider_token || undefined

    // Verify repository belongs to user
    const { data: repository, error: repoError } = await supabase
      .from('github_repositories')
      .select('*, developer_profiles!inner(user_id)')
      .eq('id', repositoryId)
      .single()

    if (repoError || !repository) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Repository not found'
      })
    }

    if (repository.developer_profiles.user_id !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }

    // Update repository status to processing
    await supabase
      .from('github_repositories')
      .update({
        analysis_status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', repositoryId)

    try {
      // Fetch repository data from GitHub (with token for private repos)
      console.log(`📥 Fetching GitHub data...`)
      const repoData = await fetchRepositoryData(repoUrl, githubUsername, githubToken)

      // Initialize LLM service
      console.log(`🤖 Initializing AI service...`)
      const llmService = await createProjectAnalysisService(event)

      // Run analysis
      console.log(`🔍 Running AI analysis...`)
      const analysisResult = await llmService.analyzeRepository(
        repoData.repoName,
        repoData.gitStats,
        repoData.packageJson || undefined,
        repoData.readme || undefined,
        repoData.fileStructure
      )

      // Delete existing analysis for this repository (if any)
      await supabase
        .from('project_analyses')
        .delete()
        .eq('repository_id', repositoryId)

      // Save new analysis to database
      console.log(`💾 Saving analysis results...`)
      const { data: analysis, error: analysisError } = await supabase
        .from('project_analyses')
        .insert({
          repository_id: repositoryId,
          developer_profile_id: repository.developer_profile_id,
          project_scale: analysisResult.project_scale,
          total_commits: repoData.gitStats.total_commits,
          lines_added: repoData.gitStats.lines_added,
          lines_deleted: repoData.gitStats.lines_deleted,
          files_changed: repoData.gitStats.files_changed,
          project_duration_days: repoData.gitStats.project_duration_days,
          first_commit_date: repoData.gitStats.first_commit_date,
          last_commit_date: repoData.gitStats.last_commit_date,
          analysis_data: analysisResult,
          tokens_used: analysisResult.actual_tokens,
          status: 'completed'
        })
        .select()
        .single()

      if (analysisError) {
        console.error('Failed to save analysis:', analysisError)
        throw new Error('Failed to save analysis results')
      }

      // Update repository status to completed
      await supabase
        .from('github_repositories')
        .update({
          analysis_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', repositoryId)

      const elapsedTime = Date.now() - startTime

      console.log(`✅ Analysis completed in ${elapsedTime}ms`)

      return {
        success: true,
        data: {
          analysis_id: analysis.id,
          repository_id: repositoryId,
          project_scale: analysisResult.project_scale,
          total_commits: repoData.gitStats.total_commits,
          achievements_count: analysisResult.key_achievements.length,
          resume_points_count: analysisResult.resume_points.length,
          tokens_used: analysisResult.actual_tokens,
          elapsed_ms: elapsedTime,
          
          // Include full analysis data
          analysis: analysisResult
        },
        metadata: {
          provider: llmService.getProviderInfo(),
          timestamp: new Date().toISOString()
        }
      }

    } catch (analysisError: any) {
      // Update repository status to failed
      await supabase
        .from('github_repositories')
        .update({
          analysis_status: 'failed',
          error_message: analysisError.message,
          updated_at: new Date().toISOString()
        })
        .eq('id', repositoryId)

      throw analysisError
    }

  } catch (error: any) {
    console.error('❌ Analysis failed:', error.message)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Analysis failed'
    })
  }
})
