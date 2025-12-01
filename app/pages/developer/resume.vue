<script setup lang="ts">
useSeoMeta({
  title: 'Resume Builder - DevProfile AI'
})
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
      <h1 class="text-3xl font-bold mb-2">Resume Builder</h1>
      <p class="text-muted">Generate a professional resume based on your analyzed repositories</p>
    </div>

    <!-- Coming Soon State -->
    <div class="bg-elevated border border-default rounded-xl p-12">
      <div class="text-center max-w-md mx-auto">
        <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <UIcon name="i-lucide-file-text" class="w-10 h-10 text-primary" />
        </div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 text-sm font-medium mb-4">
          <UIcon name="i-lucide-construction" class="w-4 h-4" />
          Coming Soon
        </div>
        <h3 class="text-xl font-semibold mb-3">AI Resume Builder</h3>
        <p class="text-muted mb-6">
          We're working on an AI-powered resume builder that will create professional resumes 
          from your analyzed repositories. Stay tuned!
        </p>
        <div class="space-y-3 text-left bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
          <p class="text-sm font-medium">What's coming:</p>
          <ul class="text-sm text-muted space-y-2">
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 text-emerald-500" />
              AI-generated professional summaries
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 text-emerald-500" />
              Skills extracted from your projects
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 text-emerald-500" />
              Multiple export formats (PDF, DOCX)
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 text-emerald-500" />
              ATS-friendly templates
            </li>
          </ul>
        </div>
        <UButton to="/developer" variant="outline">
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4 mr-2" />
          Back to Dashboard
        </UButton>
      </div>
    </div>
  </div>
</template>
