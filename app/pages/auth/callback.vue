<script setup lang="ts">
useSeoMeta({
  title: 'Verifying... - DevProfile AI'
})

const supabase = useSupabaseClient()
const router = useRouter()
const route = useRoute()
const toast = useToast()

onMounted(async () => {
  // Handle OAuth callback (GitHub, etc.) - has code in URL hash or query
  const hashParams = new URLSearchParams(window.location.hash.substring(1))
  const hasOAuthTokens = hashParams.has('access_token') || route.query.code
  
  if (hasOAuthTokens) {
    // OAuth flow - Supabase handles this automatically
    // Just wait for session to be established
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      toast.add({
        title: 'Welcome!',
        description: 'Successfully connected with GitHub.',
        color: 'success'
      })
      await router.replace('/developer/repositories')
      return
    }
  }
  
  // Handle magic link callback (has token_hash in query)
  if (route.query.token_hash) {
    const { error, data } = await supabase.auth.verifyOtp({
      type: 'email',
      token_hash: route.query.token_hash as string
    })
    
    if (error) {
      toast.add({
        title: 'Verification failed',
        description: error.message,
        color: 'error'
      })
      await router.replace('/auth/login')
      return
    }
    
    if (data.user) {
      toast.add({
        title: 'Welcome!',
        description: 'Successfully logged in.',
        color: 'success'
      })
      await router.replace('/developer')
      return
    }
  }
  
  // No valid callback params - redirect to login
  await router.replace('/auth/login')
})
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="text-center">
      <UIcon 
        name="i-lucide-loader-2" 
        class="w-12 h-12 text-primary mx-auto mb-4 animate-spin" 
      />
      <h1 class="text-xl font-semibold">Verifying your login...</h1>
      <p class="text-muted mt-2">Please wait while we sign you in.</p>
    </div>
  </div>
</template>
