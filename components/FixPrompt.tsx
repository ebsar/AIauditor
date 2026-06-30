'use client'

import { useRef, useState } from 'react'
import { createFixPrompt } from '@/lib/fixPrompt'
import type { AnalyzeResponse } from '@/lib/utils'

type FixPromptProps = {
  result: AnalyzeResponse
}

export function FixPrompt({ result }: FixPromptProps) {
  const prompt = createFixPrompt(result)
  const promptRef = useRef<HTMLTextAreaElement>(null)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopyStatus('copied')
    } catch {
      const promptField = promptRef.current

      if (!promptField) {
        setCopyStatus('error')
        return
      }

      promptField.focus()
      promptField.select()
      setCopyStatus(document.execCommand('copy') ? 'copied' : 'error')
    }
  }

  return (
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-700">
            Next step
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-950">AI repair prompt</h2>
          <p className="mt-2 text-sm text-slate-600">
            Ready for Codex, Claude, Gemini, or another coding assistant.
          </p>
        </div>

        <button
          type="button"
          onClick={copyPrompt}
          className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-sky-100 sm:w-auto"
        >
          {copyStatus === 'copied' ? 'Copied' : 'Copy prompt'}
        </button>
      </div>

      <textarea
        ref={promptRef}
        readOnly
        value={prompt}
        onFocus={(event) => event.currentTarget.select()}
        aria-label="AI repair prompt"
        className="mt-5 h-80 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-700 outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
      />

      <p className="mt-3 min-h-5 text-sm font-medium text-slate-600" aria-live="polite">
        {copyStatus === 'copied' ? 'Prompt copied to your clipboard.' : ''}
        {copyStatus === 'error' ? 'Copy failed. Select the prompt and copy it manually.' : ''}
      </p>
    </section>
  )
}
