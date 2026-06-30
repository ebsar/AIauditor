import { existsSync } from 'node:fs'
import chromium from '@sparticuz/chromium'
import puppeteer, { type Browser, type LaunchOptions } from 'puppeteer-core'
import { withTimeout, type LighthouseAudit } from './utils'

const LIGHTHOUSE_TIMEOUT_MS = 15_000
const LIGHTHOUSE_RETRY_TIMEOUT_MS = 3_000

export async function runLighthouseAudit(url: string): Promise<LighthouseAudit> {
  try {
    return await runLighthouseAttempt(url, LIGHTHOUSE_TIMEOUT_MS)
  } catch (firstError) {
    console.warn('[lighthouse] first attempt failed', formatError(firstError))

    try {
      return await runLighthouseAttempt(url, LIGHTHOUSE_RETRY_TIMEOUT_MS)
    } catch (retryError) {
      console.error('[lighthouse] retry failed', formatError(retryError))
      throw new Error('Lighthouse could not produce valid scores.')
    }
  }
}

async function runLighthouseAttempt(url: string, timeoutMs: number): Promise<LighthouseAudit> {
  let browser: Browser | null = null

  try {
    const launchOptions = await getLaunchOptions()
    browser = await puppeteer.launch({
      ...launchOptions,
      protocolTimeout: timeoutMs
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

    if (!lhr || lhr.runtimeError) {
      throw new Error(
        lhr?.runtimeError
          ? `${lhr.runtimeError.code}: ${lhr.runtimeError.message}`
          : 'Lighthouse returned no report.'
      )
    }

    const performance = toScore(lhr.categories?.performance?.score, 'performance')
    const seo = toScore(lhr.categories?.seo?.score, 'seo')
    const accessibility = toScore(lhr.categories?.accessibility?.score, 'accessibility')

    return {
      performance,
      seo,
      accessibility,
      raw: {
        requestedUrl: lhr.requestedUrl,
        finalDisplayedUrl: lhr.finalDisplayedUrl,
        fetchTime: lhr.fetchTime,
        categories: lhr.categories
      }
    }
  } finally {
    await browser?.close().catch(() => undefined)
  }
}

function toScore(score: number | null | undefined, category: string): number {
  if (typeof score !== 'number') {
    throw new Error(`Lighthouse returned no ${category} score.`)
  }

  return Math.round(score * 100)
}

async function getLaunchOptions(): Promise<LaunchOptions> {
  const localExecutablePath = resolveLocalBrowserExecutablePath()

  if (localExecutablePath) {
    return {
      headless: true,
      executablePath: localExecutablePath,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
  }

  chromium.setGraphicsMode = false

  return {
    headless: 'shell',
    executablePath: await chromium.executablePath(),
    args: await puppeteer.defaultArgs({ args: chromium.args, headless: 'shell' })
  }
}

function resolveLocalBrowserExecutablePath(): string | undefined {
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

function formatError(error: unknown) {
  return {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  }
}
