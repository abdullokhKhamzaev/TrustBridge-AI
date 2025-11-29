<script setup lang="ts">
import type { CostEstimate } from '~/composables/useAnalysis'

const props = defineProps<{
  repositoryId: string
  repoUrl: string
  repoName: string
  githubUsername: string
}>()

const emit = defineEmits<{
  'analysis-complete': [analysisId: string]
  'close': []
}>()

const { estimateCost, startAnalysis, loading, error } = useAnalysis()
const toast = useToast()

const isOpen = defineModel<boolean>('open', { default: false })
const step = ref<'estimate' | 'analyzing' | 'complete' | 'error'>('estimate')
const costEstimate = ref<CostEstimate | null>(null)
const analysisResult = ref<any>(null)
const progress = ref(0)

// Reset state when modal opens
watch(isOpen, async (open) => {
  if (open) {
    step.value = 'estimate'
    costEstimate.value = null
    analysisResult.value = null
    progress.value = 0
    error.value = null
    
    // Fetch cost estimate
    await fetchEstimate()
  }
})

async function fetchEstimate() {
  try {
    costEstimate.value = await estimateCost(
      props.repositoryId,
      props.repoUrl,
      props.githubUsername
    )
  } catch (e) {
    step.value = 'error'
  }
}

async function handleStartAnalysis() {
  step.value = 'analyzing'
  progress.value = 10
  
  // Simulate progress
  const progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 15
    }
  }, 1000)

  try {
    analysisResult.value = await startAnalysis(
      props.repositoryId,
      props.repoUrl,
      props.githubUsername
    )
    
    clearInterval(progressInterval)
    progress.value = 100
    step.value = 'complete'
    
    toast.add({
      title: 'Analysis Complete!',
      description: `Found ${analysisResult.value.achievements_count} achievements and ${analysisResult.value.resume_points_count} resume points.`,
      color: 'success'
    })
    
    emit('analysis-complete', analysisResult.value.analysis_id)
    
  } catch (e: any) {
    clearInterval(progressInterval)
    step.value = 'error'
    
    toast.add({
      title: 'Analysis Failed',
      description: e.data?.statusMessage || e.message || 'Something went wrong',
      color: 'error'
    })
  }
}

function handleClose() {
  isOpen.value = false
  emit('close')
}

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
    micro: 'Micro Project',
    small: 'Small Project',
    medium: 'Medium Project',
    large: 'Large Project',
    enterprise: 'Enterprise Project'
  }
  return labels[scale] || scale
}
</script>

<template>
  <UModal v-model:open="isOpen" :title="step === 'complete' ? 'Analysis Complete!' : `Analyze ${repoName}`">
    <slot />
    
    <template #body>
      <!-- Loading Estimate -->
      <div v-if="loading && step === 'estimate'" class="flex flex-col items-center py-8">
        <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary mb-4" />
        <p class="text-gray-500">Calculating analysis cost...</p>
      </div>
      
      <!-- Cost Estimate -->
      <div v-else-if="step === 'estimate' && costEstimate" class="space-y-6">
        <!-- Project Info -->
        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <span class="font-medium">{{ costEstimate.repo_name }}</span>
            <UBadge :color="getScaleColor(costEstimate.project_scale)" variant="subtle">
              {{ getScaleLabel(costEstimate.project_scale) }}
            </UBadge>
          </div>
          
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-git-commit" class="w-4 h-4 text-gray-400" />
              <span>{{ costEstimate.total_commits }} commits</span>
            </div>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-calendar" class="w-4 h-4 text-gray-400" />
              <span>{{ costEstimate.project_duration_days }} days</span>
            </div>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-file-code" class="w-4 h-4 text-gray-400" />
              <span>{{ costEstimate.file_count }} files</span>
            </div>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-check-circle" class="w-4 h-4 text-gray-400" />
              <span v-if="costEstimate.has_package_json">package.json ✓</span>
              <span v-else class="text-gray-400">No package.json</span>
            </div>
          </div>
          
          <!-- Languages -->
          <div v-if="costEstimate.languages.length > 0" class="mt-3 flex flex-wrap gap-1">
            <UBadge
              v-for="lang in costEstimate.languages"
              :key="lang"
              variant="subtle"
              color="neutral"
              size="xs"
            >
              {{ lang }}
            </UBadge>
          </div>
        </div>
        
        <!-- Cost Breakdown -->
        <div class="border dark:border-gray-700 rounded-lg p-4">
          <h4 class="font-medium mb-3">Estimated Cost</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Input tokens</span>
              <span>~{{ costEstimate.estimated_input_tokens.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Output tokens</span>
              <span>~{{ costEstimate.estimated_output_tokens.toLocaleString() }}</span>
            </div>
            <div class="border-t dark:border-gray-700 pt-2 mt-2 flex justify-between font-medium">
              <span>Total tokens</span>
              <span>~{{ costEstimate.estimated_total_tokens.toLocaleString() }}</span>
            </div>
          </div>
        </div>
        
        <!-- What you'll get -->
        <div class="text-sm text-gray-500">
          <p class="font-medium text-gray-700 dark:text-gray-300 mb-2">What you'll get:</p>
          <ul class="space-y-1">
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
              Project scale classification
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
              Key achievements & highlights
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
              Resume-ready bullet points
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
              Technical stack analysis
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check" class="w-4 h-4 text-green-500" />
              Interview preparation topics
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Analyzing Progress -->
      <div v-else-if="step === 'analyzing'" class="py-8">
        <div class="flex flex-col items-center">
          <UIcon name="i-lucide-brain" class="w-12 h-12 text-primary mb-4 animate-pulse" />
          <h3 class="text-lg font-medium mb-2">Analyzing Repository...</h3>
          <p class="text-gray-500 text-sm mb-6 text-center">
            AI is analyzing your code, commits, and project structure
          </p>
          
          <!-- Progress bar -->
          <div class="w-full max-w-xs">
            <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-primary transition-all duration-500 ease-out"
                :style="{ width: `${Math.min(progress, 100)}%` }"
              />
            </div>
            <p class="text-center text-sm text-gray-500 mt-2">
              {{ Math.round(progress) }}%
            </p>
          </div>
        </div>
      </div>
      
      <!-- Complete -->
      <div v-else-if="step === 'complete' && analysisResult" class="py-6">
        <div class="flex flex-col items-center text-center">
          <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <UIcon name="i-lucide-check" class="w-8 h-8 text-green-500" />
          </div>
          
          <h3 class="text-lg font-medium mb-2">Analysis Complete!</h3>
          
          <div class="grid grid-cols-3 gap-4 w-full mt-4 mb-6">
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p class="text-2xl font-bold text-primary">{{ analysisResult.achievements_count }}</p>
              <p class="text-xs text-gray-500">Achievements</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p class="text-2xl font-bold text-primary">{{ analysisResult.resume_points_count }}</p>
              <p class="text-xs text-gray-500">Resume Points</p>
            </div>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <p class="text-2xl font-bold text-primary">{{ (analysisResult.elapsed_ms / 1000).toFixed(1) }}s</p>
              <p class="text-xs text-gray-500">Analysis Time</p>
            </div>
          </div>
          
          <UBadge :color="getScaleColor(analysisResult.project_scale)" size="lg">
            {{ getScaleLabel(analysisResult.project_scale) }}
          </UBadge>
        </div>
      </div>
      
      <!-- Error -->
      <div v-else-if="step === 'error'" class="py-8">
        <div class="flex flex-col items-center text-center">
          <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <UIcon name="i-lucide-x" class="w-8 h-8 text-red-500" />
          </div>
          
          <h3 class="text-lg font-medium mb-2">Analysis Failed</h3>
          <p class="text-gray-500 text-sm mb-4">
            {{ error || 'Something went wrong. Please try again.' }}
          </p>
          
          <UButton @click="fetchEstimate" variant="outline">
            Try Again
          </UButton>
        </div>
      </div>
    </template>
    
    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton variant="ghost" @click="handleClose">
          {{ step === 'complete' ? 'Close' : 'Cancel' }}
        </UButton>
        
        <UButton
          v-if="step === 'estimate'"
          color="primary"
          :loading="loading"
          :disabled="!costEstimate"
          @click="handleStartAnalysis"
        >
          <UIcon name="i-lucide-sparkles" class="w-4 h-4 mr-1" />
          Start Analysis
        </UButton>
        
        <NuxtLink
          v-if="step === 'complete'"
          :to="`/developer/repositories/${repositoryId}`"
        >
          <UButton color="primary">
            View Results
            <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-1" />
          </UButton>
        </NuxtLink>
      </div>
    </template>
  </UModal>
</template>
