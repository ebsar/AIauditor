'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingState } from './LoadingState'
import type { AnalyzeResponse } from '@/lib/utils'

export function UrlForm() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ url })
      })

      const data = (await response.json()) as AnalyzeResponse & { error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? 'Unable to analyze this website.')
      }

      sessionStorage.setItem(`audit:${data.jobId}`, JSON.stringify(data))
      router.push(`/results?jobId=${encodeURIComponent(data.jobId)}`)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Something went wrong.')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="url" className="mb-2 block text-sm font-semibold text-slate-800">
          Website URL
        </label>
        <input
          id="url"
          type="url"
          required
          inputMode="url"
          placeholder="https://example.com"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-950 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isLoading}
        className="flex h-14 w-full items-center justify-center rounded-2xl bg-slate-950 px-5 text-base font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Website'}
      </button>

      {isLoading ? <LoadingState /> : null}
    </form>
  )
}
