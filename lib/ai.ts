import { getGeminiAudit } from './gemini'
import { getOpenAiAudit } from './openai'
import { createFallbackAudit, withTimeout, type AiAudit, type CombinedAuditInput } from './utils'

export async function getAiAudit(input: CombinedAuditInput, timeoutMs: number): Promise<AiAudit> {
  const startedAt = Date.now()

  const geminiAudit = await runProviderWithinBudget(
    () => getGeminiAudit(input),
    remainingBudget(timeoutMs, startedAt)
  )

  if (geminiAudit) {
    return geminiAudit
  }

  const openAiAudit = await runProviderWithinBudget(
    () => getOpenAiAudit(input),
    remainingBudget(timeoutMs, startedAt)
  )

  return openAiAudit ?? createFallbackAudit(input)
}

async function runProviderWithinBudget(
  provider: () => Promise<AiAudit | null>,
  timeoutMs: number
): Promise<AiAudit | null> {
  if (timeoutMs < 1_000) {
    return null
  }

  return withTimeout(provider(), timeoutMs, 'AI provider timed out').catch(() => null)
}

function remainingBudget(timeoutMs: number, startedAt: number): number {
  return Math.max(0, timeoutMs - (Date.now() - startedAt))
}
