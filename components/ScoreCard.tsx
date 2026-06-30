import { clampScore, getScoreLabel, type AnalyzeResponse } from '@/lib/utils'

type ScoreCardProps = {
  score: number
  lighthouse: AnalyzeResponse['lighthouse']
}

export function ScoreCard({ score, lighthouse }: ScoreCardProps) {
  const normalizedScore = clampScore(score)
  const label = getScoreLabel(normalizedScore)
  const labelStyles = {
    Good: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    Medium: 'bg-amber-50 text-amber-700 ring-amber-200',
    Poor: 'bg-rose-50 text-rose-700 ring-rose-200'
  }[label]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
            Overall score
          </p>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-6xl font-bold tracking-tight text-slate-950">{normalizedScore}</span>
            <span className="pb-2 text-lg font-semibold text-slate-500">/100</span>
          </div>
        </div>

        <span className={`w-fit rounded-full px-4 py-2 text-sm font-bold ring-1 ${labelStyles}`}>
          {label}
        </span>
      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-950 transition-all"
          style={{ width: `${normalizedScore}%` }}
        />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5">
        <Metric label="Performance" value={lighthouse.performance} />
        <Metric label="SEO" value={lighthouse.seo} />
        <Metric label="Accessibility" value={lighthouse.accessibility} />
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 text-center">
      <p className="text-lg font-bold text-slate-950">{clampScore(value)}</p>
      <p className="mt-1 break-words text-xs font-semibold text-slate-500">
        {label}
      </p>
    </div>
  )
}
