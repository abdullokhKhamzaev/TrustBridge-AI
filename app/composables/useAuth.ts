export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const toast = useToast()
  const config = useRuntimeConfig()

  const loading = ref(false)
  const error = ref<string | null>(null)
  const linkSent = ref(false)

  /**
   * Send magic link to email
   */
  const sendMagicLink = async (email: string) => {
    if (!email) {
      error.value = 'Email is required'
      return false
    }

    loading.value = true
    error.value = null

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${config.public.siteUrl || window.location.origin}/auth/callback`,
          shouldCreateUser: true
        }
      })

      if (authError) {
        error.value = authError.message
        toast.add({
          title: 'Error',
          description: authError.message,
          color: 'error'
        })
        return false
      }

      linkSent.value = true
      toast.add({
        title: 'Magic link sent!',
        description: 'Check your email for the login link.',
        color: 'success'
      })
      return true
    } catch (e: any) {
      error.value = e.message || 'Failed to send magic link'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Handle magic link callback (verify OTP token)
   */
  const handleMagicLinkCallback = async () => {
    const route = useRoute()
    const router = useRouter()

    // Check for token_hash in URL (Supabase magic link format)
    if (route.query.token_hash) {
      loading.value = true

      try {
        const { error: verifyError, data } = await supabase.auth.verifyOtp({
          type: 'email',
          token_hash: route.query.token_hash as string
        })

        if (verifyError) {
          toast.add({
            title: 'Verification failed',
            description: verifyError.message,
            color: 'error'
          })
          await router.replace('/auth/login')
          return false
        }

        if (data.user) {
          toast.add({
            title: 'Welcome!',
            description: 'You have successfully logged in.',
            color: 'success'
          })
          await router.replace('/developer')
          return true
        }
      } catch (e: any) {
        error.value = e.message
      } finally {
        loading.value = false
      }
    }

    return false
  }

  /**
   * Sign out
   */
  const signOut = async () => {
    loading.value = true

    try {
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        toast.add({
          title: 'Error',
          description: signOutError.message,
          color: 'error'
        })
        return false
      }

      toast.add({
        title: 'Signed out',
        description: 'You have been signed out.',
        color: 'success'
      })

      await navigateTo('/')
      return true
    } finally {
      loading.value = false
    }
  }

  /**
   * Login with GitHub OAuth
   * Requests 'repo' scope to access user's repositories
   */
  const loginWithGitHub = async () => {
    loading.value = true
    error.value = null

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${config.public.siteUrl || window.location.origin}/auth/callback`,
          scopes: 'repo read:user'
        }
      })

      if (authError) {
        error.value = authError.message
        toast.add({
          title: 'GitHub login failed',
          description: authError.message,
          color: 'error'
        })
      }
    } catch (e: any) {
      error.value = e.message || 'GitHub login failed'
    } finally {
      loading.value = false
    }
  }

  /**
   * Reset state
   */
  const reset = () => {
    error.value = null
    linkSent.value = false
  }

  return {
    user,
    loading,
    error,
    linkSent,
    sendMagicLink,
    handleMagicLinkCallback,
    signOut,
    loginWithGitHub,
    reset
  }
}
