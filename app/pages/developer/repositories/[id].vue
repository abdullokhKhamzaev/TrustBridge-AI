<script setup lang="ts">
import type { RepositoryAnalysis } from '~/composables/useAnalysis'

const route = useRoute()
const repositoryId = route.params.id as string

const { getAnalysis, loading, error } = useAnalysis()
const toast = useToast()

const data = ref<RepositoryAnalysis | null>(null)

// Fetch analysis data
onMounted(async () => {
  try {
    data.value = await getAnalysis(repositoryId)
  } catch (e: any) {
    toast.add({
      title: 'Error',
      description: e.data?.statusMessage || 'Failed to load analysis',
      color: 'error'
    })
  }
})

useSeoMeta({
  title: () => data.value?.repository?.repo_name 
    ? `${data.value.repository.repo_name} Analysis - DevProfile AI`
    : 'Repository Analysis - DevProfile AI'
})

function getScaleColor(scale: string): 'success' | 'warning' | 'info' | 'neutral' | 'primary' {
  const colors: Record<string, 'success' | 'warning' | 'info' | 'neutral' | 'primary'> = {
    micro: 'neutral',
    small: 'info',
    medium: 'primary',
    large: 'warning',
    enterprise: 'success'
  }
  return colors[scale] || 'neutral'
}

function getScaleLabel(scale: string) {
  const labels: Record<string, string> = {
    micro: 'Micro Project',
    small: 'Small Project',
    medium: 'Medium Project',
    large: 'Large Project',
    enterprise: 'Enterprise Project'
  }
  return labels[scale] || scale
}

function getCategoryColor(category: string): 'success' | 'warning' | 'info' | 'neutral' | 'primary' | 'secondary' {
  const colors: Record<string, 'success' | 'warning' | 'info' | 'neutral' | 'primary' | 'secondary'> = {
    feature: 'primary',
    integration: 'info',
    performance: 'success',
    architecture: 'warning',
    quality: 'secondary',
    business_impact: 'success'
  }
  return colors[category] || 'neutral'
}

function getCategoryIcon(category: string) {
  const icons: Record<string, string> = {
    feature: 'i-lucide-layers',
    integration: 'i-lucide-plug',
    performance: 'i-lucide-zap',
    architecture: 'i-lucide-building',
    quality: 'i-lucide-shield-check',
    business_impact: 'i-lucide-trending-up'
  }
  return icons[category] || 'i-lucide-star'
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
  toast.add({
    title: 'Copied!',
    description: 'Text copied to clipboard',
    color: 'success'
  })
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>
    
    <!-- Error -->
    <div v-else-if="error || !data" class="text-center py-16">
      <UIcon name="i-lucide-alert-circle" class="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h2 class="text-xl font-semibold mb-2">Failed to Load Analysis</h2>
      <p class="text-gray-500 mb-4">{{ error || 'Analysis not found' }}</p>
      <NuxtLink to="/developer/repositories">
        <UButton variant="outline">
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4 mr-2" />
          Back to Repositories
        </UButton>
      </NuxtLink>
    </div>
    
    <!-- No Analysis Yet -->
    <div v-else-if="!data.has_analysis" class="text-center py-16">
      <UIcon name="i-lucide-sparkles" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <h2 class="text-xl font-semibold mb-2">No Analysis Yet</h2>
      <p class="text-gray-500 mb-4">This repository hasn't been analyzed yet.</p>
      <NuxtLink to="/developer/repositories">
        <UButton color="primary">
          Go Analyze
        </UButton>
      </NuxtLink>
    </div>
    
    <!-- Analysis Results -->
    <div v-else-if="data.analysis" class="space-y-8">
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <NuxtLink to="/developer/repositories" class="text-gray-400 hover:text-gray-600">
              <UIcon name="i-lucide-arrow-left" class="w-5 h-5" />
            </NuxtLink>
            <h1 class="text-3xl font-bold">{{ data.repository.repo_name }}</h1>
            <UBadge :color="getScaleColor(data.analysis.project_scale)" size="lg">
              {{ getScaleLabel(data.analysis.project_scale) }}
            </UBadge>
          </div>
          <p class="text-gray-500">
            {{ data.repository.description || 'No description' }}
          </p>
        </div>
        <a :href="data.repository.repo_url" target="_blank">
          <UButton variant="outline" icon="i-simple-icons-github">
            View on GitHub
          </UButton>
        </a>
      </div>
      
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <UIcon name="i-lucide-git-commit" class="w-5 h-5 text-primary" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ data.analysis.total_commits }}</p>
              <p class="text-sm text-gray-500">Commits</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <UIcon name="i-lucide-calendar" class="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ data.analysis.project_duration_days }}</p>
              <p class="text-sm text-gray-500">Days</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <UIcon name="i-lucide-file-code" class="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ data.analysis.files_changed }}</p>
              <p class="text-sm text-gray-500">Files</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <UIcon name="i-lucide-plus-minus" class="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p class="text-2xl font-bold">{{ (data.analysis.lines_changed / 1000).toFixed(1) }}K</p>
              <p class="text-sm text-gray-500">Lines Changed</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Project Overview -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-info" class="w-5 h-5 text-primary" />
          Project Overview
        </h2>
        <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
          {{ data.analysis.data.project_overview }}
        </p>
      </div>
      
      <!-- Key Achievements -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-trophy" class="w-5 h-5 text-yellow-500" />
          Key Achievements ({{ data.analysis.data.key_achievements.length }})
        </h2>
        
        <div class="grid gap-4">
          <div
            v-for="(achievement, index) in data.analysis.data.key_achievements"
            :key="index"
            class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
          >
            <div class="flex items-start gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                   :class="{
                     'bg-primary/10': getCategoryColor(achievement.category) === 'primary',
                     'bg-blue-500/10': getCategoryColor(achievement.category) === 'info',
                     'bg-green-500/10': getCategoryColor(achievement.category) === 'success',
                     'bg-yellow-500/10': getCategoryColor(achievement.category) === 'warning',
                     'bg-gray-500/10': getCategoryColor(achievement.category) === 'secondary'
                   }">
                <UIcon :name="getCategoryIcon(achievement.category)" class="w-4 h-4" />
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-medium">{{ achievement.title }}</h3>
                  <UBadge :color="getCategoryColor(achievement.category)" variant="subtle" size="xs">
                    {{ achievement.category.replace('_', ' ') }}
                  </UBadge>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ achievement.description }}</p>
                <p v-if="achievement.metrics" class="text-sm text-primary mt-1 font-medium">
                  {{ achievement.metrics }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Technical Highlights -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-code-2" class="w-5 h-5 text-blue-500" />
          Technical Highlights
        </h2>
        
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Frameworks -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Frameworks</h3>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="framework in data.analysis.data.technical_highlights.frameworks"
                :key="framework"
                color="primary"
                variant="subtle"
              >
                {{ framework }}
              </UBadge>
            </div>
          </div>
          
          <!-- Libraries -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Libraries</h3>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="lib in data.analysis.data.technical_highlights.libraries"
                :key="lib"
                color="info"
                variant="subtle"
              >
                {{ lib }}
              </UBadge>
            </div>
          </div>
          
          <!-- Patterns -->
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-2">Design Patterns</h3>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="pattern in data.analysis.data.technical_highlights.patterns"
                :key="pattern"
                color="warning"
                variant="subtle"
              >
                {{ pattern }}
              </UBadge>
            </div>
          </div>
          
          <!-- Tools -->
          <div v-if="data.analysis.data.technical_highlights.tools?.length">
            <h3 class="text-sm font-medium text-gray-500 mb-2">Tools</h3>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="tool in data.analysis.data.technical_highlights.tools"
                :key="tool"
                color="neutral"
                variant="subtle"
              >
                {{ tool }}
              </UBadge>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Resume Points -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-file-text" class="w-5 h-5 text-green-500" />
          Resume Points
        </h2>
        <p class="text-sm text-gray-500 mb-4">Click to copy any bullet point for your resume</p>
        
        <ul class="space-y-3">
          <li
            v-for="(point, index) in data.analysis.data.resume_points"
            :key="index"
            class="flex items-start gap-3 group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 -mx-2 px-2 py-2 rounded-lg transition-colors"
            @click="copyToClipboard(point)"
          >
            <span class="text-primary mt-1">•</span>
            <span class="flex-1">{{ point }}</span>
            <UIcon 
              name="i-lucide-copy" 
              class="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" 
            />
          </li>
        </ul>
      </div>
      
      <!-- Interview Topics -->
      <div v-if="data.analysis.data.interview_topics?.length" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-message-circle" class="w-5 h-5 text-purple-500" />
          Interview Topics
        </h2>
        <p class="text-sm text-gray-500 mb-4">Potential interview questions based on this project</p>
        
        <ul class="space-y-2">
          <li
            v-for="(topic, index) in data.analysis.data.interview_topics"
            :key="index"
            class="flex items-start gap-3"
          >
            <span class="text-purple-500 mt-1">{{ index + 1 }}.</span>
            <span>{{ topic }}</span>
          </li>
        </ul>
      </div>
      
      <!-- Git Insights -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <UIcon name="i-lucide-git-branch" class="w-5 h-5 text-orange-500" />
          Git Insights
        </h2>
        
        <div class="grid md:grid-cols-3 gap-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-1">Commit Frequency</h3>
            <p>{{ data.analysis.data.git_insights.commit_frequency }}</p>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500 mb-1">Development Style</h3>
            <p>{{ data.analysis.data.git_insights.development_style }}</p>
          </div>
          <div v-if="data.analysis.data.git_insights.collaboration_indicators">
            <h3 class="text-sm font-medium text-gray-500 mb-1">Collaboration</h3>
            <p>{{ data.analysis.data.git_insights.collaboration_indicators }}</p>
          </div>
        </div>
        
        <div class="mt-4 pt-4 border-t dark:border-gray-700 text-sm text-gray-500">
          <p>First commit: {{ formatDate(data.analysis.first_commit_date) }}</p>
          <p>Last commit: {{ formatDate(data.analysis.last_commit_date) }}</p>
        </div>
      </div>
      
      <!-- Analysis Metadata -->
      <div class="text-center text-sm text-gray-400 pt-4">
        <p>Analysis completed on {{ formatDate(data.analysis.created_at) }}</p>
        <p>Tokens used: {{ data.analysis.tokens_used?.toLocaleString() || 'N/A' }}</p>
      </div>
    </div>
  </div>
</template>
