import { clampScore, getScoreLabel } from '@/lib/utils'

type ScoreCardProps = {
  score: number
}

export function ScoreCard({ score }: ScoreCardProps) {
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
    </section>
  )
}
