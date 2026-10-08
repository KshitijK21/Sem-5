import { useCallback, useEffect, useRef, useState } from 'react'
import type { MlDateFilter } from '@/services/api'

export type SectionStatus = 'idle' | 'loading' | 'success' | 'error'

export interface MlSection<T> {
  status: SectionStatus
  data: T | null
  error: string | null
  /** Filters the currently displayed data was produced with (null before first success). */
  appliedFilters: MlDateFilter | null
  /** True when the shared filters changed after the last completed run. */
  stale: boolean
  run: () => Promise<void>
}

/**
 * Async state for one ML section with:
 * - auto-run once on mount
 * - automatic refetch when shared filters change (no stale results kept)
 * - request identity so an older response can never overwrite a newer one
 */
export function useMlSection<T>(
  fetcher: (f: MlDateFilter) => Promise<T>,
  filters: MlDateFilter,
): MlSection<T> {
  const [status, setStatus] = useState<SectionStatus>('idle')
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [appliedFilters, setAppliedFilters] = useState<MlDateFilter | null>(null)

  const reqId = useRef(0)
  const startedRef = useRef(false)
  const filtersRef = useRef(filters)
  const fetcherRef = useRef(fetcher)
  filtersRef.current = filters
  fetcherRef.current = fetcher

  const run = useCallback(async () => {
    const id = ++reqId.current
    const snapshot = filtersRef.current
    startedRef.current = true
    setStatus('loading')
    setError(null)
    try {
      const res = await fetcherRef.current(snapshot)
      if (id !== reqId.current) return // superseded by a newer request
      setData(res)
      setAppliedFilters(snapshot)
      setStatus('success')
    } catch (err) {
      if (id !== reqId.current) return
      setError(err instanceof Error && err.message ? err.message : 'Request failed')
      setStatus('error')
    }
  }, [])

  // initial load
  useEffect(() => {
    void run()
  }, [run])

  // refetch when shared filters change once the section has run before
  const prevFilters = useRef(filters)
  useEffect(() => {
    if (prevFilters.current === filters) return
    prevFilters.current = filters
    if (startedRef.current) void run()
  }, [filters, run])

  const stale =
    appliedFilters !== null &&
    (appliedFilters.date_from !== filters.date_from ||
      appliedFilters.date_to !== filters.date_to)

  return { status, data, error, appliedFilters, stale, run }
}
