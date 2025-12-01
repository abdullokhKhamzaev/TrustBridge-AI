<script setup lang="ts">
useSeoMeta({
  title: 'About - Trust Bridge',
  description: 'Learn about Trust Bridge - our mission to build connections based on verified data, not self-reported skills.'
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="py-16 px-4 text-center">
      <div class="container mx-auto">
        <h1 class="text-4xl font-bold mb-4">About Trust Bridge</h1>
        <p class="text-xl text-muted">
          We're building a world where talent and opportunity connect through verified skills, not self-promotion.
        </p>
      </div>
    </section>

    <!-- Vision -->
    <section class="py-12 px-4">
      <div class="container mx-auto">
        <div class="text-center mb-10">
          <h2 class="text-3xl font-bold mb-4">Our Vision</h2>
          <p class="text-muted">
            A world where professionals are evaluated based on their actual abilities, and companies find the right talent without bias.
          </p>
        </div>

        <div class="space-y-6">
          <div class="bg-elevated border border-default rounded-xl p-6">
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-target" class="text-primary"/>
              The Problem
            </h3>
            <div class="space-y-4 text-muted">
              <p>
                <strong class="text-default">For Companies:</strong> Resumes are unreliable. Great candidates undersell themselves while others oversell. 
                You waste time on mismatches and miss hidden gems who don't interview well.
              </p>
              <p>
                <strong class="text-default">For Professionals:</strong> You struggle to articulate your real value. 
                Whether you're an introvert, new to the industry, or simply bad at self-promotion - your skills get overlooked.
              </p>
            </div>
          </div>

          <div class="bg-elevated border border-default rounded-xl p-6">
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-lightbulb" class="text-primary"/>
              Our Solution
            </h3>
            <p class="text-muted">
              Trust Bridge uses AI to analyze real work artifacts - code repositories, portfolios, project contributions - 
              and creates verified profiles that objectively showcase skills and achievements. 
              We bridge the gap between what you can do and how you present it.
            </p>
          </div>

          <div class="bg-elevated border border-default rounded-xl p-6">
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-users" class="text-primary"/>
              Who We Serve
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-muted">
              <div>
                <h4 class="font-semibold text-default mb-2">Companies & Recruiters</h4>
                <ul class="space-y-2">
                  <li class="flex items-start gap-2">
                    <UIcon name="i-lucide-check" class="text-green-500 mt-1 flex-shrink-0"/>
                    <span>Find talent based on verified skills</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <UIcon name="i-lucide-check" class="text-green-500 mt-1 flex-shrink-0"/>
                    <span>HR-friendly and Tech Manager views</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <UIcon name="i-lucide-check" class="text-green-500 mt-1 flex-shrink-0"/>
                    <span>Reduce hiring mistakes</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 class="font-semibold text-default mb-2">Professionals</h4>
                <ul class="space-y-2">
                  <li class="flex items-start gap-2">
                    <UIcon name="i-lucide-check" class="text-green-500 mt-1 flex-shrink-0"/>
                    <span>Let AI highlight your achievements</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <UIcon name="i-lucide-check" class="text-green-500 mt-1 flex-shrink-0"/>
                    <span>Generate accurate profiles & resumes</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <UIcon name="i-lucide-check" class="text-green-500 mt-1 flex-shrink-0"/>
                    <span>Connect with right opportunities</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-elevated border border-default rounded-xl p-6">
            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
              <UIcon name="i-lucide-heart" class="text-primary"/>
              Our Values
            </h3>
            <ul class="space-y-3 text-muted">
              <li class="flex items-start gap-2">
                <UIcon name="i-lucide-check" class="text-green-500 mt-1 flex-shrink-0"/>
                <span><strong>Facts over claims</strong> - Verified data, not self-reported skills</span>
              </li>
              <li class="flex items-start gap-2">
                <UIcon name="i-lucide-check" class="text-green-500 mt-1 flex-shrink-0"/>
                <span><strong>Transparency</strong> - Both sides deserve honest, objective information</span>
              </li>
              <li class="flex items-start gap-2">
                <UIcon name="i-lucide-check" class="text-green-500 mt-1 flex-shrink-0"/>
                <span><strong>Privacy first</strong> - Your work is analyzed, never stored or shared without consent</span>
              </li>
              <li class="flex items-start gap-2">
                <UIcon name="i-lucide-check" class="text-green-500 mt-1 flex-shrink-0"/>
                <span><strong>Inclusive</strong> - Everyone deserves to be evaluated fairly, regardless of self-promotion skills</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-16 px-4">
      <div class="container mx-auto">
        <div class="bg-primary/10 border border-primary/20 rounded-2xl p-8 text-center">
          <h2 class="text-2xl font-bold mb-3">Ready to Build Trust?</h2>
          <p class="text-muted mb-6">Create your verified profile or find verified talent today.</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <UButton to="/auth/login" size="lg">
              Get Started
              <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-2"/>
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
