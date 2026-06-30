'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { IssueList } from './IssueList'
import { ScoreCard } from './ScoreCard'
import type { AnalyzeResponse } from '@/lib/utils'

type ResultsViewProps = {
  jobId: string
}

export function ResultsView({ jobId }: ResultsViewProps) {
  const [result, setResult] = useState<AnalyzeResponse | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  useEffect(() => {
    if (!jobId) {
      setHasLoaded(true)
      return
    }

    const stored = sessionStorage.getItem(`audit:${jobId}`)

    if (stored) {
      setResult(JSON.parse(stored) as AnalyzeResponse)
    }

    setHasLoaded(true)
  }, [jobId])

  if (!hasLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-10">
        <p className="text-sm font-semibold text-slate-600">Loading report...</p>
      </main>
    )
  }

  if (!result) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5 py-10">
        <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-soft">
          <h1 className="text-2xl font-bold text-slate-950">No report found</h1>
          <p className="mt-3 text-slate-600">
            Start a new audit so the results can be saved in this browser tab.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-5 font-semibold text-white transition hover:bg-slate-800"
          >
            Analyze a website
          </Link>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-5 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
              Audit report
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              AI Website Auditor
            </h1>
            <p className="mt-2 break-all text-slate-600">{result.url}</p>
          </div>

          <Link
            href="/"
            className="inline-flex h-11 w-fit items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
          >
            New audit
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <ScoreCard score={result.audit.score} />

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-slate-950">Summary</h2>
            <p className="mt-4 leading-7 text-slate-600">{result.audit.summary}</p>
          </section>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <IssueList issues={result.audit.issues} />

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-slate-950">Quick wins</h2>
            <ul className="mt-5 space-y-3">
              {result.audit.quickWins.map((win, index) => (
                <li key={`${win}-${index}`} className="flex gap-3 text-sm leading-6 text-slate-700">
                  <span className="mt-2 h-2 w-2 flex-none rounded-full bg-sky-600" />
                  <span>{win}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  )
}
