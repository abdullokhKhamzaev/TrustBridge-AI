<script setup lang="ts">
useSeoMeta({
  title: 'Interview Prep - DevProfile AI'
})

const hasAnalyzedRepos = ref(false) // Will be computed from actual data
const selectedCategory = ref('all')

const categories = [
  { label: 'All Questions', value: 'all' },
  { label: 'Technical', value: 'technical' },
  { label: 'Behavioral', value: 'behavioral' },
  { label: 'Project-Based', value: 'project' }
]
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Interview Preparation</h1>
      <p class="text-muted">Get AI-generated interview questions based on your projects</p>
    </div>

    <!-- No Analyzed Repos State -->
    <div v-if="!hasAnalyzedRepos" class="bg-elevated border border-default rounded-xl p-12">
      <div class="text-center">
        <UIcon name="i-lucide-message-square" class="w-16 h-16 text-muted mx-auto mb-4" />
        <h3 class="text-xl font-semibold mb-2">No Analyzed Repositories</h3>
        <p class="text-muted mb-6">
          Analyze your repositories first, and we'll generate personalized interview questions
          based on your actual projects and tech stack.
        </p>
        <UButton to="/developer/repositories" icon="i-lucide-git-branch">
          Go to Repositories
        </UButton>
      </div>
    </div>

    <!-- Interview Prep UI (when repos are analyzed) -->
    <div v-else>
      <!-- Controls -->
      <div class="flex flex-col sm:flex-row gap-4 mb-6">
        <div class="flex gap-1">
          <UButton
            v-for="cat in categories"
            :key="cat.value"
            :variant="selectedCategory === cat.value ? 'solid' : 'outline'"
            size="sm"
            @click="selectedCategory = cat.value"
          >
            {{ cat.label }}
          </UButton>
        </div>

        <UButton icon="i-lucide-sparkles" class="sm:ml-auto">
          Generate New Questions
        </UButton>
      </div>

      <!-- Questions List -->
      <div class="space-y-4">
        <div class="bg-elevated border border-default rounded-xl p-8">
          <div class="text-center">
            <UIcon name="i-lucide-sparkles" class="w-12 h-12 text-muted mx-auto mb-4" />
            <p class="text-muted">Click "Generate New Questions" to create interview questions</p>
          </div>
        </div>
      </div>

      <!-- Sample Question Card (template for when questions exist) -->
      <!--
      <UCard>
        <div class="flex items-start gap-4">
          <div class="p-2 rounded-lg bg-primary/10">
            <UIcon name="i-lucide-help-circle" class="w-5 h-5 text-primary" />
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <UBadge color="blue" variant="subtle">Technical</UBadge>
              <UBadge color="yellow" variant="subtle">Medium</UBadge>
            </div>
            <p class="font-medium mb-2">Question text here...</p>
            <UButton size="sm" color="neutral" variant="ghost">
              Show Answer Tips
            </UButton>
          </div>
        </div>
      </UCard>
      -->
    </div>
  </div>
</template>
