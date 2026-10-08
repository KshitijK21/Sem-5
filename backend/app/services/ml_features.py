"""Warehouse-backed feature builders for ML inference.

Every builder mirrors, field for field, the feature definitions used by the
training scripts under ``ml/src/`` so training and inference cannot drift:

| builder           | training source                              |
|-------------------|----------------------------------------------|
| daily_series      | build_datasets.build_daily_series_with_revenue |
| recursive_forecast| train_forecast.make_features (lag/rolling)   |
| customer_rfm      | build_datasets.build_customer_rfm            |
| product_features  | build_datasets.build_product_features        |
| anomaly_features  | train_anomaly.FEATURES = [orders, revenue]   |

Data comes from the live warehouse (fact_orders / fact_order_items /
dim_product), never from static CSVs. Validation failures raise MlDataError
which the API layer maps to HTTP 409.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from sqlalchemy import text
from sqlalchemy.orm import Session

DATE_FMT = "%Y-%m-%d"

# make_features() uses lag30 + shift(1).rolling(30) -> at least 30 observations
FORECAST_MIN_DAYS = 30

FORECAST_FEATURE_LAGS = (1, 7, 14, 30)
FORECAST_ROLL_WINDOWS = (7, 30)

# Exact feature lists written by training (see *.metadata.json features_schema)
CUSTOMER_FEATURES = ["recency_days", "frequency", "monetary_log"]
PRODUCT_FEATURES = ["qty_log", "revenue_log", "avg_price", "product_weight_g"]
ANOMALY_FEATURES = ["orders", "revenue"]


class MlDataError(Exception):
    """Insufficient or unavailable data for inference (maps to HTTP 409)."""


def _date_filters(alias: str, date_from: str | None, date_to: str | None) -> tuple[str, dict]:
    clauses, params = [], {}
    if date_from:
        clauses.append(f"{alias}.purchase_date >= :ml_date_from")
        params["ml_date_from"] = date_from
    if date_to:
        clauses.append(f"{alias}.purchase_date <= :ml_date_to")
        params["ml_date_to"] = date_to
    return (f" AND {' AND '.join(clauses)}" if clauses else ""), params


def _require_rows(df: pd.DataFrame, what: str) -> pd.DataFrame:
    if df.empty:
        raise MlDataError(
            f"no {what} available for the selected filters - load the warehouse "
            "or widen the date range"
        )
    return df


def daily_series(
    db: Session, date_from: str | None = None, date_to: str | None = None
) -> pd.DataFrame:
    """Daily order counts and revenue, same grain as the training series.

    Mirrors build_daily_series_with_revenue(): one row per calendar day that
    has at least one order, revenue = sum of order item prices.
    """
    extra, params = _date_filters("o", date_from, date_to)
    rows = db.execute(
        text(
            """
            SELECT o.purchase_date AS date,
                   COUNT(DISTINCT o.order_id) AS orders,
                   COALESCE(SUM(o.item_revenue), 0) AS revenue
            FROM fact_orders o
            WHERE o.purchase_date IS NOT NULL
        """
            + extra
            + """
            GROUP BY o.purchase_date
            ORDER BY o.purchase_date
            """
        ),
        params,
    ).all()
    df = pd.DataFrame([r._mapping for r in rows])
    if df.empty:
        return pd.DataFrame(columns=["date", "orders", "revenue"])
    df["date"] = pd.to_datetime(df["date"])
    df["orders"] = df["orders"].astype(float)
    df["revenue"] = df["revenue"].astype(float)
    return df.sort_values("date").reset_index(drop=True)


def anomaly_features(
    db: Session, date_from: str | None = None, date_to: str | None = None
) -> pd.DataFrame:
    """Feature matrix for the Isolation Forest: exactly [orders, revenue]."""
    series = _require_rows(daily_series(db, date_from, date_to), "daily sales history")
    missing = [c for c in ANOMALY_FEATURES if c not in series.columns]
    if missing:
        raise MlDataError(f"warehouse is missing required columns: {', '.join(missing)}")
    return series


def _forecast_feature_value(name: str, values: list[float]) -> float:
    """Value of one make_features() column for the next step after `values`."""
    if name.startswith("lag") and name[3:].isdigit():
        lag = int(name[3:])
        if len(values) < lag:
            raise MlDataError(
                f"forecast feature {name} needs {lag} days of history "
                f"(only {len(values)} available)"
            )
        return float(values[-lag])
    if name.startswith("roll") and name[4:].isdigit():
        window = int(name[4:])
        if len(values) < window:
            raise MlDataError(
                f"forecast feature {name} needs {window} days of history "
                f"(only {len(values)} available)"
            )
        return float(np.mean(values[-window:]))
    raise MlDataError(
        f"artifact expects unsupported feature '{name}' - retrain the forecast model"
    )


def recursive_forecast(
    model, feature_cols: list[str], values, periods: int
) -> list[float]:
    """Recursive multi-step forecast faithful to train_forecast.make_features().

    For each step the lag/rolling features are computed from the history plus
    previously predicted values, exactly as the training features were defined
    (lags 1/7/14/30, shift(1).rolling(7/30).mean()).
    """
    vals = [float(v) for v in values]
    if len(vals) < FORECAST_MIN_DAYS:
        raise MlDataError(
            f"forecast needs at least {FORECAST_MIN_DAYS} days of order history "
            f"(only {len(vals)} available) - widen the date range"
        )
    preds: list[float] = []
    for _ in range(periods):
        row = pd.DataFrame(
            [[_forecast_feature_value(c, vals) for c in feature_cols]], columns=feature_cols
        )
        yhat = float(model.predict(row)[0])
        vals.append(yhat)
        preds.append(yhat)
    return preds


def customer_rfm(
    db: Session, date_from: str | None = None, date_to: str | None = None
) -> pd.DataFrame:
    """Customer RFM features, same definition as build_customer_rfm().

    recency_days = (max(purchase_date) + 1 day) - last purchase
    frequency    = distinct order count
    monetary     = sum of item revenue
    monetary_log = log1p(clip(monetary, 0))

    The warehouse stores purchase dates (not timestamps), so recency_days can
    differ by at most one day from the training CSV, which was built from
    timestamps. Frequency and monetary are exact.
    """
    extra, params = _date_filters("o", date_from, date_to)
    rows = db.execute(
        text(
            """
            SELECT o.customer_unique_id AS customer_unique_id,
                   MAX(o.purchase_date) AS last_purchase,
                   COUNT(DISTINCT o.order_id) AS frequency,
                   COALESCE(SUM(o.item_revenue), 0) AS monetary
            FROM fact_orders o
            WHERE o.purchase_date IS NOT NULL
              AND o.customer_unique_id IS NOT NULL
        """
            + extra
            + """
            GROUP BY o.customer_unique_id
            """
        ),
        params,
    ).all()
    df = pd.DataFrame([r._mapping for r in rows])
    _require_rows(df, "customers with orders")
    df["last_purchase"] = pd.to_datetime(df["last_purchase"])
    snapshot = df["last_purchase"].max() + pd.Timedelta(days=1)
    df["recency_days"] = (snapshot - df["last_purchase"]).dt.days.astype(int)
    df["frequency"] = df["frequency"].astype(int)
    df["monetary"] = df["monetary"].astype(float)
    df["monetary_log"] = np.log1p(df["monetary"].clip(lower=0))
    return df[
        ["customer_unique_id", "recency_days", "frequency", "monetary", "monetary_log"]
    ]


def product_features(
    db: Session, date_from: str | None = None, date_to: str | None = None
) -> pd.DataFrame:
    """Product engagement features, same definition as build_product_features().

    total_qty / total_revenue / avg_price from item rows (optionally date
    filtered), weight from dim_product. Null weight / price are filled with
    the column median exactly like the training script.
    """
    extra, params = _date_filters("i", date_from, date_to)
    rows = db.execute(
        text(
            """
            SELECT i.product_id AS product_id,
                   COUNT(*) AS total_qty,
                   SUM(i.price) AS total_revenue,
                   AVG(i.price) AS avg_price,
                   MAX(p.product_weight_g) AS product_weight_g
            FROM fact_order_items i
            LEFT JOIN dim_product p ON p.product_id = i.product_id
            WHERE i.purchase_date IS NOT NULL
        """
            + extra
            + """
            GROUP BY i.product_id
            """
        ),
        params,
    ).all()
    df = pd.DataFrame([r._mapping for r in rows])
    _require_rows(df, "products with sales")
    df["total_qty"] = df["total_qty"].astype(int)
    df["total_revenue"] = df["total_revenue"].astype(float)
    df["avg_price"] = df["avg_price"].astype(float)
    df["product_weight_g"] = pd.to_numeric(df["product_weight_g"], errors="coerce")
    df["qty_log"] = np.log1p(df["total_qty"].clip(lower=0))
    df["revenue_log"] = np.log1p(df["total_revenue"].clip(lower=0))
    df["product_weight_g"] = df["product_weight_g"].fillna(
        df["product_weight_g"].median() if df["product_weight_g"].notna().any() else 0.0
    )
    df["avg_price"] = df["avg_price"].fillna(
        df["avg_price"].median() if df["avg_price"].notna().any() else 0.0
    )
    return df[
        [
            "product_id",
            "total_qty",
            "total_revenue",
            "avg_price",
            "product_weight_g",
            "qty_log",
            "revenue_log",
        ]
    ]


def feature_frame(df: pd.DataFrame, feature_cols: list[str], required: int) -> pd.DataFrame:
    """Select model features in training order, validating row count/types."""
    missing = [c for c in feature_cols if c not in df.columns]
    if missing:
        raise MlDataError(f"warehouse data is missing required features: {', '.join(missing)}")
    out = df[list(feature_cols)].astype(float)
    if len(out) < required:
        raise MlDataError(f"at least {required} rows are required for this model")
    if out.isna().any().any():
        out = out.fillna(0.0)
    return out
