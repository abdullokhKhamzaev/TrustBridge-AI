// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false, // SPA mode - no SSR needed for dashboard app

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    // '@pinia/nuxt', // TODO: Re-enable when compatible with Nuxt 4
    '@nuxtjs/supabase'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  runtimeConfig: {
    // AI/LLM Configuration (server-side only)
    aiProvider: process.env.AI_PROVIDER || 'openai',

    // OpenAI
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o',
    openaiBaseUrl: process.env.OPENAI_BASE_URL || '',

    // Anthropic
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',

    // Gemini
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',

    public: {
      siteUrl: process.env.SITE_URL || 'http://localhost:3000'
    }
  },

  // Supabase configuration
  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      include: ['/developer/*'],
      exclude: ['/', '/about', '/auth/*']
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
