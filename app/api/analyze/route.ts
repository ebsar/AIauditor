import { NextResponse } from 'next/server'
import { getAiAudit } from '@/lib/ai'
import { runLighthouseAudit } from '@/lib/lighthouse'
import { fallbackHtmlAudit, scrapeHtml } from '@/lib/scraper'
import {
  createFallbackAudit,
  createJobId,
  normalizeUrl,
  withTimeout,
  type CombinedAuditInput
} from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 20

export async function POST(request: Request) {
  let url = ''

  try {
    const body = (await request.json().catch(() => null)) as { url?: unknown } | null
    url = normalizeUrl(String(body?.url ?? ''))
  } catch (error) {
    if (error instanceof TypeError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  try {
    const startedAt = Date.now()
    const combined = await withTimeout(buildAuditInput(url), 14_000, 'Analysis timed out')
    const remainingMs = Math.max(1_500, 19_000 - (Date.now() - startedAt))
    const audit = await getAiAudit(combined, remainingMs)

    return NextResponse.json({
      jobId: createJobId(),
      url,
      audit
    })
  } catch (error) {
    const fallbackInput: CombinedAuditInput = {
      url,
      lighthouse: {
        performance: 0,
        seo: 0,
        accessibility: 0,
        raw: { fallback: true, reason: 'analysis_failed' }
      },
      html: fallbackHtmlAudit()
    }

    return NextResponse.json({
      jobId: createJobId(),
      url: fallbackInput.url,
      audit: createFallbackAudit(fallbackInput)
    })
  }
}

async function buildAuditInput(url: string): Promise<CombinedAuditInput> {
  const [lighthouse, html] = await Promise.all([
    runLighthouseAudit(url),
    scrapeHtml(url).catch(() => fallbackHtmlAudit())
  ])

  return {
    url,
    lighthouse,
    html
  }
}
