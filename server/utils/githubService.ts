import type { GitStats } from '../schemas/projectAnalysisSchemas'

/**
 * Utility functions for fetching GitHub repository data
 */

interface GitHubRepoData {
  name: string
  full_name: string
  description: string | null
  language: string | null
  default_branch: string
  created_at: string
  updated_at: string
  pushed_at: string
  stargazers_count: number
  forks_count: number
  open_issues_count: number
}

interface GitHubCommit {
  sha: string
  commit: {
    author: {
      name: string
      email: string
      date: string
    }
    message: string
  }
  author: {
    login: string
  } | null
}

interface GitHubContributor {
  login: string
  contributions: number
}

/**
 * Parse GitHub repository URL to extract owner and repo name
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  // Handle various GitHub URL formats
  const patterns = [
    /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$)/,
    /^([^/]+)\/([^/]+)$/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1] && match[2]) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') }
    }
  }

  return null
}

/**
 * Fetch repository metadata from GitHub API
 */
export async function fetchRepoMetadata(
  owner: string,
  repo: string,
  token?: string
): Promise<GitHubRepoData> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'DevProfile-AI'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Repository not found')
    }
    if (response.status === 403) {
      throw new Error('API rate limit exceeded or access denied')
    }
    throw new Error(`GitHub API error: ${response.status}`)
  }

  return response.json()
}

/**
 * Fetch repository languages from GitHub API
 */
export async function fetchRepoLanguages(
  owner: string,
  repo: string,
  token?: string
): Promise<Record<string, number>> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'DevProfile-AI'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
    headers
  })

  if (!response.ok) {
    console.warn(`Failed to fetch languages: ${response.status}`)
    return {}
  }

  return response.json()
}

/**
 * Fetch commit statistics for a specific user
 */
export async function fetchUserCommitStats(
  owner: string,
  repo: string,
  username: string,
  token?: string
): Promise<{
  totalCommits: number
  firstCommit: string | null
  lastCommit: string | null
  commits: GitHubCommit[]
}> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'DevProfile-AI'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  // Fetch commits by author (paginated)
  const allCommits: GitHubCommit[] = []
  let page = 1
  const perPage = 100

  while (page <= 10) { // Max 1000 commits
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?author=${username}&per_page=${perPage}&page=${page}`,
      { headers }
    )

    if (!response.ok) {
      if (response.status === 409) {
        // Empty repository
        break
      }
      console.warn(`Failed to fetch commits page ${page}: ${response.status}`)
      break
    }

    const commits: GitHubCommit[] = await response.json()
    if (commits.length === 0) break

    allCommits.push(...commits)

    if (commits.length < perPage) break
    page++
  }

  // Sort by date
  allCommits.sort((a, b) =>
    new Date(a.commit.author.date).getTime() - new Date(b.commit.author.date).getTime()
  )

  return {
    totalCommits: allCommits.length,
    firstCommit: allCommits.length > 0 ? allCommits[0].commit.author.date : null,
    lastCommit: allCommits.length > 0 ? allCommits[allCommits.length - 1].commit.author.date : null,
    commits: allCommits
  }
}

/**
 * Fetch contributors count
 */
export async function fetchContributorsCount(
  owner: string,
  repo: string,
  token?: string
): Promise<number> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'DevProfile-AI'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=true`,
    { headers }
  )

  if (!response.ok) {
    return 1
  }

  // Get total count from Link header
  const linkHeader = response.headers.get('Link')
  if (linkHeader) {
    const match = linkHeader.match(/page=(\d+)>; rel="last"/)
    if (match && match[1]) {
      return parseInt(match[1])
    }
  }

  const contributors: GitHubContributor[] = await response.json()
  return contributors.length
}

/**
 * Fetch README content
 */
export async function fetchReadme(
  owner: string,
  repo: string,
  token?: string
): Promise<string | null> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3.raw',
    'User-Agent': 'DevProfile-AI'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
    headers
  })

  if (!response.ok) {
    return null
  }

  return response.text()
}

/**
 * Fetch any available config files from repository root
 * Returns raw content - AI will analyze and detect project type
 */
export async function fetchConfigFiles(
  owner: string,
  repo: string,
  token?: string
): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3.raw',
    'User-Agent': 'DevProfile-AI'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  // Common config files to look for
  const configFiles = [
    'package.json',
    'composer.json', 
    'requirements.txt',
    'Pipfile',
    'pyproject.toml',
    'Cargo.toml',
    'go.mod',
    'pom.xml',
    'build.gradle',
    'Gemfile',
    'Makefile',
    'Dockerfile',
    '.env.example'
  ]

  const configs: Record<string, string> = {}

  // Fetch configs in parallel (don't wait for each)
  const results = await Promise.allSettled(
    configFiles.map(async (file) => {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${file}`,
        { headers }
      )
      if (response.ok) {
        const content = await response.text()
        return { file, content }
      }
      return null
    })
  )

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      configs[result.value.file] = result.value.content
    }
  }

  return configs
}

/**
 * Fetch repository file tree (sample)
 */
export async function fetchFileTree(
  owner: string,
  repo: string,
  token?: string
): Promise<string[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'DevProfile-AI'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  // First get default branch
  const repoData = await fetchRepoMetadata(owner, repo, token)
  const branch = repoData.default_branch

  // Fetch tree
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers }
  )

  if (!response.ok) {
    return []
  }

  const data = await response.json()
  const files: string[] = []

  // Filter to important file types (supports multiple languages)
  const importantExtensions = [
    // JavaScript/TypeScript
    '.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte',
    // Python
    '.py',
    // Go
    '.go',
    // Rust
    '.rs',
    // Java/Kotlin
    '.java', '.kt', '.kts',
    // PHP
    '.php',
    // C#/.NET
    '.cs', '.cshtml', '.razor',
    // Ruby
    '.rb', '.erb',
    // Swift/Objective-C
    '.swift', '.m', '.h',
    // C/C++
    '.c', '.cpp', '.cc', '.hpp',
    // Dart/Flutter
    '.dart',
    // Elixir/Erlang
    '.ex', '.exs', '.erl',
    // Config files
    '.json', '.yaml', '.yml', '.toml', '.xml',
    // Docs
    '.md', '.mdx'
  ]

  // Directories to exclude (dependencies, build artifacts)
  const excludeDirs = [
    'node_modules', 'vendor', '.git', 'dist', 'build', 
    '__pycache__', '.venv', 'venv', 'env',
    'target', 'bin/Debug', 'bin/Release', 'obj',
    '.next', '.nuxt', '.output'
  ]

  for (const item of data.tree || []) {
    if (item.type === 'blob') {
      const hasImportantExt = importantExtensions.some(ext => item.path.endsWith(ext))
      const isExcluded = excludeDirs.some(dir => item.path.includes(`/${dir}/`) || item.path.startsWith(`${dir}/`))
      if (hasImportantExt && !isExcluded) {
        files.push(item.path)
      }
    }
  }

  return files
}

/**
 * Calculate comprehensive git stats for a repository
 */
export async function calculateGitStats(
  owner: string,
  repo: string,
  username: string,
  token?: string
): Promise<GitStats> {
  console.log(`📊 Calculating git stats for ${owner}/${repo} by ${username}`)

  // Fetch all data in parallel
  const [
    repoData,
    languages,
    commitStats,
    contributorsCount
  ] = await Promise.all([
    fetchRepoMetadata(owner, repo, token),
    fetchRepoLanguages(owner, repo, token),
    fetchUserCommitStats(owner, repo, username, token),
    fetchContributorsCount(owner, repo, token)
  ])

  // Calculate project duration
  let projectDurationDays = 0
  if (commitStats.firstCommit && commitStats.lastCommit) {
    const firstDate = new Date(commitStats.firstCommit)
    const lastDate = new Date(commitStats.lastCommit)
    projectDurationDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Estimate lines changed (rough approximation)
  // GitHub API doesn't provide this easily, so we estimate based on commits
  const avgLinesPerCommit = 50 // Conservative estimate
  const estimatedLinesChanged = commitStats.totalCommits * avgLinesPerCommit

  const stats: GitStats = {
    total_commits: commitStats.totalCommits,
    lines_added: Math.round(estimatedLinesChanged * 0.6),
    lines_deleted: Math.round(estimatedLinesChanged * 0.4),
    lines_changed: estimatedLinesChanged,
    files_changed: Math.round(commitStats.totalCommits * 3), // Estimate
    first_commit_date: commitStats.firstCommit || undefined,
    last_commit_date: commitStats.lastCommit || undefined,
    project_duration_days: projectDurationDays,
    languages,
    contributors: contributorsCount
  }

  console.log(`✅ Git stats calculated:`, {
    commits: stats.total_commits,
    duration: `${stats.project_duration_days} days`,
    languages: Object.keys(stats.languages || {}).slice(0, 5)
  })

  return stats
}

/**
 * Fetch all repository data needed for analysis
 */
export async function fetchRepositoryData(
  repoUrl: string,
  username: string,
  token?: string
): Promise<{
  gitStats: GitStats
  configFiles: Record<string, string>
  readme: string | null
  fileStructure: string[]
  repoName: string
}> {
  const parsed = parseGitHubUrl(repoUrl)
  if (!parsed) {
    throw new Error('Invalid GitHub repository URL')
  }

  const { owner, repo } = parsed

  console.log(`📥 Fetching repository data: ${owner}/${repo}`)

  // Fetch all data in parallel
  const [gitStats, configFiles, readme, fileStructure] = await Promise.all([
    calculateGitStats(owner, repo, username, token),
    fetchConfigFiles(owner, repo, token),
    fetchReadme(owner, repo, token),
    fetchFileTree(owner, repo, token)
  ])

  return {
    gitStats,
    configFiles,
    readme,
    fileStructure,
    repoName: repo
  }
}
