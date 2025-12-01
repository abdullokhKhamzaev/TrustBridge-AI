<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Trust Bridge'
const description = 'Build connections based on verified skills, not self-reported claims. AI-powered credential verification for professionals and companies.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})

// Auth state
const user = useSupabaseUser()
const { signOut, loading } = useAuth()

// Color mode
const colorMode = useColorMode()
const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: () => colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
})

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' }
]

const authNavLinks = [
  { label: 'Dashboard', to: '/developer' },
  { label: 'Repositories', to: '/developer/repositories' },
  { label: 'Resume', to: '/developer/resume' }
]
</script>

<template>
  <div class="min-h-screen bg-default">
    <!-- Header -->
    <header class="border-b border-default sticky top-0 bg-default/80 backdrop-blur-sm z-50">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2">
          <UIcon name="i-lucide-shield-check" class="w-8 h-8 text-primary" />
          <span class="font-bold text-xl">Trust Bridge</span>
        </NuxtLink>

        <!-- Navigation -->
        <nav class="hidden md:flex items-center gap-6">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-sm font-medium text-muted hover:text-default transition-colors"
          >
            {{ link.label }}
          </NuxtLink>
          <!-- Auth nav links (only when logged in) -->
          <template v-if="user">
            <NuxtLink
              v-for="link in authNavLinks"
              :key="link.to"
              :to="link.to"
              class="text-sm font-medium text-muted hover:text-default transition-colors"
            >
              {{ link.label }}
            </NuxtLink>
          </template>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <!-- Dark mode toggle -->
          <UButton
            :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
            variant="ghost"
            size="sm"
            aria-label="Toggle color mode"
            @click="isDark = !isDark"
          />

          <!-- Not logged in -->
          <template v-if="!user">
            <UButton to="/auth/login" variant="ghost" size="sm">
              Sign In
            </UButton>
            <UButton to="/auth/login" size="sm">
              Get Started
            </UButton>
          </template>

          <!-- Logged in -->
          <template v-else>
            <UDropdownMenu
              :items="[
                [{ label: user.email, disabled: true }],
                [{ label: 'Sign Out', icon: 'i-heroicons-arrow-right-on-rectangle', onSelect: () => signOut() }]
              ]"
            >
              <UButton
                icon="i-heroicons-user-circle"
                variant="ghost"
                size="sm"
              />
            </UDropdownMenu>
          </template>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="min-h-[calc(100vh-8rem)]">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="border-t border-default py-8">
      <div class="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-shield-check" class="w-5 h-5 text-primary" />
          <span class="font-semibold">Trust Bridge</span>
          <span class="text-sm text-muted">• © {{ new Date().getFullYear() }}</span>
        </div>
        <div class="flex items-center gap-4">
          <UButton
            to="https://github.com/AbdullokhKhamzaev"
            target="_blank"
            icon="i-simple-icons-github"
            aria-label="GitHub"
            variant="ghost"
            size="sm"
          />
        </div>
      </div>
    </footer>
  </div>
</template>
