<script setup lang="ts">
useSeoMeta({
  title: 'About - DevProfile AI',
  description: 'Learn about DevProfile AI - our mission to help developers showcase their real skills through AI-powered analysis.'
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="py-16 px-4 text-center">
      <div class="container mx-auto max-w-3xl">
        <h1 class="text-4xl font-bold mb-4">About DevProfile AI</h1>
        <p class="text-xl text-muted">
          We're on a mission to create transparent, trust-based connections between developers and companies.
        </p>
      </div>
    </section>

    <!-- Vision -->
    <section class="py-12 px-4">
      <div class="container mx-auto max-w-4xl">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold mb-4">Our Vision</h2>
          <p class="text-muted">
            A world where developers are evaluated based on their actual abilities, not just their self-promotion skills.
          </p>
        </div>

        <div class="space-y-6">
          <div class="bg-elevated border border-default rounded-xl p-6">
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-target" class="text-primary" />
              The Problem
            </h3>
            <p class="text-muted">
              Many talented developers struggle to present themselves effectively. Some are introverts who hate self-promotion. 
              Others don't know how to translate their technical achievements into compelling narratives. 
              Meanwhile, companies waste time interviewing candidates whose resumes don't reflect their actual abilities.
            </p>
          </div>

          <div class="bg-elevated border border-default rounded-xl p-6">
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-lightbulb" class="text-primary" />
              Our Solution
            </h3>
            <p class="text-muted">
              DevProfile AI analyzes your GitHub repositories using advanced AI to extract meaningful insights about your work. 
              We identify your strengths, quantify your contributions, and help you articulate your experience in a way that resonates with employers.
            </p>
          </div>

          <div class="bg-elevated border border-default rounded-xl p-6">
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-heart" class="text-primary" />
              Our Values
            </h3>
            <ul class="space-y-3 text-muted">
              <li class="flex items-start gap-2">
                <UIcon name="i-lucide-check" class="text-green-500 mt-1 flex-shrink-0" />
                <span><strong>Facts over claims</strong> - We believe in data-driven insights</span>
              </li>
              <li class="flex items-start gap-2">
                <UIcon name="i-lucide-check" class="text-green-500 mt-1 flex-shrink-0" />
                <span><strong>Transparency</strong> - Both developers and companies deserve honest information</span>
              </li>
              <li class="flex items-start gap-2">
                <UIcon name="i-lucide-check" class="text-green-500 mt-1 flex-shrink-0" />
                <span><strong>Privacy first</strong> - Your code is analyzed, never stored or shared</span>
              </li>
              <li class="flex items-start gap-2">
                <UIcon name="i-lucide-check" class="text-green-500 mt-1 flex-shrink-0" />
                <span><strong>Developer-centric</strong> - Built by developers, for developers</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 px-4">
      <div class="container mx-auto max-w-2xl">
        <div class="bg-primary/10 border border-primary/20 rounded-2xl p-8 text-center">
          <h2 class="text-2xl font-bold mb-3">Ready to Get Started?</h2>
          <p class="text-muted mb-6">Create your fact-based developer profile today.</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <UButton to="/auth/login" size="lg">
              Create Account
              <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-2" />
            </UButton>
            <UButton to="/" size="lg" variant="outline">
              Back to Home
            </UButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
