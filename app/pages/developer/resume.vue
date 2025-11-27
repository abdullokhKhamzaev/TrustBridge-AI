<script setup lang="ts">
useSeoMeta({
  title: 'Resume Builder - DevProfile AI'
})

const hasAnalyzedRepos = ref(false) // Will be computed from actual data
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Resume Builder</h1>
      <p class="text-muted">Generate a professional resume based on your analyzed repositories</p>
    </div>

    <!-- No Analyzed Repos State -->
    <div v-if="!hasAnalyzedRepos" class="bg-elevated border border-default rounded-xl p-12">
      <div class="text-center">
        <UIcon name="i-lucide-file-text" class="w-16 h-16 text-muted mx-auto mb-4" />
        <h3 class="text-xl font-semibold mb-2">No Analyzed Repositories</h3>
        <p class="text-muted mb-6">
          You need to analyze at least one repository before generating a resume.
          Our AI will use your project data to create a professional resume.
        </p>
        <UButton to="/developer/repositories" icon="i-lucide-git-branch">
          Go to Repositories
        </UButton>
      </div>
    </div>

    <!-- Resume Builder UI (when repos are analyzed) -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Resume Options -->
      <div class="lg:col-span-1 space-y-4">
        <div class="bg-elevated border border-default rounded-xl p-5">
          <h3 class="font-semibold mb-4">Resume Options</h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">Target Job Title</label>
              <UInput placeholder="Full Stack Developer" />
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Format</label>
              <USelect
                :items="[
                  { label: 'Professional', value: 'professional' },
                  { label: 'Modern', value: 'modern' },
                  { label: 'ATS-Friendly', value: 'ats' }
                ]"
              />
            </div>

            <UButton block icon="i-lucide-sparkles">
              Generate Resume
            </UButton>
          </div>
        </div>

        <div class="bg-elevated border border-default rounded-xl p-5">
          <h3 class="font-semibold mb-3">Selected Projects</h3>
          <p class="text-sm text-muted">
            Select which analyzed projects to include in your resume.
          </p>
        </div>
      </div>

      <!-- Resume Preview -->
      <div class="lg:col-span-2">
        <div class="bg-elevated border border-default rounded-xl">
          <div class="flex items-center justify-between p-4 border-b border-default">
            <h3 class="font-semibold">Resume Preview</h3>
            <UButton icon="i-lucide-download" variant="outline" size="sm">
              Export PDF
            </UButton>
          </div>
          
          <div class="min-h-[600px] flex items-center justify-center text-muted p-6">
            <div class="text-center">
              <UIcon name="i-lucide-file-text" class="w-12 h-12 mx-auto mb-4" />
              <p>Generate a resume to see preview</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
