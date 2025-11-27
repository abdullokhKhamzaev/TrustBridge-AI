// Database Types - matches Supabase schema

export interface DeveloperProfile {
  id: string
  user_id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  job_title: string | null
  bio: string | null
  years_of_experience: number | null
  location: string | null
  github_username: string | null
  github_id: number | null
  linkedin_url: string | null
  portfolio_url: string | null
  twitter_url: string | null
  is_public: boolean
  is_profile_complete: boolean
  created_at: string
  updated_at: string
}

export interface GitHubRepository {
  id: string
  developer_profile_id: string
  github_repo_id: number
  repo_url: string
  repo_name: string
  repo_full_name: string
  owner_username: string
  default_branch: string
  description: string | null
  language: string | null
  topics: string[] | null
  stars_count: number
  forks_count: number
  watchers_count: number
  is_fork: boolean
  is_private: boolean
  analysis_status: AnalysisStatus
  repo_created_at: string | null
  repo_updated_at: string | null
  repo_pushed_at: string | null
  created_at: string
  updated_at: string
}

export type AnalysisStatus = 'not_analyzed' | 'pending' | 'analyzing' | 'completed' | 'failed'

export type ProjectScale = 'micro' | 'small' | 'medium' | 'large' | 'enterprise'

export interface ProjectAnalysis {
  id: string
  repository_id: string
  developer_profile_id: string
  project_scale: ProjectScale | null
  total_commits: number | null
  user_commits: number | null
  lines_added: number | null
  lines_deleted: number | null
  files_changed: number | null
  contribution_percentage: number | null
  first_commit_date: string | null
  last_commit_date: string | null
  project_duration_days: number | null
  analysis_data: AnalysisData | null
  resume_bullets: string[] | null
  interview_questions: InterviewQuestion[] | null
  tokens_used: number | null
  credits_charged: number | null
  status: 'processing' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  updated_at: string
}

// AI Analysis Data Structure
export interface AnalysisData {
  document_name: string
  project_overview: string
  key_achievements: Achievement[]
  technical_highlights: TechnicalHighlights
  code_quality: CodeQuality | null
  resume_points: string[]
  notable_patterns: string[] | null
  interview_topics: string[] | null
}

export interface Achievement {
  title: string
  description: string
  category?: 'feature' | 'integration' | 'performance' | 'architecture' | 'business'
}

export interface TechnicalHighlights {
  frameworks: string[]
  libraries: string[]
  languages: string[]
  patterns: string[]
  tools: string[]
}

export interface CodeQuality {
  has_tests: boolean
  has_typescript: boolean
  has_linting: boolean
  architecture_notes: string | null
}

export interface InterviewQuestion {
  question: string
  category: 'technical' | 'behavioral' | 'project'
  difficulty: 'easy' | 'medium' | 'hard'
  topics: string[]
}

// Insert/Update Types
export type DeveloperProfileInsert = Omit<DeveloperProfile, 'id' | 'created_at' | 'updated_at'>
export type DeveloperProfileUpdate = Partial<Omit<DeveloperProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

export type GitHubRepositoryInsert = Omit<GitHubRepository, 'id' | 'created_at' | 'updated_at'>
export type GitHubRepositoryUpdate = Partial<Omit<GitHubRepository, 'id' | 'developer_profile_id' | 'created_at' | 'updated_at'>>
