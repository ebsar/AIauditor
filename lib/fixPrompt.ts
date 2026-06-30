import { clampScore, type AnalyzeResponse } from './utils'

export function createFixPrompt(result: AnalyzeResponse): string {
  const issues = result.audit.issues
    .map(
      (issue, index) =>
        `${index + 1}. ${issue.category}\nProblem: ${issue.problem}\nRequired fix: ${issue.fix}`
    )
    .join('\n\n')

  const quickWins = result.audit.quickWins.map((win) => `- ${win}`).join('\n')

  return `You are working on the website project for ${result.url}.

Goal:
Improve the website audit score from ${clampScore(result.audit.score)}/100. Make the site faster, easier to find, more accessible, and clearer for visitors.

Measured Lighthouse scores:
- Performance: ${clampScore(result.lighthouse.performance)}/100
- SEO: ${clampScore(result.lighthouse.seo)}/100
- Accessibility: ${clampScore(result.lighthouse.accessibility)}/100

Audit summary:
${result.audit.summary}

Problems to fix:
${issues}

Quick wins:
${quickWins}

Instructions:
- Inspect the existing codebase before making changes.
- Implement the fixes directly using the project's existing framework, components, and styles.
- Start with the changes that have the greatest visitor and business impact.
- Preserve working features and the existing brand identity.
- Keep website copy simple, specific, and easy to understand.
- Check desktop and mobile layouts, keyboard navigation, image descriptions, headings, and loading performance.
- Run the relevant type checks, tests, and production build after editing.
- Do not stop at recommendations. Make the code changes.
- Finish with a short summary of the files changed and how each audit issue was addressed.`
}
