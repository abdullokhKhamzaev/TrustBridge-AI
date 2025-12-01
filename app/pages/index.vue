<script setup lang="ts">
const features = [
  {
    icon: 'i-lucide-shield-check',
    title: 'Verified Credentials',
    description: 'AI analyzes real work artifacts to verify skills - no more guessing from resumes.'
  },
  {
    icon: 'i-lucide-scan-search',
    title: 'Deep Work Analysis',
    description: 'Understand the true scope and impact of projects through intelligent analysis.'
  },
  {
    icon: 'i-lucide-file-text',
    title: 'Smart Profile Builder',
    description: 'Generate professional profiles that accurately reflect real capabilities.'
  },
  {
    icon: 'i-lucide-users',
    title: 'Dual-View Profiles',
    description: 'Tailored views for HR (soft skills, impact) and Tech Managers (architecture, code quality).'
  },
  {
    icon: 'i-lucide-target',
    title: 'Better Matches',
    description: 'Connect companies with talent based on verified abilities, not self-promotion.'
  },
  {
    icon: 'i-lucide-trending-up',
    title: 'Growth Tracking',
    description: 'Showcase professional development and learning trajectory over time.'
  }
]

const steps = [
  {
    icon: 'i-lucide-link',
    title: 'Connect Your Work',
    description: 'Link your GitHub repositories, portfolios, or other work artifacts.'
  },
  {
    icon: 'i-lucide-sparkles',
    title: 'AI Verification',
    description: 'Our AI analyzes your work to extract verified skills and achievements.'
  },
  {
    icon: 'i-lucide-rocket',
    title: 'Get Matched',
    description: 'Share your verified profile and connect with the right opportunities.'
  }
]
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative py-24 md:py-32 px-4 overflow-hidden">
      <!-- Background gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
      <div class="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute bottom-10 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div class="container mx-auto text-center max-w-4xl relative">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <UIcon name="i-lucide-zap" class="w-4 h-4 text-primary" />
          <span class="text-sm font-medium text-primary">AI-Powered Credential Verification</span>
        </div>
        
        <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
          Build <span class="text-primary">Trust</span> Through
          <br class="hidden md:block" />
          Verified Skills
        </h1>
        <p class="text-lg md:text-xl text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
          Trust Bridge connects talent and companies through AI-verified credentials. 
          No more inflated resumes. No more overlooked talent. Just facts.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton to="/auth/login" size="xl">
            Get Started Free
            <UIcon name="i-lucide-arrow-right" class="w-5 h-5 ml-2" />
          </UButton>
          <UButton to="/about" size="xl" variant="outline">
            <UIcon name="i-lucide-play-circle" class="w-5 h-5 mr-2" />
            See How It Works
          </UButton>
        </div>
        
        <!-- Trust indicators -->
        <div class="flex flex-wrap items-center justify-center gap-6 mt-12 text-muted text-sm">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-check-circle" class="w-5 h-5 text-primary" />
            <span>Free to start</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-lock" class="w-5 h-5 text-primary" />
            <span>Privacy first</span>
          </div>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-github" class="w-5 h-5 text-primary" />
            <span>GitHub integration</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Problem Statement -->
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-6xl">
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 text-red-500" />
            <span class="text-sm font-medium text-red-500">The Problem</span>
          </div>
          <h2 class="text-3xl md:text-4xl font-bold mb-4">The Hiring Gap We Bridge</h2>
          <p class="text-muted max-w-2xl mx-auto text-lg">
            Resumes lie. Interviews fail. Great talent gets overlooked while companies waste time on mismatches.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="group relative bg-elevated border border-default rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <UIcon name="i-lucide-building-2" class="w-6 h-6 text-primary" />
            </div>
            <h3 class="font-semibold text-lg mb-3">For Companies</h3>
            <p class="text-muted leading-relaxed">Find talent based on verified skills, not inflated resumes. Stop missing great candidates who undersell themselves.</p>
          </div>

          <div class="group relative bg-elevated border border-default rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <UIcon name="i-lucide-user-check" class="w-6 h-6 text-primary" />
            </div>
            <h3 class="font-semibold text-lg mb-3">For Professionals</h3>
            <p class="text-muted leading-relaxed">Stop underselling yourself. Let AI objectively highlight your achievements and real impact.</p>
          </div>

          <div class="group relative bg-elevated border border-default rounded-2xl p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
              <UIcon name="i-lucide-handshake" class="w-6 h-6 text-primary" />
            </div>
            <h3 class="font-semibold text-lg mb-3">Trust Over Claims</h3>
            <p class="text-muted leading-relaxed">Build connections based on verified data, not self-reported skills or interview performance.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-20 px-4 bg-muted/30">
      <div class="container mx-auto max-w-6xl">
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <UIcon name="i-lucide-layers" class="w-4 h-4 text-primary" />
            <span class="text-sm font-medium text-primary">Features</span>
          </div>
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
          <p class="text-muted text-lg">From work analysis to verified profiles, we've got you covered.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="feature in features" 
            :key="feature.title"
            class="group bg-elevated border border-default rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
          >
            <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <UIcon :name="feature.icon" class="w-6 h-6 text-primary" />
            </div>
            <h3 class="font-semibold text-lg mb-2">{{ feature.title }}</h3>
            <p class="text-muted">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-4xl">
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <UIcon name="i-lucide-workflow" class="w-4 h-4 text-primary" />
            <span class="text-sm font-medium text-primary">How It Works</span>
          </div>
          <h2 class="text-3xl md:text-4xl font-bold mb-4">Three Simple Steps</h2>
          <p class="text-muted text-lg">Get your verified profile in minutes</p>
        </div>

        <div class="relative">
          <!-- Connection line -->
          <div class="hidden md:block absolute top-16 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div 
              v-for="(step, index) in steps" 
              :key="step.title"
              class="relative text-center"
            >
              <div class="w-14 h-14 mx-auto mb-6 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center relative z-10">
                <UIcon :name="step.icon" class="w-7 h-7 text-primary" />
              </div>
              <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">{{ index + 1 }}</div>
              <h3 class="text-lg font-semibold mb-2">{{ step.title }}</h3>
              <p class="text-muted">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 px-4">
      <div class="container mx-auto max-w-4xl">
        <div class="relative bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-10 md:p-14 text-center overflow-hidden">
          <!-- Decorative elements -->
          <div class="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
          <div class="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          
          <div class="relative">
            <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/20 flex items-center justify-center">
              <UIcon name="i-lucide-sparkles" class="w-8 h-8 text-primary" />
            </div>
            <h2 class="text-3xl md:text-4xl font-bold mb-4">Ready to Build Trust?</h2>
            <p class="text-muted mb-8 max-w-xl mx-auto text-lg">
              Join professionals who let their verified work speak for them, and companies who want real talent.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <UButton to="/auth/login" size="xl">
                Create Free Account
                <UIcon name="i-lucide-arrow-right" class="w-5 h-5 ml-2" />
              </UButton>
              <UButton to="/about" size="xl" variant="outline">
                About Trust Bridge
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
