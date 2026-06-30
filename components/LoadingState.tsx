export function LoadingState() {
  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-4 text-sm text-sky-950">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-200 border-t-sky-700" />
        <div>
          <p className="font-semibold">Running audit</p>
          <p className="mt-1 text-sky-800">Checking speed, search basics, accessibility, and page structure.</p>
        </div>
      </div>
    </div>
  )
}
