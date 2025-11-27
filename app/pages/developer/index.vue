<script setup lang="ts">
useSeoMeta({
  title: 'Dashboard - DevProfile AI'
})

// Mock data - will be replaced with real data from Supabase
const stats = [
  { label: 'Repositories', value: '0', icon: 'i-lucide-git-branch' },
  { label: 'Analyses', value: '0', icon: 'i-lucide-bar-chart-3' },
  { label: 'Resume Score', value: '-', icon: 'i-lucide-file-text' },
  { label: 'Credits', value: '0', icon: 'i-lucide-coins' }
]

const quickActions = [
  {
    title: 'Add Repository',
    description: 'Connect a GitHub repository for analysis',
    icon: 'i-lucide-plus',
    to: '/developer/repositories'
  },
  {
    title: 'Generate Resume',
    description: 'Create an AI-powered resume from your projects',
    icon: 'i-lucide-file-text',
    to: '/developer/resume'
  },
  {
    title: 'Interview Prep',
    description: 'Get AI-generated interview questions',
    icon: 'i-lucide-message-square',
    to: '/developer/interview-prep'
  }
]
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
      <p class="text-muted">Manage your developer profile and showcase your skills</p>
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
            <UIcon :name="stat.icon" class="w-6 h-6 text-primary" />
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
          class="bg-elevated border border-default rounded-xl p-5 hover:border-primary/50 transition-colors cursor-pointer"
          @click="navigateTo(action.to)"
        >
          <div class="flex items-start gap-4">
            <div class="p-3 rounded-lg bg-primary/10">
              <UIcon :name="action.icon" class="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 class="font-semibold mb-1">{{ action.title }}</h3>
              <p class="text-sm text-muted">{{ action.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity (Placeholder) -->
    <div>
      <h2 class="text-xl font-semibold mb-4">Recent Activity</h2>
      <div class="bg-elevated border border-default rounded-xl p-8">
        <div class="text-center">
          <UIcon name="i-lucide-inbox" class="w-12 h-12 text-muted mx-auto mb-4" />
          <p class="text-muted">No activity yet. Start by adding a repository!</p>
          <UButton to="/developer/repositories" class="mt-4">
            Add Repository
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
