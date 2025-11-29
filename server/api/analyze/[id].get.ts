import { createError } from 'h3'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

/**
 * Get analysis result for a repository
 * 
 * GET /api/analyze/:id
 * Params: id = repository ID (UUID)
 */
export default defineEventHandler(async (event) => {
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

    // Get Supabase client
    const supabase = await serverSupabaseClient(event)

    // Get repository with latest analysis
    const { data: repository, error: repoError } = await supabase
      .from('github_repositories')
      .select(`
        *,
        developer_profiles!inner(user_id, full_name, job_title),
        project_analyses(
          id,
          project_scale,
          total_commits,
          lines_added,
          lines_deleted,
          files_changed,
          project_duration_days,
          first_commit_date,
          last_commit_date,
          analysis_data,
          tokens_used,
          status,
          created_at,
          updated_at
        )
      `)
      .eq('id', repositoryId)
      .order('created_at', { foreignTable: 'project_analyses', ascending: false })
      .single()

    if (repoError || !repository) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Repository not found'
      })
    }

    // Verify ownership
    if (repository.developer_profiles.user_id !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }

    // Get latest analysis
    const latestAnalysis = repository.project_analyses?.[0] || null

    return {
      success: true,
      data: {
      repository: {
          id: repository.id,
          repo_url: repository.repo_url,
          repo_name: repository.repo_name,
          repo_full_name: repository.repo_full_name,
          owner_username: repository.owner_username,
          default_branch: repository.default_branch,
          description: repository.description,
          language: repository.language,
          analysis_status: repository.analysis_status,
          error_message: repository.error_message,
          created_at: repository.created_at,
          updated_at: repository.updated_at
        },
        developer: {
          full_name: repository.developer_profiles.full_name,
          job_title: repository.developer_profiles.job_title
        },
        analysis: latestAnalysis ? {
          id: latestAnalysis.id,
          project_scale: latestAnalysis.project_scale,
          total_commits: latestAnalysis.total_commits,
          lines_added: latestAnalysis.lines_added,
          lines_deleted: latestAnalysis.lines_deleted,
          lines_changed: (latestAnalysis.lines_added || 0) + (latestAnalysis.lines_deleted || 0),
          files_changed: latestAnalysis.files_changed,
          project_duration_days: latestAnalysis.project_duration_days,
          first_commit_date: latestAnalysis.first_commit_date,
          last_commit_date: latestAnalysis.last_commit_date,
          tokens_used: latestAnalysis.tokens_used,
          status: latestAnalysis.status,
          created_at: latestAnalysis.created_at,
          
          // Full analysis data
          data: latestAnalysis.analysis_data
        } : null,
        has_analysis: !!latestAnalysis,
        analysis_count: repository.project_analyses?.length || 0
      }
    }

  } catch (error: any) {
    console.error('❌ Failed to get analysis:', error.message)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to get analysis'
    })
  }
})
