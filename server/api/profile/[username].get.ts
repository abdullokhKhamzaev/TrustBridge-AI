import { createError } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

/**
 * Get public developer profile with HR/Tech views
 * 
 * GET /api/profile/:username
 * Query params:
 *   - view: 'hr' | 'tech' | 'full' (default: 'full')
 */
export default defineEventHandler(async (event) => {
  try {
    const username = getRouterParam(event, 'username')
    if (!username) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username is required'
      })
    }

    const query = getQuery(event)
    const view = (query.view as string) || 'full'

    const supabase = await serverSupabaseClient(event)

    // Based on view type, fetch from appropriate view
    if (view === 'hr') {
      return await fetchHrProfile(supabase, username)
    } else if (view === 'tech') {
      return await fetchTechProfile(supabase, username)
    } else {
      return await fetchFullProfile(supabase, username)
    }

  } catch (error: any) {
    console.error('❌ Profile fetch error:', error.message)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch profile'
    })
  }
})

/**
 * Fetch HR-focused profile view
 */
async function fetchHrProfile(supabase: any, username: string) {
  // Fetch HR profile and stats in parallel (case-insensitive)
  const [hrResult, statsResult, projectsResult, achievementsResult] = await Promise.all([
    supabase
      .from('developer_hr_profile')
      .select('*')
      .ilike('github_username', username)
      .single(),
    supabase
      .from('developer_profile_stats')
      .select('*')
      .ilike('github_username', username)
      .single(),
    supabase
      .from('developer_projects_list')
      .select('repo_name, description, language, project_scale, total_commits, project_duration_days, hr_summary, team_context')
      .ilike('github_username', username),
    supabase
      .from('developer_achievements')
      .select('*')
      .ilike('github_username', username)
      .in('category', ['business_impact', 'feature', 'integration'])
  ])

  if (hrResult.error || !hrResult.data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Profile not found or not public'
    })
  }

  const hrProfile = hrResult.data
  const stats = statsResult.data || {}
  const projects = projectsResult.data || []
  const achievements = achievementsResult.data || []

  return {
    success: true,
    view: 'hr',
    data: {
      profile: {
        full_name: hrProfile.full_name,
        job_title: hrProfile.job_title,
        bio: hrProfile.bio,
        avatar_url: hrProfile.avatar_url,
        years_of_experience: hrProfile.years_of_experience,
        location: hrProfile.location
      },
      stats: {
        total_projects: stats.total_projects || 0,
        total_commits: stats.total_commits || 0,
        total_project_days: stats.total_project_days || 0,
        enterprise_projects: stats.enterprise_projects || 0,
        large_projects: stats.large_projects || 0
      },
      hr_view: {
        professional_summary: hrProfile.professional_summary,
        soft_skills: hrProfile.soft_skills || [],
        growth_indicators: hrProfile.growth_indicators || [],
        reliability_score: hrProfile.reliability_score
      },
      achievements: groupAchievementsByCategory(achievements),
      projects: projects.map((p: any) => ({
        name: p.repo_name,
        description: p.description,
        scale: p.project_scale,
        duration_days: p.project_duration_days,
        team_context: p.team_context,
        hr_highlights: p.hr_summary
      }))
    }
  }
}

/**
 * Fetch Tech-focused profile view
 */
async function fetchTechProfile(supabase: any, username: string) {
  // Fetch Tech profile and stats in parallel (case-insensitive)
  const [techResult, statsResult, projectsResult, achievementsResult] = await Promise.all([
    supabase
      .from('developer_tech_profile')
      .select('*')
      .ilike('github_username', username)
      .single(),
    supabase
      .from('developer_profile_stats')
      .select('*')
      .ilike('github_username', username)
      .single(),
    supabase
      .from('developer_projects_list')
      .select('repo_name, description, language, project_scale, total_commits, project_duration_days, tech_summary, team_context')
      .ilike('github_username', username),
    supabase
      .from('developer_achievements')
      .select('*')
      .ilike('github_username', username)
      .in('category', ['architecture', 'performance', 'quality', 'feature'])
  ])

  if (techResult.error || !techResult.data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Profile not found or not public'
    })
  }

  const techProfile = techResult.data
  const stats = statsResult.data || {}
  const projects = projectsResult.data || []
  const achievements = achievementsResult.data || []

  return {
    success: true,
    view: 'tech',
    data: {
      profile: {
        full_name: techProfile.full_name,
        job_title: techProfile.job_title,
        avatar_url: techProfile.avatar_url,
        location: techProfile.location
      },
      stats: {
        total_projects: stats.total_projects || 0,
        total_commits: stats.total_commits || 0,
        total_lines_changed: stats.total_lines_changed || 0,
        total_project_days: stats.total_project_days || 0,
        enterprise_projects: stats.enterprise_projects || 0,
        large_projects: stats.large_projects || 0
      },
      tech_view: {
        frameworks: techProfile.frameworks || [],
        libraries: techProfile.libraries || [],
        patterns: techProfile.patterns || [],
        languages: techProfile.languages || [],
        best_practices: techProfile.best_practices || [],
        interview_topics: techProfile.interview_topics || []
      },
      achievements: groupAchievementsByCategory(achievements),
      projects: projects.map((p: any) => ({
        name: p.repo_name,
        description: p.description,
        language: p.language,
        scale: p.project_scale,
        commits: p.total_commits,
        duration_days: p.project_duration_days,
        team_context: p.team_context,
        tech_highlights: p.tech_summary
      }))
    }
  }
}

/**
 * Fetch full profile (both HR and Tech views)
 */
async function fetchFullProfile(supabase: any, username: string) {
  // Fetch both profiles in parallel (case-insensitive)
  const [hrResult, techResult, projectsResult, achievementsResult] = await Promise.all([
    supabase
      .from('developer_hr_profile')
      .select('*')
      .ilike('github_username', username)
      .single(),
    supabase
      .from('developer_tech_profile')
      .select('*')
      .ilike('github_username', username)
      .single(),
    supabase
      .from('developer_projects_list')
      .select('*')
      .ilike('github_username', username),
    supabase
      .from('developer_achievements')
      .select('*')
      .ilike('github_username', username)
  ])

  if (hrResult.error || !hrResult.data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Profile not found or not public'
    })
  }

  const hrProfile = hrResult.data
  const techProfile = techResult.data || {}
  const projects = projectsResult.data || []
  const achievements = achievementsResult.data || []

  return {
    success: true,
    view: 'full',
    data: {
      profile: {
        full_name: hrProfile.full_name,
        job_title: hrProfile.job_title,
        bio: hrProfile.bio,
        avatar_url: hrProfile.avatar_url,
        years_of_experience: hrProfile.years_of_experience,
        location: hrProfile.location
      },
      stats: {
        total_projects: hrProfile.total_projects,
        total_commits: techProfile.total_commits || 0,
        total_lines_changed: techProfile.total_lines_changed || 0,
        total_project_days: hrProfile.total_project_days || 0,
        enterprise_projects: techProfile.enterprise_projects || 0,
        large_projects: techProfile.large_projects || 0
      },
      // HR View Data
      hr_view: {
        professional_summary: hrProfile.professional_summary,
        soft_skills: hrProfile.soft_skills || [],
        growth_indicators: hrProfile.growth_indicators || [],
        reliability_score: hrProfile.reliability_score
      },
      // Tech View Data
      tech_view: {
        frameworks: techProfile.frameworks || [],
        libraries: techProfile.libraries || [],
        patterns: techProfile.patterns || [],
        languages: techProfile.languages || [],
        best_practices: techProfile.best_practices || [],
        interview_topics: techProfile.interview_topics || []
      },
      // All achievements grouped by category
      achievements: groupAchievementsByCategory(achievements),
      // Projects with both HR and Tech highlights
      projects: projects.map((p: any) => ({
        name: p.repo_name,
        description: p.description,
        language: p.language,
        scale: p.project_scale,
        is_private: p.is_private,
        commits: p.total_commits,
        duration_days: p.project_duration_days,
        overview: p.project_overview,
        team_context: p.team_context,
        hr_summary: p.hr_summary,
        tech_summary: p.tech_summary
      }))
    }
  }
}

/**
 * Group achievements by category
 */
function groupAchievementsByCategory(achievements: any[]) {
  const grouped: Record<string, any[]> = {
    business_impact: [],
    feature: [],
    performance: [],
    architecture: [],
    integration: [],
    quality: []
  }

  for (const achievement of achievements) {
    const category = achievement.category || 'feature'
    if (grouped[category]) {
      grouped[category].push({
        title: achievement.title,
        description: achievement.description,
        metrics: achievement.metrics,
        project: achievement.project_name,
        is_solo: achievement.is_solo === 'true',
        team_size: parseInt(achievement.team_size) || 1,
        user_role: achievement.user_role
      })
    }
  }

  return grouped
}
