<script setup lang="ts">
const route = useRoute()
const username = route.params.username as string

// View mode: hr, tech, full
const viewMode = ref<'hr' | 'tech' | 'full'>('full')

// Fetch profile data
const { data, pending, error } = await useFetch(`/api/profile/${username}`, {
  query: { view: viewMode }
})

// Watch view mode changes
watch(viewMode, async (newView) => {
  await refreshNuxtData()
})

useSeoMeta({
  title: () => data.value?.data?.profile?.full_name 
    ? `${data.value.data.profile.full_name} - DevProfile AI`
    : 'Developer Profile - DevProfile AI',
  description: () => data.value?.data?.hr_view?.professional_summary || 'Developer portfolio powered by AI'
})

function getScaleColor(scale: string) {
  const colors: Record<string, string> = {
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
    micro: 'Micro',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    enterprise: 'Enterprise'
  }
  return labels[scale] || scale
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    business_impact: 'Business Impact',
    feature: 'Features Built',
    performance: 'Performance',
    architecture: 'Architecture',
    integration: 'Integrations',
    quality: 'Code Quality'
  }
  return labels[category] || category
}

function getCategoryIcon(category: string) {
  const icons: Record<string, string> = {
    business_impact: 'i-lucide-trending-up',
    feature: 'i-lucide-layers',
    performance: 'i-lucide-zap',
    architecture: 'i-lucide-building',
    integration: 'i-lucide-plug',
    quality: 'i-lucide-shield-check'
  }
  return icons[category] || 'i-lucide-star'
}

function formatDuration(days: number): string {
  if (!days || days <= 0) return '-'
  const years = Math.floor(days / 365)
  const months = Math.floor((days % 365) / 30)
  if (years > 0 && months > 0) return `${years}y ${months}m`
  if (years > 0) return `${years}y`
  if (months > 0) return `${months}m`
  return `${days}d`
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center min-h-screen">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <!-- Error -->
    <div v-else-if="error || !data?.success" class="flex flex-col items-center justify-center min-h-screen">
      <UIcon name="i-lucide-user-x" class="w-16 h-16 text-gray-300 mb-4" />
      <h1 class="text-2xl font-bold mb-2">Profile Not Found</h1>
      <p class="text-gray-500 mb-6">This profile doesn't exist or is not public.</p>
      <NuxtLink to="/">
        <UButton variant="outline">Go Home</UButton>
      </NuxtLink>
    </div>

    <!-- Profile Content -->
    <div v-else class="container mx-auto py-8 px-4 max-w-5xl">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-6">
        <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
          <!-- Avatar -->
          <img 
            v-if="data.data.profile.avatar_url"
            :src="data.data.profile.avatar_url" 
            :alt="data.data.profile.full_name"
            class="w-24 h-24 rounded-full border-4 border-primary/20"
          />
          <div class="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center" v-else>
            <UIcon name="i-lucide-user" class="w-12 h-12 text-primary" />
          </div>

          <!-- Info -->
          <div class="flex-1">
            <h1 class="text-3xl font-bold mb-1">{{ data.data.profile.full_name || username }}</h1>
            <p v-if="data.data.profile.job_title" class="text-xl text-gray-600 dark:text-gray-400 mb-2">
              {{ data.data.profile.job_title }}
            </p>
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span v-if="data.data.profile.location" class="flex items-center gap-1">
                <UIcon name="i-lucide-map-pin" class="w-4 h-4" />
                {{ data.data.profile.location }}
              </span>
              <span v-if="data.data.profile.years_of_experience" class="flex items-center gap-1">
                <UIcon name="i-lucide-briefcase" class="w-4 h-4" />
                {{ data.data.profile.years_of_experience }}+ years
              </span>
              <span class="flex items-center gap-1">
                <UIcon name="i-lucide-folder" class="w-4 h-4" />
                {{ data.data.stats.total_projects }} projects
              </span>
            </div>
          </div>

          <!-- View Toggle -->
          <div class="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              @click="viewMode = 'hr'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                viewMode === 'hr' 
                  ? 'bg-white dark:bg-gray-700 shadow text-primary' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
              ]"
            >
              <UIcon name="i-lucide-users" class="w-4 h-4 mr-1 inline" />
              HR View
            </button>
            <button
              @click="viewMode = 'tech'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                viewMode === 'tech' 
                  ? 'bg-white dark:bg-gray-700 shadow text-primary' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
              ]"
            >
              <UIcon name="i-lucide-code" class="w-4 h-4 mr-1 inline" />
              Tech View
            </button>
            <button
              @click="viewMode = 'full'"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                viewMode === 'full' 
                  ? 'bg-white dark:bg-gray-700 shadow text-primary' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400'
              ]"
            >
              <UIcon name="i-lucide-layout-grid" class="w-4 h-4 mr-1 inline" />
              Full
            </button>
          </div>
        </div>

        <!-- Bio -->
        <p v-if="data.data.profile.bio" class="mt-6 text-gray-600 dark:text-gray-400">
          {{ data.data.profile.bio }}
        </p>

        <!-- Professional Summary (HR view) -->
        <div v-if="viewMode !== 'tech' && data.data.hr_view?.professional_summary" class="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p class="text-gray-700 dark:text-gray-300 italic">
            "{{ data.data.hr_view.professional_summary }}"
          </p>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <p class="text-3xl font-bold text-primary">{{ data.data.stats.total_projects }}</p>
          <p class="text-sm text-gray-500">Projects</p>
        </div>
        <div v-if="viewMode !== 'hr'" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <p class="text-3xl font-bold text-green-500">{{ data.data.stats.total_commits?.toLocaleString() }}</p>
          <p class="text-sm text-gray-500">Commits</p>
        </div>
        <div v-if="viewMode === 'hr'" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <p class="text-3xl font-bold text-green-500">{{ data.data.hr_view?.reliability_score }}</p>
          <p class="text-sm text-gray-500">Reliability</p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <p class="text-3xl font-bold text-blue-500">{{ data.data.stats.enterprise_projects + data.data.stats.large_projects }}</p>
          <p class="text-sm text-gray-500">Large Projects</p>
        </div>
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 text-center">
          <p class="text-3xl font-bold text-purple-500">{{ formatDuration(data.data.stats.total_project_days) }}</p>
          <p class="text-sm text-gray-500">Experience</p>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <!-- Main Content (2/3) -->
        <div class="md:col-span-2 space-y-6">
          <!-- HR View: Soft Skills & Growth -->
          <template v-if="viewMode === 'hr' || viewMode === 'full'">
            <!-- Soft Skills -->
            <div v-if="data.data.hr_view?.soft_skills?.length" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <UIcon name="i-lucide-heart" class="w-5 h-5 text-pink-500" />
                Key Strengths
              </h2>
              <div class="flex flex-wrap gap-2">
                <UBadge 
                  v-for="skill in data.data.hr_view.soft_skills" 
                  :key="skill"
                  color="primary"
                  variant="subtle"
                  size="lg"
                >
                  {{ skill }}
                </UBadge>
              </div>
            </div>

            <!-- Growth Indicators -->
            <div v-if="data.data.hr_view?.growth_indicators?.length" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <UIcon name="i-lucide-trending-up" class="w-5 h-5 text-green-500" />
                Growth & Learning
              </h2>
              <ul class="space-y-2">
                <li v-for="indicator in data.data.hr_view.growth_indicators" :key="indicator" class="flex items-start gap-2">
                  <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{{ indicator }}</span>
                </li>
              </ul>
            </div>
          </template>

          <!-- Tech View: Skills -->
          <template v-if="viewMode === 'tech' || viewMode === 'full'">
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <UIcon name="i-lucide-code-2" class="w-5 h-5 text-blue-500" />
                Technical Skills
              </h2>
              
              <div class="space-y-4">
                <!-- Languages -->
                <div v-if="data.data.tech_view?.languages?.length">
                  <h3 class="text-sm font-medium text-gray-500 mb-2">Languages</h3>
                  <div class="flex flex-wrap gap-2">
                    <UBadge v-for="lang in data.data.tech_view.languages" :key="lang" color="info" variant="subtle">
                      {{ lang }}
                    </UBadge>
                  </div>
                </div>

                <!-- Frameworks -->
                <div v-if="data.data.tech_view?.frameworks?.length">
                  <h3 class="text-sm font-medium text-gray-500 mb-2">Frameworks</h3>
                  <div class="flex flex-wrap gap-2">
                    <UBadge v-for="fw in data.data.tech_view.frameworks" :key="fw" color="primary" variant="subtle">
                      {{ fw }}
                    </UBadge>
                  </div>
                </div>

                <!-- Libraries -->
                <div v-if="data.data.tech_view?.libraries?.length">
                  <h3 class="text-sm font-medium text-gray-500 mb-2">Libraries</h3>
                  <div class="flex flex-wrap gap-2">
                    <UBadge v-for="lib in data.data.tech_view.libraries" :key="lib" color="neutral" variant="subtle">
                      {{ lib }}
                    </UBadge>
                  </div>
                </div>

                <!-- Patterns -->
                <div v-if="data.data.tech_view?.patterns?.length">
                  <h3 class="text-sm font-medium text-gray-500 mb-2">Patterns & Practices</h3>
                  <div class="flex flex-wrap gap-2">
                    <UBadge v-for="pattern in data.data.tech_view.patterns" :key="pattern" color="warning" variant="subtle">
                      {{ pattern }}
                    </UBadge>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Achievements -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-trophy" class="w-5 h-5 text-yellow-500" />
              Key Achievements
            </h2>

            <div class="space-y-4">
              <template v-for="(achievements, category) in data.data.achievements" :key="category">
                <div v-if="achievements?.length" class="space-y-3">
                  <h3 class="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <UIcon :name="getCategoryIcon(category)" class="w-4 h-4" />
                    {{ getCategoryLabel(category) }} ({{ achievements.length }})
                  </h3>
                  
                  <div 
                    v-for="(achievement, idx) in achievements.slice(0, 5)" 
                    :key="idx"
                    class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <h4 class="font-medium">{{ achievement.title }}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{{ achievement.description }}</p>
                        <div class="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span v-if="achievement.project" class="flex items-center gap-1">
                            <UIcon name="i-lucide-folder" class="w-3 h-3" />
                            {{ achievement.project }}
                          </span>
                          <span v-if="achievement.team_size > 1" class="flex items-center gap-1">
                            <UIcon name="i-lucide-users" class="w-3 h-3" />
                            Team of {{ achievement.team_size }}
                          </span>
                          <span v-else class="flex items-center gap-1">
                            <UIcon name="i-lucide-user" class="w-3 h-3" />
                            Solo
                          </span>
                        </div>
                      </div>
                      <UBadge v-if="achievement.metrics" color="success" variant="subtle" size="xs">
                        {{ achievement.metrics }}
                      </UBadge>
                    </div>
                  </div>
                  
                  <!-- Show more -->
                  <button 
                    v-if="achievements.length > 5" 
                    class="text-sm text-primary hover:underline"
                  >
                    Show {{ achievements.length - 5 }} more...
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Sidebar (1/3) -->
        <div class="space-y-6">
          <!-- Projects List -->
          <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-folder-open" class="w-5 h-5 text-blue-500" />
              Projects
            </h2>
            
            <div class="space-y-3">
              <div 
                v-for="project in data.data.projects" 
                :key="project.name"
                class="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div class="flex items-center justify-between mb-1">
                  <h3 class="font-medium">{{ project.name }}</h3>
                  <UBadge :color="getScaleColor(project.scale)" variant="subtle" size="xs">
                    {{ getScaleLabel(project.scale) }}
                  </UBadge>
                </div>
                <p v-if="project.description" class="text-sm text-gray-500 line-clamp-2">
                  {{ project.description }}
                </p>
                <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span v-if="project.language">{{ project.language }}</span>
                  <span v-if="project.team_context?.team_size > 1">
                    Team of {{ project.team_context.team_size }}
                  </span>
                  <span v-else>Solo</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Interview Topics (Tech view) -->
          <div 
            v-if="(viewMode === 'tech' || viewMode === 'full') && data.data.tech_view?.interview_topics?.length"
            class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
          >
            <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-message-circle" class="w-5 h-5 text-purple-500" />
              Interview Topics
            </h2>
            
            <ul class="space-y-2 text-sm">
              <li 
                v-for="(topic, idx) in data.data.tech_view.interview_topics.slice(0, 10)" 
                :key="idx"
                class="flex items-start gap-2"
              >
                <span class="text-purple-500 mt-0.5">{{ idx + 1 }}.</span>
                <span>{{ topic }}</span>
              </li>
            </ul>
          </div>

          <!-- Best Practices (Tech view) -->
          <div 
            v-if="(viewMode === 'tech' || viewMode === 'full') && data.data.tech_view?.best_practices?.length"
            class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6"
          >
            <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-check-square" class="w-5 h-5 text-green-500" />
              Best Practices
            </h2>
            
            <ul class="space-y-2 text-sm">
              <li 
                v-for="practice in data.data.tech_view.best_practices" 
                :key="practice"
                class="flex items-start gap-2"
              >
                <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{{ practice }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center text-sm text-gray-400">
        <p>Profile powered by <NuxtLink to="/" class="text-primary hover:underline">DevProfile AI</NuxtLink></p>
      </div>
    </div>
  </div>
</template>
