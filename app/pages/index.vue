<script setup lang="ts">
const features = [
  {
    icon: 'i-lucide-git-branch',
    title: 'AI-Powered Repository Analysis',
    description: 'Connect your GitHub repositories and let AI analyze your real contributions.'
  },
  {
    icon: 'i-lucide-file-text',
    title: 'Smart Resume Builder',
    description: 'Generate professional resumes based on your actual work.'
  },
  {
    icon: 'i-lucide-message-square',
    title: 'Interview Preparation',
    description: 'Get AI-generated interview questions tailored to your projects.'
  },
  {
    icon: 'i-lucide-bar-chart-3',
    title: 'Project Scale Classification',
    description: 'Understand the true scale of your projects accurately.'
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'Facts Over Claims',
    description: 'Build trust through verified, data-driven insights.'
  },
  {
    icon: 'i-lucide-users',
    title: 'Company Matching',
    description: 'Let companies find you based on your actual skills.'
  }
]
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="py-20 px-4">
      <div class="container mx-auto text-center max-w-4xl">
        <h1 class="text-4xl md:text-6xl font-bold mb-6">
          <span class="text-primary">AI-Powered</span> Developer Portfolio
        </h1>
        <p class="text-xl text-muted mb-8 max-w-2xl mx-auto">
          DevProfile AI analyzes your GitHub repositories to create a fact-based developer profile. 
          Stop underselling yourself - let your code speak for you.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton to="/auth/login" size="xl">
            Get Started Free
            <UIcon name="i-lucide-arrow-right" class="w-5 h-5 ml-2" />
          </UButton>
          <UButton to="/about" size="xl" variant="outline">
            Learn More
          </UButton>
        </div>
      </div>
    </section>

    <!-- Problem Statement -->
    <section class="py-16 px-4 bg-muted/30">
      <div class="container mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4">The Problem We Solve</h2>
          <p class="text-muted max-w-2xl mx-auto">
            Many talented developers struggle to showcase their skills. They don't know what to highlight 
            or can't translate their technical work into a compelling narrative.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-elevated border border-default rounded-xl p-6">
            <div class="flex items-center gap-2 mb-3">
              <UIcon name="i-lucide-user-x" class="w-6 h-6 text-red-500" />
              <span class="font-semibold">For Shy Developers</span>
            </div>
            <p class="text-muted">Stop underselling yourself. Let AI highlight your achievements objectively.</p>
          </div>

          <div class="bg-elevated border border-default rounded-xl p-6">
            <div class="flex items-center gap-2 mb-3">
              <UIcon name="i-lucide-building-2" class="w-6 h-6 text-blue-500" />
              <span class="font-semibold">For Companies</span>
            </div>
            <p class="text-muted">Find developers based on real skills, not inflated resumes.</p>
          </div>

          <div class="bg-elevated border border-default rounded-xl p-6">
            <div class="flex items-center gap-2 mb-3">
              <UIcon name="i-lucide-handshake" class="w-6 h-6 text-green-500" />
              <span class="font-semibold">Trust Over Claims</span>
            </div>
            <p class="text-muted">Build connections based on verified data, not self-reported skills.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="py-16 px-4">
      <div class="container mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4">Everything You Need</h2>
          <p class="text-muted">From repository analysis to interview preparation, we've got you covered.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="feature in features" 
            :key="feature.title"
            class="bg-elevated border border-default rounded-xl p-6 hover:border-primary/50 transition-colors"
          >
            <UIcon :name="feature.icon" class="w-10 h-10 text-primary mb-4" />
            <h3 class="font-semibold text-lg mb-2">{{ feature.title }}</h3>
            <p class="text-muted text-sm">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-16 px-4 bg-muted/30">
      <div class="container mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold mb-4">How It Works</h2>
          <p class="text-muted">Three simple steps to showcase your real skills</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <span class="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 class="text-lg font-semibold mb-2">Connect GitHub</h3>
            <p class="text-muted">Link your GitHub repositories - public or private.</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <span class="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 class="text-lg font-semibold mb-2">AI Analysis</h3>
            <p class="text-muted">Our AI analyzes your code and contributions.</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <span class="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 class="text-lg font-semibold mb-2">Get Results</h3>
            <p class="text-muted">Receive resume, interview prep, and opportunities.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-20 px-4">
      <div class="container mx-auto">
        <div class="bg-primary/10 border border-primary/20 rounded-2xl p-8 md:p-12 text-center">
          <h2 class="text-3xl font-bold mb-4">Ready to Showcase Your Real Skills?</h2>
          <p class="text-muted mb-8 max-w-xl mx-auto">
            Join developers who are tired of underselling themselves. Let your code speak for you.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <UButton to="/auth/login" size="lg">
              Create Free Account
              <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-2" />
            </UButton>
            <UButton to="/about" size="lg" variant="outline">
              Learn More
            </UButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
