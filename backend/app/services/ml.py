"""ML model registry + serving layer.

Reads model metadata written by the ml/ training scripts, lazily loads joblib
artifacts, and runs REAL inference against the live warehouse. Feature
definitions come from app.services.ml_features, which mirror the training code
so training and inference cannot drift.

Truthfulness rules:
- ``inference_ready`` means the artifact exists AND loads successfully.
- Missing/broken artifacts and insufficient data surface as errors; no
  endpoint ever fabricates values, falls back to static data, or trains
  during a request.
"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from functools import lru_cache
from pathlib import Path

from app.services import ml_features
from app.services.ml_features import MlDataError

logger = logging.getLogger("app.ml")

REPO_ROOT = Path(__file__).resolve().parents[3]


class ArtifactError(Exception):
    """Artifact exists but cannot be deserialized/loaded (maps to HTTP 503)."""

FEATURE_GROUPS: dict[str, list[str]] = {
    "sales_forecast": ["sales_forecast_orders", "sales_forecast_revenue"],
    "sales_prediction": ["sales_prediction"],
    "customer_segmentation": ["customer_segmentation"],
    "product_segmentation": ["product_segmentation"],
    "anomaly_detection": ["anomaly_detection"],
}

# Unit of each forecast target (Olist dataset currency is BRL).
FORECAST_UNITS = {"orders": "orders", "revenue": "BRL"}
FORECAST_TARGET_MODELS = {"orders": "sales_forecast_orders", "revenue": "sales_forecast_revenue"}


def models_dir() -> Path:
    env = os.getenv("ML_MODELS_DIR")
    return Path(env) if env else REPO_ROOT / "ml" / "models"


def processed_dir() -> Path:
    env = os.getenv("ML_DATA_DIR")
    return Path(env) if env else REPO_ROOT / "ml" / "data" / "processed"


@lru_cache(maxsize=1)
def load_all_metadata() -> dict[str, dict]:
    out: dict[str, dict] = {}
    d = models_dir()
    if not d.exists():
        return out
    for path in d.glob("*.metadata.json"):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            out[path.name.replace(".metadata.json", "")] = data
        except (json.JSONDecodeError, OSError):
            continue
    return out


def artifact_available(name: str) -> bool:
    meta = load_all_metadata().get(name)
    if not meta or not meta.get("artifact"):
        return False
    return (models_dir() / meta["artifact"]).exists()


@lru_cache(maxsize=8)
def _load_artifact(name: str):
    """Lazy, cached artifact load (loaded once per process)."""
    import joblib

    meta = load_all_metadata().get(name)
    if not meta or not meta.get("artifact"):
        raise FileNotFoundError(f"no artifact metadata registered for model '{name}'")
    path = models_dir() / meta["artifact"]
    if not path.exists():
        raise FileNotFoundError(
            f"artifact for '{name}' not found ({path.name}) - train the models "
            "with: cd ml && python run_all.py"
        )
    logger.info("ml: loading artifact %s", path.name)
    try:
        return joblib.load(path)
    except Exception as exc:  # noqa: BLE001 - any load failure must surface honestly
        raise ArtifactError(
            f"artifact for '{name}' could not be loaded ({type(exc).__name__})"
        ) from exc


def model_state(name: str) -> dict:
    """Truthful per-model serving state.

    inference: inference_ready | unavailable | inference_failed
    """
    meta = load_all_metadata().get(name)
    trained = bool(meta and meta.get("status") == "available")
    if not meta or not meta.get("artifact"):
        return {
            "trained": trained,
            "artifact_available": False,
            "artifact_path": None,
            "inference": "unavailable",
            "reason": "no artifact is registered for this model",
        }
    path = models_dir() / meta["artifact"]
    artifact_ok = path.exists()
    if not artifact_ok:
        return {
            "trained": trained,
            "artifact_available": False,
            "artifact_path": str(path),
            "inference": "unavailable",
            "reason": f"artifact {path.name} is missing - train with: cd ml && python run_all.py",
        }
    try:
        _load_artifact(name)
    except Exception as exc:  # noqa: BLE001 - report any load failure honestly
        logger.exception("ml: failed to load artifact for %s", name)
        return {
            "trained": trained,
            "artifact_available": True,
            "artifact_path": str(path),
            "inference": "inference_failed",
            "reason": f"artifact could not be loaded ({type(exc).__name__})",
        }
    return {
        "trained": trained,
        "artifact_available": True,
        "artifact_path": str(path),
        "inference": "inference_ready",
        "reason": None,
    }


def feature_status() -> list[dict]:
    metas = load_all_metadata()
    features = []
    for feature, keys in FEATURE_GROUPS.items():
        present = [k for k in keys if k in metas]
        if not present:
            features.append({"name": feature, "status": "planned", "models": []})
            continue
        states = {k: model_state(k) for k in present}
        statuses = [metas[k].get("status", "planned") for k in present]
        artifacts_ready = all(states[k]["inference"] == "inference_ready" for k in present)
        if all(s == "available" for s in statuses) and artifacts_ready:
            status = "available"
        elif states and all(s["inference"] == "inference_failed" for s in states.values()):
            status = "failed"
        elif all(s == "available" for s in statuses):
            status = "integration"  # trained + documented, artifact not servable locally
        else:
            status = statuses[0]
        features.append(
            {
                "name": feature,
                "status": status,
                "models": [
                    {
                        "name": k,
                        "algorithm": metas[k].get("algorithm"),
                        "target": metas[k].get("target"),
                        "features": metas[k].get("features_schema"),
                        "trained_at": metas[k].get("trained_at"),
                        "metrics": metas[k].get("metrics"),
                        "artifact_available": states[k]["artifact_available"],
                        "artifact_path": states[k]["artifact_path"],
                        "trained": states[k]["trained"],
                        "inference": states[k]["inference"],
                        "reason": states[k]["reason"],
                    }
                    for k in present
                ],
            }
        )
    return features


def _training_metrics(name: str) -> dict:
    return load_all_metadata().get(name, {}).get("metrics", {}) or {}


def _artifact_info(name: str) -> dict:
    meta = load_all_metadata().get(name, {})
    state = model_state(name)
    return {
        "trained_at": meta.get("trained_at"),
        "artifact": meta.get("artifact"),
        "artifact_path": state["artifact_path"],
        "notes": meta.get("notes"),
    }


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def forecast(
    db,
    periods: int = 30,
    target: str = "orders",
    date_from: str | None = None,
    date_to: str | None = None,
) -> dict:
    """Recursive daily forecast via real model.predict() calls."""
    name = FORECAST_TARGET_MODELS[target]
    bundle = _load_artifact(name)
    model, feature_cols = bundle["model"], bundle["features"]

    series = ml_features.daily_series(db, date_from, date_to)
    values = series[target].astype(float).tolist()
    preds = ml_features.recursive_forecast(model, feature_cols, values, periods)

    import pandas as pd

    last_date = pd.to_datetime(series["date"]).max()
    history_tail = [
        {
            "date": d.strftime(ml_features.DATE_FMT),
            "value": float(v),
            target: float(v),
        }
        for d, v in list(zip(pd.to_datetime(series["date"]), values))[-30:]
    ]
    forecast_points = [
        {
            "date": (last_date + pd.Timedelta(days=i + 1)).strftime(ml_features.DATE_FMT),
            "value": float(yhat),
            target: float(yhat),
        }
        for i, yhat in enumerate(preds)
    ]
    logger.info(
        "ml: %s forecast ok (periods=%d, history=%d days)", name, periods, len(values)
    )
    return {
        "model": name,
        "algorithm": load_all_metadata().get(name, {}).get("algorithm"),
        "target": target,
        "unit": FORECAST_UNITS[target],
        "status": "success",
        "periods": periods,
        "history_tail": history_tail,
        "forecast": forecast_points,
        "metrics": _training_metrics(name),
        "metadata": {
            **_artifact_info(name),
            "n_history_days": int(len(values)),
            "date_from": date_from,
            "date_to": date_to,
            "generated_at": _now(),
        },
    }


def customer_segments(db, date_from: str | None = None, date_to: str | None = None) -> dict:
    """Live K-Means inference over warehouse-derived RFM features."""
    name = "customer_segmentation"
    bundle = _load_artifact(name)
    scaler, model, feature_cols = bundle["scaler"], bundle["model"], bundle["features"]

    rfm = ml_features.customer_rfm(db, date_from, date_to)
    X = ml_features.feature_frame(rfm, feature_cols, required=1)
    labels = model.predict(scaler.transform(X))
    rfm = rfm.assign(cluster=labels)

    k = int(bundle.get("k") or len(set(labels)))
    clusters = []
    total = int(len(rfm))
    for cid in sorted(rfm["cluster"].unique()):
        grp = rfm[rfm["cluster"] == cid]
        clusters.append(
            {
                "cluster": int(cid),
                "customers": int(len(grp)),
                "share": float(len(grp)) / total,
                "mean_recency_days": float(round(float(grp["recency_days"].mean()), 2)),
                "mean_frequency": float(round(float(grp["frequency"].mean()), 2)),
                "mean_monetary": float(round(float(grp["monetary"].mean()), 2)),
            }
        )
    logger.info(
        "ml: customer_segmentation inference ok (%d customers, k=%d)", total, k
    )
    return {
        "model": name,
        "algorithm": load_all_metadata().get(name, {}).get("algorithm"),
        "target": "cluster_label",
        "status": "success",
        "inference": {
            "n_customers": total,
            "k": k,
            "features": list(feature_cols),
            "clusters": clusters,
        },
        "metrics": _training_metrics(name),
        "metadata": {
            **_artifact_info(name),
            "date_from": date_from,
            "date_to": date_to,
            "generated_at": _now(),
        },
    }


def product_segments(db, date_from: str | None = None, date_to: str | None = None) -> dict:
    """Live K-Means inference over warehouse-derived product features."""
    name = "product_segmentation"
    bundle = _load_artifact(name)
    scaler, model, feature_cols = bundle["scaler"], bundle["model"], bundle["features"]

    feats = ml_features.product_features(db, date_from, date_to)
    X = ml_features.feature_frame(feats, feature_cols, required=1)
    labels = model.predict(scaler.transform(X))
    feats = feats.assign(cluster=labels)

    k = int(bundle.get("k") or len(set(labels)))
    clusters = []
    total = int(len(feats))
    for cid in sorted(feats["cluster"].unique()):
        grp = feats[feats["cluster"] == cid]
        clusters.append(
            {
                "cluster": int(cid),
                "products": int(len(grp)),
                "share": float(len(grp)) / total,
                "mean_total_qty": float(round(float(grp["total_qty"].mean()), 2)),
                "mean_total_revenue": float(round(float(grp["total_revenue"].mean()), 2)),
                "mean_avg_price": float(round(float(grp["avg_price"].mean()), 2)),
                "mean_product_weight_g": float(
                    round(float(grp["product_weight_g"].mean()), 2)
                ),
            }
        )
    logger.info("ml: product_segmentation inference ok (%d products, k=%d)", total, k)
    return {
        "model": name,
        "algorithm": load_all_metadata().get(name, {}).get("algorithm"),
        "target": "cluster_label",
        "status": "success",
        "inference": {
            "n_products": total,
            "k": k,
            "features": list(feature_cols),
            "clusters": clusters,
        },
        "metrics": _training_metrics(name),
        "metadata": {
            **_artifact_info(name),
            "date_from": date_from,
            "date_to": date_to,
            "generated_at": _now(),
        },
    }


def anomalies(db, date_from: str | None = None, date_to: str | None = None) -> dict:
    """Live Isolation Forest scoring over the daily orders/revenue series."""
    name = "anomaly_detection"
    bundle = _load_artifact(name)
    model, feature_cols = bundle["model"], bundle["features"]

    feats = ml_features.anomaly_features(db, date_from, date_to)
    X = ml_features.feature_frame(feats, feature_cols, required=1)
    labels = model.predict(X)  # -1 = anomaly
    scores = model.decision_function(X)

    rows = [
        {
            "date": d.strftime(ml_features.DATE_FMT),
            "orders": int(o),
            "revenue": float(r),
            "score": float(s),
            "is_anomaly": bool(l == -1),
        }
        for d, o, r, s, l in zip(
            feats["date"], feats["orders"], feats["revenue"], scores, labels
        )
    ]
    flagged = sorted((r for r in rows if r["is_anomaly"]), key=lambda r: r["score"])
    n_days = len(rows)
    logger.info(
        "ml: anomaly_detection inference ok (%d/%d days flagged)", len(flagged), n_days
    )
    return {
        "model": name,
        "algorithm": load_all_metadata().get(name, {}).get("algorithm"),
        "target": "is_anomaly",
        "status": "success",
        "inference": {
            "n_days": n_days,
            "n_anomalies": len(flagged),
            "anomaly_share": (len(flagged) / n_days) if n_days else 0.0,
            "contamination": bundle.get("contamination"),
            "score_definition": "decision_function; lower = more unusual",
            "evaluated_from": rows[0]["date"],
            "evaluated_to": rows[-1]["date"],
            "top_anomalies": flagged[:50],
        },
        "metrics": _training_metrics(name),
        "metadata": {
            **_artifact_info(name),
            "date_from": date_from,
            "date_to": date_to,
            "generated_at": _now(),
        },
    }


def predict_sales(payload: dict) -> dict:
    """Order item-revenue prediction via the trained sklearn Pipeline."""
    import pandas as pd

    name = "sales_prediction"
    bundle = _load_artifact(name)
    pipe, features, target = bundle["pipeline"], bundle["features"], bundle.get("target")
    missing = [f for f in features if payload.get(f) is None]
    if missing:
        raise MlDataError(f"missing required model inputs: {', '.join(missing)}")
    row = pd.DataFrame([{f: payload.get(f) for f in features}])
    yhat = float(pipe.predict(row)[0])
    meta = load_all_metadata().get(name, {})
    logger.info("ml: sales_prediction inference ok (%.2f)", yhat)
    return {
        "predicted_item_revenue": yhat,
        "currency": "BRL",
        "model": name,
        "algorithm": meta.get("algorithm"),
        "target": target,
        "status": "success",
        "metrics": _training_metrics(name),
        "metadata": {"trained_at": meta.get("trained_at"), "generated_at": _now()},
    }
