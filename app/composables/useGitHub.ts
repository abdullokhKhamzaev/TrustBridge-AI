import type { GitHubRepo, GitHubUser, FetchReposOptions } from '~/types/github'

const GITHUB_API = 'https://api.github.com'

export const useGitHub = () => {
  const supabase = useSupabaseClient()

  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Get GitHub access token from current session
   */
  const getToken = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession()
    return data.session?.provider_token || null
  }

  /**
   * Check if user is connected to GitHub
   * First checks for active token, then falls back to checking profile
   */
  const isGitHubConnected = async (): Promise<boolean> => {
    // First try token (for fresh sessions)
    const token = await getToken()
    if (token) return true
    
    // Fallback: check if user has github_username in profile
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    
    const { data: profile } = await supabase
      .from('developer_profiles')
      .select('github_username')
      .eq('user_id', user.id)
      .single()
    
    return !!profile?.github_username
  }

  /**
   * Make authenticated request to GitHub API
   */
  const fetchGitHub = async <T>(endpoint: string): Promise<T | null> => {
    const token = await getToken()

    if (!token) {
      error.value = 'GitHub not connected. Please connect your GitHub account.'
      return null
    }

    try {
      const response = await fetch(`${GITHUB_API}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          error.value = 'GitHub session expired. Please reconnect your GitHub account.'
        } else if (response.status === 403) {
          error.value = 'GitHub API rate limit exceeded. Please try again later.'
        } else {
          error.value = `GitHub API error: ${response.statusText}`
        }
        return null
      }

      return await response.json()
    } catch (e: any) {
      error.value = e.message || 'Failed to fetch from GitHub'
      return null
    }
  }

  /**
   * Get authenticated user info from GitHub
   */
  const fetchGitHubUser = async (): Promise<GitHubUser | null> => {
    loading.value = true
    error.value = null

    try {
      return await fetchGitHub<GitHubUser>('/user')
    } finally {
      loading.value = false
    }
  }

  /**
   * Get user's repositories from GitHub
   */
  const fetchGitHubRepos = async (options: FetchReposOptions = {}): Promise<GitHubRepo[]> => {
    loading.value = true
    error.value = null

    const {
      type = 'owner',
      sort = 'pushed',
      direction = 'desc',
      per_page = 100,
      page = 1
    } = options

    try {
      const params = new URLSearchParams({
        type,
        sort,
        direction,
        per_page: per_page.toString(),
        page: page.toString()
      })

      const repos = await fetchGitHub<GitHubRepo[]>(`/user/repos?${params}`)
      return repos || []
    } finally {
      loading.value = false
    }
  }

  /**
   * Get all repos (handles pagination automatically)
   */
  const fetchAllGitHubRepos = async (): Promise<GitHubRepo[]> => {
    loading.value = true
    error.value = null

    const allRepos: GitHubRepo[] = []
    let page = 1
    const perPage = 100

    try {
      while (true) {
        const repos = await fetchGitHubRepos({ page, per_page: perPage })

        if (repos.length === 0) break

        allRepos.push(...repos)

        if (repos.length < perPage) break

        page++
      }

      return allRepos
    } finally {
      loading.value = false
    }
  }

  /**
   * Get single repository details
   */
  const fetchGitHubRepo = async (owner: string, repo: string): Promise<GitHubRepo | null> => {
    loading.value = true
    error.value = null

    try {
      return await fetchGitHub<GitHubRepo>(`/repos/${owner}/${repo}`)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    isGitHubConnected,
    fetchGitHubUser,
    fetchGitHubRepos,
    fetchAllGitHubRepos,
    fetchGitHubRepo
  }
}
