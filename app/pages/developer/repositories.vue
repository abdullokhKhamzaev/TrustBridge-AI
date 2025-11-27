<script setup lang="ts">
useSeoMeta({
  title: 'Repositories - DevProfile AI'
})

const showAddModal = ref(false)
const repoUrl = ref('')
const loading = ref(false)

// Mock data - will be replaced with real data
const repositories = ref([])

async function addRepository() {
  loading.value = true
  // TODO: Implement repository addition
  console.log('Adding repository:', repoUrl.value)
  setTimeout(() => {
    loading.value = false
    showAddModal.value = false
    repoUrl.value = ''
  }, 1000)
}
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold mb-2">Repositories</h1>
        <p class="text-muted">Manage your GitHub repositories for analysis</p>
      </div>
      <UButton @click="showAddModal = true" icon="i-lucide-plus">
        Add Repository
      </UButton>
    </div>

    <!-- Empty State -->
    <div v-if="repositories.length === 0" class="bg-elevated border border-default rounded-xl p-12">
      <div class="text-center">
        <UIcon name="i-lucide-git-branch" class="w-16 h-16 text-muted mx-auto mb-4" />
        <h3 class="text-xl font-semibold mb-2">No repositories yet</h3>
        <p class="text-muted mb-6">Add your first GitHub repository to start the AI analysis</p>
        <UButton @click="showAddModal = true" icon="i-lucide-plus">
          Add Your First Repository
        </UButton>
      </div>
    </div>

    <!-- Repositories List (when data exists) -->
    <div v-else class="space-y-4">
      <div 
        v-for="repo in repositories" 
        :key="repo.id"
        class="bg-elevated border border-default rounded-xl p-5"
      >
        <!-- Repository card content will go here -->
      </div>
    </div>

    <!-- Add Repository Modal -->
    <UModal 
      v-model:open="showAddModal" 
      title="Add Repository"
      description="Connect a GitHub repository for AI analysis"
    >
      <template #body>
        <form @submit.prevent="addRepository" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">GitHub Repository URL</label>
            <UInput
              v-model="repoUrl"
              placeholder="https://github.com/username/repository"
              icon="i-lucide-link"
              size="lg"
            />
          </div>

          <p class="text-sm text-muted">
            Enter the full URL of your GitHub repository. Both public and private repositories are supported.
          </p>
        </form>
      </template>

      <template #footer>
        <div class="flex gap-2 justify-end">
          <UButton
            variant="outline"
            @click="showAddModal = false"
          >
            Cancel
          </UButton>
          <UButton
            :loading="loading"
            @click="addRepository"
          >
            Add Repository
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
