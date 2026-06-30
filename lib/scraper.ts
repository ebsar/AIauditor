import * as cheerio from 'cheerio'
import { withTimeout, type HtmlAudit } from './utils'

export async function scrapeHtml(url: string): Promise<HtmlAudit> {
  const response = await withTimeout(
    fetch(url, {
      headers: {
        accept: 'text/html,application/xhtml+xml',
        'user-agent':
          'Mozilla/5.0 (compatible; AIWebsiteAuditor/1.0; +https://example.com/auditor)'
      },
      redirect: 'follow'
    }),
    5_000,
    'Site unreachable'
  )

  if (!response.ok) {
    throw new Error(`Site returned ${response.status}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  return {
    title: cleanText($('title').first().text()),
    description: cleanText($('meta[name="description"]').attr('content') ?? ''),
    headings: {
      h1: $('h1')
        .map((_, element) => cleanText($(element).text()))
        .get()
        .filter(Boolean),
      h2: $('h2')
        .map((_, element) => cleanText($(element).text()))
        .get()
        .filter(Boolean),
      h3: $('h3')
        .map((_, element) => cleanText($(element).text()))
        .get()
        .filter(Boolean)
    },
    imagesTotal: $('img').length,
    imagesMissingAlt: $('img')
      .filter((_, element) => !cleanText($(element).attr('alt') ?? ''))
      .length,
    scripts: $('script').length,
    stylesheets: $('link[rel="stylesheet"]').length
  }
}

export function fallbackHtmlAudit(): HtmlAudit {
  return {
    title: '',
    description: '',
    headings: {
      h1: [],
      h2: [],
      h3: []
    },
    imagesTotal: 0,
    imagesMissingAlt: 0,
    scripts: 0,
    stylesheets: 0
  }
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}
