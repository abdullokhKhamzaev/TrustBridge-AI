import type { GitHubRepository, GitHubRepositoryInsert } from '~/types/database'
import type { GitHubRepo } from '~/types/github'

export const useRepositories = () => {
  const supabase = useSupabaseClient<any>()
  const user = useSupabaseUser()
  const toast = useToast()

  const repositories = ref<GitHubRepository[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Get user's developer profile ID (auto-creates if not exists)
   */
  const getProfileId = async (): Promise<string | null> => {
    if (!user.value) return null

    // Try to get existing profile
    const { data: existing } = await supabase
      .from('developer_profiles')
      .select('id')
      .eq('user_id', user.value.id)
      .maybeSingle()

    if (existing?.id) return existing.id

    // Auto-create profile from user metadata
    const { data: created, error } = await supabase
      .from('developer_profiles')
      .insert({
        user_id: user.value.id,
        email: user.value.email,
        full_name: user.value.user_metadata?.full_name || user.value.user_metadata?.name,
        avatar_url: user.value.user_metadata?.avatar_url,
        github_username: user.value.user_metadata?.user_name,
        github_id: user.value.user_metadata?.provider_id
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to create profile:', error)
      return null
    }

    return created?.id || null
  }

  /**
   * Fetch all imported repositories for current user
   */
  const fetchRepositories = async () => {
    const profileId = await getProfileId()
    if (!profileId) return []

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('github_repositories')
        .select('*')
        .eq('developer_profile_id', profileId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      repositories.value = data || []
      return data || []
    } catch (e: any) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Import a GitHub repo to our database
   */
  const importRepository = async (githubRepo: GitHubRepo): Promise<GitHubRepository | null> => {
    const profileId = await getProfileId()
    if (!profileId) {
      error.value = 'Profile not found'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const repoData: GitHubRepositoryInsert = {
        developer_profile_id: profileId,
        github_repo_id: githubRepo.id,
        repo_url: githubRepo.html_url,
        repo_name: githubRepo.name,
        repo_full_name: githubRepo.full_name,
        owner_username: githubRepo.owner.login,
        default_branch: githubRepo.default_branch,
        description: githubRepo.description,
        language: githubRepo.language,
        topics: githubRepo.topics,
        stars_count: githubRepo.stargazers_count,
        forks_count: githubRepo.forks_count,
        watchers_count: githubRepo.watchers_count,
        is_fork: githubRepo.fork,
        is_private: githubRepo.private,
        analysis_status: 'not_analyzed',
        repo_created_at: githubRepo.created_at,
        repo_updated_at: githubRepo.updated_at,
        repo_pushed_at: githubRepo.pushed_at
      }

      const { data, error: insertError } = await supabase
        .from('github_repositories')
        .insert(repoData)
        .select()
        .single()

      if (insertError) {
        // Duplicate check
        if (insertError.code === '23505') {
          toast.add({
            title: 'Already imported',
            description: `${githubRepo.name} is already in your list`,
            color: 'warning'
          })
          return null
        }
        throw insertError
      }

      // Add to local list
      repositories.value.unshift(data)

      toast.add({
        title: 'Repository imported',
        description: `${githubRepo.name} added successfully`,
        color: 'success'
      })

      return data
    } catch (e: any) {
      error.value = e.message
      toast.add({
        title: 'Import failed',
        description: e.message,
        color: 'error'
      })
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Import multiple repositories
   */
  const importRepositories = async (githubRepos: GitHubRepo[]): Promise<number> => {
    let imported = 0

    for (const repo of githubRepos) {
      const result = await importRepository(repo)
      if (result) imported++
    }

    return imported
  }

  /**
   * Remove repository from our database
   */
  const removeRepository = async (repoId: string): Promise<boolean> => {
    loading.value = true
    error.value = null

    try {
      const { error: deleteError } = await supabase
        .from('github_repositories')
        .delete()
        .eq('id', repoId)

      if (deleteError) throw deleteError

      // Remove from local list
      repositories.value = repositories.value.filter(r => r.id !== repoId)

      toast.add({
        title: 'Repository removed',
        color: 'success'
      })

      return true
    } catch (e: any) {
      error.value = e.message
      toast.add({
        title: 'Remove failed',
        description: e.message,
        color: 'error'
      })
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if a GitHub repo is already imported
   */
  const isImported = (githubRepoId: number): boolean => {
    return repositories.value.some(r => r.github_repo_id === githubRepoId)
  }

  /**
   * Get repository by ID
   */
  const getRepository = (id: string): GitHubRepository | undefined => {
    return repositories.value.find(r => r.id === id)
  }

  return {
    repositories,
    loading,
    error,
    fetchRepositories,
    importRepository,
    importRepositories,
    removeRepository,
    isImported,
    getRepository
  }
}
