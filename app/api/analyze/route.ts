import { NextResponse } from 'next/server'
import { getAiAudit } from '@/lib/ai'
import { runLighthouseAudit } from '@/lib/lighthouse'
import { fallbackHtmlAudit, scrapeHtml } from '@/lib/scraper'
import {
  calculateOverallScore,
  createJobId,
  normalizeUrl,
  withTimeout,
  type CombinedAuditInput
} from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 25

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
    console.log('[api/analyze] audit started', { url })
    const combined = await withTimeout(buildAuditInput(url), 18_500, 'Analysis timed out')
    const remainingMs = Math.max(0, 19_500 - (Date.now() - startedAt))
    const generatedAudit = await getAiAudit(combined, remainingMs)
    const audit = {
      ...generatedAudit,
      score: calculateOverallScore(combined.lighthouse)
    }

    console.log('[api/analyze] audit completed', {
      url,
      durationMs: Date.now() - startedAt,
      lighthouse: {
        performance: combined.lighthouse.performance,
        seo: combined.lighthouse.seo,
        accessibility: combined.lighthouse.accessibility
      }
    })

    return NextResponse.json({
      jobId: createJobId(),
      url,
      audit,
      lighthouse: {
        performance: combined.lighthouse.performance,
        seo: combined.lighthouse.seo,
        accessibility: combined.lighthouse.accessibility
      }
    })
  } catch (error) {
    console.error('[api/analyze] audit failed', {
      url,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })

    return NextResponse.json(
      {
        error:
          'A real Lighthouse score could not be measured for this site. No report was generated. Please try again.'
      },
      { status: 502 }
    )
  }
}

async function buildAuditInput(url: string): Promise<CombinedAuditInput> {
  const [lighthouse, html] = await Promise.all([
    runLighthouseAudit(url),
    scrapeHtml(url).catch((error) => {
      console.warn('[scraper] HTML extraction failed', {
        url,
        message: error instanceof Error ? error.message : String(error)
      })
      return fallbackHtmlAudit()
    })
  ])

  return {
    url,
    lighthouse,
    html
  }
}
