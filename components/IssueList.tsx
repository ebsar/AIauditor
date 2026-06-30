import type { AuditIssue } from '@/lib/utils'

type IssueListProps = {
  issues: AuditIssue[]
}

const categoryStyles: Record<AuditIssue['category'], string> = {
  Performance: 'bg-sky-50 text-sky-700 ring-sky-200',
  SEO: 'bg-violet-50 text-violet-700 ring-violet-200',
  Accessibility: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  Design: 'bg-amber-50 text-amber-700 ring-amber-200'
}

export function IssueList({ issues }: IssueListProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <h2 className="text-xl font-bold text-slate-950">Issues and fixes</h2>

      <div className="mt-5 space-y-4">
        {issues.map((issue, index) => (
          <article key={`${issue.category}-${index}`} className="rounded-2xl border border-slate-100 p-4">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${categoryStyles[issue.category]}`}
            >
              {issue.category}
            </span>
            <p className="mt-3 font-semibold text-slate-950">{issue.problem}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{issue.fix}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
