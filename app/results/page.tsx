import { ResultsView } from '@/components/ResultsView'

type ResultsPageProps = {
  searchParams?: {
    jobId?: string
  }
}

export default function ResultsPage({ searchParams }: ResultsPageProps) {
  return <ResultsView jobId={searchParams?.jobId ?? ''} />
}
