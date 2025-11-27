import type { DeveloperProfile, DeveloperProfileUpdate } from '~/types/database'

export const useDeveloperProfile = () => {
  const supabase = useSupabaseClient<any>()
  const user = useSupabaseUser()

  const profile = ref<DeveloperProfile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Fetch current user's profile
   */
  const fetchProfile = async () => {
    if (!user.value) return null

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('developer_profiles')
        .select('*')
        .eq('user_id', user.value.id)
        .single()

      if (fetchError) {
        // Profile not found is not an error - it will be created by trigger
        if (fetchError.code === 'PGRST116') {
          profile.value = null
          return null
        }
        throw fetchError
      }

      profile.value = data
      return data
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update profile
   */
  const updateProfile = async (updates: DeveloperProfileUpdate) => {
    if (!user.value || !profile.value) {
      error.value = 'No user or profile found'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('developer_profiles')
        .update(updates)
        .eq('id', profile.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      profile.value = data
      return data
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if profile is complete (has required fields)
   */
  const isProfileComplete = computed(() => {
    if (!profile.value) return false
    return !!(
      profile.value.full_name &&
      profile.value.github_username
    )
  })

  /**
   * Get GitHub access token from session
   * This is provided by Supabase after GitHub OAuth
   */
  const getGitHubToken = async (): Promise<string | null> => {
    const { data } = await supabase.auth.getSession()
    return data.session?.provider_token || null
  }

  // Auto-fetch profile when user changes
  watch(user, async (newUser) => {
    if (newUser) {
      await fetchProfile()
    } else {
      profile.value = null
    }
  }, { immediate: true })

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile,
    isProfileComplete,
    getGitHubToken
  }
}
