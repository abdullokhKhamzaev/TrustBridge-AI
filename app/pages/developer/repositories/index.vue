<script setup lang="ts">
import type { GitHubRepo } from '~/types/github'
import type { GitHubRepository } from '~/types/database'

useSeoMeta({
  title: 'Repositories - DevProfile AI'
})

const supabase = useSupabaseClient()
const { loginWithGitHub } = useAuth()
const github = useGitHub()
const repos = useRepositories()

const githubRepos = ref<GitHubRepo[]>([])
const hasGitHubToken = ref(false) // Has active GitHub token for API calls
const hasGitHubUsername = ref(false) // Has github_username in profile (was connected before)
const searchQuery = ref('')
const importing = ref<number | null>(null)
const loadingGithub = ref(false)
const modalOpen = ref(false)
const initialLoading = ref(true)

// Analysis modal state
const analysisModalOpen = ref(false)
const selectedRepo = ref<GitHubRepository | null>(null)

// Check GitHub connection status
const checkGitHubConnection = async () => {
  // Check for active token
  const { data } = await supabase.auth.getSession()
  hasGitHubToken.value = !!data.session?.provider_token
  
  // Check for github_username in profile (means was connected at some point)
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('developer_profiles')
      .select('github_username')
      .eq('user_id', user.id)
      .single()
    hasGitHubUsername.value = !!profile?.github_username
  }
}

// Load data on mount
onMounted(async () => {
  await checkGitHubConnection()
  
  // Only fetch repositories if user has been connected to GitHub before
  if (hasGitHubUsername.value) {
    await repos.fetchRepositories()
  }
  
  initialLoading.value = false
})

// Load GitHub repos when modal opens
async function loadGitHubRepos() {
  if (!hasGitHubToken.value) {
    github.error.value = 'GitHub not connected. Please connect your GitHub account.'
    return
  }
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

// Open analysis modal
async function openAnalysisModal(repo: GitHubRepository) {
  selectedRepo.value = repo
  await nextTick()
  analysisModalOpen.value = true
}

// Handle analysis complete
function handleAnalysisComplete() {
  repos.fetchRepositories()
  analysisModalOpen.value = false
}

// Filter GitHub repos
const filteredGithubRepos = computed(() => {
  if (!searchQuery.value) return githubRepos.value
  const q = searchQuery.value.toLowerCase()
  return githubRepos.value.filter(r =>
    r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
  )
})

function getStatusColor(status: string): 'success' | 'warning' | 'error' | 'neutral' | 'primary' | 'secondary' | 'info' {
  const colors: Record<string, 'success' | 'warning' | 'error' | 'neutral' | 'primary' | 'secondary' | 'info'> = {
    completed: 'success',
    processing: 'warning',
    failed: 'error',
    pending: 'neutral',
    not_analyzed: 'neutral'
  }
  return colors[status] || 'neutral'
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    completed: 'Analyzed',
    processing: 'Analyzing...',
    failed: 'Failed',
    pending: 'Pending',
    not_analyzed: 'Not Analyzed'
  }
  return labels[status] || status
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
      
      <!-- Connect GitHub button (if no token - needs to connect/reconnect) -->
      <UButton 
        v-if="!hasGitHubToken" 
        @click="loginWithGitHub" 
        icon="i-simple-icons-github"
      >
        {{ hasGitHubUsername ? 'Reconnect GitHub' : 'Connect GitHub' }}
      </UButton>
      
      <!-- Import Modal (if has active token) -->
      <UModal 
        v-else 
        v-model:open="modalOpen" 
        title="Import from GitHub" 
        @update:open="(open: boolean) => open && loadGitHubRepos()"
      >
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
              <UButton @click="loginWithGitHub" variant="outline" size="sm">
                Reconnect GitHub
              </UButton>
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

    <!-- Initial Loading -->
    <div v-if="initialLoading" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin" />
    </div>

    <!-- Not Connected to GitHub -->
    <div v-else-if="!hasGitHubUsername" class="text-center py-16">
      <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
        <UIcon name="i-simple-icons-github" class="w-10 h-10 text-gray-400" />
      </div>
      <h3 class="text-xl font-semibold mb-2">Connect Your GitHub Account</h3>
      <p class="text-gray-500 mb-6 max-w-md mx-auto">
        Connect your GitHub account to import repositories and analyze your projects with AI.
      </p>
      <UButton @click="loginWithGitHub" icon="i-simple-icons-github" size="lg">
        Connect GitHub
      </UButton>
    </div>

    <!-- Connected but no repos imported -->
    <div v-else-if="repos.repositories.value.length === 0" class="text-center py-16">
      <UIcon name="i-lucide-git-branch" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h3 class="text-xl font-semibold mb-2">No repositories imported</h3>
      <p class="text-gray-500 mb-6">Import repositories from GitHub to start AI analysis</p>
      <UButton 
        v-if="hasGitHubToken" 
        @click="modalOpen = true; loadGitHubRepos()" 
        icon="i-lucide-plus"
      >
        Import Repository
      </UButton>
      <UButton 
        v-else 
        @click="loginWithGitHub" 
        icon="i-simple-icons-github"
      >
        Reconnect GitHub to Import
      </UButton>
    </div>

    <!-- Repositories List -->
    <div v-else class="space-y-4">
      <!-- Reconnect Alert -->
      <div 
        v-if="!hasGitHubToken && hasGitHubUsername" 
        class="mb-4 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-alert-triangle" class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p class="font-medium text-amber-800 dark:text-amber-200">GitHub session expired</p>
              <p class="text-sm text-amber-700 dark:text-amber-300">Reconnect to import new repositories or re-analyze existing ones.</p>
            </div>
          </div>
          <UButton 
            @click="loginWithGitHub" 
            size="sm"
            class="flex-shrink-0"
          >
            <UIcon name="i-simple-icons-github" class="w-4 h-4 mr-1" />
            Reconnect GitHub
          </UButton>
        </div>
      </div>

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
              <UBadge :color="getStatusColor(repo.analysis_status || 'not_analyzed')" variant="subtle" size="xs">
                {{ getStatusLabel(repo.analysis_status || 'not_analyzed') }}
              </UBadge>
              <span v-if="repo.analysis_status === 'completed' && repo.updated_at" class="text-xs text-gray-400">
                {{ new Date(repo.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }}, {{ new Date(repo.updated_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }) }}
              </span>
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
            <!-- Not analyzed yet -->
            <template v-if="!repo.analysis_status || repo.analysis_status === 'not_analyzed' || repo.analysis_status === 'pending' || repo.analysis_status === 'failed'">
              <UButton
                v-if="hasGitHubToken"
                color="primary"
                size="sm"
                @click="openAnalysisModal(repo)"
              >
                <UIcon name="i-lucide-sparkles" class="w-4 h-4 mr-1" />
                Analyze
              </UButton>
              <UButton
                v-else
                color="primary"
                size="sm"
                @click="loginWithGitHub"
              >
                <UIcon name="i-simple-icons-github" class="w-4 h-4 mr-1" />
                Connect to Analyze
              </UButton>
            </template>
            
            <!-- Processing -->
            <UButton
              v-else-if="repo.analysis_status === 'processing'"
              variant="outline"
              size="sm"
              disabled
            >
              <UIcon name="i-lucide-loader-2" class="w-4 h-4 mr-1 animate-spin" />
              Analyzing...
            </UButton>
            
            <!-- Completed -->
            <template v-else-if="repo.analysis_status === 'completed'">
              <NuxtLink :to="`/developer/repositories/${repo.id}`">
                <UButton variant="outline" size="sm">
                  <UIcon name="i-lucide-eye" class="w-4 h-4 mr-1" />
                  View
                </UButton>
              </NuxtLink>
              <UButton
                v-if="hasGitHubToken"
                variant="ghost"
                size="sm"
                @click="openAnalysisModal(repo)"
              >
                <UIcon name="i-lucide-refresh-cw" class="w-4 h-4 mr-1" />
                Re-analyze
              </UButton>
              <UButton
                v-else
                variant="ghost"
                size="sm"
                disabled
                title="Connect GitHub to re-analyze"
              >
                <UIcon name="i-lucide-refresh-cw" class="w-4 h-4 mr-1 opacity-50" />
                <span class="opacity-50">Re-analyze</span>
              </UButton>
            </template>
            
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
    
    <!-- Analysis Modal -->
    <AnalysisModal
      v-if="selectedRepo"
      v-model:open="analysisModalOpen"
      :repository-id="selectedRepo.id"
      :repo-url="selectedRepo.repo_url"
      :repo-name="selectedRepo.repo_name || 'Repository'"
      :github-username="selectedRepo.owner_username"
      @analysis-complete="handleAnalysisComplete"
    />
  </div>
</template>
