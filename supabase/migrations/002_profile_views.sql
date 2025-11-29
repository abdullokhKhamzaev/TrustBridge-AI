-- DevProfile AI - Profile Aggregation Views
-- Run this in Supabase SQL Editor after 001_initial_schema.sql

-- ============================================
-- VIEW: Developer Profile Stats
-- Aggregates basic stats across all projects
-- ============================================
CREATE OR REPLACE VIEW developer_profile_stats AS
SELECT 
  dp.id AS profile_id,
  dp.github_username,
  dp.full_name,
  dp.job_title,
  dp.bio,
  dp.avatar_url,
  dp.years_of_experience,
  dp.location,
  dp.linkedin_url,
  dp.portfolio_url,
  dp.is_public,
  
  -- Project counts
  COUNT(DISTINCT pa.id) AS total_projects,
  COUNT(DISTINCT CASE WHEN pa.project_scale = 'enterprise' THEN pa.id END) AS enterprise_projects,
  COUNT(DISTINCT CASE WHEN pa.project_scale = 'large' THEN pa.id END) AS large_projects,
  COUNT(DISTINCT CASE WHEN pa.project_scale = 'medium' THEN pa.id END) AS medium_projects,
  COUNT(DISTINCT CASE WHEN pa.project_scale IN ('small', 'micro') THEN pa.id END) AS small_projects,
  
  -- Commit stats
  COALESCE(SUM(pa.total_commits), 0) AS total_commits,
  COALESCE(SUM(pa.lines_added), 0) AS total_lines_added,
  COALESCE(SUM(pa.lines_deleted), 0) AS total_lines_deleted,
  COALESCE(SUM(pa.lines_added) + SUM(pa.lines_deleted), 0) AS total_lines_changed,
  COALESCE(SUM(pa.files_changed), 0) AS total_files_changed,
  
  -- Activity range
  MIN(pa.first_commit_date) AS earliest_commit,
  MAX(pa.last_commit_date) AS latest_commit,
  
  -- Duration (from earliest to latest commit across ALL projects)
  COALESCE(
    EXTRACT(DAY FROM (MAX(pa.last_commit_date) - MIN(pa.first_commit_date)))::INTEGER,
    0
  ) AS total_project_days,
  COALESCE(AVG(pa.project_duration_days), 0)::INTEGER AS avg_project_duration,
  
  -- Timestamps
  dp.created_at AS profile_created,
  MAX(pa.created_at) AS last_analysis_date

FROM developer_profiles dp
LEFT JOIN project_analyses pa ON pa.developer_profile_id = dp.id AND pa.status = 'completed'
GROUP BY dp.id;

-- ============================================
-- VIEW: Aggregated Skills
-- Extracts and counts skills from all analyses
-- ============================================
CREATE OR REPLACE VIEW developer_aggregated_skills AS
SELECT 
  dp.id AS profile_id,
  dp.github_username,
  
  -- Aggregate frameworks (from JSONB)
  (
    SELECT jsonb_agg(DISTINCT framework)
    FROM project_analyses pa2,
    jsonb_array_elements_text(pa2.analysis_data->'technical_highlights'->'frameworks') AS framework
    WHERE pa2.developer_profile_id = dp.id AND pa2.status = 'completed'
  ) AS frameworks,
  
  -- Aggregate libraries
  (
    SELECT jsonb_agg(DISTINCT library)
    FROM project_analyses pa2,
    jsonb_array_elements_text(pa2.analysis_data->'technical_highlights'->'libraries') AS library
    WHERE pa2.developer_profile_id = dp.id AND pa2.status = 'completed'
  ) AS libraries,
  
  -- Aggregate patterns
  (
    SELECT jsonb_agg(DISTINCT pattern)
    FROM project_analyses pa2,
    jsonb_array_elements_text(pa2.analysis_data->'technical_highlights'->'patterns') AS pattern
    WHERE pa2.developer_profile_id = dp.id AND pa2.status = 'completed'
  ) AS patterns,
  
  -- Aggregate languages from repositories
  (
    SELECT jsonb_agg(DISTINCT gr.language)
    FROM github_repositories gr
    WHERE gr.developer_profile_id = dp.id 
    AND gr.language IS NOT NULL
    AND gr.analysis_status = 'completed'
  ) AS languages,
  
  -- Aggregate soft skills from HR summary
  (
    SELECT jsonb_agg(DISTINCT skill)
    FROM project_analyses pa2,
    jsonb_array_elements_text(pa2.analysis_data->'hr_summary'->'soft_skills') AS skill
    WHERE pa2.developer_profile_id = dp.id AND pa2.status = 'completed'
  ) AS soft_skills,
  
  -- Aggregate best practices from Tech summary
  (
    SELECT jsonb_agg(DISTINCT practice)
    FROM project_analyses pa2,
    jsonb_array_elements_text(pa2.analysis_data->'tech_summary'->'best_practices') AS practice
    WHERE pa2.developer_profile_id = dp.id AND pa2.status = 'completed'
  ) AS best_practices

FROM developer_profiles dp
WHERE dp.is_public = true;

-- ============================================
-- VIEW: All Achievements (deduplicated by title)
-- Groups achievements by category
-- ============================================
CREATE OR REPLACE VIEW developer_achievements AS
SELECT DISTINCT ON (dp.id, achievement->>'title')
  dp.id AS profile_id,
  dp.github_username,
  gr.repo_name AS project_name,
  pa.project_scale,
  achievement->>'title' AS title,
  achievement->>'description' AS description,
  achievement->>'category' AS category,
  achievement->>'metrics' AS metrics,
  pa.analysis_data->'git_insights'->'team_context'->>'is_solo' AS is_solo,
  pa.analysis_data->'git_insights'->'team_context'->>'team_size' AS team_size,
  pa.analysis_data->'git_insights'->'team_context'->>'user_role' AS user_role,
  pa.created_at AS analysis_date

FROM developer_profiles dp
JOIN project_analyses pa ON pa.developer_profile_id = dp.id AND pa.status = 'completed'
JOIN github_repositories gr ON gr.id = pa.repository_id
CROSS JOIN jsonb_array_elements(pa.analysis_data->'key_achievements') AS achievement
WHERE dp.is_public = true
ORDER BY dp.id, achievement->>'title', pa.created_at DESC;

-- ============================================
-- VIEW: HR Profile Summary
-- Aggregated data for HR/recruiters view
-- ============================================
CREATE OR REPLACE VIEW developer_hr_profile AS
SELECT 
  dp.id AS profile_id,
  dp.github_username,
  dp.full_name,
  dp.job_title,
  dp.bio,
  dp.avatar_url,
  dp.years_of_experience,
  dp.location,
  
  -- Stats summary
  stats.total_projects,
  stats.total_commits,
  stats.total_project_days,
  
  -- Get most recent professional summary
  (
    SELECT pa2.analysis_data->'hr_summary'->>'professional_summary'
    FROM project_analyses pa2
    WHERE pa2.developer_profile_id = dp.id AND pa2.status = 'completed'
    ORDER BY pa2.created_at DESC
    LIMIT 1
  ) AS professional_summary,
  
  -- Aggregate soft skills
  skills.soft_skills,
  
  -- Business impact achievements only
  (
    SELECT jsonb_agg(jsonb_build_object(
      'title', da.title,
      'description', da.description,
      'metrics', da.metrics,
      'project', da.project_name
    ))
    FROM developer_achievements da
    WHERE da.profile_id = dp.id AND da.category = 'business_impact'
  ) AS business_achievements,
  
  -- Growth indicators
  (
    SELECT jsonb_agg(DISTINCT indicator)
    FROM project_analyses pa2,
    jsonb_array_elements_text(pa2.analysis_data->'hr_summary'->'growth_indicators') AS indicator
    WHERE pa2.developer_profile_id = dp.id AND pa2.status = 'completed'
  ) AS growth_indicators,
  
  -- Calculate reliability
  CASE 
    WHEN stats.total_commits > 500 AND stats.total_projects >= 3 THEN 'High'
    WHEN stats.total_commits > 100 AND stats.total_projects >= 2 THEN 'Medium'
    ELSE 'Building'
  END AS reliability_score

FROM developer_profiles dp
LEFT JOIN developer_profile_stats stats ON stats.profile_id = dp.id
LEFT JOIN developer_aggregated_skills skills ON skills.profile_id = dp.id
WHERE dp.is_public = true;

-- ============================================
-- VIEW: Tech Profile Summary
-- Aggregated data for Technical managers view
-- ============================================
CREATE OR REPLACE VIEW developer_tech_profile AS
SELECT 
  dp.id AS profile_id,
  dp.github_username,
  dp.full_name,
  dp.job_title,
  
  -- Technical skills
  skills.frameworks,
  skills.libraries,
  skills.patterns,
  skills.languages,
  skills.best_practices,
  
  -- Stats
  stats.total_projects,
  stats.total_commits,
  stats.total_lines_changed,
  stats.enterprise_projects,
  stats.large_projects,
  
  -- Architecture achievements
  (
    SELECT jsonb_agg(jsonb_build_object(
      'title', da.title,
      'description', da.description,
      'project', da.project_name,
      'is_solo', da.is_solo,
      'team_size', da.team_size
    ))
    FROM developer_achievements da
    WHERE da.profile_id = dp.id AND da.category = 'architecture'
  ) AS architecture_achievements,
  
  -- Performance achievements
  (
    SELECT jsonb_agg(jsonb_build_object(
      'title', da.title,
      'description', da.description,
      'metrics', da.metrics,
      'project', da.project_name
    ))
    FROM developer_achievements da
    WHERE da.profile_id = dp.id AND da.category = 'performance'
  ) AS performance_achievements,
  
  -- Quality achievements
  (
    SELECT jsonb_agg(jsonb_build_object(
      'title', da.title,
      'description', da.description,
      'project', da.project_name
    ))
    FROM developer_achievements da
    WHERE da.profile_id = dp.id AND da.category = 'quality'
  ) AS quality_achievements,
  
  -- Interview topics (aggregated, limited to 15)
  (
    SELECT jsonb_agg(topic)
    FROM (
      SELECT DISTINCT topic
      FROM project_analyses pa2,
      jsonb_array_elements_text(pa2.analysis_data->'interview_topics') AS topic
      WHERE pa2.developer_profile_id = dp.id AND pa2.status = 'completed'
      LIMIT 15
    ) AS limited_topics
  ) AS interview_topics

FROM developer_profiles dp
LEFT JOIN developer_profile_stats stats ON stats.profile_id = dp.id
LEFT JOIN developer_aggregated_skills skills ON skills.profile_id = dp.id
WHERE dp.is_public = true;

-- ============================================
-- VIEW: Projects List (for profile page)
-- Minimal project info for display
-- ============================================
CREATE OR REPLACE VIEW developer_projects_list AS
SELECT 
  dp.id AS profile_id,
  dp.github_username,
  gr.id AS repository_id,
  gr.repo_name,
  gr.description,
  gr.language,
  gr.is_private,
  pa.project_scale,
  pa.total_commits,
  pa.project_duration_days,
  pa.analysis_data->'project_overview' AS project_overview,
  pa.analysis_data->'hr_summary' AS hr_summary,
  pa.analysis_data->'tech_summary' AS tech_summary,
  pa.analysis_data->'git_insights'->'team_context' AS team_context,
  pa.created_at AS analysis_date

FROM developer_profiles dp
JOIN github_repositories gr ON gr.developer_profile_id = dp.id AND gr.analysis_status = 'completed'
JOIN project_analyses pa ON pa.repository_id = gr.id AND pa.status = 'completed'
WHERE dp.is_public = true
ORDER BY pa.created_at DESC;

-- ============================================
-- Grant access to views for authenticated users
-- ============================================
GRANT SELECT ON developer_profile_stats TO authenticated, anon;
GRANT SELECT ON developer_aggregated_skills TO authenticated, anon;
GRANT SELECT ON developer_achievements TO authenticated, anon;
GRANT SELECT ON developer_hr_profile TO authenticated, anon;
GRANT SELECT ON developer_tech_profile TO authenticated, anon;
GRANT SELECT ON developer_projects_list TO authenticated, anon;
