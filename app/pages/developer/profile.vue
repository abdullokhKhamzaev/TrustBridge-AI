<script setup lang="ts">
import type { DeveloperProfile } from '~/types/database'

useSeoMeta({
  title: 'Edit Profile - DevProfile AI'
})

const supabase = useSupabaseClient<any>()
const user = useSupabaseUser()
const toast = useToast()

// State
const profile = ref<DeveloperProfile | null>(null)
const loading = ref(true)
const saving = ref(false)

// Form data
const form = ref({
  full_name: '',
  job_title: '',
  bio: '',
  location: '',
  linkedin_url: '',
  portfolio_url: '',
  twitter_url: '',
  is_public: false
})

// Fetch profile
const fetchProfile = async () => {
  if (!user.value) return
  
  loading.value = true
  
  try {
    const { data, error } = await supabase
      .from('developer_profiles')
      .select('*')
      .eq('user_id', user.value.id)
      .single()
    
    if (error) throw error
    
    profile.value = data
    
    // Populate form
    form.value = {
      full_name: data.full_name || '',
      job_title: data.job_title || '',
      bio: data.bio || '',
      location: data.location || '',
      linkedin_url: data.linkedin_url || '',
      portfolio_url: data.portfolio_url || '',
      twitter_url: data.twitter_url || '',
      is_public: data.is_public || false
    }
  } catch (e) {
    console.error('Failed to fetch profile:', e)
  } finally {
    loading.value = false
  }
}

// Save profile
const saveProfile = async () => {
  if (!profile.value) return
  
  saving.value = true
  
  try {
    const { error } = await supabase
      .from('developer_profiles')
      .update({
        full_name: form.value.full_name || null,
        job_title: form.value.job_title || null,
        bio: form.value.bio || null,
        location: form.value.location || null,
        linkedin_url: form.value.linkedin_url || null,
        portfolio_url: form.value.portfolio_url || null,
        twitter_url: form.value.twitter_url || null,
        is_public: form.value.is_public
      })
      .eq('id', profile.value.id)
    
    if (error) throw error
    
    toast.add({
      title: 'Profile saved',
      description: 'Your profile has been updated successfully',
      color: 'success'
    })
  } catch (e: any) {
    toast.add({
      title: 'Save failed',
      description: e.message,
      color: 'error'
    })
  } finally {
    saving.value = false
  }
}

// Profile completion
const profileCompletion = computed(() => {
  const fields = [
    form.value.full_name,
    profile.value?.github_username,
    form.value.job_title,
    form.value.bio,
    form.value.location,
    profile.value?.avatar_url
  ]
  
  const filled = fields.filter(f => !!f).length
  return Math.round((filled / fields.length) * 100)
})

onMounted(fetchProfile)
</script>

<template>
  <div class="container mx-auto py-8 px-4 max-w-3xl">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-muted mb-4">
        <UButton to="/developer" variant="ghost" size="sm" class="p-0">
          <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
        </UButton>
        <span>Back to Dashboard</span>
      </div>
      <h1 class="text-3xl font-bold mb-2">Edit Profile</h1>
      <p class="text-muted">Update your developer profile information</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-primary" />
    </div>

    <template v-else-if="profile">
      <!-- Profile Completion -->
      <div class="mb-8 bg-elevated border border-default rounded-xl p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="font-medium">Profile Completion</span>
          <span class="text-sm text-muted">{{ profileCompletion }}%</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            class="bg-primary h-2 rounded-full transition-all duration-300" 
            :style="{ width: `${profileCompletion}%` }"
          />
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="saveProfile" class="space-y-6">
        <!-- GitHub Info (Read-only) -->
        <div class="bg-elevated border border-default rounded-xl p-6">
          <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-github" class="w-5 h-5" />
            GitHub Account
          </h2>
          <div class="flex items-center gap-4">
            <img 
              v-if="profile.avatar_url"
              :src="profile.avatar_url"
              :alt="profile.github_username || 'Avatar'"
              class="w-16 h-16 rounded-full"
            />
            <div v-else class="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <UIcon name="i-lucide-user" class="w-8 h-8 text-muted" />
            </div>
            <div>
              <p class="font-semibold">@{{ profile.github_username || 'Not connected' }}</p>
              <p class="text-sm text-muted">{{ profile.email }}</p>
            </div>
          </div>
        </div>

        <!-- Personal Info -->
        <div class="bg-elevated border border-default rounded-xl p-6">
          <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-user" class="w-5 h-5" />
            Personal Information
          </h2>
          
          <div class="space-y-4">
            <UFormField label="Full Name">
              <UInput 
                v-model="form.full_name"
                placeholder="John Doe"
              />
            </UFormField>

            <UFormField label="Job Title">
              <UInput 
                v-model="form.job_title"
                placeholder="Full Stack Developer"
              />
            </UFormField>

            <UFormField label="Location">
              <UInput 
                v-model="form.location"
                placeholder="San Francisco, CA"
              />
            </UFormField>

            <UFormField label="Bio">
              <UTextarea 
                v-model="form.bio"
                placeholder="Tell us about yourself..."
                :rows="4"
              />
            </UFormField>
          </div>
        </div>

        <!-- Social Links -->
        <div class="bg-elevated border border-default rounded-xl p-6">
          <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-link" class="w-5 h-5" />
            Social Links
          </h2>
          
          <div class="space-y-4">
            <UFormField label="LinkedIn URL">
              <UInput 
                v-model="form.linkedin_url"
                type="url"
                placeholder="https://linkedin.com/in/username"
              />
            </UFormField>

            <UFormField label="Portfolio URL">
              <UInput 
                v-model="form.portfolio_url"
                type="url"
                placeholder="https://yourportfolio.com"
              />
            </UFormField>

            <UFormField label="Twitter/X URL">
              <UInput 
                v-model="form.twitter_url"
                type="url"
                placeholder="https://twitter.com/username"
              />
            </UFormField>
          </div>
        </div>

        <!-- Privacy Settings -->
        <div class="bg-elevated border border-default rounded-xl p-6">
          <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-shield" class="w-5 h-5" />
            Privacy
          </h2>
          
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium">Public Profile</p>
              <p class="text-sm text-muted">
                {{ form.is_public 
                  ? 'Your profile is visible to everyone' 
                  : 'Your profile is only visible to you' 
                }}
              </p>
            </div>
            <UToggle v-model="form.is_public" />
          </div>

          <div v-if="form.is_public && profile.github_username" class="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
            <p class="text-sm text-emerald-700 dark:text-emerald-300">
              Your public profile will be available at: 
              <a 
                :href="`/${profile.github_username}`" 
                target="_blank"
                class="font-mono underline"
              >
                devprofile.ai/{{ profile.github_username }}
              </a>
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4">
          <UButton to="/developer" variant="outline">
            Cancel
          </UButton>
          <UButton 
            type="submit" 
            :loading="saving"
          >
            Save Changes
          </UButton>
        </div>
      </form>
    </template>
  </div>
</template>
