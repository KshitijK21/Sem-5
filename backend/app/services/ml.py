"""ML model registry + serving layer.

Reads model metadata written by the ml/ training scripts and lazily loads
joblib artifacts to serve predictions. All numbers come from real training runs.
"""

from __future__ import annotations

import json
import os
from functools import lru_cache
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]

FEATURE_GROUPS: dict[str, list[str]] = {
    "sales_forecast": ["sales_forecast_orders", "sales_forecast_revenue"],
    "sales_prediction": ["sales_prediction"],
    "customer_segmentation": ["customer_segmentation"],
    "product_segmentation": ["product_segmentation"],
    "anomaly_detection": ["anomaly_detection"],
}


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


def feature_status() -> list[dict]:
    metas = load_all_metadata()
    features = []
    for feature, keys in FEATURE_GROUPS.items():
        present = [k for k in keys if k in metas]
        if not present:
            features.append({"name": feature, "status": "planned", "models": []})
            continue
        statuses = [metas[k].get("status", "planned") for k in present]
        all_available = all(s == "available" for s in statuses)
        artifacts_ready = all(artifact_available(k) for k in present)
        if all_available and artifacts_ready:
            status = "available"
        elif all_available:
            status = "integration"  # trained + documented, artifact not present locally
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
                        "trained_at": metas[k].get("trained_at"),
                        "metrics": metas[k].get("metrics"),
                        "artifact_available": artifact_available(k),
                    }
                    for k in present
                ],
            }
        )
    return features


@lru_cache(maxsize=8)
def _load_artifact(name: str):
    import joblib

    meta = load_all_metadata().get(name)
    if not meta or not meta.get("artifact"):
        raise FileNotFoundError(f"no artifact metadata for {name}")
    path = models_dir() / meta["artifact"]
    if not path.exists():
        raise FileNotFoundError(f"artifact missing: {path}")
    return joblib.load(path)


def forecast(periods: int = 30) -> dict:
    """Recursive daily order forecast using lag/rolling features."""
    import numpy as np
    import pandas as pd

    bundle = _load_artifact("sales_forecast_orders")
    model, feature_cols = bundle["model"], bundle["features"]

    series = pd.read_csv(processed_dir() / "daily_series.csv", parse_dates=["date"]).sort_values("date")
    hist = series.set_index("date")["orders"].astype(float).copy()
    last_date = hist.index.max()
    values = list(hist.values)

    preds = []
    for step in range(periods):
        window = np.array(values, dtype=float)
        feats = {
            "lag1": window[-1],
            "lag7": window[-7],
            "lag14": window[-14],
            "lag30": window[-30],
            "roll7": window[-7:].mean(),
            "roll30": window[-30:].mean(),
        }
        row = pd.DataFrame([[feats[c] for c in feature_cols]], columns=feature_cols)
        yhat = float(model.predict(row)[0])
        values.append(yhat)
        preds.append({"date": (last_date + pd.Timedelta(days=step + 1)).strftime("%Y-%m-%d"), "orders": round(yhat, 2)})
    return {"history_tail": [{"date": d.strftime("%Y-%m-%d"), "orders": float(v)} for d, v in list(hist.items())[-30:]], "forecast": preds}


def anomalies() -> dict:
    meta = load_all_metadata().get("anomaly_detection", {})
    return {"metrics": meta.get("metrics", {}), "status": meta.get("status", "planned")}


def customer_segments() -> dict:
    meta = load_all_metadata().get("customer_segmentation", {})
    return {"metrics": meta.get("metrics", {}), "status": meta.get("status", "planned")}


def predict_sales(payload: dict) -> dict:
    import pandas as pd

    bundle = _load_artifact("sales_prediction")
    pipe, features = bundle["pipeline"], bundle["features"]
    row = pd.DataFrame([{f: payload.get(f) for f in features}])
    yhat = float(pipe.predict(row)[0])
    return {"predicted_item_revenue": round(yhat, 2), "currency": "BRL"}
