// GitHub API Types

export interface GitHubUser {
  id: number
  login: string
  avatar_url: string
  html_url: string
  name: string | null
  bio: string | null
  location: string | null
  email: string | null
  public_repos: number
  followers: number
  following: number
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  owner: {
    login: string
    avatar_url: string
  }
  html_url: string
  description: string | null
  fork: boolean
  private: boolean
  default_branch: string
  language: string | null
  topics: string[]
  stargazers_count: number
  forks_count: number
  watchers_count: number
  size: number
  created_at: string
  updated_at: string
  pushed_at: string
}

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  author: {
    login: string
  } | null
  stats?: {
    additions: number
    deletions: number
    total: number
  }
}

export interface GitHubContributor {
  login: string
  contributions: number
  avatar_url: string
}

export interface GitHubLanguages {
  [language: string]: number
}

// For fetching user repos
export interface FetchReposOptions {
  type?: 'all' | 'owner' | 'member'
  sort?: 'created' | 'updated' | 'pushed' | 'full_name'
  direction?: 'asc' | 'desc'
  per_page?: number
  page?: number
}
