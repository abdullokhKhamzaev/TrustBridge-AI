<script setup lang="ts">
import type { ProjectAnalysis, GitHubRepository } from '~/types/database'

useSeoMeta({
  title: 'Interview Prep - DevProfile AI'
})

const supabase = useSupabaseClient<any>()
const user = useSupabaseUser()

// State
const loading = ref(true)
const analyses = ref<(ProjectAnalysis & { repository: GitHubRepository })[]>([])
const selectedProject = ref<string>('all')

// Fetch analyses with interview topics
const fetchAnalyses = async () => {
  if (!user.value) return
  
  loading.value = true
  
  try {
    // Get profile
    const { data: profile } = await supabase
      .from('developer_profiles')
      .select('id')
      .eq('user_id', user.value.id)
      .single()
    
    if (!profile) return
    
    // Get analyses with repositories
    const { data } = await supabase
      .from('project_analyses')
      .select(`
        *,
        repository:github_repositories(*)
      `)
      .eq('developer_profile_id', profile.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
    
    analyses.value = data || []
  } catch (e) {
    console.error('Failed to fetch analyses:', e)
  } finally {
    loading.value = false
  }
}

// Get all interview topics grouped by project
const topicsByProject = computed(() => {
  const result: { projectId: string; projectName: string; topics: string[] }[] = []
  
  for (const analysis of analyses.value) {
    const topics = analysis.analysis_data?.interview_topics || []
    if (topics.length > 0) {
      result.push({
        projectId: analysis.repository_id,
        projectName: analysis.repository?.repo_name || 'Unknown',
        topics
      })
    }
  }
  
  return result
})

// Filtered topics based on selection
const filteredTopics = computed(() => {
  if (selectedProject.value === 'all') {
    return topicsByProject.value
  }
  return topicsByProject.value.filter(p => p.projectId === selectedProject.value)
})

// Total topics count
const totalTopicsCount = computed(() => {
  return topicsByProject.value.reduce((sum, p) => sum + p.topics.length, 0)
})

// Project filter options
const projectOptions = computed(() => {
  const options = [{ label: `All Projects (${totalTopicsCount.value})`, value: 'all' }]
  
  for (const project of topicsByProject.value) {
    options.push({
      label: `${project.projectName} (${project.topics.length})`,
      value: project.projectId
    })
  }
  
  return options
})

onMounted(fetchAnalyses)
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="mb-8">
      <div class="flex items-center gap-2 text-muted mb-4">
        <UButton to="/developer" variant="ghost" size="sm" class="p-0">
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
        </UButton>
        <span>Back to Dashboard</span>
      </div>
      <h1 class="text-3xl font-bold mb-2">Interview Preparation</h1>
      <p class="text-muted">Practice with AI-generated interview topics from your projects</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <template v-else>
      <!-- No Analyses State -->
      <div v-if="analyses.length === 0" class="bg-elevated border border-default rounded-xl p-12">
        <div class="text-center">
          <UIcon name="i-lucide-message-square" class="w-16 h-16 text-muted mx-auto mb-4" />
          <h3 class="text-xl font-semibold mb-2">No Analyzed Projects</h3>
          <p class="text-muted mb-6">
            Analyze your repositories first, and we'll generate personalized interview topics
            based on your actual projects and tech stack.
          </p>
          <UButton to="/developer/repositories">
            <UIcon name="i-lucide-git-branch" class="w-4 h-4 mr-2" />
            Go to Repositories
          </UButton>
        </div>
      </div>

      <!-- No Topics State -->
      <div v-else-if="totalTopicsCount === 0" class="bg-elevated border border-default rounded-xl p-12">
        <div class="text-center">
          <UIcon name="i-lucide-message-square" class="w-16 h-16 text-muted mx-auto mb-4" />
          <h3 class="text-xl font-semibold mb-2">No Interview Topics Found</h3>
          <p class="text-muted mb-6">
            Your analyzed projects don't have interview topics yet.
            Try re-analyzing your repositories to generate interview topics.
          </p>
          <UButton to="/developer/repositories">
            <UIcon name="i-lucide-refresh-cw" class="w-4 h-4 mr-2" />
            Go to Repositories
          </UButton>
        </div>
      </div>

      <!-- Topics List -->
      <template v-else>
        <!-- Stats & Filter -->
        <div class="flex flex-col sm:flex-row gap-4 mb-6">
          <div class="flex items-center gap-4">
            <div class="bg-elevated border border-default rounded-lg px-4 py-2">
              <span class="text-2xl font-bold text-primary">{{ totalTopicsCount }}</span>
              <span class="text-sm text-muted ml-2">topics</span>
            </div>
            <div class="bg-elevated border border-default rounded-lg px-4 py-2">
              <span class="text-2xl font-bold">{{ topicsByProject.length }}</span>
              <span class="text-sm text-muted ml-2">projects</span>
            </div>
          </div>
          
          <div class="sm:ml-auto">
            <USelect 
              v-model="selectedProject"
              :items="projectOptions"
              class="w-full sm:w-64"
            />
          </div>
        </div>

        <!-- Topics by Project -->
        <div class="space-y-6">
          <div
            v-for="project in filteredTopics"
            :key="project.projectId"
            class="bg-elevated border border-default rounded-xl overflow-hidden"
          >
            <!-- Project Header -->
            <div class="px-6 py-4 border-b border-default bg-gray-50 dark:bg-gray-900">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-primary/10">
                    <UIcon name="i-lucide-folder-git-2" class="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 class="font-semibold">{{ project.projectName }}</h3>
                    <p class="text-sm text-muted">{{ project.topics.length }} interview topics</p>
                  </div>
                </div>
                <UButton 
                  :to="`/developer/repositories/${project.projectId}`" 
                  variant="ghost" 
                  size="sm"
                >
                  View Analysis
                  <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-1" />
                </UButton>
              </div>
            </div>

            <!-- Topics List -->
            <div class="p-6">
              <ul class="space-y-3">
                <li
                  v-for="(topic, index) in project.topics"
                  :key="index"
                  class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span class="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-medium">
                    {{ index + 1 }}
                  </span>
                  <span class="flex-1">{{ topic }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Tips Section -->
        <div class="mt-8 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 class="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
            <UIcon name="i-lucide-lightbulb" class="w-5 h-5" />
            Interview Tips
          </h3>
          <ul class="text-sm text-blue-700 dark:text-blue-300 space-y-2">
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 mt-0.5 flex-shrink-0" />
              Be ready to explain your technical decisions and trade-offs
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 mt-0.5 flex-shrink-0" />
              Prepare specific examples from your projects to illustrate your answers
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 mt-0.5 flex-shrink-0" />
              Practice explaining complex concepts in simple terms
            </li>
            <li class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 mt-0.5 flex-shrink-0" />
              Think about challenges you faced and how you overcame them
            </li>
          </ul>
        </div>
      </template>
    </template>
  </div>
</template>
