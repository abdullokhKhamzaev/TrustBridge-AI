<script setup lang="ts">
import type { GitHubRepository, ProjectAnalysis, DeveloperProfile } from '~/types/database'

useSeoMeta({
  title: 'Dashboard - DevProfile AI'
})

const supabase = useSupabaseClient<any>()
const user = useSupabaseUser()

// State
const profile = ref<DeveloperProfile | null>(null)
const repositories = ref<GitHubRepository[]>([])
const recentAnalyses = ref<(ProjectAnalysis & { repository: GitHubRepository })[]>([])
const loading = ref(true)

// Fetch dashboard data
const fetchDashboardData = async () => {
  if (!user.value) return
  
  loading.value = true
  
  try {
    // Get profile
    const { data: profileData } = await supabase
      .from('developer_profiles')
      .select('*')
      .eq('user_id', user.value.id)
      .single()
    
    profile.value = profileData
    
    if (!profileData) return
    
    // Get repositories
    const { data: reposData } = await supabase
      .from('github_repositories')
      .select('*')
      .eq('developer_profile_id', profileData.id)
      .order('created_at', { ascending: false })
    
    repositories.value = reposData || []
    
    // Get recent analyses with repository info
    const { data: analysesData } = await supabase
      .from('project_analyses')
      .select(`
        *,
        repository:github_repositories(*)
      `)
      .eq('developer_profile_id', profileData.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5)
    
    recentAnalyses.value = analysesData || []
  } catch (e) {
    console.error('Failed to fetch dashboard data:', e)
  } finally {
    loading.value = false
  }
}

// Computed stats
const stats = computed(() => {
  const totalRepos = repositories.value.length
  const analyzedRepos = repositories.value.filter(r => r.analysis_status === 'completed').length
  const totalCommits = recentAnalyses.value.reduce((sum, a) => sum + (a.total_commits || 0), 0)
  
  return [
    { 
      label: 'Repositories', 
      value: totalRepos.toString(), 
      icon: 'i-lucide-git-branch',
      color: 'text-blue-500'
    },
    { 
      label: 'Analyzed', 
      value: analyzedRepos.toString(), 
      icon: 'i-lucide-bar-chart-3',
      color: 'text-emerald-500'
    },
    { 
      label: 'Total Commits', 
      value: totalCommits > 0 ? totalCommits.toLocaleString() : '-', 
      icon: 'i-lucide-git-commit',
      color: 'text-purple-500'
    },
    { 
      label: 'Profile', 
      value: profile.value?.is_public ? 'Public' : 'Private', 
      icon: profile.value?.is_public ? 'i-lucide-globe' : 'i-lucide-lock',
      color: profile.value?.is_public ? 'text-green-500' : 'text-gray-500'
    }
  ]
})

// Profile completion percentage
const profileCompletion = computed(() => {
  if (!profile.value) return 0
  
  const fields = [
    profile.value.full_name,
    profile.value.github_username,
    profile.value.job_title,
    profile.value.bio,
    profile.value.location,
    profile.value.avatar_url
  ]
  
  const filled = fields.filter(f => !!f).length
  return Math.round((filled / fields.length) * 100)
})

// Quick actions with dynamic states
const quickActions = computed(() => [
  {
    title: 'Add Repository',
    description: repositories.value.length > 0 
      ? `${repositories.value.length} repos imported` 
      : 'Connect a GitHub repository for analysis',
    icon: 'i-lucide-plus',
    to: '/developer/repositories',
    badge: null,
    badgeColor: ''
  },
  {
    title: 'Generate Resume',
    description: 'AI-powered resume from your projects',
    icon: 'i-lucide-file-text',
    to: '/developer/resume',
    badge: 'Coming Soon',
    badgeColor: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
  },
  {
    title: 'Interview Prep',
    description: 'Practice interview topics from your projects',
    icon: 'i-lucide-message-square',
    to: '/developer/interview-prep',
    badge: null,
    badgeColor: ''
  }
])

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Scale badge color
const getScaleColor = (scale: string | null) => {
  const colors: Record<string, string> = {
    micro: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    small: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    medium: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    large: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    enterprise: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
  }
  return colors[scale || 'small'] || colors.small
}

// Fetch on mount
onMounted(fetchDashboardData)
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <!-- Header with greeting -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">
        {{ profile?.full_name ? `Welcome, ${profile.full_name.split(' ')[0]}!` : 'Welcome to Your Dashboard' }}
      </h1>
      <p class="text-muted">Manage your developer profile and showcase your skills</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <template v-else>
      <!-- Profile Completion Banner -->
      <div 
        v-if="profileCompletion < 100" 
        class="mb-6 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
      >
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <UIcon name="i-lucide-user" class="w-5 h-5 text-amber-600" />
              <span class="font-medium text-amber-800 dark:text-amber-200">Complete your profile</span>
              <span class="text-sm text-amber-600 dark:text-amber-400">{{ profileCompletion }}%</span>
            </div>
            <div class="w-full bg-amber-200 dark:bg-amber-800 rounded-full h-2">
              <div 
                class="bg-amber-500 h-2 rounded-full transition-all duration-300" 
                :style="{ width: `${profileCompletion}%` }"
              />
            </div>
          </div>
          <UButton 
            to="/developer/profile" 
            variant="outline" 
            size="sm"
            class="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300"
          >
            Edit Profile
          </UButton>
        </div>
      </div>

      <!-- Public Profile Link -->
      <div 
        v-if="profile?.github_username && profile?.is_public" 
        class="mb-6 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-globe" class="w-5 h-5 text-emerald-600" />
            <span class="text-emerald-800 dark:text-emerald-200">Your public profile is live!</span>
          </div>
          <UButton 
            :to="`/${profile.github_username}`" 
            variant="outline" 
            size="sm"
            class="border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300"
          >
            <UIcon name="i-lucide-external-link" class="w-4 h-4 mr-1" />
            View Profile
          </UButton>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div 
          v-for="stat in stats" 
          :key="stat.label"
          class="bg-elevated border border-default rounded-xl p-5"
        >
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-lg bg-primary/10">
              <UIcon :name="stat.icon" :class="['w-6 h-6', stat.color]" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ stat.value }}</p>
              <p class="text-sm text-muted">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            v-for="action in quickActions"
            :key="action.title"
            class="bg-elevated border border-default rounded-xl p-5 transition-colors hover:border-primary/50 cursor-pointer"
            @click="navigateTo(action.to)"
          >
            <div class="flex items-start gap-4">
              <div class="p-3 rounded-lg bg-primary/10">
                <UIcon :name="action.icon" class="w-6 h-6 text-primary" />
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="font-semibold">{{ action.title }}</h3>
                  <span 
                    v-if="action.badge" 
                    :class="['text-xs px-2 py-0.5 rounded-full', action.badgeColor]"
                  >
                    {{ action.badge }}
                  </span>
                </div>
                <p class="text-sm text-muted mt-1">{{ action.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Analyses -->
      <div>
        <h2 class="text-xl font-semibold mb-4">Recent Analyses</h2>
        
        <!-- Empty State -->
        <div v-if="recentAnalyses.length === 0" class="bg-elevated border border-default rounded-xl p-8">
          <div class="text-center">
            <UIcon name="i-lucide-bar-chart-3" class="w-12 h-12 text-muted mx-auto mb-4" />
            <p class="text-muted mb-2">No analyses yet</p>
            <p class="text-sm text-muted mb-4">
              {{ repositories.length > 0 
                ? 'Start analyzing your imported repositories!' 
                : 'Import a repository and analyze it to see insights here.' 
              }}
            </p>
            <UButton :to="'/developer/repositories'" class="mt-2">
              {{ repositories.length > 0 ? 'Go to Repositories' : 'Add Repository' }}
            </UButton>
          </div>
        </div>

        <!-- Analyses List -->
        <div v-else class="space-y-3">
          <div
            v-for="analysis in recentAnalyses"
            :key="analysis.id"
            class="bg-elevated border border-default rounded-xl p-4 hover:border-primary/50 transition-colors cursor-pointer"
            @click="navigateTo(`/developer/repositories/${analysis.repository_id}`)"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="p-2 rounded-lg bg-primary/10">
                  <UIcon name="i-lucide-folder-git-2" class="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-semibold">{{ analysis.repository?.repo_name }}</h3>
                    <span 
                      :class="['text-xs px-2 py-0.5 rounded-full capitalize', getScaleColor(analysis.project_scale)]"
                    >
                      {{ analysis.project_scale }}
                    </span>
                  </div>
                  <p class="text-sm text-muted">
                    {{ analysis.total_commits }} commits · 
                    {{ analysis.repository?.language || 'Unknown' }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm text-muted">{{ formatDate(analysis.created_at) }}</p>
                <UIcon name="i-lucide-chevron-right" class="w-5 h-5 text-muted" />
              </div>
            </div>
          </div>

          <!-- View All Link -->
          <div v-if="repositories.length > recentAnalyses.length" class="text-center pt-2">
            <UButton to="/developer/repositories" variant="ghost" size="sm">
              View all repositories
              <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-1" />
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
