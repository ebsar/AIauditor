import { existsSync } from 'node:fs'
import puppeteer from 'puppeteer'
import { withTimeout, type LighthouseAudit } from './utils'

const LIGHTHOUSE_TIMEOUT_MS = 8_500
const LIGHTHOUSE_RETRY_TIMEOUT_MS = 4_500

export async function runLighthouseAudit(url: string): Promise<LighthouseAudit> {
  try {
    return await runLighthouseAttempt(url, LIGHTHOUSE_TIMEOUT_MS)
  } catch {
    try {
      return await runLighthouseAttempt(url, LIGHTHOUSE_RETRY_TIMEOUT_MS)
    } catch {
      return fallbackLighthouseAudit('lighthouse_unavailable')
    }
  }
}

async function runLighthouseAttempt(url: string, timeoutMs: number): Promise<LighthouseAudit> {
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null

  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: resolveBrowserExecutablePath(),
      protocolTimeout: timeoutMs,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    })

    const port = Number(new URL(browser.wsEndpoint()).port)
    const lighthouse = (await import('lighthouse')).default

    const result = await withTimeout(
      lighthouse(url, {
        port,
        logLevel: 'error',
        output: 'json',
        onlyCategories: ['performance', 'seo', 'accessibility'],
        maxWaitForLoad: timeoutMs,
        throttlingMethod: 'simulate'
      } as Record<string, unknown>),
      timeoutMs,
      'Lighthouse timed out'
    )

    const lhr = result?.lhr

    return {
      performance: toScore(lhr?.categories?.performance?.score),
      seo: toScore(lhr?.categories?.seo?.score),
      accessibility: toScore(lhr?.categories?.accessibility?.score),
      raw: {
        requestedUrl: lhr?.requestedUrl,
        finalDisplayedUrl: lhr?.finalDisplayedUrl,
        fetchTime: lhr?.fetchTime,
        categories: lhr?.categories
      }
    }
  } finally {
    await browser?.close().catch(() => undefined)
  }
}

function toScore(score: number | null | undefined): number {
  if (typeof score !== 'number') {
    return 0
  }

  return Math.round(score * 100)
}

function fallbackLighthouseAudit(reason: string): LighthouseAudit {
  return {
    performance: 0,
    seo: 0,
    accessibility: 0,
    raw: {
      fallback: true,
      reason
    }
  }
}

function resolveBrowserExecutablePath(): string | undefined {
  const configuredPath = process.env.PUPPETEER_EXECUTABLE_PATH

  if (configuredPath && existsSync(configuredPath)) {
    return configuredPath
  }

  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/microsoft-edge'
  ]

  return candidates.find((candidate) => existsSync(candidate))
}
