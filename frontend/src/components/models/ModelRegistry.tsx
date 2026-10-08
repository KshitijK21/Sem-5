import { useEffect, useState } from 'react'
import { getMlStatus, type MlFeature, type MlModel } from '@/services/api'
import { Card, ErrorNote, Loading, StatusBadge } from './parts'

function inferenceTone(model: MlModel) {
  const state = model.inference ?? (model.artifact_available ? 'inference_ready' : 'unavailable')
  if (state === 'inference_ready') return 'ok' as const
  if (state === 'inference_failed') return 'error' as const
  return 'warn' as const
}

function inferenceLabel(model: MlModel) {
  const state = model.inference ?? (model.artifact_available ? 'inference_ready' : 'unavailable')
  if (state === 'inference_ready') return 'inference ready'
  if (state === 'inference_failed') return 'inference failed'
  return 'unavailable'
}

function ModelRow({ model }: { model: MlModel }) {
  const mae =
    model.metrics && typeof model.metrics === 'object'
      ? (model.metrics as { model?: { mae?: number } }).model?.mae
      : undefined
  return (
    <div className="py-2 border-b border-neutral-800/60 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium" data-testid="registry-model-name">
          {model.name}
        </span>
        <div className="flex items-center gap-2">
          <StatusBadge tone={inferenceTone(model)}>{inferenceLabel(model)}</StatusBadge>
          <StatusBadge tone="neutral">{model.algorithm ?? 'unknown'}</StatusBadge>
        </div>
      </div>
      <div className="text-xs text-neutral-500 mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5">
        {model.target && <span>target: {model.target}</span>}
        {Array.isArray(model.features) && model.features.length > 0 && (
          <span>features: {model.features.join(', ')}</span>
        )}
        <span>trained: {model.trained_at ?? 'unknown'}</span>
        {mae != null && <span>holdout MAE: {mae.toFixed(2)}</span>}
        {!model.artifact_available && <span className="text-amber-400">artifact missing</span>}
      </div>
      {model.reason && (
        <div className="text-xs text-amber-400/90 mt-0.5" data-testid="registry-reason">
          {model.reason}
        </div>
      )}
    </div>
  )
}

function featureTone(status: string) {
  if (status === 'available') return 'ok' as const
  if (status === 'failed') return 'error' as const
  if (status === 'integration') return 'warn' as const
  return 'neutral' as const
}

export function ModelRegistry() {
  const [features, setFeatures] = useState<MlFeature[] | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getMlStatus()
      .then((res) => {
        setFeatures(res.features)
        setStatus('success')
      })
      .catch((err: unknown) => {
        setError(err instanceof Error && err.message ? err.message : 'Request failed')
        setStatus('error')
      })
  }, [])

  return (
    <Card
      testId="ml-registry"
      title="Model Registry"
      subtitle="Training metadata and live inference availability (from /api/ml/status)"
    >
      {status === 'loading' && <Loading label="Loading model registry…" />}
      {status === 'error' && error && <ErrorNote message={error} testId="registry-error" />}

      {features && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          {features.map((f) => (
            <div key={f.name} className="mb-3" data-testid="registry-feature">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-neutral-200">{f.name}</h3>
                <StatusBadge tone={featureTone(f.status)}>{f.status}</StatusBadge>
              </div>
              {f.models.length === 0 ? (
                <p className="text-xs text-neutral-500">No models registered for this feature.</p>
              ) : (
                f.models.map((m) => <ModelRow key={m.name} model={m} />)
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
