<script setup lang="ts">
useSeoMeta({
  title: 'Verifying... - DevProfile AI'
})

const { handleMagicLinkCallback, loading } = useAuth()

onMounted(async () => {
  await handleMagicLinkCallback()
})
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center">
    <div class="text-center">
      <UIcon 
        name="i-lucide-loader-2" 
        class="w-12 h-12 text-primary mx-auto mb-4 animate-spin" 
      />
      <h1 class="text-xl font-semibold">Verifying your login...</h1>
      <p class="text-muted mt-2">Please wait while we sign you in.</p>
    </div>
  </div>
</template>
