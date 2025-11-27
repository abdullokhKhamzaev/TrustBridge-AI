<script setup lang="ts">
useSeoMeta({
  title: 'Sign In - DevProfile AI'
})

const { loading, error, linkSent, sendMagicLink, loginWithGitHub, reset } = useAuth()

const email = ref('')

async function handleSubmit() {
  await sendMagicLink(email.value)
}

// Reset state when component mounts
onMounted(() => {
  reset()
})
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-elevated border border-default rounded-xl shadow-lg">
      <!-- Header -->
      <div class="text-center p-6 border-b border-default">
        <UIcon name="i-lucide-code-2" class="w-12 h-12 text-primary mx-auto mb-2" />
        <h1 class="text-2xl font-bold">Welcome to DevProfile AI</h1>
        <p class="text-muted mt-1">Enter your email to sign in or create an account</p>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Success state: Magic link sent -->
        <div v-if="linkSent" class="space-y-4">
          <div class="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
            <UIcon name="i-lucide-mail-check" class="w-12 h-12 text-green-500 mx-auto mb-2" />
            <h3 class="font-semibold text-lg">Check your email!</h3>
            <p class="text-sm text-muted mt-1">
              We sent a magic link to <strong>{{ email }}</strong>
            </p>
            <p class="text-sm text-muted mt-2">
              Click the link in the email to sign in.
            </p>
          </div>

          <UButton
            variant="ghost"
            block
            @click="reset()"
          >
            Use a different email
          </UButton>
        </div>

        <!-- Form state -->
        <div v-else>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Email</label>
              <UInput
                v-model="email"
                type="email"
                placeholder="you@example.com"
                icon="i-lucide-mail"
                size="lg"
                :disabled="loading"
              />
            </div>

            <p v-if="error" class="text-sm text-red-500">
              {{ error }}
            </p>

            <UButton
              type="submit"
              size="lg"
              block
              :loading="loading"
              :disabled="!email"
            >
              <UIcon name="i-lucide-sparkles" class="w-4 h-4 mr-2" />
              Send Magic Link
            </UButton>
          </form>

          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-default" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="bg-elevated px-2 text-muted">or continue with</span>
            </div>
          </div>

          <UButton
            variant="outline"
            size="lg"
            block
            icon="i-simple-icons-github"
            :loading="loading"
            @click="loginWithGitHub"
          >
            Continue with GitHub
          </UButton>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-4 border-t border-default">
        <p class="text-center text-xs text-muted">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  </div>
</template>
