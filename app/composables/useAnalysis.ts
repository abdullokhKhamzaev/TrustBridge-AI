import type { ProjectAnalysisData } from '../../server/schemas/projectAnalysisSchemas'

/**
 * Composable for repository analysis operations
 */
export function useAnalysis() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Estimate analysis cost for a repository
   */
  async function estimateCost(repositoryId: string, repoUrl: string, githubUsername: string) {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/analyze/estimate', {
        method: 'POST',
        body: {
          repositoryId,
          repoUrl,
          githubUsername
        }
      })

      return response.data
    } catch (err: any) {
      error.value = err.data?.statusMessage || err.message || 'Failed to estimate cost'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Start repository analysis
   */
  async function startAnalysis(
    repositoryId: string,
    repoUrl: string,
    githubUsername: string,
    branch = 'main'
  ) {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch(`/api/analyze/${repositoryId}`, {
        method: 'POST',
        body: {
          repoUrl,
          githubUsername,
          branch
        }
      })

      return response.data
    } catch (err: any) {
      error.value = err.data?.statusMessage || err.message || 'Analysis failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get analysis result for a repository
   */
  async function getAnalysis(repositoryId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; data: RepositoryAnalysis }>(`/api/analyze/${repositoryId}`)

      return response.data
    } catch (err: any) {
      error.value = err.data?.statusMessage || err.message || 'Failed to get analysis'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    estimateCost,
    startAnalysis,
    getAnalysis
  }
}

// Type exports for components
export interface CostEstimate {
  repository_id: string
  repo_url: string
  repo_name: string
  estimated_input_tokens: number
  estimated_output_tokens: number
  estimated_total_tokens: number
  estimated_credits: number
  project_scale: string
  total_commits: number
  project_duration_days: number
  has_package_json: boolean
  has_readme: boolean
  file_count: number
  languages: string[]
  message: string
}

export interface AnalysisResult {
  analysis_id: string
  repository_id: string
  project_scale: string
  total_commits: number
  achievements_count: number
  resume_points_count: number
  tokens_used: number
  elapsed_ms: number
  analysis: ProjectAnalysisData
}

export interface RepositoryAnalysis {
  repository: {
    id: string
    repo_url: string
    repo_name: string
    repo_full_name: string
    owner_username: string
    default_branch: string
    description: string | null
    language: string | null
    analysis_status: string
    error_message: string | null
    created_at: string
    updated_at: string
  }
  developer: {
    full_name: string | null
    job_title: string | null
  }
  analysis: {
    id: string
    project_scale: string
    total_commits: number
    lines_added: number
    lines_deleted: number
    lines_changed: number
    files_changed: number
    project_duration_days: number
    first_commit_date: string | null
    last_commit_date: string | null
    tokens_used: number
    status: string
    created_at: string
    data: ProjectAnalysisData
  } | null
  has_analysis: boolean
  analysis_count: number
}
