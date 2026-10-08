import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getMlStatus } from '@/services/api';
import { Card, ErrorNote, Loading, StatusBadge } from './parts';
function inferenceTone(model) {
    const state = model.inference ?? (model.artifact_available ? 'inference_ready' : 'unavailable');
    if (state === 'inference_ready')
        return 'ok';
    if (state === 'inference_failed')
        return 'error';
    return 'warn';
}
function inferenceLabel(model) {
    const state = model.inference ?? (model.artifact_available ? 'inference_ready' : 'unavailable');
    if (state === 'inference_ready')
        return 'inference ready';
    if (state === 'inference_failed')
        return 'inference failed';
    return 'unavailable';
}
function ModelRow({ model }) {
    const mae = model.metrics && typeof model.metrics === 'object'
        ? model.metrics.model?.mae
        : undefined;
    return (_jsxs("div", { className: "py-2 border-b border-neutral-800/60 last:border-b-0", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsx("span", { className: "text-sm font-medium", "data-testid": "registry-model-name", children: model.name }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(StatusBadge, { tone: inferenceTone(model), children: inferenceLabel(model) }), _jsx(StatusBadge, { tone: "neutral", children: model.algorithm ?? 'unknown' })] })] }), _jsxs("div", { className: "text-xs text-neutral-500 mt-0.5 flex flex-wrap gap-x-4 gap-y-0.5", children: [model.target && _jsxs("span", { children: ["target: ", model.target] }), Array.isArray(model.features) && model.features.length > 0 && (_jsxs("span", { children: ["features: ", model.features.join(', ')] })), _jsxs("span", { children: ["trained: ", model.trained_at ?? 'unknown'] }), mae != null && _jsxs("span", { children: ["holdout MAE: ", mae.toFixed(2)] }), !model.artifact_available && _jsx("span", { className: "text-amber-400", children: "artifact missing" })] }), model.reason && (_jsx("div", { className: "text-xs text-amber-400/90 mt-0.5", "data-testid": "registry-reason", children: model.reason }))] }));
}
function featureTone(status) {
    if (status === 'available')
        return 'ok';
    if (status === 'failed')
        return 'error';
    if (status === 'integration')
        return 'warn';
    return 'neutral';
}
export function ModelRegistry() {
    const [features, setFeatures] = useState(null);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState(null);
    useEffect(() => {
        getMlStatus()
            .then((res) => {
            setFeatures(res.features);
            setStatus('success');
        })
            .catch((err) => {
            setError(err instanceof Error && err.message ? err.message : 'Request failed');
            setStatus('error');
        });
    }, []);
    return (_jsxs(Card, { testId: "ml-registry", title: "Model Registry", subtitle: "Training metadata and live inference availability (from /api/ml/status)", children: [status === 'loading' && _jsx(Loading, { label: "Loading model registry\u2026" }), status === 'error' && error && _jsx(ErrorNote, { message: error, testId: "registry-error" }), features && (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-x-6", children: features.map((f) => (_jsxs("div", { className: "mb-3", "data-testid": "registry-feature", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h3", { className: "text-sm font-semibold text-neutral-200", children: f.name }), _jsx(StatusBadge, { tone: featureTone(f.status), children: f.status })] }), f.models.length === 0 ? (_jsx("p", { className: "text-xs text-neutral-500", children: "No models registered for this feature." })) : (f.models.map((m) => _jsx(ModelRow, { model: m }, m.name)))] }, f.name))) }))] }));
}
