-- DevProfile AI - Initial Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DEVELOPER PROFILES
-- ============================================
CREATE TABLE developer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Personal Info
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  
  -- Professional Info
  job_title TEXT,
  bio TEXT,
  years_of_experience INTEGER,
  location TEXT,
  
  -- GitHub Info (from OAuth)
  github_username TEXT,
  github_id BIGINT,
  -- NOTE: GitHub access token is stored in auth.users by Supabase
  -- Access via: supabase.auth.getSession() -> provider_token
  
  -- Social Links
  linkedin_url TEXT,
  portfolio_url TEXT,
  twitter_url TEXT,
  
  -- Profile Status
  is_public BOOLEAN DEFAULT FALSE,
  is_profile_complete BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_developer_profiles_user_id ON developer_profiles(user_id);
CREATE INDEX idx_developer_profiles_github_username ON developer_profiles(github_username);
CREATE INDEX idx_developer_profiles_is_public ON developer_profiles(is_public);

-- RLS
ALTER TABLE developer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON developer_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON developer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON developer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public profiles viewable by all" ON developer_profiles
  FOR SELECT USING (is_public = true);

-- ============================================
-- GITHUB REPOSITORIES
-- ============================================
CREATE TABLE github_repositories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_profile_id UUID REFERENCES developer_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- GitHub Info
  github_repo_id BIGINT NOT NULL,
  repo_url TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  repo_full_name TEXT NOT NULL,
  owner_username TEXT NOT NULL,
  default_branch TEXT DEFAULT 'main',
  
  -- Metadata
  description TEXT,
  language TEXT,
  topics TEXT[],
  stars_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  watchers_count INTEGER DEFAULT 0,
  is_fork BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  
  -- Analysis
  analysis_status TEXT DEFAULT 'not_analyzed' CHECK (analysis_status IN (
    'not_analyzed', 'pending', 'processing', 'completed', 'failed'
  )),
  error_message TEXT,
  
  -- Timestamps
  repo_created_at TIMESTAMPTZ,
  repo_updated_at TIMESTAMPTZ,
  repo_pushed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(developer_profile_id, github_repo_id)
);

-- Indexes
CREATE INDEX idx_repos_developer_profile ON github_repositories(developer_profile_id);
CREATE INDEX idx_repos_analysis_status ON github_repositories(analysis_status);
CREATE INDEX idx_repos_language ON github_repositories(language);

-- RLS
ALTER TABLE github_repositories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own repos" ON github_repositories
  FOR SELECT USING (
    developer_profile_id IN (SELECT id FROM developer_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own repos" ON github_repositories
  FOR INSERT WITH CHECK (
    developer_profile_id IN (SELECT id FROM developer_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own repos" ON github_repositories
  FOR UPDATE USING (
    developer_profile_id IN (SELECT id FROM developer_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own repos" ON github_repositories
  FOR DELETE USING (
    developer_profile_id IN (SELECT id FROM developer_profiles WHERE user_id = auth.uid())
  );

-- Public repos of public profiles
CREATE POLICY "Public repos viewable" ON github_repositories
  FOR SELECT USING (
    developer_profile_id IN (SELECT id FROM developer_profiles WHERE is_public = true)
    AND analysis_status = 'completed'
  );

-- ============================================
-- PROJECT ANALYSES
-- ============================================
CREATE TABLE project_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  repository_id UUID REFERENCES github_repositories(id) ON DELETE CASCADE NOT NULL,
  developer_profile_id UUID REFERENCES developer_profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Scale Classification
  project_scale TEXT CHECK (project_scale IN ('micro', 'small', 'medium', 'large', 'enterprise')),
  
  -- Git Metrics
  total_commits INTEGER,
  user_commits INTEGER,
  lines_added INTEGER,
  lines_deleted INTEGER,
  files_changed INTEGER,
  contribution_percentage NUMERIC(5,2),
  first_commit_date TIMESTAMPTZ,
  last_commit_date TIMESTAMPTZ,
  project_duration_days INTEGER,
  
  -- AI Analysis Data (JSONB) - see server/schemas/projectAnalysisSchemas.ts for structure
  analysis_data JSONB,
  
  -- Resume-ready content
  resume_bullets JSONB,
  interview_questions JSONB,
  
  -- Tokens/Credits
  tokens_used INTEGER,
  credits_charged NUMERIC(10,2),
  
  -- Status
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analyses_repository ON project_analyses(repository_id);
CREATE INDEX idx_analyses_developer ON project_analyses(developer_profile_id);
CREATE INDEX idx_analyses_scale ON project_analyses(project_scale);
CREATE INDEX idx_analyses_status ON project_analyses(status);
CREATE INDEX idx_analyses_data ON project_analyses USING GIN (analysis_data);

-- RLS
ALTER TABLE project_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" ON project_analyses
  FOR SELECT USING (
    developer_profile_id IN (SELECT id FROM developer_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own analyses" ON project_analyses
  FOR INSERT WITH CHECK (
    developer_profile_id IN (SELECT id FROM developer_profiles WHERE user_id = auth.uid())
  );

-- Public analyses viewable
CREATE POLICY "Public analyses viewable" ON project_analyses
  FOR SELECT USING (
    developer_profile_id IN (SELECT id FROM developer_profiles WHERE is_public = true)
    AND status = 'completed'
  );

-- ============================================
-- AUTO UPDATE TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_developer_profiles_updated
  BEFORE UPDATE ON developer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_github_repositories_updated
  BEFORE UPDATE ON github_repositories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tr_project_analyses_updated
  BEFORE UPDATE ON project_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FUNCTION: Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.developer_profiles (user_id, email, full_name, avatar_url, github_username, github_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'user_name',
    (NEW.raw_user_meta_data->>'provider_id')::BIGINT
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
