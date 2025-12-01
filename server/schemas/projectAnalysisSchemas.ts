import { z } from 'zod'

/**
 * Zod schemas for Project Analysis validation
 * Defines the structure of LLM output for GitHub repository analysis
 */

// Project scale classification - flexible string to accept any scale from LLM
export const projectScaleSchema = z.string().describe('Project scale: micro, small, medium, large, or enterprise')

// Achievement schema
export const achievementSchema = z.object({
  title: z.string().describe('Brief achievement title'),
  description: z.string().describe('Detailed description of the achievement'),
  category: z.string().describe('Achievement category'),
  metrics: z.string().optional().describe('Quantifiable metrics if available')
})

// Technical highlight schema
export const technicalHighlightSchema = z.object({
  frameworks: z.array(z.string()).describe('Frameworks used (e.g., Vue.js, React, Express)'),
  libraries: z.array(z.string()).describe('Key libraries used'),
  patterns: z.array(z.string()).describe('Design patterns identified'),
  tools: z.array(z.string()).optional().describe('Development tools used')
})

// Code quality schema
export const codeQualitySchema = z.object({
  organization: z.string().describe('Code organization assessment'),
  patterns_used: z.array(z.string()).describe('Design patterns used'),
  testing: z.string().optional().describe('Testing approach if visible'),
  type_safety: z.string().optional().describe('TypeScript/type safety if applicable')
})

// Team context schema
export const teamContextSchema = z.object({
  is_solo: z.boolean().describe('Whether this is a solo project'),
  team_size: z.number().describe('Total number of contributors'),
  user_role: z.string().describe('User role: Solo Developer / Lead / Contributor'),
  contribution_summary: z.string().describe('Brief description of user specific contributions')
})

// Git insights schema
export const gitInsightsSchema = z.object({
  commit_frequency: z.string().describe('How often commits were made'),
  development_style: z.string().describe('Development workflow style'),
  collaboration_indicators: z.string().optional().describe('Team collaboration signs'),
  team_context: teamContextSchema.optional().describe('Team and contribution context')
})

// HR Summary schema (for non-technical recruiters)
export const hrSummarySchema = z.object({
  professional_summary: z.string().describe('2-3 sentence summary for non-technical readers'),
  soft_skills: z.array(z.string()).describe('Soft skills demonstrated'),
  business_impact: z.string().describe('Business value this project delivers'),
  work_style: z.string().describe('Work style description'),
  growth_indicators: z.array(z.string()).describe('Professional growth indicators'),
  reliability_score: z.string()
    .transform((val): 'High' | 'Medium' | 'Low' => {
      const lower = val.toLowerCase()
      if (lower.includes('high') || lower.includes('excellent') || lower.includes('very')) return 'High'
      if (lower.includes('low') || lower.includes('poor') || lower.includes('limited')) return 'Low'
      return 'Medium'
    })
    .describe('Reliability based on commit consistency: High, Medium, or Low')
})

// Architecture decision schema
export const architectureDecisionSchema = z.object({
  decision: z.string().describe('What was decided'),
  reasoning: z.string().describe('Why this choice was made')
})

// Tech Summary schema (for technical managers)
export const techSummarySchema = z.object({
  architecture_overview: z.string().describe('Brief architecture description'),
  architecture_decisions: z.array(architectureDecisionSchema).describe('Key architecture decisions'),
  code_quality_assessment: z.string().describe('Overall code quality assessment'),
  best_practices: z.array(z.string()).describe('Best practices followed'),
  security_considerations: z.array(z.string()).optional().describe('Security aspects'),
  scalability_notes: z.string().optional().describe('Scalability assessment'),
  tech_debt_observations: z.string().optional().describe('Technical debt observations'),
  review_readiness: z.string().describe('Code review readiness assessment')
})

// Main Project Analysis Data schema (LLM output)
export const projectAnalysisDataSchema = z.object({
  document_name: z.string().describe('Project/repository name'),
  project_scale: projectScaleSchema.describe('Classification based on commits, duration, and complexity'),
  project_overview: z.string().describe('2-4 sentence project description'),
  
  key_achievements: z.array(achievementSchema)
    .describe('Scale-appropriate achievements list'),
  
  technical_highlights: technicalHighlightSchema.describe('Technical stack and patterns'),
  
  code_quality: codeQualitySchema.optional().describe('Code quality assessment (Medium+ projects)'),
  
  resume_points: z.array(z.string())
    .describe('HR-friendly bullet points for resume'),
  
  notable_patterns: z.array(z.string())
    .optional()
    .describe('Notable implementation patterns (Medium+ projects)'),
  
  git_insights: gitInsightsSchema.describe('Insights from git history'),
  
  interview_topics: z.array(z.string())
    .optional()
    .describe('Potential interview discussion topics'),
  
  // HR & Tech summaries for different audiences
  hr_summary: hrSummarySchema.optional().describe('Summary for HR/recruiters'),
  tech_summary: techSummarySchema.optional().describe('Summary for technical managers'),
  
  // Token tracking
  actual_tokens: z.number().optional().describe('Actual tokens used by LLM')
})

// Git statistics input schema
export const gitStatsSchema = z.object({
  total_commits: z.number(),
  lines_added: z.number(),
  lines_deleted: z.number(),
  lines_changed: z.number(),
  files_changed: z.number(),
  first_commit_date: z.string().optional(),
  last_commit_date: z.string().optional(),
  project_duration_days: z.number(),
  languages: z.record(z.string(), z.number()).optional(), // language -> bytes
  contributors: z.number().optional()
})

// API request schema for analysis
export const analyzeRequestSchema = z.object({
  repositoryId: z.string().uuid('Invalid repository ID'),
  repoUrl: z.string().url('Invalid repository URL'),
  githubUsername: z.string().min(1, 'GitHub username required'),
  branch: z.string().default('main')
})

// Cost estimation request schema
export const estimateCostRequestSchema = z.object({
  repositoryId: z.string().uuid('Invalid repository ID'),
  repoUrl: z.string().url('Invalid repository URL'),
  githubUsername: z.string().min(1, 'GitHub username required')
})

// Type exports
export type ProjectScale = z.infer<typeof projectScaleSchema>
export type Achievement = z.infer<typeof achievementSchema>
export type TechnicalHighlight = z.infer<typeof technicalHighlightSchema>
export type CodeQuality = z.infer<typeof codeQualitySchema>
export type TeamContext = z.infer<typeof teamContextSchema>
export type GitInsights = z.infer<typeof gitInsightsSchema>
export type HrSummary = z.infer<typeof hrSummarySchema>
export type TechSummary = z.infer<typeof techSummarySchema>
export type ArchitectureDecision = z.infer<typeof architectureDecisionSchema>
export type ProjectAnalysisData = z.infer<typeof projectAnalysisDataSchema>
export type GitStats = z.infer<typeof gitStatsSchema>
export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>
export type EstimateCostRequest = z.infer<typeof estimateCostRequestSchema>
