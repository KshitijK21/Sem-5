"""Sales/demand forecasting on the daily orders series.

- Target: daily order count (also trains on daily revenue as second target).
- Baseline: seasonal naive (value 7 days earlier).
- Models: Linear Regression, XGBRegressor, ARIMA.
- Split: chronological 80/20 (no shuffling -> no leakage).

Saves artifacts + metadata to ml/models (gitignored). Honest metrics only.
"""

from __future__ import annotations

import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
import xgboost as xgb
from statsmodels.tsa.arima.model import ARIMA
import warnings
from statsmodels.tools.sm_exceptions import ConvergenceWarning

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from src.common.metadata import write_metadata  # noqa: E402
from src.common.paths import models_dir, processed_dir  # noqa: E402
from src.evaluation.metrics import regression_metrics  # noqa: E402

warnings.simplefilter('ignore', ConvergenceWarning)
warnings.simplefilter('ignore', UserWarning)


def make_features(series: pd.Series) -> pd.DataFrame:
    df = pd.DataFrame({"y": series})
    for lag in (1, 7, 14, 30):
        df[f"lag{lag}"] = df["y"].shift(lag)
    df["roll7"] = df["y"].shift(1).rolling(7).mean()
    df["roll30"] = df["y"].shift(1).rolling(30).mean()
    return df


def train_target(name: str, series: pd.Series) -> dict:
    df = make_features(series).dropna()
    feature_cols = [c for c in df.columns if c != "y"]

    split = int(len(df) * 0.8)
    train, test = df.iloc[:split], df.iloc[split:]
    Xtr, ytr = train[feature_cols], train["y"]
    Xte, yte = test[feature_cols], test["y"]

    # seasonal naive baseline: value 7 days earlier
    naive_pred = test["lag7"]
    baseline = regression_metrics(yte, naive_pred)

    candidates = {}
    
    # Linear Regression
    lr = LinearRegression().fit(Xtr, ytr)
    lr_pred = lr.predict(Xte)
    lr_metrics = regression_metrics(yte, lr_pred)
    candidates["LinearRegression"] = {"model": lr, "metrics": lr_metrics, "type": "sklearn"}

    # XGBoost
    xg = xgb.XGBRegressor(n_estimators=100, max_depth=4, random_state=42).fit(Xtr, ytr)
    xg_pred = xg.predict(Xte)
    xg_metrics = regression_metrics(yte, xg_pred)
    candidates["XGBoost"] = {"model": xg, "metrics": xg_metrics, "type": "sklearn"}

    # ARIMA
    arima_model = ARIMA(ytr.values, order=(7, 1, 1))
    try:
        arima_fit = arima_model.fit(method='innovations_mle')
        arima_pred = arima_fit.forecast(steps=len(yte))
        arima_metrics = regression_metrics(yte, arima_pred)
        candidates["ARIMA"] = {"model": arima_fit, "metrics": arima_metrics, "type": "statsmodels"}
    except Exception as e:
        print(f"ARIMA failed for {name}: {e}")

    best_name = min(candidates.keys(), key=lambda k: candidates[k]["metrics"]["mae"])
    best_candidate = candidates[best_name]
    best_metrics = best_candidate["metrics"]
    best_model = best_candidate["model"]
    
    artifact = models_dir() / f"{name}.joblib"
    
    if best_candidate["type"] == "sklearn":
        joblib.dump({"model": best_model, "features": feature_cols, "type": "sklearn", "algorithm": best_name}, artifact)
    else:
        joblib.dump({"model": best_model, "features": None, "type": "statsmodels", "algorithm": best_name}, artifact)

    meta = write_metadata(
        name,
        target=name,
        features=feature_cols if best_candidate["type"] == "sklearn" else [],
        metrics={"model": best_metrics, "seasonal_naive_baseline": baseline, "n_train": len(train), "n_test": len(test)},
        status="available",
        algorithm=best_name,
        dataset_files=[processed_dir() / "daily_series.csv"],
        artifact=artifact.name,
        notes=f"Selected {best_name} over candidates. Candidates evaluated: {list(candidates.keys())}",
    )
    return {"name": name, "best": best_name, "metrics": best_metrics, "baseline": baseline, "metadata": str(meta)}

def main() -> None:
    daily = pd.read_csv(processed_dir() / "daily_series.csv", parse_dates=["date"]).sort_values("date")
    daily.set_index("date", inplace=True)
    results = []
    results.append(train_target("sales_forecast_orders", daily["orders"].astype(float)))
    results.append(train_target("sales_forecast_revenue", daily["revenue"].astype(float)))
    for r in results:
        print(f"{r['name']} ({r['best']}): model={r['metrics']} baseline={r['baseline']}")

if __name__ == "__main__":
    main()
