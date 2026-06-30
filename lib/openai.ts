import { AUDIT_SYSTEM_PROMPT, compactAuditInput } from './auditPrompt'
import { parseJsonObject, type AiAudit, type CombinedAuditInput } from './utils'

export async function getOpenAiAudit(input: CombinedAuditInput): Promise<AiAudit | null> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return null
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: AUDIT_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: JSON.stringify(compactAuditInput(input), null, 2)
        }
      ],
      temperature: 0.2
    })
  })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content

  return parseJsonObject<AiAudit>(content)
}
