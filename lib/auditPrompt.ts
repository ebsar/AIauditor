import type { CombinedAuditInput } from './utils'

export const AUDIT_SYSTEM_PROMPT = `You are a website auditor for business owners. Return ONLY valid JSON:
{
  "score": number,
  "summary": string,
  "issues": [
    {
      "category": "Performance | SEO | Accessibility | Design",
      "problem": string,
      "fix": string
    }
  ],
  "quickWins": [string]
}
Rules:
No technical jargon
Be simple and clear
Focus on business impact`

export function compactAuditInput(input: CombinedAuditInput) {
  return {
    url: input.url,
    lighthouse: {
      performance: input.lighthouse.performance,
      seo: input.lighthouse.seo,
      accessibility: input.lighthouse.accessibility,
      raw: input.lighthouse.raw
    },
    html: input.html
  }
}
