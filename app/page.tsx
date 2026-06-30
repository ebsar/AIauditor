import { UrlForm } from '@/components/UrlForm'

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-10">
      <section className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
            Website audit
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            AI Website Auditor
          </h1>
          <p className="mt-4 text-lg text-slate-600">Analyze any website in seconds</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <UrlForm />
        </div>
      </section>
    </main>
  )
}
