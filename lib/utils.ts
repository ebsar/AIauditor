export type LighthouseAudit = {
  performance: number
  seo: number
  accessibility: number
  raw: object
}

export type HtmlAudit = {
  available: boolean
  title: string
  description: string
  headings: {
    h1: string[]
    h2: string[]
    h3: string[]
  }
  imagesTotal: number
  imagesMissingAlt: number
  scripts: number
  stylesheets: number
}

export type IssueCategory = 'Performance' | 'SEO' | 'Accessibility' | 'Design'

export type AuditIssue = {
  category: IssueCategory
  problem: string
  fix: string
}

export type AiAudit = {
  score: number
  summary: string
  issues: AuditIssue[]
  quickWins: string[]
}

export type AnalyzeResponse = {
  jobId: string
  url: string
  audit: AiAudit
  lighthouse: Pick<LighthouseAudit, 'performance' | 'seo' | 'accessibility'>
}

export type CombinedAuditInput = {
  url: string
  lighthouse: LighthouseAudit
  html: HtmlAudit
}

export function normalizeUrl(value: string): string {
  const trimmed = value.trim()

  if (!trimmed) {
    throw new TypeError('Enter a website URL.')
  }

  const parsed = new URL(trimmed)

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new TypeError('URL must start with http:// or https://.')
  }

  return parsed.toString()
}

export function createJobId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `job_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function getScoreLabel(score: number): 'Good' | 'Medium' | 'Poor' {
  if (score >= 80) {
    return 'Good'
  }

  if (score >= 50) {
    return 'Medium'
  }

  return 'Poor'
}

export function clampScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}

export function calculateOverallScore(lighthouse: LighthouseAudit): number {
  return clampScore(
    (lighthouse.performance + lighthouse.seo + lighthouse.accessibility) / 3
  )
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(message)), timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeout) {
      clearTimeout(timeout)
    }
  }
}

export function parseJsonObject<T>(value: string | undefined): T | null {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export function createFallbackAudit(input: CombinedAuditInput): AiAudit {
  const averageScore = calculateOverallScore(input.lighthouse)
  const issues: AuditIssue[] = []

  if (input.lighthouse.performance < 75) {
    issues.push({
      category: 'Performance',
      problem: 'The site may feel slow for visitors.',
      fix: 'Reduce heavy scripts, compress images, and keep the first screen lightweight.'
    })
  }

  if (
    input.html.available &&
    (!input.html.title || !input.html.description || input.html.headings.h1.length === 0)
  ) {
    issues.push({
      category: 'SEO',
      problem: 'Search engines may not understand the page clearly.',
      fix: 'Add a clear page title, a short description, and one main heading that explains the offer.'
    })
  }

  if (input.html.available && input.html.imagesTotal > 0 && input.html.imagesMissingAlt > 0) {
    issues.push({
      category: 'Accessibility',
      problem: 'Some images are missing helpful descriptions.',
      fix: 'Add simple alt text so every visitor can understand important images.'
    })
  }

  if (input.html.available && (input.html.scripts > 20 || input.html.stylesheets > 8)) {
    issues.push({
      category: 'Design',
      problem: 'The page may be carrying more visual and tracking weight than it needs.',
      fix: 'Remove unused tools and keep the page focused on the visitor action that matters most.'
    })
  }

  if (issues.length === 0) {
    issues.push({
      category: 'Design',
      problem: 'The basics look healthy, but the page can still be clearer.',
      fix: 'Make sure the main message, proof, and next step are visible without scrolling.'
    })
  }

  return {
    score: averageScore,
    summary:
      'This report is based on measured Lighthouse scores and the page details that were available during the audit.',
    issues,
    quickWins: issues.slice(0, 4).map((issue) => issue.fix)
  }
}
