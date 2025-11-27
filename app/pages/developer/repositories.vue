<script setup lang="ts">
import type { GitHubRepo } from '~/types/github'
import type { GitHubRepository } from '~/types/database'

useSeoMeta({
  title: 'Repositories - DevProfile AI'
})

const { loginWithGitHub } = useAuth()
const github = useGitHub()
const repos = useRepositories()

const githubRepos = ref<GitHubRepo[]>([])
const isConnected = ref(false)
const searchQuery = ref('')
const importing = ref<number | null>(null)
const loadingGithub = ref(false)
const modalOpen = ref(false)

// Check GitHub connection and load data
onMounted(async () => {
  isConnected.value = await github.isGitHubConnected()
  await repos.fetchRepositories()
})

// Load GitHub repos when modal opens
async function loadGitHubRepos() {
  if (githubRepos.value.length > 0) return
  loadingGithub.value = true
  githubRepos.value = await github.fetchAllGitHubRepos()
  loadingGithub.value = false
}

// Import a single repo
async function handleImport(repo: GitHubRepo) {
  importing.value = repo.id
  const result = await repos.importRepository(repo)
  importing.value = null
  if (result) {
    modalOpen.value = false
  }
}

// Remove repo
async function handleRemove(repo: GitHubRepository) {
  if (confirm(`Remove ${repo.repo_name} from your list?`)) {
    await repos.removeRepository(repo.id)
  }
}

// Filter GitHub repos
const filteredGithubRepos = computed(() => {
  if (!searchQuery.value) return githubRepos.value
  const q = searchQuery.value.toLowerCase()
  return githubRepos.value.filter(r =>
    r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
  )
})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    completed: 'success',
    analyzing: 'warning',
    failed: 'error'
  }
  return colors[status] || 'neutral'
}
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold mb-2">Repositories</h1>
        <p class="text-gray-500">Manage your GitHub repositories for AI analysis</p>
      </div>
      
      <!-- Connect GitHub button (if not connected) -->
      <UButton v-if="!isConnected" @click="loginWithGitHub" icon="i-simple-icons-github">
        Connect GitHub
      </UButton>
      
      <!-- Import Modal (if connected) -->
      <UModal v-else v-model:open="modalOpen" title="Import from GitHub" @update:open="(open: boolean) => open && loadGitHubRepos()">
        <UButton icon="i-lucide-plus">Import Repository</UButton>
        
        <template #body>
          <div class="space-y-4">
            <UInput
              v-model="searchQuery"
              placeholder="Search your repositories..."
              icon="i-lucide-search"
            />

            <!-- Loading -->
            <div v-if="loadingGithub" class="flex justify-center py-8">
              <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin" />
            </div>

            <!-- Error -->
            <div v-else-if="github.error.value" class="text-center py-6">
              <p class="text-red-500 mb-3">{{ github.error.value }}</p>
            </div>

            <!-- Repos List -->
            <div v-else class="max-h-80 overflow-y-auto space-y-2">
              <div
                v-for="repo in filteredGithubRepos"
                :key="repo.id"
                class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div class="flex-1 min-w-0 mr-3">
                  <div class="flex items-center gap-2">
                    <span class="font-medium truncate">{{ repo.name }}</span>
                    <span v-if="repo.private" class="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Private</span>
                  </div>
                  <p v-if="repo.description" class="text-sm text-gray-500 truncate">{{ repo.description }}</p>
                  <div class="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span v-if="repo.language">{{ repo.language }}</span>
                    <span>⭐ {{ repo.stargazers_count }}</span>
                  </div>
                </div>
                <UButton
                  v-if="repos.isImported(repo.id)"
                  disabled
                  variant="outline"
                  size="sm"
                >
                  Added
                </UButton>
                <UButton
                  v-else
                  size="sm"
                  :loading="importing === repo.id"
                  @click="handleImport(repo)"
                >
                  Import
                </UButton>
              </div>
              <p v-if="filteredGithubRepos.length === 0 && !loadingGithub" class="text-center py-6 text-gray-500">
                No repositories found
              </p>
            </div>
          </div>
        </template>
      </UModal>
    </div>

    <!-- Loading -->
    <div v-if="repos.loading.value && repos.repositories.value.length === 0" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin" />
    </div>

    <!-- Empty State -->
    <div v-else-if="repos.repositories.value.length === 0" class="text-center py-16">
      <UIcon name="i-lucide-git-branch" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-xl font-semibold mb-2">No repositories yet</h3>
      <p class="text-gray-500 mb-6">Connect your GitHub and import repositories for AI analysis</p>
      <UButton v-if="!isConnected" @click="loginWithGitHub" icon="i-simple-icons-github">
        Connect GitHub
      </UButton>
    </div>

    <!-- Repositories List -->
    <div v-else class="space-y-4">
      <h2 class="text-lg font-semibold mb-4">
        Your Repositories ({{ repos.repositories.value.length }})
      </h2>
      <div
        v-for="repo in repos.repositories.value"
        :key="repo.id"
        class="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <a
                :href="repo.repo_url"
                target="_blank"
                class="text-lg font-semibold hover:text-primary transition-colors"
              >
                {{ repo.repo_name }}
              </a>
              <span v-if="repo.is_private" class="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Private</span>
              <UBadge :color="getStatusColor(repo.analysis_status)" variant="subtle" size="xs">
                {{ repo.analysis_status.replace('_', ' ') }}
              </UBadge>
            </div>
            <p v-if="repo.description" class="text-gray-500 text-sm mb-3">{{ repo.description }}</p>
            <div class="flex items-center gap-4 text-sm text-gray-400">
              <span v-if="repo.language" class="flex items-center gap-1">
                <span class="w-3 h-3 rounded-full bg-primary"></span>
                {{ repo.language }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-star" class="w-4 h-4" />
                {{ repo.stars_count }}
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-git-fork" class="w-4 h-4" />
                {{ repo.forks_count }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UButton
              v-if="repo.analysis_status === 'not_analyzed'"
              color="primary"
              size="sm"
            >
              Analyze
            </UButton>
            <UButton
              v-else-if="repo.analysis_status === 'completed'"
              variant="outline"
              size="sm"
            >
              View Results
            </UButton>
            <UButton
              variant="ghost"
              color="error"
              size="sm"
              icon="i-lucide-trash-2"
              @click="handleRemove(repo)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
